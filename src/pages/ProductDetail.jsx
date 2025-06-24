import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMenu as useMenuContext } from '../context/MenuContext.jsx';
import { useCart } from '../cms-menu/useMenu.js';
import { StockIndicator } from '../cms-menu/StockIndicator.jsx';
import { FaShoppingCart } from 'react-icons/fa';
import './ProductDetail.css';

// Componente para productos sugeridos
const SuggestedProducts = ({ currentProduct, menu, onProductClick }) => {
  const [suggestedProducts, setSuggestedProducts] = useState([]);

  useEffect(() => {
    if (!currentProduct || !menu) return;

    // Buscar productos de la misma categoría
    let categoryProducts = [];
    for (const [categoryName, category] of Object.entries(menu)) {
      if (category.items) {
        const currentProductInCategory = category.items.find(item => item.id === currentProduct.id);
        if (currentProductInCategory) {
          // Encontramos la categoría del producto actual
          categoryProducts = category.items
            .filter(item => 
              item.id !== currentProduct.id && // Excluir el producto actual
              !item.isHidden && // Solo productos visibles
              item.isAvailable !== false // Solo productos disponibles
            )
            .slice(0, 8); // Máximo 8 productos sugeridos
          break;
        }
      }
    }

    setSuggestedProducts(categoryProducts);
  }, [currentProduct, menu]);

  if (suggestedProducts.length === 0) return null;

  return (
    <div className="suggested-products-section">
      <h2>Productos relacionados</h2>
      <div className="suggested-products-grid">
        {suggestedProducts.map((product) => (
          <div 
            key={product.id} 
            className="suggested-product-card"
            onClick={() => onProductClick(product.id)}
          >
            <div className="suggested-product-image">
              {product.images?.[0] || product.imageUrl || product.image ? (
                <img 
                  src={product.images?.[0] || product.imageUrl || product.image} 
                  alt={product.name}
                />
              ) : (
                <div className="suggested-product-placeholder">🍽️</div>
              )}
            </div>
            <div className="suggested-product-info">
              <h3 className="suggested-product-name">{product.name}</h3>
              <div className="suggested-product-price">
                <span className="price-symbol">$</span>
                <span className="price-amount">{product.price}</span>
              </div>
              {product.trackStock && product.stock <= 5 && product.stock > 0 && (
                <div className="suggested-stock-warning">
                  ⚠️ Últimas {product.stock} unidades
                </div>
              )}
              {product.trackStock && product.stock <= 0 && (
                <div className="suggested-out-of-stock">
                  ❌ Sin stock
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { menu, isLoading: menuLoading, error: menuError } = useMenuContext();
  const { addToCart, cartCount } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showAddedNotification, setShowAddedNotification] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (menu && !menuLoading) {
      // Buscar el producto en todas las categorías
      let foundProduct = null;
      for (const category of Object.values(menu)) {
        if (category.items) {
          foundProduct = category.items.find(item => item.id === productId);
          if (foundProduct) break;
        }
      }
      
      if (foundProduct) {
        setProduct(foundProduct);
        // Si el producto tiene múltiples imágenes, usar la primera como seleccionada
        if (foundProduct.images && foundProduct.images.length > 0) {
          setSelectedImage(0);
        }
      } else {
        setProduct(null);
      }
    }
  }, [menu, menuLoading, productId]);

  // useEffect adicional para resetear el estado cuando cambia el productId
  useEffect(() => {
    // Marcar como transición y resetear estados cuando cambia el producto
    setIsTransitioning(true);
    setQuantity(1);
    setSelectedImage(0);
    setShowAddedNotification(false);
    
    // Scroll al top de la página
    window.scrollTo(0, 0);
    
    // Quitar el estado de transición después de un breve delay
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;

    try {
      // Usar la función addToCart del contexto que ya maneja el stock
      addToCart(product, quantity);
      
      // Mostrar notificación
      setShowAddedNotification(true);
      setTimeout(() => setShowAddedNotification(false), 3000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error al agregar al carrito');
    }
  };

  const getStockStatus = () => {
    if (!product.trackStock) return { status: 'unlimited', text: 'Disponible', color: '#28a745' };
    
    if (product.stock <= 0) return { status: 'out', text: 'Sin stock', color: '#dc3545' };
    if (product.stock <= 5) return { status: 'low', text: `Últimas ${product.stock} unidades`, color: '#ffc107' };
    return { status: 'available', text: 'Disponible', color: '#28a745' };
  };

  const isItemAvailable = () => {
    if (product.isHidden) return false;
    if (product.isAvailable === false) return false;
    if (product.trackStock && product.stock <= 0) return false;
    return true;
  };

  if (menuLoading || isTransitioning) {
    return (
      <div className="product-detail-loading">
        <div className="loading-spinner">🔄</div>
        <p>Cargando producto...</p>
      </div>
    );
  }

  if (menuError || !product) {
    return (
      <div className="product-detail-error">
        <div className="error-icon">❌</div>
        <h2>Producto no encontrado</h2>
        <p>El producto que buscas no existe o no está disponible.</p>
        <Link to="/" className="btn btn-primary">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const stockStatus = getStockStatus();
  const images = product.images || (product.imageUrl || product.image ? [product.imageUrl || product.image] : []);

  return (
    <div className="product-detail-page">
      {/* Barra de navegación superior */}
      <div className="product-nav-bar">
        <div className="nav-container">
          <button 
            className="back-button"
            onClick={() => navigate('/')}
          >
            ← Volver al catálogo
          </button>
          <Link to="/" className="home-link">
            🏪 Digital Store
          </Link>
          
          {/* Indicador del carrito */}
          {cartCount > 0 && (
            <div className="cart-indicator">
              <FaShoppingCart />
              <span className="cart-count">{cartCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/">Inicio</Link>
        <span> › </span>
        <span>{product.name}</span>
      </div>

      {/* Notificación de agregado al carrito */}
      {showAddedNotification && (
        <div className="add-to-cart-notification">
          ✅ Producto agregado al carrito
        </div>
      )}

      <div className="product-detail-container">
        {/* Galería de imágenes */}
        <div className="product-gallery">
          <div className="main-image">
            {images.length > 0 ? (
              <img 
                src={images[selectedImage]} 
                alt={product.name}
                className="product-main-image"
              />
            ) : (
              <div className="product-placeholder">
                🍽️
              </div>
            )}
            
            {product.isFeatured && (
              <div className="featured-badge">
                ⭐ Destacado
              </div>
            )}
          </div>

          {/* Miniaturas si hay múltiples imágenes */}
          {images.length > 1 && (
            <div className="image-thumbnails">
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div className="product-info">
          <div className="product-header">
            <h1 className="product-title">{product.name}</h1>
            
            {/* Estado del stock */}
            <div className="stock-status" style={{ color: stockStatus.color }}>
              <span className="stock-icon">
                {stockStatus.status === 'available' && '✅'}
                {stockStatus.status === 'low' && '⚠️'}
                {stockStatus.status === 'out' && '❌'}
                {stockStatus.status === 'unlimited' && '♾️'}
              </span>
              {stockStatus.text}
            </div>
          </div>

          {/* Precio */}
          <div className="product-price">
            <span className="price-symbol">$</span>
            <span className="price-amount">{product.price}</span>
            <span className="price-currency">ARS</span>
          </div>

          {/* Selector de cantidad */}
          {isItemAvailable() && (
            <div className="quantity-section">
              <label htmlFor="quantity">Cantidad:</label>
              <div className="quantity-controls">
                <button 
                  className="quantity-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  max={product.trackStock ? product.stock : 999}
                  value={quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    const maxValue = product.trackStock ? product.stock : 999;
                    setQuantity(Math.min(Math.max(1, value), maxValue));
                  }}
                  className="quantity-input"
                />
                <button 
                  className="quantity-btn"
                  onClick={() => {
                    const maxValue = product.trackStock ? product.stock : quantity + 1;
                    setQuantity(Math.min(quantity + 1, maxValue));
                  }}
                  disabled={product.trackStock && quantity >= product.stock}
                >
                  +
                </button>
              </div>
              {product.trackStock && (
                <small className="stock-info">
                  {product.stock} unidades disponibles
                </small>
              )}
            </div>
          )}

          {/* Botones de acción */}
          <div className="product-actions">
            {isItemAvailable() ? (
              <>
                <button 
                  className="btn btn-primary add-to-cart-btn"
                  onClick={handleAddToCart}
                >
                  Agregar al carrito
                </button>
                <button 
                  className="btn btn-secondary buy-now-btn"
                  onClick={() => {
                    handleAddToCart();
                    setTimeout(() => navigate('/'), 500);
                  }}
                >
                  Comprar ahora
                </button>
              </>
            ) : (
              <button className="btn btn-disabled" disabled>
                {product.isHidden ? 'Producto oculto' : 
                 product.isAvailable === false ? 'No disponible' :
                 'Sin stock'}
              </button>
            )}
          </div>

          {/* Información adicional */}
          <div className="product-features">
            <div className="feature">
              <span className="feature-icon">🚚</span>
              <span>Envío a todo el país</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🔒</span>
              <span>Compra protegida</span>
            </div>
            <div className="feature">
              <span className="feature-icon">💳</span>
              <span>Múltiples medios de pago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Descripción del producto */}
      {product.description && (
        <div className="product-description-section">
          <h2>Descripción del producto</h2>
          <div className="product-description">
            <p>{product.description}</p>
          </div>
        </div>
      )}

      {/* Productos sugeridos de la misma categoría */}
      <SuggestedProducts 
        currentProduct={product}
        menu={menu}
        onProductClick={(productId) => {
          // Navegar al nuevo producto usando la ruta correcta
          navigate(`/producto/${productId}`);
        }}
      />

    </div>
  );
};

export default ProductDetail;
