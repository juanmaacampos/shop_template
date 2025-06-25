import { useEffect, useRef, useState } from 'react';
import { useFeaturedItems } from '../../cms-menu/useMenu.js';
import { MenuSDK } from '../../cms-menu/menu-sdk.js';
import { MENU_CONFIG } from '../../cms-menu/config.js';
import '../../styles/layout/Header.css';
import VerticalProductCarouselDown from './VerticalProductCarouselDown';

// Carrusel horizontal animado para móviles, con lógica similar al vertical
function HorizontalProductCarouselLoop({ featuredItems = [], loading }) {
  const [carouselItems, setCarouselItems] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [paused, setPaused] = useState(false);
  const carouselRef = useRef(null);
  const animationRef = useRef();
  const [offset, setOffset] = useState(0);
  const itemRef = useRef(null);
  const [itemSize, setItemSize] = useState(180); // ancho default

  // Medir el ancho real de un item
  useEffect(() => {
    if (itemRef.current) {
      setItemSize(itemRef.current.offsetWidth);
    }
  }, [carouselItems]);

  // Filtrar solo productos destacados (isFeatured)
  useEffect(() => {
    if (!featuredItems || featuredItems.length === 0) return;
    const onlyFeatured = featuredItems.filter(item => item.isFeatured);
    // Agrupar por categoría
    const categories = {};
    onlyFeatured.forEach(item => {
      if (!categories[item.categoryId]) categories[item.categoryId] = [];
      categories[item.categoryId].push(item);
    });
    // Elegir un producto aleatorio por categoría
    const items = Object.values(categories).map(itemsArr => {
      return itemsArr[Math.floor(Math.random() * itemsArr.length)];
    });
    setCarouselItems(items);
  }, [featuredItems]);

  // Animación horizontal infinita
  useEffect(() => {
    if (carouselItems.length === 0 || itemSize === 0) return;
    let lastTime = null;
    const speed = itemSize * 0.7; // px por segundo
    let running = true;
    function animate(time) {
      if (!running) return;
      if (!lastTime) lastTime = time;
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      setOffset(prev => {
        let next = paused ? prev : prev + speed * delta;
        const totalWidth = itemSize * carouselItems.length * 2;
        if (next >= totalWidth) next = 0;
        return next;
      });
      animationRef.current = requestAnimationFrame(animate);
    }
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      running = false;
      cancelAnimationFrame(animationRef.current);
    };
  }, [paused, carouselItems, itemSize]);

  // Pausar en hover
  const handleMouseEnter = idx => {
    setPaused(true);
    setHoveredIndex(idx);
  };
  const handleMouseLeave = () => {
    setPaused(false);
    setHoveredIndex(null);
  };

  if (loading) {
    return <div className="horizontal-carousel loading">Cargando...</div>;
  }
  if (!carouselItems.length) {
    return <div className="horizontal-carousel empty">Sin productos destacados</div>;
  }

  // Duplicar items para loop visual
  const displayItems = [...carouselItems, ...carouselItems];

  return (
    <div
      className="horizontal-carousel"
      ref={carouselRef}
      style={{
        width: '100%',
        minHeight: 150,
        maxWidth: '100vw',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        margin: '1.5rem 0 0 0',
      }}
    >
      <div
        className="horizontal-carousel-inner"
        style={{
          display: 'flex',
          flexDirection: 'row',
          height: '100%',
          transform: `translateX(-${offset % (carouselItems.length * itemSize)}px)`,
          willChange: 'transform',
          transition: paused ? 'transform 0.5s cubic-bezier(0.4,0,0.2,1)' : 'none',
        }}
      >
        {displayItems.map((item, idx) => (
          <div
            key={idx}
            ref={idx === 0 ? itemRef : null}
            className={`carousel-item${hoveredIndex === (idx % carouselItems.length) ? ' hovered' : ''}`}
            style={{
              width: 180,
              minWidth: 180,
              maxWidth: 220,
              height: 180,
              margin: '0 12px',
              position: 'relative',
              cursor: 'pointer',
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={() => handleMouseEnter(idx % carouselItems.length)}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={item.imageUrl || item.image || '/default-product.png'}
              alt={item.name}
              className="carousel-img"
              style={{
                width: '100%',
                height: '100%',
                aspectRatio: '1/1',
                objectFit: 'cover',
                borderRadius: 16,
                boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
                transition: 'filter 0.3s',
              }}
            />
            {hoveredIndex === (idx % carouselItems.length) && (
              <div className="carousel-overlay">
                <div className="carousel-info">
                  <span className="carousel-name">{item.name}</span>
                  <span className="carousel-price">${parseFloat(item.price).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Carrusel vertical de productos destacados
function VerticalProductCarousel({ featuredItems = [], loading }) {
  const [carouselItems, setCarouselItems] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [paused, setPaused] = useState(false);
  const carouselRef = useRef(null);
  const animationRef = useRef();
  const [offset, setOffset] = useState(0);
  const itemRef = useRef(null);
  const [itemSize, setItemSize] = useState(220); // default más grande

  // Medir el alto real de un item
  useEffect(() => {
    if (itemRef.current) {
      setItemSize(itemRef.current.offsetHeight);
    }
  }, [carouselItems]);

  // Filtrar solo productos destacados (isFeatured)
  useEffect(() => {
    if (!featuredItems || featuredItems.length === 0) return;
    // Solo items con isFeatured true
    const onlyFeatured = featuredItems.filter(item => item.isFeatured);
    // Agrupar por categoría
    const categories = {};
    onlyFeatured.forEach(item => {
      if (!categories[item.categoryId]) categories[item.categoryId] = [];
      categories[item.categoryId].push(item);
    });
    // Elegir un producto aleatorio por categoría
    const items = Object.values(categories).map(itemsArr => {
      return itemsArr[Math.floor(Math.random() * itemsArr.length)];
    });
    setCarouselItems(items);
  }, [featuredItems]);

  // Obtener el alto del header para el tamaño de las imágenes
  const [carouselHeight, setCarouselHeight] = useState(0);
  useEffect(() => {
    function updateHeight() {
      if (carouselRef.current) {
        setCarouselHeight(carouselRef.current.offsetHeight);
      }
    }
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Animación vertical infinita
  useEffect(() => {
    if (carouselItems.length === 0 || itemSize === 0) return;
    let lastTime = null;
    const speed = itemSize * 0.7; // px por segundo
    let running = true;
    function animate(time) {
      if (!running) return;
      if (!lastTime) lastTime = time;
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      setOffset(prev => {
        let next = paused ? prev : prev + speed * delta;
        const totalHeight = itemSize * carouselItems.length * 2;
        if (next >= totalHeight) next = 0;
        return next;
      });
      animationRef.current = requestAnimationFrame(animate);
    }
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      running = false;
      cancelAnimationFrame(animationRef.current);
    };
  }, [paused, carouselItems, itemSize]);

  // Pausar en hover
  const handleMouseEnter = idx => {
    setPaused(true);
    setHoveredIndex(idx);
  };
  const handleMouseLeave = () => {
    setPaused(false);
    setHoveredIndex(null);
  };

  if (loading) {
    return <div className="vertical-carousel loading">Cargando...</div>;
  }
  if (!carouselItems.length) {
    return <div className="vertical-carousel empty">Sin productos destacados</div>;
  }

  // Duplicar items para loop visual
  const displayItems = [...carouselItems, ...carouselItems];

  return (
    <div
      className="vertical-carousel"
      ref={carouselRef}
      style={{
        height: '100%',
        minHeight: 400, // aumentado desde 300
        maxHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        className="vertical-carousel-inner"
        style={{
          height: displayItems.length * itemSize,
          transform: `translateY(-${offset % (carouselItems.length * itemSize)}px)`,
          willChange: 'transform',
          transition: paused ? 'transform 0.5s cubic-bezier(0.4,0,0.2,1)' : 'none',
        }}
      >
        {displayItems.map((item, idx) => (
          <div
            key={idx}
            ref={idx === 0 ? itemRef : null}
            className={`carousel-item${hoveredIndex === (idx % carouselItems.length) ? ' hovered' : ''}`}
            style={{
              height: 320, // FIJO, más grande
              width: 320, // FIJO, más grande
              minWidth: 320,
              minHeight: 320,
              maxWidth: 420,
              maxHeight: 420,
              margin: '0 auto 40px auto', // más espacio
              position: 'relative',
              cursor: 'pointer',
              borderRadius: 32,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.13)',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={() => handleMouseEnter(idx % carouselItems.length)}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={item.imageUrl || item.image || '/default-product.png'}
              alt={item.name}
              className="carousel-img"
              style={{
                width: '100%',
                height: '100%',
                aspectRatio: '1/1',
                objectFit: 'cover',
                borderRadius: 32,
                boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
                transition: 'filter 0.3s',
              }}
            />
            {hoveredIndex === (idx % carouselItems.length) && (
              <div className="carousel-overlay">
                <div className="carousel-info">
                  <span className="carousel-name">{item.name}</span>
                  <span className="carousel-price">${parseFloat(item.price).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const Header = () => {
  const headerRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const sliderRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  
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

  const scrollToProducts = () => {
    document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
            {/* Carrusel horizontal animado solo en móvil */}
            {isMobile && (
              <HorizontalProductCarouselLoop featuredItems={featuredItems} loading={featuredLoading} />
            )}
          </div>
          {/* Carruseles verticales solo en desktop/tablet */}
          {!isMobile && (
            <div ref={sliderRef} className="header-right" style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
              <VerticalProductCarousel featuredItems={featuredItems} loading={featuredLoading} />
              <VerticalProductCarouselDown featuredItems={featuredItems} loading={featuredLoading} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
