/* 
🖼️ EJEMPLO DE USO - ProductImageGallery 
======================================

Este ejemplo muestra cómo usar el componente ProductImageGallery
en tu ProductDetail o cualquier otra página.
*/

import React from 'react';
import { ProductImageGallery } from '../gallery-components/MenuComponents.jsx';
import '../gallery-components/MenuComponents.css';

// Ejemplo de uso en ProductDetail
function ProductDetailExample() {
  const product = {
    name: "Hamburguesa Deluxe",
    images: [
      { url: "https://example.com/burger1.jpg", id: "img1" },
      { url: "https://example.com/burger2.jpg", id: "img2" }, 
      { url: "https://example.com/burger3.jpg", id: "img3" }
    ]
    // O simplemente un array de strings:
    // images: [
    //   "https://example.com/burger1.jpg",
    //   "https://example.com/burger2.jpg",
    //   "https://example.com/burger3.jpg"
    // ]
  };

  return (
    <div className="product-detail">
      {/* Galería de imágenes */}
      <div className="product-gallery-container">
        <ProductImageGallery 
          images={product.images} 
          itemName={product.name} 
          className="product-detail-gallery"
        />
      </div>
      
      {/* Resto del contenido del producto */}
      <div className="product-info">
        <h1>{product.name}</h1>
        {/* ... más contenido ... */}
      </div>
    </div>
  );
}

/*
📚 CARACTERÍSTICAS DE LA GALERÍA:

✅ Navegación entre múltiples imágenes
✅ Indicadores visuales (dots)
✅ Botones prev/next
✅ Contador de imágenes
✅ Fallback para imágenes faltantes
✅ Responsive design
✅ Lazy loading
✅ Error handling

🎯 FORMATOS DE IMAGEN SOPORTADOS:

1. Array de objetos:
   images: [
     { url: "imagen1.jpg", id: "id1" },
     { url: "imagen2.jpg", id: "id2" }
   ]

2. Array de strings:
   images: ["imagen1.jpg", "imagen2.jpg"]

3. Imagen única:
   images: ["imagen.jpg"]

4. Sin imágenes:
   images: [] // Mostrará placeholder

📦 PROPS DEL COMPONENTE:

- images: Array de imágenes (requerido)
- itemName: Nombre del producto para alt text (requerido)
- className: Clase CSS personalizada (opcional)

🎨 ESTILOS PERSONALIZABLES:

Puedes personalizar los estilos editando:
- MenuComponents.css (estilos base)
- ProductDetail.css (estilos específicos)

Las variables CSS están definidas en :root para fácil personalización.
*/
