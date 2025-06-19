import React, { useState, useEffect } from 'react';
import { MenuSDK } from './menu-sdk.js';
import './ItemVisibilityManager.css';

/**
 * Componente para gestionar la visibilidad de items del menú
 * Solo para uso administrativo
 */
export function ItemVisibilityManager({ menuSDK, onUpdate }) {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMenuWithHidden();
  }, [menuSDK]);

  const loadMenuWithHidden = async () => {
    try {
      setLoading(true);
      setError(null);
      const fullMenu = await menuSDK.getFullMenuWithHidden();
      setMenu(fullMenu);
    } catch (err) {
      setError(err.message);
      console.error('Error loading menu with hidden items:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleItemVisibility = async (categoryId, itemId, currentHidden) => {
    try {
      setSaving(true);
      
      // Aquí implementarías la lógica para actualizar el estado en Firebase
      // Por ahora solo actualizamos el estado local
      setMenu(prevMenu => 
        prevMenu.map(category => {
          if (category.id === categoryId) {
            return {
              ...category,
              items: category.items.map(item => {
                if (item.id === itemId) {
                  return { ...item, isHidden: !currentHidden };
                }
                return item;
              })
            };
          }
          return category;
        })
      );

      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      setError(`Error updating item visibility: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="visibility-manager loading">
        <div className="loading-spinner"></div>
        <p>Cargando menú completo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="visibility-manager error">
        <h3>❌ Error</h3>
        <p>{error}</p>
        <button onClick={loadMenuWithHidden} className="retry-btn">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="visibility-manager">
      <div className="manager-header">
        <h2>🔧 Gestión de Visibilidad de Items</h2>
        <p>Controla qué items son visibles para los clientes</p>
      </div>

      <div className="manager-stats">
        <div className="stat">
          <span className="stat-number">
            {menu.reduce((total, cat) => total + cat.items.length, 0)}
          </span>
          <span className="stat-label">Total Items</span>
        </div>
        <div className="stat">
          <span className="stat-number">
            {menu.reduce((total, cat) => total + cat.items.filter(item => !item.isHidden).length, 0)}
          </span>
          <span className="stat-label">Visibles</span>
        </div>
        <div className="stat">
          <span className="stat-number">
            {menu.reduce((total, cat) => total + cat.items.filter(item => item.isHidden).length, 0)}
          </span>
          <span className="stat-label">Ocultos</span>
        </div>
      </div>

      <div className="categories-list">
        {menu.map(category => (
          <div key={category.id} className="category-section">
            <div className="category-header">
              <h3>{category.name}</h3>
              <span className="item-count">
                {category.items.filter(item => !item.isHidden).length} de {category.items.length} visibles
              </span>
            </div>

            <div className="items-grid">
              {category.items.map(item => (
                <div 
                  key={item.id} 
                  className={`item-card ${item.isHidden ? 'hidden' : 'visible'}`}
                >
                  <div className="item-info">
                    <div className="item-header">
                      <h4>{item.name}</h4>
                      <span className="item-price">${item.price}</span>
                    </div>
                    {item.description && (
                      <p className="item-description">{item.description}</p>
                    )}
                    <div className="item-tags">
                      {item.isFeatured && <span className="tag featured">⭐ Destacado</span>}
                      {item.trackStock && <span className="tag stock">📦 Stock: {item.stock || 0}</span>}
                    </div>
                  </div>

                  <div className="item-controls">
                    <div className="visibility-toggle">
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={!item.isHidden}
                          onChange={() => toggleItemVisibility(category.id, item.id, item.isHidden)}
                          disabled={saving}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                      <span className="toggle-label">
                        {item.isHidden ? '👁️‍🗨️ Oculto' : '👁️ Visible'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ItemVisibilityManager;
