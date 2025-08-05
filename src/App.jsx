import React, { useState, useEffect } from 'react'
import { Header, Footer } from './components/layout'
import { Menu, Location, Contact } from './components/sections'
import { Navbar } from './components/navigation'
import { ConnectionStatus } from './components/ConnectionStatus'
import { useMenu } from './context/MenuContext'
import { optimizeForMobile } from './utils'
import { useMenuIntegration } from './cms-menu/useMenu.js'
import { MENU_CONFIG } from './cms-menu/config.js'
import Cart from './components/checkout/Cart'
import './styles/index.css'

function App() {
  const { isConnected, error } = useMenu();
  const [showCart, setShowCart] = useState(false);
  
  // Get cart data from the CMS integration
  const { cart, addToCart, updateQuantity, removeFromCart, clearCart, total, itemCount, firebaseManager, cartTotal, cartCount } = useMenuIntegration(MENU_CONFIG, { enabled: true });

  // Use fallback values to prevent undefined errors
  const safeTotal = total || cartTotal || 0;
  const safeItemCount = itemCount || cartCount || 0;

  const handleCartClick = () => {
    setShowCart(true);
  };

  // Manejar el scroll del body cuando el modal está abierto
  useEffect(() => {
    if (showCart) {
      // Prevenir el scroll del fondo
      document.body.classList.add('modal-open');
      
      // Prevenir eventos de touch que puedan causar scroll en el fondo
      const preventTouchMove = (e) => {
        if (!e.target.closest('.cart-container')) {
          e.preventDefault();
        }
      };
      
      // Agregar listeners para prevenir scroll en móviles
      document.addEventListener('touchmove', preventTouchMove, { passive: false });
      document.addEventListener('wheel', preventTouchMove, { passive: false });
      
      return () => {
        document.body.classList.remove('modal-open');
        document.removeEventListener('touchmove', preventTouchMove);
        document.removeEventListener('wheel', preventTouchMove);
      };
    } else {
      document.body.classList.remove('modal-open');
    }
  }, [showCart]);

  useEffect(() => {
    // Optimize for mobile devices
    optimizeForMobile();
    
    // Re-run optimization on window resize
    const handleResize = () => {
      optimizeForMobile();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="App">
      <ConnectionStatus />
      {error && (
        <div style={{
          background: '#ffebee',
          color: '#c62828',
          padding: '1rem',
          margin: '1rem',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          Error de conexión: {error}
        </div>
      )}
      <Header />
      <Menu 
        cart={cart}
        addToCart={addToCart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        total={safeTotal}
        itemCount={safeItemCount}
        firebaseManager={firebaseManager}
      />
      <Location />
      <Contact />
      <Footer />
      <Navbar onCartClick={handleCartClick} itemCount={safeItemCount} />
      
      {showCart && (
        <div 
          className="cart-overlay" 
          onClick={(e) => e.target.classList.contains('cart-overlay') && setShowCart(false)}
          onTouchStart={(e) => {
            if (e.target.classList.contains('cart-overlay')) {
              e.preventDefault();
            }
          }}
        >
          <Cart 
            cart={cart}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
            clearCart={clearCart}
            total={safeTotal}
            onClose={() => setShowCart(false)}
            firebaseManager={firebaseManager}
          />
        </div>
      )}
    </div>
  )
}

export default App
