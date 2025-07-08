# 🍽️🏪 CMS Menu - Paquete de Integración para React

> **¿Qué hace esto?** Te permite mostrar tu catálogo/menú del CMS en **cualquier** página web React + Vite. Funciona tanto para **restaurantes** como **tiendas**. Subes productos/platos al CMS ➜ aparecen automáticamente en tu web frontend. ✨

## 🆕 NUEVA FUNCIONALIDAD - Galería de Imágenes por Producto

✨ **NUEVO**: Cada producto/plato ahora puede tener hasta **10 imágenes** con una galería interactiva completa.

### 🚀 Características de la Galería:
- ✅ **Hasta 10 imágenes por producto**: La primera imagen es la portada
- ✅ **Galería interactiva**: Navegación con flechas, dots y contador
- ✅ **Optimización automática**: Imágenes convertidas a WebP (mejor compresión)
- ✅ **Responsive**: Perfecto en móvil y desktop
- ✅ **Compatibilidad total**: Productos con solo `imageUrl` siguen funcionando
- ✅ **Transiciones suaves**: Animaciones fluidas entre imágenes

### 📸 Formato de imágenes:
- **Formato**: Todas las imágenes se convierten automáticamente a WebP
- **Tamaño**: Máximo 1200px en el lado más largo
- **Calidad**: 85% (balance perfecto entre calidad y tamaño)
- **Estructura**: Array de objetos `{id, url, order}` ordenado por `order`

## 🆕 NUEVA FUNCIONALIDAD - Información Bancaria en Tiempo Real

✨ **NUEVO**: La información bancaria del restaurante/negocio se actualiza automáticamente en tiempo real en la página que ven los clientes. No necesitas recargar la página ni hacer nada manual.

### 🚀 Características:
- ✅ **Información bancaria en tiempo real**: CBU, Alias, Banco, Titular
- ✅ **Botones de copia**: Los clientes pueden copiar CBU y Alias con un click
- ✅ **Actualización automática**: Cambias la info en el admin panel ➜ se actualiza al instante en la web
- ✅ **Flujo de transferencias completo**: Desde selección hasta confirmación
- ✅ **Interfaz responsiva**: Se ve perfecto en móvil y desktop

## 🆕 ACTUALIZACIÓN IMPORTANTE - Sistema Unificado de Businesses

Este paquete ahora soporta tanto **restaurantes** 🍽️ como **tiendas/stores** 🏪 usando el nuevo sistema unificado de "businesses". 

### ✅ Compatibilidad total:
- ✅ Código existente con `restaurantId` sigue funcionando igual
- ✅ Nuevo código puede usar `businessId` 
- ✅ Detección automática: restaurants 🍽️ vs stores 🏪
- ✅ Terminología dinámica: "platos/menú" vs "productos/catálogo"
- ✅ Componentes adaptativos según el tipo de negocio
- ✅ Migración transparente sin romper código existente

## 📁 ¿Qué hay en esta carpeta?

```
integration-package/           ← ESTA carpeta tiene TODO lo que necesitas
├── menu-sdk.js               # Se conecta a Firebase
├── useMenu.js                # React hooks (maneja estado)
├── MenuComponents.jsx        # Componentes visuales
├── MenuComponents.css        # Estilos bonitos
├── config.js                 # Tu configuración aquí
├── examples.jsx              # 5 ejemplos de uso
└── README.md                 # Esta guía
```

## 🚀 Instalación súper fácil (3 pasos)

### 1️⃣ Instalar Firebase en tu proyecto React
```bash
cd tu-proyecto-react
npm install firebase
```

### 2️⃣ Copiar esta carpeta completa
```bash
# Desde el directorio de tu CMS
cp -r integration-package/ tu-proyecto-react/src/cms-menu/

# O manualmente: copia TODA la carpeta integration-package/
# y pégala como src/cms-menu/ en tu proyecto
```

### 3️⃣ Configurar tu Business/Restaurant ID
1. **Obtén el ID del negocio**:
   - Abre tu CMS panel
   - Inicia sesión con la cuenta del negocio/restaurante
   - Pulsa F12 → Consola → ejecuta: `firebase.auth().currentUser.uid`
   - Copia ese ID (ej: `abc123def456...`)

2. **Edita `src/cms-menu/config.js`**:
   ```javascript
   export const MENU_CONFIG = {
     firebaseConfig: {
       // Pon aquí la config de Firebase (igual que en tu CMS)
       apiKey: "tu-api-key...",
       authDomain: "tu-proyecto.firebaseapp.com",
       // etc...
     },
     restaurantId: "abc123def456..."  // ← Pon tu UID aquí
   };
   ```

## 🔄 Migración desde Restaurants a Businesses

Si ya tienes código funcionando, hay varias formas de migrar:

### Opción 1: Sin cambios (recomendado para empezar)
Tu código existente seguirá funcionando tal como está. Internamente usa el nuevo sistema.

### Opción 2: Usar helper de migración
```jsx
import { createCompatibleMenuSDK } from './cms-menu/migration-helper.js';

// Funciona con restaurantId o businessId
const menuSDK = createCompatibleMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.restaurantId);
```

