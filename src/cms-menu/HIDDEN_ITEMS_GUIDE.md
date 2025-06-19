# 👁️ Sistema de Items Ocultos - Documentación

## 📋 Descripción

El sistema de items ocultos permite a los administradores controlar qué items del menú son visibles para los clientes, sin eliminarlos permanentemente de la base de datos.

## 🎯 Casos de Uso

- **Items temporalmente no disponibles** (sin eliminar del menú)
- **Items en preparación** (próximos a lanzar)
- **Items estacionales** (ocultar fuera de temporada)
- **Control de inventario** (ocultar items sin stock)
- **Pruebas A/B** (mostrar/ocultar items según criterios)

## 🔧 Implementación

### 1. Estructura de Datos

Cada item en Firebase debe tener el campo `isHidden`:

```javascript
// Estructura del item en Firebase
{
  id: "item-123",
  name: "Pizza Margherita",
  price: 25.99,
  description: "Deliciosa pizza con tomate y mozzarella",
  isHidden: false,        // ✅ false = visible, true = oculto
  isAvailable: true,      // Disponibilidad general
  trackStock: true,       // Si controla stock
  stock: 10              // Stock disponible
}
```

### 2. Métodos del SDK

#### `getFullMenu()` - Solo items visibles
```javascript
const menuSDK = new MenuSDK(firebaseConfig, businessId);
const visibleMenu = await menuSDK.getFullMenu();
// Retorna solo items donde isHidden !== true
```

#### `getFullMenuWithHidden()` - Todos los items (admin)
```javascript
const fullMenu = await menuSDK.getFullMenuWithHidden();
// Retorna TODOS los items, incluidos los ocultos
```

#### `getFeaturedItems()` - Destacados visibles
```javascript
const featuredItems = await menuSDK.getFeaturedItems();
// Retorna solo items destacados que NO están ocultos
```

#### `getAvailableItems()` - Items disponibles
```javascript
const availableItems = await menuSDK.getAvailableItems();
// Retorna items con stock y visibles
```

### 3. Hooks Disponibles

#### `useMenu()` - Hook estándar (solo visibles)
```javascript
import { useMenu } from './useMenu.js';

function PublicMenu() {
  const { menu, loading, error } = useMenu(menuSDK);
  // menu contiene solo items visibles
}
```

#### `useMenuWithHidden()` - Hook para administradores
```javascript
import { useMenuWithHidden } from './useMenu.js';

function AdminMenu() {
  const { menu, loading, error, refreshMenu } = useMenuWithHidden(menuSDK);
  // menu contiene TODOS los items
}
```

#### `useFeaturedItems()` - Items destacados visibles
```javascript
import { useFeaturedItems } from './useMenu.js';

function FeaturedSection() {
  const { featuredItems, loading, error } = useFeaturedItems(menuSDK);
  // Solo items destacados y visibles
}
```

#### `useAvailableItems()` - Items disponibles y visibles
```javascript
import { useAvailableItems } from './useMenu.js';

function AvailableItems() {
  const { availableItems, loading, error } = useAvailableItems(menuSDK);
  // Items con stock y visibles
}
```

### 4. Componentes de UI

#### `ItemVisibilityManager` - Panel de administración
```javascript
import { ItemVisibilityManager } from './ItemVisibilityManager.jsx';

function AdminPanel() {
  const handleUpdate = () => {
    console.log('Item visibility updated');
  };

  return (
    <ItemVisibilityManager 
      menuSDK={menuSDK}
      onUpdate={handleUpdate}
    />
  );
}
```

#### `MenuWithCart` - Menú público (solo visibles)
```javascript
import { MenuWithCart } from './MenuComponents.jsx';

function PublicMenu() {
  return (
    <MenuWithCart 
      menuSDK={menuSDK}
      showImages={true}
      terminology={{
        menuName: 'menú',
        items: 'platos',
        addToCart: 'Agregar al carrito'
      }}
    />
  );
}
```

### 5. Estilos CSS

Los items ocultos tienen estilos especiales:

