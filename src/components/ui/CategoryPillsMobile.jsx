import React from 'react';
import './CategoryPillsMobile.css';

const CategoryPillsMobile = ({ categories = [], selected, onSelect }) => {
  if (!categories.length) return null;
  return (
    <div className="category-pills-mobile-wrapper">
      <div className="category-pills-mobile-track">
        {categories.map((cat) => (
          <button
            key={cat.id || cat.name}
            className={`category-pill-mobile${selected === cat.name ? ' active' : ''}`}
            onClick={() => onSelect && onSelect(cat.name)}
            type="button"
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryPillsMobile;
