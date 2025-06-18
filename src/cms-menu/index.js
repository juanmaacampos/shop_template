// Exportaciones principales del CMS Menu
export { MenuSDK, createMenuSDK } from './menu-sdk.js';
export { 
  useMenu, 
  useCart, 
  useMenuIntegration,
  useMenuWithTerminology,
  useBusinessTerminology,
  useFeaturedItems
} from './useMenu.js';
export { 
  MenuDisplay, 
  MenuItem, 
  Cart, 
  MenuWithCart, 
  FeaturedItems,
  CategoryNav
} from './MenuComponents.jsx';

// 🆕 Exportaciones del sistema de stock en tiempo real
export { 
  useRealTimeStock, 
  useRealTimeStockByCategory 
} from './useRealTimeStock.js';
export { 
  StockIndicator, 
  StockSummary 
} from './StockIndicator.jsx';

// Configuración y utilidades
export { MENU_CONFIG } from './config.js';
export { menuSDKManager } from './menu-sdk-singleton.js';
export { globalFirebaseManager } from './firebase-manager.js';
