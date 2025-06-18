// Configuración para la integración del menú CMS
// ⚠️ IMPORTANTE: Reemplaza estos valores con tu configuración real

export const MENU_CONFIG = {
  // Configuración de Firebase (copia desde tu Firebase Console)
  firebaseConfig: {
    apiKey: "AIzaSyDHi_a1trI35goPoKcNPUDBMOSLKjvZKyc",
    authDomain: "cms-menu-7b4a4.firebaseapp.com",
    projectId: "cms-menu-7b4a4",
    storageBucket: "cms-menu-7b4a4.firebasestorage.app",
    messagingSenderId: "509736809578",
    appId: "1:509736809578:web:15471af092f3b46392c613",
    measurementId: "G-X4F9XDEL13"
  },
  
  // ✅ Business ID (recomendado - sistema unificado)
  businessId: "GLxQFeNBaXO7PFyYnTFlooFgJNl2", // Updated to match working MercadoPago secret
  
  // 🔄 Restaurant ID (para compatibilidad - mismo valor que businessId)
  restaurantId: "store_template_demo", // Keep for compatibility
  
  // MercadoPago configuration - PRODUCCIÓN
  mercadoPago: {
    publicKey: "APP_USR-6359a306-23ca-4d23-924e-b72a3fd1816f", // Tu public key de producción
    currency: "ARS",
    enabled: true // Habilitado para producción
  },
  
  // URLs de tu aplicación - PRODUCCIÓN
  baseUrl: "https://juanmaacampos.github.io/restaurant_template", // URL de producción GitHub Pages
  backendUrl: "https://us-central1-cms-menu-7b4a4.cloudfunctions.net", // Cloud Functions URL
  
  // 🧪 Testing configuration
  testing: {
    enabled: false, // Cambiar a true para habilitar modo testing
    showTestingPanel: false
  }
};

// Función para obtener el UID del business
// Instrucciones:
// 1. Ve a tu CMS panel y haz login con la cuenta del business
// 2. Abre las herramientas de desarrollador (F12)
// 3. En la consola ejecuta: firebase.auth().currentUser.uid
// 4. Copia ese UID y reemplaza el businessId arriba

export function validateConfig() {
  if (MENU_CONFIG.businessId === "GLxQFeNBaXO7PFyYnTFlooFgJNl2" || 
      MENU_CONFIG.restaurantId === "YOUR_BUSINESS_UID_HERE") {
    console.warn("⚠️ Configuración incompleta!");
    console.log("📝 Para obtener tu Business UID:");
    console.log("1. Ve a tu panel CMS de menús");
    console.log("2. Haz login con la cuenta del business/restaurant");
    console.log("3. Abre las herramientas de desarrollador (F12)");
    console.log("4. En la consola ejecuta: firebase.auth().currentUser.uid");
    console.log("5. Copia ese UID a config.js");
    return false;
  }
  return true;
}

// Store-specific terminology
export const STORE_TERMINOLOGY = {
  businessName: "Tienda Digital",
  menuName: "catálogo",
  menuNameCapitalized: "Nuestro Catálogo",
  items: "productos",
  itemsCapitalized: "Productos",
  addToCart: "Agregar al Carrito",
  orderSummary: "Carrito de Compras",
  categoriesOfMenu: "Categorías de Productos",
  featuredProducts: "Productos Destacados",
  allProducts: "Todos los Productos",
  serviceOptions: {
    delivery: "Envío a Domicilio",
    pickup: "Retiro en Tienda",
    shipping: "Envío Nacional"
  }
};

//note
