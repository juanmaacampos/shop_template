import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MenuDisplay } from '../../cms-menu/MenuComponents.jsx';
import { useMenuWithTerminology } from '../../cms-menu/useMenu.js';
import { MENU_CONFIG, STORE_TERMINOLOGY } from '../../cms-menu/config.js';
import { menuSDKManager } from '../../cms-menu/menu-sdk-singleton.js';
import CategorySlider from '../ui/CategorySlider';
import Cart from '../checkout/Cart';
import '../../styles/sections/Menu.css';

gsap.registerPlugin(ScrollTrigger);

const Menu = ({ cart, addToCart, updateQuantity, removeFromCart, clearCart, total, itemCount, firebaseManager }) => {
  const menuRef = useRef(null);
  const titleRef = useRef(null);
  const [showCart, setShowCart] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Use the same SDK instance as App.jsx with terminology support
  const menuSDK = menuSDKManager.getInstance(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId);
  const { business, restaurant, menu, loading, error } = useMenuWithTerminology(menuSDK);

  // Use store terminology
  const terminology = STORE_TERMINOLOGY;

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
  };

  // Filtrar el menú por categoría seleccionada
  const filteredMenu = selectedCategory && menu 
    ? menu.filter(category => category.name.toLowerCase() === selectedCategory.toLowerCase())
    : menu;

  useEffect(() => {
    gsap.fromTo(titleRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      }
    );
  }, []);

  return (
    <section id="menu" className="menu-section store-catalog" ref={menuRef}>
      <div className="container">
        <div className="menu-header">
          <h2 className="section-title" ref={titleRef}>
            🏪 {terminology.menuNameCapitalized}
          </h2>
          {itemCount > 0 && (
            <button 
              className="cart-btn store-cart-btn"
              onClick={() => setShowCart(true)}
            >
              🛒 {terminology.orderSummary} ({itemCount})
            </button>
          )}
        </div>
        
        {/* Category Slider */}
        <CategorySlider 
          menu={menu}
          onCategorySelect={handleCategorySelect}
          selectedCategory={selectedCategory}
        />

        {/* Category Filter Status */}
        {selectedCategory && (
          <div className="category-filter-status">
            <span className="filter-text">
              Mostrando: <strong>{selectedCategory}</strong>
            </span>
            <button 
              className="clear-filter-btn"
              onClick={() => setSelectedCategory(null)}
            >
              Ver todas las categorías
            </button>
          </div>
        )}
        
        <MenuDisplay 
          menu={filteredMenu} 
          loading={loading}
          error={error}
          onAddToCart={addToCart}
          showImages={true}
          showPrices={true}
          showDescription={true}
          terminology={terminology}
          businessId={MENU_CONFIG.businessId}
          enableRealTimeStock={true} // 🆕 Habilitar stock en tiempo real
          db={menuSDK?.db} // 🆕 Pasar la conexión a la base de datos
        />
      </div>

      {showCart && (
        <div className="cart-overlay" onClick={(e) => e.target.classList.contains('cart-overlay') && setShowCart(false)}>
          <Cart 
            cart={cart}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
            clearCart={clearCart}
            total={total}
            onClose={() => setShowCart(false)}
            firebaseManager={firebaseManager}
          />
        </div>
      )}
    </section>
  );
};

export default Menu;