### Opción 3: Migrar completamente (recomendado a largo plazo)
```jsx
// Antes
import { createMenuSDK } from './cms-menu/menu-sdk.js';
import { useMenu } from './cms-menu/useMenu.js';
const { restaurant, menu, loading, error } = useMenu(menuSDK);

// Después (con terminología dinámica)
import { createMenuSDK } from './cms-menu/menu-sdk.js';
import { useMenuWithTerminology } from './cms-menu/useMenu.js';
const { business, menu, loading, error, terminology } = useMenuWithTerminology(menuSDK);

// Ahora puedes usar:
// - business.businessType ('restaurant' o 'store')
// - terminology.itemType ('plato' o 'producto')
// - terminology.addToCart ('Agregar al Pedido' o 'Agregar al Carrito')
```

### Configuración actualizada
```javascript
export const MENU_CONFIG = {
  firebaseConfig: {
    // Tu config de Firebase
  },
  businessId: "abc123def456...",     // ← Recomendado
  restaurantId: "abc123def456..."    // ← Funciona por compatibilidad
};
```

## 💡 Uso básico

### Opción 1: Usa un ejemplo completo
```jsx
import RestaurantPage from './cms-menu/examples.jsx';

function App() {
  return <RestaurantPage />;
}
```

### Opción 2: Construye tu propio componente
```jsx
import React from 'react';
import { createMenuSDK } from './cms-menu/menu-sdk.js';
import { MenuDisplay } from './cms-menu/MenuComponents.jsx';
import { useMenu, useCart } from './cms-menu/useMenu.js';
import { MENU_CONFIG } from './cms-menu/config.js';
import './cms-menu/MenuComponents.css';

function MiRestaurante() {
  const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.restaurantId);
  const { menu, loading, error } = useMenu(menuSDK);
  const { addToCart } = useCart();

  return (
    <div>
      <h1>Mi Restaurante</h1>
      <MenuDisplay 
        menu={menu}
        onAddToCart={addToCart}
        loading={loading}
        error={error}
        showImages={true}
      />
    </div>
  );
}
```

## 🎯 Ejemplos disponibles

El archivo `examples.jsx` incluye 7 casos de uso diferentes:

1. **`RestaurantPage`** - Página completa con menú y carrito
2. **`FeaturedPage`** - Solo platos destacados  
3. **`CompactMenu`** - Menú sin imágenes (compacto)
4. **`SimpleRestaurantMenu`** - Todo-en-uno más simple
5. **`MenuOnly`** - Solo menú sin carrito
6. **`MercadoPagoTestingPage`** - 🧪 Testing completo de MercadoPago
7. **`RestaurantWithTesting`** - Restaurante con testing integrado

### 🧪 **Nuevo: Testing de MercadoPago**

Para probar pagos de forma segura sin usar dinero real:

```jsx
import { MercadoPagoTestingPage, RestaurantWithTesting } from './cms-menu/examples.jsx';

// Para testing completo
<MercadoPagoTestingPage />

// Para restaurante con testing integrado  
<RestaurantWithTesting />
```

**📋 Guías de testing:**
- 🚀 **Guía rápida:** `GUIA-PASO-A-PASO.md` (15 min)
- 📖 **Guía completa:** `TESTING-MERCADOPAGO.md`
- 🧪 **Testing Suite:** `mercadopago-testing.html`
- ⚡ **Setup automático:** `./setup-testing.sh`

## 🎨 Personalización

### Cambiar colores
Edita las variables CSS en `MenuComponents.css`:
```css
:root {
  --menu-primary: #tu-color;
  --menu-success: #tu-color;
  --menu-danger: #tu-color;
}
```

### Customizar componentes
Todos los componentes aceptan props para personalización:
```jsx
<MenuDisplay 
  menu={menu}
  showImages={false}      // Ocultar imágenes
  showPrices={true}       // Mostrar precios
  showDescription={false} // Ocultar descripciones
  onAddToCart={addToCart}
/>
```

## 🔧 API Reference

### Hooks disponibles

#### `useMenu(menuSDK)`
```javascript
const { restaurant, menu, loading, error } = useMenu(menuSDK);
```

#### `useCart()`
```javascript
const { 
  cart, 
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  clearCart, 
  cartTotal, 
  cartCount 
} = useCart();
```

#### `useFeaturedItems(menuSDK)`
```javascript
const { featuredItems, loading, error } = useFeaturedItems(menuSDK);
```

### Componentes disponibles

- `<MenuDisplay />` - Menú completo por categorías
- `<FeaturedItems />` - Solo platos destacados
- `<Cart />` - Carrito de compras
- `<MenuWithCart />` - Todo integrado
- `<MenuItem />` - Item individual
- `<CheckoutFlow />` - 💳 Proceso de pago con MercadoPago
- `<MercadoPagoTester />` - 🧪 Testing de MercadoPago
- `<QuickMercadoPagoTest />` - ⚡ Test rápido

### 💳 **MercadoPago Integration**

