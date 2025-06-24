import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useFeaturedItems } from '../../cms-menu/useMenu.js';
import { MenuSDK } from '../../cms-menu/menu-sdk.js';
import { MENU_CONFIG } from '../../cms-menu/config.js';
import FeaturedSlider from '../ui/FeaturedSlider.jsx';
import '../../styles/layout/Header.css';

const Header = () => {
  const headerRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const sliderRef = useRef(null);
  
  // Estado para el SDK del menú
  const [menuSDK, setMenuSDK] = useState(null);
  
  // Inicializar el SDK
  useEffect(() => {
    const sdk = new MenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId);
    sdk.initialize().then(() => {
      setMenuSDK(sdk);
    }).catch(error => {
      console.error('Error initializing MenuSDK:', error);
    });
  }, []);
  
  // Hook para productos destacados
  const { featuredItems, loading: featuredLoading } = useFeaturedItems(menuSDK);

  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(titleRef.current, 
      { opacity: 0, y: 100 }, 
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    )
    .fromTo(subtitleRef.current, 
      { opacity: 0, y: 50 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 
      "-=0.5"
    )
    .fromTo(ctaRef.current, 
      { opacity: 0, scale: 0.8 }, 
      { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" }, 
      "-=0.3"
    )
    .fromTo(sliderRef.current, 
      { opacity: 0, x: 100 }, 
      { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" }, 
      "-=0.5"
    );
  }, []);

  const scrollToProducts = () => {
    document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header ref={headerRef} className="header" id="home">
      <div className="header-bg"></div>
      <div className="container">
        <div className="header-content">
          <div className="header-left">
            <h1 ref={titleRef} className="header-title">
              DIGITAL
              <br />
              STORE
            </h1>
            <p ref={subtitleRef} className="header-subtitle">
              Tu Tienda Online
            </p>
            <button ref={ctaRef} className="btn-primary header-cta" onClick={scrollToProducts}>
              Ver Productos
            </button>
          </div>
          
          <div ref={sliderRef} className="header-right">
            {!featuredLoading && featuredItems && featuredItems.length > 0 && (
              <FeaturedSlider 
                featuredItems={featuredItems}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
