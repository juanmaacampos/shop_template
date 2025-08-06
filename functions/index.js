/**
 * Firebase Cloud Functions for Restaurant CMS Menu System
 * MercadoPago Payment Integration
 */

const { onCall } = require("firebase-functions/v2/https");
const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");
const mercadopago = require("mercadopago");

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

// Initialize Secret Manager client
const secretClient = new SecretManagerServiceClient();

/**
 * Cloud Function para crear una preferencia de pago en MercadoPago
 * Callable function que recibe datos del frontend y retorna el init_point
 */
exports.createMercadoPagoPreference = onCall(async (request) => {
  try {
    logger.info("🔄 Creating MercadoPago preference...", { request: request.data });

    // 1. Validar datos de entrada
    const { 
      businessId, 
      items, 
      customer, 
      totalAmount, 
      orderId, 
      backUrls,
      notes = ""
    } = request.data;

    // Validaciones
    if (!businessId || typeof businessId !== 'string') {
      throw new Error('businessId is required and must be a string');
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('items is required and must be a non-empty array');
    }

    if (!customer || typeof customer !== 'object' || !customer.name || !customer.phone) {
      throw new Error('customer is required with name and phone');
    }

    if (!totalAmount || typeof totalAmount !== 'number' || totalAmount <= 0) {
      throw new Error('totalAmount is required and must be a positive number');
    }

    if (!orderId || typeof orderId !== 'string') {
      throw new Error('orderId is required and must be a string');
    }

    if (!backUrls || typeof backUrls !== 'object' || !backUrls.success || !backUrls.pending || !backUrls.failure) {
      throw new Error('backUrls is required with success, pending, and failure URLs');
    }

    // Validar estructura de items
    for (const item of items) {
      if (!item.name || typeof item.unit_price !== 'number' || typeof item.quantity !== 'number') {
        throw new Error('Each item must have name, unit_price (number), and quantity (number)');
      }
    }

    logger.info("✅ Input validation passed");

    // 2. Obtener Access Token desde Secret Manager
    const secretName = `SHOP_TEMPLATE_MP_ACCESS_TOKEN_${businessId}`;
    const projectId = process.env.GCLOUD_PROJECT;
    const secretPath = `projects/${projectId}/secrets/${secretName}/versions/latest`;

    let accessToken;
    try {
      logger.info(`🔐 Fetching secret: ${secretName}`);
      const [version] = await secretClient.accessSecretVersion({
        name: secretPath,
      });
      accessToken = version.payload.data.toString();
      logger.info("✅ Access token retrieved successfully");
    } catch (error) {
      logger.error("❌ Failed to retrieve access token from Secret Manager:", error);
      throw new Error(`Failed to retrieve MercadoPago access token for business ${businessId}. Please check Secret Manager configuration.`);
    }

    // 3. Configurar MercadoPago SDK
    const client = new mercadopago.MercadoPagoConfig({
      accessToken: accessToken,
    });
    const preference = new mercadopago.Preference(client);

    logger.info("✅ MercadoPago SDK configured");

    // 4. Guardar/actualizar pedido en Firestore
    const orderData = {
      businessId,
      items,
      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        address: customer.address || ''
      },
      total: totalAmount,
      paymentMethod: "mercadopago",
      status: "pending",
      paymentStatus: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      notes: notes || ''
    };

    // Usar merge para actualizar si ya existe
    await db.collection('orders').doc(orderId).set(orderData, { merge: true });
    logger.info(`✅ Order saved/updated in Firestore: ${orderId}`);

    // 6. Crear preferencia de pago en MercadoPago
    const preferenceData = {
      items: items.map(item => ({
        title: item.name,
        unit_price: parseFloat(item.unit_price),
        quantity: parseInt(item.quantity),
        currency_id: "ARS"
      })),
      payer: {
        name: customer.name,
        phone: {
          number: customer.phone
        },
        email: customer.email || undefined
      },
      back_urls: {
        success: backUrls.success,
        pending: backUrls.pending,
        failure: backUrls.failure
      },
      auto_return: "approved", // Solo auto-redirige en pagos aprobados
      external_reference: orderId,
      notification_url: `https://us-central1-cms-menu-7b4a4.cloudfunctions.net/mercadoPagoWebhookV3`,
      statement_descriptor: "RESTAURANTE",
      metadata: {
        business_id: businessId,
        order_id: orderId
      }
    };

    logger.info("🔄 Creating MercadoPago preference...", { 
      preferenceData,
      backUrls: backUrls
    });

    const mpResponse = await preference.create({ body: preferenceData });
    
    if (!mpResponse || !mpResponse.id || !mpResponse.init_point) {
      throw new Error('Invalid response from MercadoPago API');
    }

    logger.info("✅ MercadoPago preference created:", { 
      preferenceId: mpResponse.id, 
      initPoint: mpResponse.init_point 
    });

    // 6. Actualizar pedido con el ID de preferencia de MercadoPago
    await db.collection('orders').doc(orderId).update({
      mpPreferenceId: mpResponse.id,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    logger.info(`✅ Order updated with MercadoPago preference ID: ${mpResponse.id}`);

    // 7. Retornar init_point al frontend
    return {
      success: true,
      init_point: mpResponse.init_point,
      preference_id: mpResponse.id,
      order_id: orderId
    };

  } catch (error) {
    logger.error("❌ Error creating MercadoPago preference:", error);
    
    // Retornar error estructurado
    throw new Error(`Failed to create MercadoPago preference: ${error.message}`);
  }
});

/**
 * Webhook para recibir notificaciones de MercadoPago
 * HTTP function que maneja las notificaciones de estado de pago
 */
exports.mercadoPagoWebhookV3 = onRequest(async (req, res) => {
  try {
    logger.info("🔔 MercadoPago webhook received:", {
      method: req.method,
      query: req.query,
      body: req.body,
      headers: req.headers
    });

    // 1. Validar que la petición sea POST
    if (req.method !== 'POST') {
      logger.warn("⚠️ Webhook received non-POST request");
      res.status(200).send('OK'); // Responder 200 para evitar reintentos
      return;
    }

    // 2. Extraer topic e id de query o body
    let topic = req.query.topic || req.body.topic;
    let id = req.query.id || req.body.id || req.body.data?.id;

    logger.info(`📋 Webhook details - Topic: ${topic}, ID: ${id}`);

    // Si faltan topic o id, responder OK pero registrar advertencia
    if (!topic || !id) {
      logger.warn("⚠️ Missing topic or id in webhook notification", {
        topic,
        id,
        query: req.query,
        body: req.body
      });
      res.status(200).send('OK');
      return;
    }

    // 3. Manejar notificaciones de payment
    if (topic === 'payment') {
      await handlePaymentNotification(id);
    } else {
      // Para otros topics, responder OK pero registrar advertencia
      logger.warn(`⚠️ Unhandled webhook topic: ${topic}`, { id });
    }

    res.status(200).send('OK');
    
  } catch (error) {
    logger.error("❌ Error processing MercadoPago webhook:", error);
    // Aún así responder 200 para evitar reintentos innecesarios
    res.status(200).send('OK');
  }
});

/**
 * Procesa notificaciones de pago de MercadoPago
 * @param {string} paymentId - ID del pago en MercadoPago
 */
async function handlePaymentNotification(paymentId) {
  try {
    logger.info(`💳 Processing payment notification for ID: ${paymentId}`);

    // 3a. Obtener el paymentId (ya lo tenemos)
    
    // 3b. Primero intentamos con el token específico del business conocido
    // Si no funciona, necesitaremos obtener el business_id desde el payment
    const projectId = process.env.GCLOUD_PROJECT;
    const knownBusinessId = 'OANNHilb2kZOVQKx7fb80hPrAL92'; // Business ID del config
    let secretName = `SHOP_TEMPLATE_MP_ACCESS_TOKEN_${knownBusinessId}`;
    let secretPath = `projects/${projectId}/secrets/${secretName}/versions/latest`;

    let accessToken;
    try {
      logger.info(`🔐 Fetching business-specific secret: ${secretName}`);
      const [version] = await secretClient.accessSecretVersion({
        name: secretPath,
      });
      accessToken = version.payload.data.toString();
      logger.info("✅ Business-specific access token retrieved successfully");
    } catch (error) {
      logger.error("❌ Failed to retrieve business-specific access token from Secret Manager:", error);
      throw new Error(`Failed to retrieve MercadoPago access token for business ${knownBusinessId}. Please check Secret Manager configuration.`);
    }

    // 3c. Configurar MercadoPago SDK
    const client = new mercadopago.MercadoPagoConfig({
      accessToken: accessToken,
    });
    const payment = new mercadopago.Payment(client);

    logger.info("✅ MercadoPago SDK configured for webhook");

    // 3d. Consultar detalles del pago
    logger.info(`🔍 Fetching payment details for ID: ${paymentId}`);
    const mpPayment = await payment.get({ id: paymentId });

    if (!mpPayment) {
      throw new Error(`Payment not found: ${paymentId}`);
    }

    logger.info("✅ Payment details retrieved:", {
      id: mpPayment.id,
      status: mpPayment.status,
      external_reference: mpPayment.external_reference,
      metadata: mpPayment.metadata
    });

    // 3e. Extraer status, external_reference y business_id
    const paymentStatus = mpPayment.status;
    const orderId = mpPayment.external_reference;
    const businessIdFromPayment = mpPayment.metadata?.business_id;

    if (!orderId) {
      logger.warn("⚠️ Payment has no external_reference (orderId)");
      return;
    }

    // Validar que el business_id coincida (seguridad adicional)
    if (businessIdFromPayment && businessIdFromPayment !== knownBusinessId) {
      logger.warn(`⚠️ Business ID mismatch: expected ${knownBusinessId}, got ${businessIdFromPayment}`);
    }

    logger.info(`📦 Processing order update - Order: ${orderId}, Status: ${paymentStatus}`);

    // 3f. Actualizar documento del pedido en Firestore
    const updateData = {
      mpPaymentId: paymentId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Mapear status de MercadoPago a nuestros estados
    switch (paymentStatus) {
      case 'approved':
        updateData.paymentStatus = 'paid';
        updateData.status = 'confirmed';
        logger.info(`✅ Payment approved for order ${orderId}`);
        break;
      case 'pending':
        updateData.paymentStatus = 'pending';
        updateData.status = 'pending';
        logger.info(`⏳ Payment pending for order ${orderId}`);
        break;
      case 'rejected':
      case 'cancelled':
        updateData.paymentStatus = 'failed';
        updateData.status = 'cancelled';
        logger.info(`❌ Payment rejected/cancelled for order ${orderId}`);
        break;
      case 'in_process':
        updateData.paymentStatus = 'processing';
        updateData.status = 'pending';
        logger.info(`🔄 Payment in process for order ${orderId}`);
        break;
      default:
        updateData.paymentStatus = 'unknown';
        logger.warn(`⚠️ Unknown payment status: ${paymentStatus} for order ${orderId}`);
    }

    // Actualizar en Firestore
    await db.collection('orders').doc(orderId).update(updateData);
    
    logger.info(`✅ Order ${orderId} updated successfully`, {
      paymentStatus: updateData.paymentStatus,
      orderStatus: updateData.status,
      mpPaymentId: paymentId
    });

    // Log adicional para debugging
    logger.info(`🎉 Webhook processing completed for payment ${paymentId}`);

  } catch (error) {
    logger.error(`❌ Error processing payment notification ${paymentId}:`, error);
    throw error;
  }
}

/**
 * HTTP Function para crear preferencias de MercadoPago (para testing directo)
 * Compatible con llamadas HTTP directas como curl
 */
exports.createMercadoPagoPreferenceHTTP = onRequest(async (req, res) => {
  try {
    // Configurar CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    logger.info("🔄 Creating MercadoPago preference via HTTP...", { body: req.body });

    // Extract data from request body
    const { 
      businessId = 'HsuTZWhRVkT88a0WOztELGzJUhl1', // Default for testing
      items, 
      payer,
      customer,
      totalAmount,
      orderId = `order_${Date.now()}`, // Generate if not provided
      backUrls = {
        success: 'https://juanmaacampos.github.io/shop_template/#/payment/success',
        pending: 'https://juanmaacampos.github.io/shop_template/#/payment/pending',
        failure: 'https://juanmaacampos.github.io/shop_template/#/payment/failure'
      },
      notes = ""
    } = req.body;

    // Basic validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'items is required and must be a non-empty array' });
      return;
    }

    // Calculate total if not provided
    let calculatedTotal = totalAmount;
    if (!calculatedTotal) {
      calculatedTotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    }

    // Use payer or customer info
    const customerInfo = customer || payer || {};

    logger.info("✅ Input validation passed for HTTP request");

    // Get Access Token from Secret Manager
    const secretName = `SHOP_TEMPLATE_MP_ACCESS_TOKEN_${businessId}`;
    const projectId = process.env.GCLOUD_PROJECT;
    const secretPath = `projects/${projectId}/secrets/${secretName}/versions/latest`;

    let accessToken;
    try {
      logger.info(`🔐 Fetching secret: ${secretName}`);
      const [version] = await secretClient.accessSecretVersion({
        name: secretPath,
      });
      accessToken = version.payload.data.toString();
      logger.info("✅ Access token retrieved successfully");
    } catch (error) {
      logger.error("❌ Failed to retrieve access token from Secret Manager:", error);
      res.status(500).json({ 
        error: `Failed to retrieve MercadoPago access token for business ${businessId}` 
      });
      return;
    }

    // Configure MercadoPago SDK
    const client = new mercadopago.MercadoPagoConfig({
      accessToken: accessToken,
    });
    const preference = new mercadopago.Preference(client);

    logger.info("✅ MercadoPago SDK configured for HTTP request");

    // Save order to Firestore
    const orderData = {
      businessId,
      items,
      customer: customerInfo,
      totalAmount: calculatedTotal,
      status: 'pending',
      paymentStatus: 'pending',
      notes,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('orders').doc(orderId).set(orderData);
    logger.info(`✅ Order saved to Firestore: ${orderId}`);

    // Prepare MercadoPago preference data
    const preferenceData = {
      items: items.map(item => ({
        title: item.title || item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: 'ARS'
      })),
      payer: {
        name: customerInfo.name || 'Customer',
        surname: customerInfo.surname || customerInfo.lastname || '',
        email: customerInfo.email || 'test@test.com',
        phone: customerInfo.phone ? {
          area_code: '',
          number: customerInfo.phone
        } : undefined
      },
      external_reference: orderId,
      back_urls: backUrls,
      auto_return: 'approved',
      notification_url: 'https://us-central1-cms-menu-7b4a4.cloudfunctions.net/mercadoPagoWebhookV3',
      metadata: {
        business_id: businessId,
        order_id: orderId
      }
    };

    logger.info("🔄 Creating MercadoPago preference...", { preferenceData });

    const mpResponse = await preference.create({ body: preferenceData });
    
    if (!mpResponse || !mpResponse.id || !mpResponse.init_point) {
      throw new Error('Invalid response from MercadoPago API');
    }

    logger.info("✅ MercadoPago preference created:", { 
      preferenceId: mpResponse.id, 
      initPoint: mpResponse.init_point 
    });

    // Update order with MercadoPago preference ID
    await db.collection('orders').doc(orderId).update({
      mpPreferenceId: mpResponse.id,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    logger.info(`✅ Order updated with MercadoPago preference ID: ${mpResponse.id}`);

    // Return response
    res.status(200).json({
      success: true,
      init_point: mpResponse.init_point,
      preference_id: mpResponse.id,
      order_id: orderId
    });

  } catch (error) {
    logger.error("❌ Error creating MercadoPago preference via HTTP:", error);
    res.status(500).json({
      error: 'Failed to create MercadoPago preference',
      message: error.message
    });
  }
});