#### **Testing de forma segura:**
```javascript
import { isTestingMode, getTestCardsInfo } from './mercadopago-test-config.js';

// Verificar si estás en modo testing
if (isTestingMode()) {
  console.log('🧪 Modo testing activado - Credenciales de prueba');
}

// Obtener tarjetas de prueba
const testCards = getTestCardsInfo();
console.log('💳 Tarjetas disponibles:', testCards);
```

#### **Integrar checkout:**
```jsx
import { CheckoutFlow } from './PaymentFlow.jsx';

<CheckoutFlow
  cart={cart}
  cartTotal={total}
  restaurant={restaurant}
  onOrderComplete={(orderId) => {
    console.log('✅ Pedido completado:', orderId);
  }}
/>
```

## 🛠️ Troubleshooting

### "Restaurant not found"
- ✅ Verifica que el `restaurantId` en `config.js` sea correcto
- ✅ Asegúrate de que ese restaurante tenga platos en el menú

### "Firebase error"
- ✅ Verifica la configuración de Firebase en `config.js`
- ✅ Asegúrate de que tu dominio esté autorizado en Firebase Console

### No se muestran las imágenes
- ✅ **SOLUCION PRINCIPAL**: Ejecuta `./setup-cors.sh` desde la raíz del proyecto
- ✅ Verifica que las URLs de las imágenes sean accesibles
- ✅ Asegúrate de que Firebase Storage tenga configuración CORS correcta
- ✅ Verifica con `./verify-images.sh` que las imágenes sean accesibles
- ✅ Si sigues teniendo problemas, revisa la consola del navegador para errores CORS

**Pasos para solucionar imágenes:**
1. Instala Google Cloud SDK si no lo tienes
2. Ejecuta `gcloud init` y autentica con tu cuenta de Firebase
3. Ejecuta `./setup-cors.sh` para aplicar configuración CORS
4. Redeploya las reglas de Storage con `firebase deploy --only storage`
5. Verifica con `./verify-images.sh`

## 🔄 Flujo de trabajo

1. **Administrador usa el CMS**: Sube platos, categorías, precios
2. **Los cambios se guardan en Firebase**: En tiempo real
3. **Tu web frontend**: Muestra automáticamente los cambios
4. **Sin deploy necesario**: Todo es dinámico

## 📱 Responsive

Todos los componentes son completamente responsive y se adaptan a:
- 📱 Móviles
- 📱 Tablets  
- 💻 Desktop

## 🏦 Información Bancaria en Tiempo Real

### ¿Cómo funciona?

Cuando un cliente selecciona "transferencia" como método de pago, automáticamente se muestra la información bancaria actualizada del restaurante/negocio:

```jsx
import { CheckoutFlow } from './cms-menu/PaymentFlow.jsx';
import { useMenu } from './cms-menu/useMenu.js';

function MiCheckout() {
  const { restaurant } = useMenu(menuSDK);
  
  return (
    <CheckoutFlow
      cart={cart}
      cartTotal={cartTotal}
      restaurant={restaurant}  // ← Información actualizada en tiempo real
      menuSDK={menuSDK}
    />
  );
}
```

### ✨ Características de la información bancaria:

- **🔄 Tiempo real**: Se actualiza automáticamente cuando el admin cambia los datos
- **📋 Copiar con un click**: Botones para copiar CBU y Alias al portapapeles
- **💰 Monto destacado**: El total a transferir se muestra claramente
- **📱 Responsivo**: Interfaz optimizada para móvil y desktop
- **🎨 Visual atractivo**: Diseño moderno con gradientes y animaciones

### 🎯 Ejemplo completo con transferencias

```jsx
import React from 'react';
import { createMenuSDK } from './cms-menu/menu-sdk.js';
import { useMenu, useCart } from './cms-menu/useMenu.js';
import { CheckoutFlow } from './cms-menu/PaymentFlow.jsx';
import { MENU_CONFIG } from './cms-menu/config.js';

function RestauranteConTransferencias() {
  const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId);
  const { restaurant, loading } = useMenu(menuSDK);
  const { cart, cartTotal } = useCart();

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      {/* Header mostrando métodos de pago disponibles */}
      {restaurant?.paymentMethods?.transfer && (
        <div className="payment-info">
          🏦 Aceptamos transferencias bancarias
        </div>
      )}

      {/* Checkout con información bancaria automática */}
      <CheckoutFlow
        cart={cart}
        cartTotal={cartTotal}
        restaurant={restaurant}  // Info bancaria actualizada automáticamente
        menuSDK={menuSDK}
      />
    </div>
  );
}
```

### 🔧 Configuración en el Admin Panel

1. Ve al admin panel de tu restaurante
2. Marca "Transferencia Bancaria" en métodos de pago
3. Completa la información bancaria:
   - CBU (requerido)
   - Alias (opcional pero recomendado)
   - Nombre del banco
   - Titular de la cuenta
4. ¡Los cambios aparecen automáticamente en la web pública!

### 📋 Datos que se muestran al cliente:

- **CBU**: Con botón de copia
- **Alias**: Con botón de copia (si está configurado)
- **Banco**: Nombre del banco
- **Titular**: Nombre del titular de la cuenta
- **Monto**: Total a transferir destacado en dorado
