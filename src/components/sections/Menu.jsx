import { useRef, useState } from 'react';
import { MenuDisplay } from '../../cms-menu/MenuComponents.jsx';
import { useMenuWithTerminology } from '../../cms-menu/useMenu.js';
import { MENU_CONFIG, STORE_TERMINOLOGY } from '../../cms-menu/config.js';
import { menuSDKManager } from '../../cms-menu/menu-sdk-singleton.js';
import CategorySlider from '../ui/CategorySlider';
import CategoryPillsMobile from '../ui/CategoryPillsMobile';
import Cart from '../checkout/Cart';
import { FaStore } from 'react-icons/fa';
import '../../styles/sections/Menu.css';

const Menu = ({ cart, addToCart, updateQuantity, removeFromCart, clearCart, total, itemCount, firebaseManager }) => {
  const menuRef = useRef(null);
  const titleRef = useRef(null);
  const [showCart, setShowCart] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const isMobile = () => typeof window !== 'undefined' && window.innerWidth <= 768;

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

  // Obtener categorías para pills
  const categories = Array.isArray(menu) ? menu.map(category => ({
    id: category.id || category.name,
    name: category.name
  })) : [];

  return (
    <section id="menu" className="menu-section store-catalog" ref={menuRef}>
      <div className="container">
        <div className="menu-header" style={{ justifyContent: 'center' }}>
          <h2 className="section-title" ref={titleRef} style={{ textAlign: 'center', width: '100%' }}>
            <FaStore /> {terminology.menuNameCapitalized}
          </h2>
        </div>
        {/* Pills solo en móviles, slider en desktop */}
        {isMobile() ? (
          <CategoryPillsMobile
            categories={categories}
            selected={selectedCategory}
            onSelect={handleCategorySelect}
          />
        ) : (
          <CategorySlider
            menu={menu}
            onCategorySelect={handleCategorySelect}
            selectedCategory={selectedCategory}
          />
        )}
        
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
