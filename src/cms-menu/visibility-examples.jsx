import React from 'react';
import { MenuSDK } from './menu-sdk.js';
import { ItemVisibilityManager } from './ItemVisibilityManager.jsx';
import { MENU_CONFIG } from './config.js';
import { FaUtensils } from 'react-icons/fa';

/**
 * Ejemplo de uso del Gestor de Visibilidad de Items
 * Solo para uso administrativo
 */
export function AdminVisibilityExample() {
  // Crear una instancia del SDK
  const menuSDK = new MenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId);

  const handleUpdate = () => {
    console.log('✅ Item visibility updated');
    // Aquí puedes agregar lógica adicional como mostrar notificaciones
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>🔧 Panel de Administración</h1>
        <p>Gestiona la visibilidad de los items de tu menú</p>
      </div>

      <ItemVisibilityManager 
        menuSDK={menuSDK}
        onUpdate={handleUpdate}
      />
    </div>
  );
}

/**
 * Ejemplo de menú público que solo muestra items visibles
 */
export function PublicMenuExample() {
  const menuSDK = new MenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId);

  return (
    <div className="public-menu">
      <h1><FaUtensils /> Nuestro Menú</h1>
      <p>Solo verás los items disponibles</p>
      
      {/* Aquí usarías MenuWithCart que automáticamente filtra items ocultos */}
      <MenuWithCart 
        menuSDK={menuSDK}
        showImages={true}
        terminology={{
          menuName: 'menú',
          items: 'platos',
          addToCart: 'Agregar al carrito',
          orderSummary: 'Resumen del pedido'
        }}
      />
    </div>
  );
}

/**
 * Ejemplo comparativo: menú completo vs menú público
 */
export function MenuComparisonExample() {
  const menuSDK = new MenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId);

  return (
    <div className="menu-comparison">
      <div className="comparison-header">
        <h1>👀 Comparación de Visibilidad</h1>
        <p>Ve la diferencia entre el menú completo (admin) y el público</p>
      </div>

      <div className="comparison-grid">
        <div className="admin-view">
          <h2>Vista Administrativa</h2>
          <p>Incluye todos los items (visibles y ocultos)</p>
          <ItemVisibilityManager menuSDK={menuSDK} />
        </div>

        <div className="public-view">
          <h2>Vista Pública</h2>
          <p>Solo items visibles para clientes</p>
          <PublicMenuExample />
        </div>
      </div>
    </div>
  );
}

export default {
  AdminVisibilityExample,
  PublicMenuExample,
  MenuComparisonExample
};
