import React, { useState, useEffect, useRef } from 'react';
import './FeaturedSlider.css';

const FeaturedSlider = ({ featuredItems = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const sliderRef = useRef(null);
  const intervalRef = useRef(null);

  // Auto-slide functionality
  useEffect(() => {
    if (isPlaying && featuredItems.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % featuredItems.length);
      }, 3000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, featuredItems.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? featuredItems.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredItems.length);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  if (!featuredItems || featuredItems.length === 0) {
    return null;
  }

  return (
    <div className="featured-slider">
      <div className="slider-container" ref={sliderRef}>
        <div className="slider-track" style={{
          transform: `translateX(-${currentIndex * 100}%)`
        }}>
          {featuredItems.map((item, index) => (
            <div key={item.id} className="slider-item">
              <div className="item-content">
                <h4 className="item-name">{item.name}</h4>
                {item.categoryName && (
                  <span className="item-category">{item.categoryName}</span>
                )}
              </div>
              <div className="item-image">
                {item.image || item.imageUrl ? (
                  <img
                    src={item.image || item.imageUrl}
                    alt={item.name}
                    loading="lazy"
                  />
                ) : (
                  <div className="image-placeholder">
                    <span>🍽️</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        {featuredItems.length > 1 && (
          <>
            <button
              className="nav-arrow nav-arrow-prev"
              onClick={goToPrevious}
              aria-label="Producto anterior"
            >
              ❮
            </button>
            <button
              className="nav-arrow nav-arrow-next"
              onClick={goToNext}
              aria-label="Siguiente producto"
            >
              ❯
            </button>
          </>
        )}
      </div>

      {/* Dots indicator */}
      {featuredItems.length > 1 && (
        <div className="slider-dots">
          {featuredItems.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Ir al producto ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturedSlider;
