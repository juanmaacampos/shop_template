import React, { useState } from 'react';
import './MenuComponents.css';

// Componente para galería de imágenes de productos
export function ProductImageGallery({ images, itemName, className = "item-image" }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Si no hay imágenes o el array está vacío, usar el fallback
  if (!images || !Array.isArray(images) || images.length === 0) {
    return <div className={`${className} item-placeholder`}>🍽️</div>;
  }

  const currentImage = images[currentImageIndex];
  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className={`${className} product-gallery`}>
      <ImageWithFallback 
        src={currentImage.url || currentImage || currentImage.src || currentImage.imageUrl} 
        alt={`${itemName} - Imagen ${currentImageIndex + 1}`} 
        className="gallery-main-image"
      />
      
      {hasMultipleImages && (
        <>
          {/* Botones de navegación */}
          <button 
            className="gallery-nav-btn gallery-prev" 
            onClick={prevImage}
            aria-label="Imagen anterior"
          >
            ‹
          </button>
          <button 
            className="gallery-nav-btn gallery-next" 
            onClick={nextImage}
            aria-label="Siguiente imagen"
          >
            ›
          </button>
          
          {/* Indicador de múltiples imágenes */}
          <div className="gallery-indicator">
            <span className="gallery-count">{currentImageIndex + 1}/{images.length}</span>
          </div>
          
          {/* Dots indicadores */}
          <div className="gallery-dots">
            {images.map((_, index) => (
              <button
                key={index}
                className={`gallery-dot ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => goToImage(index)}
                aria-label={`Ver imagen ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Componente para imagen con loading y error handling mejorado para WebP
export function ImageWithFallback({ src, alt, className, placeholder = "🍽️" }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    console.warn(`Error cargando imagen: ${src}`);
    setLoading(false);
    setError(true);
  };

  // Si no hay src, mostrar placeholder directamente
  if (!src) {
    return <div className={`${className} item-placeholder`}>{placeholder}</div>;
  }

  // Si hubo error, mostrar placeholder
  if (error) {
    return <div className={`${className} item-placeholder`}>{placeholder}</div>;
  }

  return (
    <div className={className} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {loading && (
        <div className="item-placeholder" style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8f9fa',
          zIndex: 1
        }}>
          🔄
        </div>
      )}
      <img 
        src={src} 
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        decoding="async"
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        style={{ 
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          opacity: loading ? 0 : 1,
          transition: 'opacity 0.3s ease'
        }}
        // Optimización específica para WebP
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}
