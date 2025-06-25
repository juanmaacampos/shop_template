import { useEffect, useRef, useState } from 'react';
import '../../styles/layout/Header.css';

// Carrusel vertical de productos destacados animando hacia abajo
function VerticalProductCarouselDown({ featuredItems = [], loading }) {
  const [carouselItems, setCarouselItems] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [paused, setPaused] = useState(false);
  const carouselRef = useRef(null);
  const animationRef = useRef();
  const [offset, setOffset] = useState(0);
  const itemRef = useRef(null);
  const [itemSize, setItemSize] = useState(220);

  useEffect(() => {
    if (itemRef.current) {
      setItemSize(itemRef.current.offsetHeight);
    }
  }, [carouselItems]);

  useEffect(() => {
    if (!featuredItems || featuredItems.length === 0) return;
    const onlyFeatured = featuredItems.filter(item => item.isFeatured);
    const categories = {};
    onlyFeatured.forEach(item => {
      if (!categories[item.categoryId]) categories[item.categoryId] = [];
      categories[item.categoryId].push(item);
    });
    const items = Object.values(categories).map(itemsArr => {
      return itemsArr[Math.floor(Math.random() * itemsArr.length)];
    });
    setCarouselItems(items);
  }, [featuredItems]);

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

  // Animación vertical infinita hacia abajo
  useEffect(() => {
    if (carouselItems.length === 0 || itemSize === 0) return;
    let lastTime = null;
    const speed = itemSize * 0.7;
    let running = true;
    function animate(time) {
      if (!running) return;
      if (!lastTime) lastTime = time;
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      setOffset(prev => {
        let next = paused ? prev : prev - speed * delta;
        const totalHeight = itemSize * carouselItems.length * 2;
        if (next <= -totalHeight) next = 0;
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

  const displayItems = [...carouselItems, ...carouselItems];

  return (
    <div
      className="vertical-carousel"
      ref={carouselRef}
      style={{
        height: '100%',
        minHeight: 400,
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
          transform: `translateY(${offset % (carouselItems.length * itemSize)}px)`,
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
              height: 320,
              width: 320,
              minWidth: 320,
              minHeight: 320,
              maxWidth: 420,
              maxHeight: 420,
              margin: '0 auto 40px auto',
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

export default VerticalProductCarouselDown;
