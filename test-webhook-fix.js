/**
 * Script de prueba para verificar que el webhook funciona correctamente
 * con el token específico del business
 */

// Script para probar el webhook desde la consola del navegador
function testWebhookFix() {
  console.log('🧪 Testing webhook fix...');
  
  const webhookUrl = 'https://mercadopagowebhookv3-pmav4zp6aq-uc.a.run.app';
  const testPaymentId = '123456789'; // ID de prueba
  
  // Simular un webhook de MercadoPago
  const webhookData = {
    topic: 'payment',
    id: testPaymentId
  };
  
  console.log('📡 Sending test webhook to:', webhookUrl);
  console.log('📋 Test data:', webhookData);
  
  fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(webhookData)
  })
  .then(response => {
    console.log('✅ Webhook response status:', response.status);
    return response.text();
  })
  .then(text => {
    console.log('📝 Webhook response:', text);
  })
  .catch(error => {
    console.error('❌ Webhook test failed:', error);
  });
}

// Para ejecutar desde la consola del navegador:
// testWebhookFix();

console.log('🔧 Script cargado. Ejecuta testWebhookFix() para probar el webhook.');
