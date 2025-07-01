/**
 * Payment Service for MercadoPago Integration
 * Frontend service to interact with Cloud Functions
 */

import { getFunctions, httpsCallable } from 'firebase/functions';
import { globalFirebaseManager } from './firebase-manager.js';

export class PaymentService {
  constructor() {
    this.functions = null;
    this.initialized = false;
  }

  async _ensureInitialized() {
    if (this.initialized) return;

    try {
      const { app } = await globalFirebaseManager.initialize();
      this.functions = getFunctions(app);
      this.initialized = true;
      console.log('✅ PaymentService initialized');
    } catch (error) {
      console.error('❌ Failed to initialize PaymentService:', error);
      throw error;
    }
  }

  _validateOrderData(orderData) {
    console.log('🔍 Validating order data:', {
      hasBusinessId: !!orderData.businessId,
      businessId: orderData.businessId,
      hasItems: !!orderData.items,
      itemsLength: orderData.items?.length,
      hasCustomer: !!orderData.customer,
      customerData: orderData.customer,
      hasTotalAmount: !!orderData.totalAmount,
      totalAmount: orderData.totalAmount,
      hasOrderId: !!orderData.orderId,
      orderId: orderData.orderId,
      hasBackUrls: !!orderData.backUrls,
      backUrls: orderData.backUrls
    });

    if (!orderData.businessId || typeof orderData.businessId !== 'string') {
      throw new Error('businessId is required and must be a string');
    }

    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      throw new Error('items is required and must be a non-empty array');
    }

    if (!orderData.customer || typeof orderData.customer !== 'object' || !orderData.customer.name || !orderData.customer.phone) {
      throw new Error('customer is required with name and phone');
    }

    if (!orderData.totalAmount || typeof orderData.totalAmount !== 'number' || orderData.totalAmount <= 0) {
      throw new Error('totalAmount is required and must be a positive number');
    }

    if (!orderData.orderId || typeof orderData.orderId !== 'string') {
      throw new Error('orderId is required and must be a string');
    }

    if (!orderData.backUrls || typeof orderData.backUrls !== 'object' || 
        !orderData.backUrls.success || !orderData.backUrls.pending || !orderData.backUrls.failure) {
      throw new Error('backUrls is required with success, pending, and failure URLs');
    }

    // Validar estructura de items
    for (const item of orderData.items) {
      if (!item.name || typeof item.unit_price !== 'number' || typeof item.quantity !== 'number') {
        throw new Error(`Invalid item structure: ${JSON.stringify(item)}`);
      }
    }

    console.log('✅ Order data validation passed');
  }

  /**
   * Crear preferencia de pago en MercadoPago usando Cloud Functions
   * @param {Object} orderData - Datos del pedido
   * @returns {Promise<Object>} Respuesta con init_point para redirección
   */
  async createMercadoPagoPreference(orderData) {
    try {
      await this._ensureInitialized();

      console.log('🔄 Creating MercadoPago preference...', orderData);

      // Validar datos requeridos
      this._validateOrderData(orderData);

      try {
        // Llamar a Cloud Function (onCall)
        const createPreference = httpsCallable(this.functions, 'createMercadoPagoPreference');
        
        console.log('📤 Sending data to Cloud Function:', {
          businessId: orderData.businessId,
          itemsCount: orderData.items.length,
          totalAmount: orderData.totalAmount,
          orderId: orderData.orderId
        });

        const result = await createPreference({
          businessId: orderData.businessId,
          items: orderData.items,
          customer: orderData.customer,
          totalAmount: orderData.totalAmount,
          orderId: orderData.orderId,
          backUrls: orderData.backUrls,
          notes: orderData.notes || ''
        });

        if (result.data.success) {
          console.log('✅ MercadoPago preference created:', result.data);
          return {
            success: true,
            init_point: result.data.init_point,
            preference_id: result.data.preference_id,
            order_id: result.data.order_id
          };
        } else {
          console.error('❌ Failed to create preference:', result.data);
          throw new Error('Failed to create payment preference');
        }
      } catch (firebaseError) {
        console.error('❌ Firebase callable error details:', {
          code: firebaseError.code,
          message: firebaseError.message,
          details: firebaseError.details,
          stack: firebaseError.stack
        });
        
        console.warn('⚠️ Firebase callable failed, trying HTTP fallback');
        
        // Fallback to HTTP function
        const response = await fetch('https://us-central1-cms-menu-7b4a4.cloudfunctions.net/createMercadoPagoPreferenceHTTP', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            businessId: orderData.businessId,
            items: orderData.items,
            payer: orderData.customer,
            totalAmount: orderData.totalAmount,
            orderId: orderData.orderId,
            backUrls: orderData.backUrls,
            notes: orderData.notes || ''
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ HTTP fallback failed:', {
            status: response.status,
            statusText: response.statusText,
            errorData
          });
          throw new Error(`HTTP function failed: ${errorData.message || response.statusText}`);
        }

        const result = await response.json();
        console.log('✅ MercadoPago preference created via HTTP:', result);
        return result;
      }

    } catch (error) {
      console.error('❌ Error creating MercadoPago preference:', {
        message: error.message,
        stack: error.stack
      });
      throw new Error(`Payment error: ${error.message}`);
    }
  }

  /**
   * Generar URLs de retorno para MercadoPago
   * @param {string} baseUrl - URL base de la aplicación
   * @param {string} orderId - ID del pedido
   * @returns {Object} URLs de retorno
   */
  generateBackUrls(baseUrl, orderId) {
    // Usar siempre la URL de producción para las URLs de retorno
    const prodBaseUrl = "https://juanmaacampos.github.io/shop_template";
    
    // MercadoPago reemplaza automáticamente estos placeholders
    return {
      success: `${prodBaseUrl}/#/payment/success?order=${orderId}&payment_id={{payment_id}}&status={{status}}&collection_status={{collection_status}}&source=mp_redirect`,
      pending: `${prodBaseUrl}/#/payment/pending?order=${orderId}&payment_id={{payment_id}}&status={{status}}&collection_status={{collection_status}}&source=mp_redirect`,
      failure: `${prodBaseUrl}/#/payment/failure?order=${orderId}&payment_id={{payment_id}}&status={{status}}&collection_status={{collection_status}}&source=mp_redirect`
    };
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
export default paymentService;
