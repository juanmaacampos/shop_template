// Ejemplo de uso del sistema de stock en tiempo real
// Este archivo muestra cómo usar las nuevas características de stock

import React from 'react';
import { MenuSDK } from './menu-sdk.js';
import { MenuWithCart, MenuDisplay } from './MenuComponents.jsx';
import { StockSummary } from './StockIndicator.jsx';
import { useRealTimeStockByCategory } from './useRealTimeStock.js';
import { MENU_CONFIG } from './config.js';

// Ejemplo 1: Menu completo con stock en tiempo real
export function MenuWithRealTimeStock() {
  const menuSDK = new MenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId);
  
  return (
    <MenuWithCart 
      menuSDK={menuSDK}
      showImages={true}
      enableRealTimeStock={true} // 🆕 Habilitar stock en tiempo real
      terminology={{
        menuName: 'catálogo',
        items: 'productos',
        addToCart: 'Agregar al carrito',
        orderSummary: 'Resumen del pedido'
      }}
    />
  );
}

// Ejemplo 2: Monitor de stock por categoría
export function CategoryStockMonitor({ categoryId }) {
  const [menuSDK] = React.useState(() => 
    new MenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId)
  );
  const [initialized, setInitialized] = React.useState(false);

  React.useEffect(() => {
    menuSDK.initialize().then(() => setInitialized(true));
  }, [menuSDK]);

  const {
    stockData,
    loading,
    error,
    isRealTimeActive,
    lastUpdated
  } = useRealTimeStockByCategory(
    categoryId,
    MENU_CONFIG.businessId,
    initialized,
    menuSDK.db
  );

  if (loading) return <div>Cargando stock...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h3>Monitor de Stock - Categoría: {categoryId}</h3>
      <div>
        <p>Estado: {isRealTimeActive ? '🔄 Tiempo real activo' : '❌ Sin conexión'}</p>
        {lastUpdated && <p>Última actualización: {lastUpdated.toLocaleString()}</p>}
      </div>
      
      {/* Resumen visual del stock */}
      <StockSummary stockData={stockData} isRealTime={isRealTimeActive} />
      
      {/* Lista detallada de productos */}
      <div style={{ marginTop: '1rem' }}>
        <h4>Productos:</h4>
        {Object.values(stockData).map(product => (
          <div key={product.id} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            padding: '0.5rem',
            border: '1px solid #ddd',
            marginBottom: '0.5rem',
            borderRadius: '4px'
          }}>
            <span>{product.name}</span>
            <span>
              {product.trackStock ? 
                `Stock: ${product.stock} | ${product.isAvailable ? 'Disponible' : 'No disponible'}` :
                'Sin seguimiento'
              }
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Ejemplo 3: Componente de producto individual con stock
export function ProductWithStock({ productId, categoryId }) {
  const [menuSDK] = React.useState(() => 
    new MenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId)
  );
  const [initialized, setInitialized] = React.useState(false);

  React.useEffect(() => {
    menuSDK.initialize().then(() => setInitialized(true));
  }, [menuSDK]);

  const {
    getProductStock,
    isProductAvailable,
    getStockStatus,
    isRealTimeActive
  } = useRealTimeStock(
    [{ id: productId, categoryId }],
    MENU_CONFIG.businessId,
    initialized,
    menuSDK.db
  );

  const stock = getProductStock(productId);
  const available = isProductAvailable(productId);
  const status = getStockStatus(productId);

  return (
    <div style={{ 
      padding: '1rem', 
      border: '1px solid #ddd', 
      borderRadius: '8px',
      margin: '1rem 0'
    }}>
      <h4>Producto: {productId}</h4>
      <p>Stock: {stock}</p>
      <p>Disponible: {available ? 'Sí' : 'No'}</p>
      <p>Estado: {status}</p>
      <p>Tiempo real: {isRealTimeActive ? '🔄 Activo' : '❌ Inactivo'}</p>
      
      <button 
        disabled={!available || stock <= 0}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: available && stock > 0 ? '#007bff' : '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: available && stock > 0 ? 'pointer' : 'not-allowed'
        }}
      >
        {!available ? 'No disponible' : 
         stock <= 0 ? 'Sin stock' : 
         'Agregar al carrito'}
      </button>
    </div>
  );
}

// Configuraciones recomendadas para diferentes tipos de negocio
export const STOCK_CONFIGURATIONS = {
  // Para restaurantes (generalmente no necesitan stock estricto)
  restaurant: {
    enableRealTimeStock: false,
    trackStockByDefault: false,
    terminology: {
      menuName: 'menú',
      items: 'platos',
      addToCart: 'Agregar al pedido'
    }
  },
  
  // Para tiendas (necesitan control de stock)
  store: {
    enableRealTimeStock: true,
    trackStockByDefault: true,
    terminology: {
      menuName: 'catálogo',
      items: 'productos',
      addToCart: 'Agregar al carrito'
    }
  }
};

export default {
  MenuWithRealTimeStock,
  CategoryStockMonitor,
  ProductWithStock,
  STOCK_CONFIGURATIONS
};
