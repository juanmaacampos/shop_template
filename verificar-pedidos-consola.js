// SCRIPT DE DEBUGGING PARA CONSOLA DEL NAVEGADOR
// Ejecutar en la consola cuando estés en tu aplicación web

console.log('🔍 Iniciando verificación de pedidos...');

async function verificarPedidos() {
  try {
    const businessId = "GLxQFeNBaXO7PFyYnTFlooFgJNl2";
    
    // Importar Firebase
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const { globalFirebaseManager } = await import('./src/cms-menu/firebase-manager.js');
    
    // Inicializar Firebase
    await globalFirebaseManager.initialize();
    const db = globalFirebaseManager.getDatabase();
    
    console.log('✅ Firebase inicializado correctamente');
    
    // Buscar TODOS los pedidos
    console.log('\n📋 Buscando todos los pedidos...');
    const ordersRef = collection(db, 'orders');
    const allOrders = await getDocs(ordersRef);
    
    console.log(`Total de pedidos en la base de datos: ${allOrders.size}`);
    
    let pedidosDelBusiness = 0;
    let pedidosOtros = 0;
    
    allOrders.forEach((doc) => {
      const data = doc.data();
      const esMiBusiness = data.businessId === businessId;
      
      if (esMiBusiness) {
        pedidosDelBusiness++;
        console.log(`✅ MI PEDIDO ${doc.id}:`, {
          businessId: data.businessId,
          total: data.total,
          status: data.status,
          paymentStatus: data.paymentStatus,
          customer: data.customer?.name,
          items: data.items?.length,
          fecha: data.createdAt?.toDate?.() || data.createdAt
        });
      } else {
        pedidosOtros++;
        console.log(`❌ OTRO BUSINESS ${doc.id}:`, {
          businessId: data.businessId,
          total: data.total
        });
      }
    });
    
    console.log(`\n📊 RESUMEN:`);
    console.log(`✅ Pedidos de tu business (${businessId}): ${pedidosDelBusiness}`);
    console.log(`❌ Pedidos de otros business: ${pedidosOtros}`);
    console.log(`📋 Total: ${allOrders.size}`);
    
    if (pedidosDelBusiness === 0) {
      console.log('\n⚠️ NO SE ENCONTRARON PEDIDOS PARA TU BUSINESS');
      console.log('🔧 Posibles causas:');
      console.log('1. No se han creado pedidos aún');
      console.log('2. Los pedidos se están guardando con otro businessId');
      console.log('3. Hay un problema en la configuración');
      
      console.log('\n🧪 Crear un pedido de prueba:');
      console.log('1. Ve a tu tienda');
      console.log('2. Agrega productos al carrito');
      console.log('3. Haz un checkout');
      console.log('4. Vuelve a ejecutar este script');
    } else {
      console.log('\n✅ ¡Perfecto! Tus pedidos están guardándose correctamente');
      console.log('🎯 Si tu CMS no los muestra, el problema está en la consulta del CMS');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.log('\n💡 Asegúrate de:');
    console.log('1. Estar en una página de tu aplicación');
    console.log('2. Que Firebase esté inicializado');
    console.log('3. Tener permisos de lectura en Firestore');
  }
}

// Ejecutar automáticamente
verificarPedidos();
