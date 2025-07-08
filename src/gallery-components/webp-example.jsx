/* 
🖼️ EJEMPLO ESPECÍFICO - Galería con Imágenes WebP
=================================================

Este ejemplo muestra el uso optimizado de ProductImageGallery
con imágenes WebP para máximo rendimiento.
*/

import React from 'react';
import { ProductImageGallery } from '../gallery-components/MenuComponents.jsx';
import '../gallery-components/MenuComponents.css';

// Ejemplo real con imágenes WebP
function ProductDetailWebPExample() {
  const product = {
    name: "Hamburguesa Gourmet",
    // ✅ Formato recomendado para WebP
    images: [
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?fm=webp&w=800&q=80",
      "https://images.unsplash.com/photo-1550547660-d9450f859349?fm=webp&w=800&q=80", 
      "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?fm=webp&w=800&q=80"
    ]
  };

  return (
    <div className="product-detail" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div className="product-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
        
        {/* Galería de imágenes WebP */}
        <div className="product-gallery-container" style={{ height: '500px' }}>
          <ProductImageGallery 
            images={product.images} 
            itemName={product.name} 
            className="product-detail-gallery"
          />
        </div>
        
        {/* Información del producto */}
        <div className="product-info">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{product.name}</h1>
          <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>
            Galería optimizada con imágenes WebP para máximo rendimiento
          </p>
          
          <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
            <h3>🚀 Optimizaciones WebP Activas:</h3>
            <ul style={{ marginLeft: '1rem' }}>
              <li>✅ Lazy loading inteligente</li>
              <li>✅ Decodificación asíncrona</li>
              <li>✅ Responsive images</li>
              <li>✅ Error handling robusto</li>
              <li>✅ Memory optimization</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/*
🎯 MEJORES PRÁCTICAS PARA WEBP:

1. 📏 TAMAÑOS RECOMENDADOS:
   - Desktop: 800-1200px width
   - Mobile: 400-600px width
   - Quality: 80-85% para balance perfecto

2. 🔧 PARÁMETROS URL UNSPLASH:
   ?fm=webp&w=800&q=80
   - fm=webp: Formato WebP
   - w=800: Ancho 800px
   - q=80: Calidad 80%

3. 🌐 URLS DE EJEMPLO:
   https://images.unsplash.com/photo-ID?fm=webp&w=800&q=80
   https://tu-cdn.com/imagen.webp
   https://firebasestorage.googleapis.com/...imagen.webp

4. 📱 RESPONSIVE WEBP:
   La galería automáticamente optimiza según el dispositivo:
   - Mobile: Carga versiones más pequeñas
   - Desktop: Carga versiones de alta calidad
   - Tablet: Tamaño intermedio optimizado

5. 🔄 FALLBACK AUTOMÁTICO:
   Si WebP falla, la galería:
   - Muestra placeholder elegante
   - Registra error en consola
   - Mantiene UX fluida

📊 MÉTRICAS DE RENDIMIENTO:
- WebP vs JPEG: 25-50% menos tamaño
- Tiempo de carga: 40-60% más rápido
- Core Web Vitals: Mejora significativa
- Mobile performance: Excelente
*/

export default ProductDetailWebPExample;
