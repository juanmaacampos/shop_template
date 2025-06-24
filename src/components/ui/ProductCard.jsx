import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ProductCard.css';

gsap.registerPlugin(ScrollTrigger);

const ProductCard = ({ 
  item, 
  onAddToCart, 
  showImage = true, 
  showPrice = true, 
  showDescription = true,
  terminology = {},
  businessId = null,
  categoryId = null,
  enableRealTimeStock = false,
  db = null 
}) => {
  const cardRef = useRef(null);
  const navigate = useNavigate();

  const handleCardClick = (e) => {
    // Prevenir navegación si se hace click en el botón
    if (e.target.closest('.product-card-footer button')) {
      return;
    }
    navigate(`/producto/${item.id}`);
  };

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current,
        { opacity: 0, y: 30, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 85%",
            end: "bottom 15%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }
  }, []);

  const imageSource = item.imageUrl || item.image;
  const currentStock = item.stock || 0;
  const currentAvailable = item.isAvailable !== false;

  // Funciones helper para el estado del item
  const isItemAvailable = () => {
    if (item.isHidden) return false;
    if (item.isAvailable === false) return false;
    if (!item.trackStock) return true;
    return item.stock > 0;
  };

  const getButtonClass = () => {
    if (item.isHidden) return 'product-card-button disabled';
    if (!isItemAvailable()) return 'product-card-button disabled';
    if (item.trackStock && item.stock <= (item.minStock || 5)) return 'product-card-button warning';
    return 'product-card-button';
  };

  const getButtonText = () => {
    if (item.isHidden) return 'No disponible';
    if (item.isAvailable === false) return 'No disponible';
    if (item.trackStock && item.stock <= 0) return 'Sin stock';
    if (item.trackStock && item.stock <= 5) return `Agregar (quedan ${item.stock})`;
    return terminology.addToCart || 'Agregar al Carrito';
  };

  const getStockBadge = () => {
    if (!item.trackStock) {
      return currentAvailable && !item.isHidden ? (
        <span className="stock-badge available">En Stock</span>
      ) : null;
    }

    if (item.stock <= 0 || item.isAvailable === false) {
      return <span className="stock-badge out-of-stock">Sin Stock</span>;
    }

    if (item.stock <= 5) {
      return <span className="stock-badge low-stock">Poco Stock</span>;
    }

    return <span className="stock-badge in-stock">En Stock</span>;
  };

  return (
    <div 
      ref={cardRef} 
      className={`product-card ${item.isHidden ? 'hidden' : ''}`}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      {showImage && (
        <div className="product-card-image">
          {imageSource ? (
            <img src={imageSource} alt={item.name} />
          ) : (
            <div className="product-card-placeholder">
              🍽️
            </div>
          )}
          {getStockBadge()}
        </div>
      )}
      
      <div className="product-card-content">
        <div className="product-card-header">
          <h3 className="product-card-title">{item.name}</h3>
          {showPrice && (
            <span className="product-card-price">${item.price}</span>
          )}
        </div>
        
        {showDescription && item.description && (
          <p className="product-card-description">{item.description}</p>
        )}
        
        <div className="product-card-footer">
          {onAddToCart && (
            <button 
              className={getButtonClass()}
              onClick={() => !item.isHidden && isItemAvailable() && onAddToCart(item)}
              disabled={item.isHidden || !isItemAvailable()}
            >
              {getButtonText()}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
