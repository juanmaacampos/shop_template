/**
 * Script de debugging para verificar pedidos en Firebase
 * Ejecutar desde la consola del navegador para verificar los pedidos
 */

// Script para verificar pedidos en Firebase Console
async function debugOrders() {
  console.log('🔍 Verificando pedidos para business ID: GLxQFeNBaXO7PFyYnTFlooFgJNl2');
  
  try {
    // Importar Firebase desde el módulo global si está disponible
    const { collection, query, where, getDocs, orderBy } = window.firebase?.firestore ? 
      window.firebase.firestore : 
      await import('./src/firebase.js');
    
    const { db } = await import('./src/firebase.js');
    
    const businessId = "GLxQFeNBaXO7PFyYnTFlooFgJNl2";
    
    // 1. Buscar todos los pedidos en la colección orders
    console.log('📋 1. Buscando TODOS los pedidos en la colección orders...');
    const allOrdersRef = collection(db, 'orders');
    const allOrdersSnapshot = await getDocs(allOrdersRef);
    
    console.log(`Total de pedidos en la base de datos: ${allOrdersSnapshot.size}`);
    allOrdersSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`Pedido ${doc.id}:`, {
        businessId: data.businessId,
        restaurantId: data.restaurantId, // Si existe
        total: data.total,
        status: data.status,
        createdAt: data.createdAt?.toDate?.() || data.createdAt
      });
    });
    
    console.log('\n🎯 2. Buscando pedidos específicos para tu business ID...');
    
    // 2. Buscar pedidos específicos para tu businessId
    const businessOrdersRef = collection(db, 'orders');
    const businessOrdersQuery = query(
      businessOrdersRef, 
      where('businessId', '==', businessId),
      orderBy('createdAt', 'desc')
    );
    
    const businessOrdersSnapshot = await getDocs(businessOrdersQuery);
    console.log(`Pedidos para tu business (${businessId}): ${businessOrdersSnapshot.size}`);
    
    businessOrdersSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`✅ Pedido encontrado ${doc.id}:`, {
        businessId: data.businessId,
        total: data.total,
        status: data.status,
        paymentStatus: data.paymentStatus,
        customer: data.customer?.name,
        items: data.items?.length || 0,
        createdAt: data.createdAt?.toDate?.() || data.createdAt
      });
    });
    
    // 3. Verificar si hay pedidos con restaurantId (legacy)
    console.log('\n🔍 3. Verificando pedidos legacy con restaurantId...');
    try {
      const legacyOrdersQuery = query(
        businessOrdersRef, 
        where('restaurantId', '==', businessId)
      );
      
      const legacyOrdersSnapshot = await getDocs(legacyOrdersQuery);
      console.log(`Pedidos legacy encontrados: ${legacyOrdersSnapshot.size}`);
      
      legacyOrdersSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`📰 Pedido legacy ${doc.id}:`, {
          restaurantId: data.restaurantId,
          businessId: data.businessId,
          total: data.total
        });
      });
    } catch (legacyError) {
      console.log('No hay pedidos legacy o error al buscarlos:', legacyError.message);
    }
    
    // 4. Verificar la configuración actual
    console.log('\n⚙️ 4. Configuración actual:');
    const { MENU_CONFIG } = await import('./src/cms-menu/config.js');
    console.log('MENU_CONFIG.businessId:', MENU_CONFIG.businessId);
    console.log('¿Coincide con el business ID buscado?', MENU_CONFIG.businessId === businessId);
    
    // 5. Instrucciones para el CMS
    console.log('\n📝 5. Para ver los pedidos en tu CMS:');
    console.log('- Ve a tu panel de administración del CMS');
    console.log('- Asegúrate de que estés logueado con la cuenta del business');
    console.log('- El CMS debe filtrar pedidos por businessId =', businessId);
    console.log('- Si no ves pedidos, revisa que tu CMS esté consultando la colección "orders" correctamente');
    
  } catch (error) {
    console.error('❌ Error verificando pedidos:', error);
    console.log('\n🔧 Para ejecutar este script correctamente:');
    console.log('1. Abre las herramientas de desarrollador (F12)');
    console.log('2. Ve a la pestaña Console');
    console.log('3. Copia y pega este código');
    console.log('4. Presiona Enter');
  }
}

// Instrucciones de uso
console.log('🚀 Script de debugging cargado!');
console.log('📝 Para ejecutar: debugOrders()');
console.log('💡 Asegúrate de estar en una página con Firebase inicializado');

// Para uso directo desde el archivo
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { debugOrders };
}

// Para uso desde navegador
if (typeof window !== 'undefined') {
  window.debugOrders = debugOrders;
}