```css
/* Item oculto en vista administrativa */
.menu-item.hidden {
  opacity: 0.6;
  position: relative;
}

/* Patrón diagonal para indicar item oculto */
.menu-item.hidden::before {
  content: '';
  position: absolute;
  background: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px);
}

/* Tag de item oculto */
.tag.hidden {
  background: rgba(108, 117, 125, 0.2);
  color: #6c757d;
  border: 1px dashed #6c757d;
}

/* Botón deshabilitado para items ocultos */
.add-button.hidden {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.7;
}
```

## 🚀 Ejemplos de Uso

### Menú Público Básico
```javascript
import { MenuWithCart } from './cms-menu';

function RestaurantMenu() {
  const menuSDK = new MenuSDK(config.firebaseConfig, config.businessId);
  
  return (
    <MenuWithCart 
      menuSDK={menuSDK}
      showImages={true}
    />
  );
}
// Solo muestra items visibles automáticamente
```

### Panel de Administración
```javascript
import { ItemVisibilityManager } from './cms-menu';

function AdminDashboard() {
  const menuSDK = new MenuSDK(config.firebaseConfig, config.businessId);
  
  return (
    <div className="admin-panel">
      <h1>Gestión de Menú</h1>
      <ItemVisibilityManager 
        menuSDK={menuSDK}
        onUpdate={() => console.log('Updated!')}
      />
    </div>
  );
}
```

### Comparación Admin vs Público
```javascript
import { useMenu, useMenuWithHidden } from './cms-menu';

function MenuComparison() {
  const { menu: publicMenu } = useMenu(menuSDK);
  const { menu: adminMenu } = useMenuWithHidden(menuSDK);
  
  const hiddenCount = adminMenu.reduce((total, cat) => 
    total + cat.items.filter(item => item.isHidden).length, 0
  );
  
  return (
    <div>
      <p>Items públicos: {publicMenu.reduce((t, c) => t + c.items.length, 0)}</p>
      <p>Items ocultos: {hiddenCount}</p>
      <p>Total items: {adminMenu.reduce((t, c) => t + c.items.length, 0)}</p>
    </div>
  );
}
```

## 🔒 Seguridad

- **Frontend**: Los métodos estándar (`getFullMenu()`) automáticamente filtran items ocultos
- **Backend**: Las reglas de Firebase deben permitir lectura de items ocultos solo a administradores
- **UI**: Los componentes públicos no renderizan items ocultos

### Reglas de Firebase recomendadas:
```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /businesses/{businessId}/menu/{categoryId}/items/{itemId} {
      // Lectura pública solo de items no ocultos
      allow read: if !resource.data.isHidden;
      
      // Lectura completa solo para el propietario
      allow read: if request.auth != null && request.auth.uid == businessId;
      
      // Escritura solo para el propietario
      allow write: if request.auth != null && request.auth.uid == businessId;
    }
  }
}
```

## 📊 Monitoreo y Estadísticas

El `ItemVisibilityManager` muestra:
- Total de items
- Items visibles 
- Items ocultos
- Estado por categoría

## 🔄 Migración desde Versión Anterior

Si tienes items existentes sin el campo `isHidden`:

1. **Los items sin `isHidden` se consideran visibles por defecto**
2. **Agregar `isHidden: false` a items existentes** (opcional pero recomendado)
3. **Usar `getFullMenuWithHidden()` para ver todos los items**

## 🛠️ Troubleshooting

### Items no aparecen en el menú público
- ✅ Verificar que `isHidden` sea `false` o `undefined`
- ✅ Verificar que `isAvailable` no sea `false`
- ✅ Verificar reglas de Firebase

### Panel de administración no carga
- ✅ Verificar permisos de Firebase
- ✅ Usar `getFullMenuWithHidden()` en lugar de `getFullMenu()`
- ✅ Verificar que el usuario esté autenticado

### Items ocultos aparecen en público
- ✅ Asegurar uso de `getFullMenu()` y no `getFullMenuWithHidden()`
- ✅ Verificar componentes que no usen filtros
- ✅ Revisar reglas de Firebase
