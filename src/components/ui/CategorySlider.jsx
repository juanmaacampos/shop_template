import { useState, useEffect, useRef } from 'react';
import { FaChevronLeft, FaChevronRight, FaStore } from 'react-icons/fa';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './CategorySlider.css';

const CategorySlider = ({ menu = [], onCategorySelect, selectedCategory = null }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const sliderRef = useRef(null);
  const intervalRef = useRef(null);

  const categories = Array.isArray(menu) ? menu.map(category => {
    const categoryItems = category.items || [];
    const firstItem = categoryItems.find(item => item.image || item.imageUrl) || categoryItems[0];
    const imageSource = firstItem?.imageUrl || firstItem?.image;
    
    return {
      name: category.name,
      displayName: category.name.charAt(0).toUpperCase() + category.name.slice(1),
      image: imageSource || null,
      itemCount: categoryItems.length,
      firstItem
    };
  }).filter(cat => cat.itemCount > 0) : [];

  const settings = {
    dots: true,
    infinite: categories.length > 3,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  const handleCategoryClick = (categoryName, index) => {
    if (onCategorySelect) {
      onCategorySelect(categoryName);
    }
    if (sliderRef.current) {
      sliderRef.current.slickGoTo(index);
    }
    // Scroll to the menu grid
    const menuElement = document.querySelector('.menu-display');
    if (menuElement) {
      menuElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="category-slider">
      <div className="category-slider-container">
        <Slider ref={sliderRef} {...settings}>
          {categories.map((category, index) => (
            <div
              key={category.name}
              className={`category-item ${selectedCategory === category.name ? 'active' : ''}`}
              onClick={() => handleCategoryClick(category.name, index)}
            >
              <div className="category-image">
                {category.image ? (
                  <img 
                    src={category.image} 
                    alt={category.displayName}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextElementSibling) {
                        e.target.nextElementSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : (
                  <div className="category-image-placeholder" style={{ display: 'flex' }}>
                    <span className="category-icon"><FaStore /></span>
                  </div>
                )}
                {category.image && (
                  <div className="category-image-placeholder" style={{ display: 'none' }}>
                    <span className="category-icon"><FaStore /></span>
                  </div>
                )}
                <div className="category-overlay">
                  <span className="category-count">{category.itemCount} productos</span>
                </div>
              </div>
              <div className="category-info">
                <h3 className="category-name">{category.displayName}</h3>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default CategorySlider;
