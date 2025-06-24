import React from 'react';
import './StockIndicator.css';

/**
 * Componente para mostrar el estado del stock en tiempo real
 * @param {Object} props
 * @param {number} props.stock - Cantidad en stock
 * @param {boolean} props.isAvailable - Si el producto está disponible
 * @param {boolean} props.trackStock - Si se está rastreando el stock
 * @param {string} props.status - Estado del stock ('in-stock', 'low-stock', 'out-of-stock', 'unavailable', 'not-tracked')
 * @param {boolean} props.showText - Si mostrar texto además del ícono
 * @param {string} props.size - Tamaño ('small', 'medium', 'large')
 * @param {Date} props.lastUpdated - Última actualización
 * @param {boolean} props.isRealTime - Si está en tiempo real
 */
export function StockIndicator({ 
  stock = 0, 
  isAvailable = true, 
  trackStock = false, 
  status = 'unknown',
  showText = true,
  size = 'medium',
  lastUpdated = null,
  isRealTime = false
}) {
  
  const getStockInfo = () => {
    switch (status) {
      case 'in-stock':
        return {
          icon: '✓',
          text: `Disponible`,
          className: 'stock-in-stock',
          color: '#666'
        };
      case 'low-stock':
        return {
          icon: '⚠',
          text: `Limitado`,
          className: 'stock-low-stock',
          color: '#666'
        };
      case 'out-of-stock':
        return {
          icon: '✕',
          text: 'Agotado',
          className: 'stock-out-of-stock',
          color: '#666'
        };
      case 'unavailable':
        return {
          icon: '✕',
          text: 'No disponible',
          className: 'stock-unavailable',
          color: '#666'
        };
      case 'not-tracked':
        return {
          icon: '✓',
          text: 'Disponible',
          className: 'stock-not-tracked',
          color: '#666'
        };
      default:
        return {
          icon: '?',
          text: 'Estado desconocido',
          className: 'stock-unknown',
          color: '#666'
        };
    }
  };

  const stockInfo = getStockInfo();

  return (
    <div className={`stock-indicator stock-indicator--${size} ${stockInfo.className}`}>
      <div className="stock-indicator__content">
        <span 
          className="stock-indicator__icon"
          style={{ color: stockInfo.color }}
        >
          {stockInfo.icon}
        </span>
        
        {showText && (
          <span 
            className="stock-indicator__text"
            style={{ color: stockInfo.color }}
          >
            {stockInfo.text}
          </span>
        )}
        
        {isRealTime && (
          <span className="stock-indicator__realtime" title="Actualización en tiempo real">
            🔄
          </span>
        )}
      </div>
      
      {false && lastUpdated && showText && (
        <div className="stock-indicator__timestamp">
          Actualizado: {lastUpdated.toLocaleTimeString('es-AR')}
        </div>
      )}
    </div>
  );
}

/**
 * Componente para mostrar un resumen del stock de múltiples productos
 */
export function StockSummary({ stockData, isRealTime = false }) {
  const stats = Object.values(stockData).reduce((acc, product) => {
    if (!product.trackStock) {
      acc.notTracked++;
    } else if (!product.isAvailable) {
      acc.unavailable++;
    } else if (product.stock <= 0) {
      acc.outOfStock++;
    } else if (product.stock <= 5) {
      acc.lowStock++;
    } else {
      acc.inStock++;
    }
    acc.total++;
    return acc;
  }, {
    total: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    unavailable: 0,
    notTracked: 0
  });

  return (
    <div className="stock-summary">
      <div className="stock-summary__header">
        <h3>Resumen de Stock</h3>
        {isRealTime && (
          <span className="stock-summary__realtime" title="Actualización en tiempo real">
            🔄 En tiempo real
          </span>
        )}
      </div>
      
      <div className="stock-summary__stats">
        <div className="stock-stat stock-stat--in-stock">
          <span className="stock-stat__icon">✅</span>
          <span className="stock-stat__label">En stock</span>
          <span className="stock-stat__count">{stats.inStock}</span>
        </div>
        
        <div className="stock-stat stock-stat--low-stock">
          <span className="stock-stat__icon">⚠️</span>
          <span className="stock-stat__label">Poco stock</span>
          <span className="stock-stat__count">{stats.lowStock}</span>
        </div>
        
        <div className="stock-stat stock-stat--out-of-stock">
          <span className="stock-stat__icon">❌</span>
          <span className="stock-stat__label">Sin stock</span>
          <span className="stock-stat__count">{stats.outOfStock}</span>
        </div>
        
        <div className="stock-stat stock-stat--unavailable">
          <span className="stock-stat__icon">🚫</span>
          <span className="stock-stat__label">No disponible</span>
          <span className="stock-stat__count">{stats.unavailable}</span>
        </div>
        
        <div className="stock-stat stock-stat--not-tracked">
          <span className="stock-stat__icon">📦</span>
          <span className="stock-stat__label">Sin seguimiento</span>
          <span className="stock-stat__count">{stats.notTracked}</span>
        </div>
      </div>
      
      <div className="stock-summary__total">
        Total de productos: {stats.total}
      </div>
    </div>
  );
}

export default StockIndicator;