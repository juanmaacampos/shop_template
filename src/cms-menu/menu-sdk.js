import { collection, doc, getDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { globalFirebaseManager } from './firebase-manager.js';
import { OrderService } from './order-service.js';

export class MenuSDK {
  constructor(firebaseConfig, businessId) {
    this.firebaseConfig = firebaseConfig;
    // Solo usar businessId
    this.businessId = businessId;
    this.app = null;
    this.db = null;
    this.storage = null;
    this.initialized = false;
    this.orderService = null;
    this.firebaseManager = globalFirebaseManager;
  }

  /**
   * Public method to ensure SDK is initialized
   */
  async initialize() {
    return await this._ensureInitialized();
  }

  async _ensureInitialized() {
    if (this.initialized) return;

    try {
      const { app, db, storage } = await globalFirebaseManager.initialize(this.firebaseConfig);
      this.app = app;
      this.db = db;
      this.storage = storage;
      this.initialized = true;
      
      // Initialize order service with firebaseManager
      this.orderService = new OrderService(globalFirebaseManager, this.businessId);
    } catch (error) {
      throw new Error(`Failed to initialize MenuSDK: ${error.message}`);
    }
  }

  async _resolveImageUrl(imagePath) {
    if (!imagePath) {
      return null;
    }
    
    try {
      // Si ya es una URL completa, devolverla tal como está
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
      }
      
      await this._ensureInitialized();
      
      if (!this.storage) {
        console.error('❌ Firebase Storage not initialized');
        return null;
      }
      
      // Crear referencia al archivo en Firebase Storage
      const imageRef = ref(this.storage, imagePath);
      const downloadURL = await getDownloadURL(imageRef);
      
      return downloadURL;
    } catch (error) {
      console.error('❌ Failed to resolve image URL:', {
        path: imagePath,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Obtiene información básica del negocio (nuevo método unificado)
   */
  async getBusinessInfo() {
    try {
      await this._ensureInitialized();
      
      console.log('🔍 Fetching business info for:', this.businessId);
      
      // Intentar primero con la colección businesses
      const businessRef = doc(this.db, 'businesses', this.businessId);
      const businessDoc = await getDoc(businessRef);
      
      if (businessDoc.exists()) {
        console.log('✅ Business info loaded from businesses collection');
        return businessDoc.data();
      }
      
      // Fallback: intentar con la colección restaurants (compatibilidad)
      console.log('📍 Trying restaurants collection for compatibility...');
      const restaurantRef = doc(this.db, 'restaurants', this.businessId);
      const restaurantDoc = await getDoc(restaurantRef);
      
      if (restaurantDoc.exists()) {
        console.log('✅ Business info loaded from restaurants collection (compatibility mode)');
        const data = restaurantDoc.data();
        // Agregar businessType por defecto si no existe
        return {
          ...data,
          businessType: data.businessType || 'restaurant'
        };
      }
      
      throw new Error('Business not found in either businesses or restaurants collection');
    } catch (error) {
      console.error('❌ Error getting business info:', error);
      throw error;
    }
  }

  async getRestaurantInfo() {
    try {
      await this._ensureInitialized();
      
      console.log('🔍 Fetching business info for:', this.businessId);
      
      // Intentar primero con businesses (nuevo sistema)
      try {
        return await this.getBusinessInfo();
      } catch (businessError) {
        // Fallback: usar colección restaurants original
        const restaurantRef = doc(this.db, 'restaurants', this.businessId);
        const restaurantDoc = await getDoc(restaurantRef);
        
        if (!restaurantDoc.exists()) {
          throw new Error('Restaurant not found');
        }
        
        console.log('✅ Restaurant info loaded successfully');
        return restaurantDoc.data();
      }
    } catch (error) {
      console.error('❌ Error getting restaurant info:', error);
      
      // Provide better error context
      if (error.code === 'unavailable') {
        throw new Error('Firebase service is temporarily unavailable. Please try again later.');
      } else if (error.code === 'permission-denied') {
        throw new Error('Access denied. Please check your Firebase security rules.');
      }
      
      throw error;
    }
  }

  async getFullMenu() {
    try {
      await this._ensureInitialized();
      
      console.log('🍽️ Fetching full menu for business:', this.businessId);
      
      // Intentar con la nueva estructura businesses
      let categoriesRef = collection(this.db, 'businesses', this.businessId, 'menu');
      let categoriesQuery = query(categoriesRef, orderBy('order', 'asc'));
      let categoriesSnapshot = await getDocs(categoriesQuery);
      
      // Si no hay categorías en businesses, intentar con restaurants (compatibilidad)
      if (categoriesSnapshot.empty) {
        console.log('📍 Trying restaurants collection for menu...');
        categoriesRef = collection(this.db, 'restaurants', this.businessId, 'menu');
        categoriesQuery = query(categoriesRef, orderBy('order', 'asc'));
        categoriesSnapshot = await getDocs(categoriesQuery);
      }
      
      console.log('📂 Found', categoriesSnapshot.size, 'menu categories');
      
      const menu = [];
      
      for (const categoryDoc of categoriesSnapshot.docs) {
        const categoryData = {
          id: categoryDoc.id,
          ...categoryDoc.data(),
          items: []
        };
        
        // Obtener items de esta categoría
        const itemsRef = collection(categoryDoc.ref, 'items');
        const itemsQuery = query(itemsRef, orderBy('name', 'asc'));
        const itemsSnapshot = await getDocs(itemsQuery);
        
        console.log(`📋 Category "${categoryData.name}": ${itemsSnapshot.size} items`);
        
        for (const itemDoc of itemsSnapshot.docs) {
          const itemData = {
            id: itemDoc.id,
            ...itemDoc.data()
          };
          
          // Resolver URL de imagen - priorizar imageUrl sobre image
          let imageSource = itemData.imageUrl || itemData.image;
          
          if (imageSource) {
            try {
              const resolvedUrl = await this._resolveImageUrl(imageSource);
              // Establecer tanto image como imageUrl para compatibilidad
              itemData.image = resolvedUrl;
              itemData.imageUrl = resolvedUrl;
            } catch (imageError) {
              console.warn(`⚠️ Could not resolve image for item ${itemData.name}:`, imageError.message);
              itemData.image = null;
              itemData.imageUrl = null;
            }
          } else {
            itemData.image = null;
            itemData.imageUrl = null;
          }
          
          // Solo incluir items que no estén ocultos del público
          if (!itemData.isHidden) {
            categoryData.items.push(itemData);
          }
        }
        
        // Solo incluir categorías que tengan items visibles
        if (categoryData.items.length > 0) {
          menu.push(categoryData);
        }
      }
      
      console.log('✅ Full menu loaded successfully:', menu.length, 'categories');
      return menu;
    } catch (error) {
      console.error('❌ Error getting full menu:', error);
      
      // Proporcionar más contexto sobre el error
      if (error.code === 'unavailable') {
        throw new Error('Firebase service is temporarily unavailable. Please try again later.');
      } else if (error.code === 'permission-denied') {
        throw new Error('Access denied. Please check your Firebase security rules.');
      }
      
      throw error;
    }
  }

  /**
   * Obtiene el menú completo incluyendo items ocultos (para uso administrativo)
   */
  async getFullMenuWithHidden() {
    try {
      await this._ensureInitialized();
      
      console.log('🍽️ Fetching full menu with hidden items for business:', this.businessId);
      
      // Intentar con la nueva estructura businesses
      let categoriesRef = collection(this.db, 'businesses', this.businessId, 'menu');
      let categoriesQuery = query(categoriesRef, orderBy('order', 'asc'));
      let categoriesSnapshot = await getDocs(categoriesQuery);
      
      // Si no hay categorías en businesses, intentar con restaurants (compatibilidad)
      if (categoriesSnapshot.empty) {
        console.log('📍 Trying restaurants collection for menu...');
        categoriesRef = collection(this.db, 'restaurants', this.businessId, 'menu');
        categoriesQuery = query(categoriesRef, orderBy('order', 'asc'));
        categoriesSnapshot = await getDocs(categoriesQuery);
      }
      
      console.log('📂 Found', categoriesSnapshot.size, 'menu categories');
      
      const menu = [];
      
      for (const categoryDoc of categoriesSnapshot.docs) {
        const categoryData = {
          id: categoryDoc.id,
          ...categoryDoc.data(),
          items: []
        };
        
        // Obtener items de esta categoría
        const itemsRef = collection(categoryDoc.ref, 'items');
        const itemsQuery = query(itemsRef, orderBy('name', 'asc'));
        const itemsSnapshot = await getDocs(itemsQuery);
        
        console.log(`📋 Category "${categoryData.name}": ${itemsSnapshot.size} items (including hidden)`);
        
        for (const itemDoc of itemsSnapshot.docs) {
          const itemData = {
            id: itemDoc.id,
            ...itemDoc.data()
          };
          
          // Resolver URL de imagen - priorizar imageUrl sobre image
          let imageSource = itemData.imageUrl || itemData.image;
          
          if (imageSource) {
            try {
              const resolvedUrl = await this._resolveImageUrl(imageSource);
              // Establecer tanto image como imageUrl para compatibilidad
              itemData.image = resolvedUrl;
              itemData.imageUrl = resolvedUrl;
            } catch (imageError) {
              console.warn(`⚠️ Could not resolve image for item ${itemData.name}:`, imageError.message);
              itemData.image = null;
              itemData.imageUrl = null;
            }
          } else {
            itemData.image = null;
            itemData.imageUrl = null;
          }
          
          // Incluir todos los items, incluso los ocultos
          categoryData.items.push(itemData);
        }
        
        // Incluir todas las categorías, incluso si no tienen items visibles
        menu.push(categoryData);
      }
      
      console.log('✅ Full menu with hidden items loaded successfully:', menu.length, 'categories');
      return menu;
    } catch (error) {
      console.error('❌ Error getting full menu with hidden items:', error);
      
      // Proporcionar más contexto sobre el error
      if (error.code === 'unavailable') {
        throw new Error('Firebase service is temporarily unavailable. Please try again later.');
      } else if (error.code === 'permission-denied') {
        throw new Error('Access denied. Please check your Firebase security rules.');
      }
      
      throw error;
    }
  }

  /**
   * Obtiene una categoría específica con sus items
   */
  async getCategory(categoryId) {
    try {
      await this._ensureInitialized();
      
      // Intentar con businesses primero
      let categoryRef = doc(this.db, 'businesses', this.businessId, 'menu', categoryId);
      let categoryDoc = await getDoc(categoryRef);
      
      // Fallback a restaurants si no existe en businesses
      if (!categoryDoc.exists()) {
        categoryRef = doc(this.db, 'restaurants', this.businessId, 'menu', categoryId);
        categoryDoc = await getDoc(categoryRef);
      }
      
      if (!categoryDoc.exists()) {
        throw new Error('Category not found');
      }
      
      const categoryData = {
        id: categoryDoc.id,
        ...categoryDoc.data(),
        items: []
      };
      
      // Obtener items de esta categoría
      const itemsRef = collection(categoryDoc.ref, 'items');
      const itemsQuery = query(itemsRef, orderBy('name', 'asc'));
      const itemsSnapshot = await getDocs(itemsQuery);
      
      for (const itemDoc of itemsSnapshot.docs) {
        const itemData = {
          id: itemDoc.id,
          ...itemDoc.data()
        };
        
        // Resolver URL de imagen - priorizar imageUrl sobre image
        let imageSource = itemData.imageUrl || itemData.image;
        
        if (imageSource) {
          try {
            const resolvedUrl = await this._resolveImageUrl(imageSource);
            itemData.image = resolvedUrl;
            itemData.imageUrl = resolvedUrl;
          } catch (imageError) {
            console.warn(`⚠️ Could not resolve image for item ${itemData.name}:`, imageError.message);
            itemData.image = null;
            itemData.imageUrl = null;
          }
        }
        
        categoryData.items.push(itemData);
      }
      
      return categoryData;
    } catch (error) {
      console.error('Error getting category:', error);
      throw error;
    }
  }

  /**
   * Busca items por nombre o descripción
   */
  async searchItems(searchTerm) {
    try {
      const menu = await this.getFullMenu();
      const allItems = [];
      
      menu.forEach(category => {
        category.items.forEach(item => {
          allItems.push({
            ...item,
            categoryName: category.name,
            categoryId: category.id
          });
        });
      });
      
      const searchTermLower = searchTerm.toLowerCase();
      return allItems.filter(item => 
        item.name.toLowerCase().includes(searchTermLower) ||
        (item.description && item.description.toLowerCase().includes(searchTermLower))
      );
    } catch (error) {
      console.error('Error searching items:', error);
      throw error;
    }
  }

  async createOrder(orderData) {
    if (!this.orderService) {
      throw new Error('SDK not initialized. Call initialize() first.');
    }
    return await this.orderService.createOrder(orderData);
  }

  async updateOrderStatus(orderId, status, paymentStatus = null) {
    if (!this.orderService) {
      throw new Error('SDK not initialized. Call initialize() first.');
    }
    return await this.orderService.updateOrderStatus(orderId, status, paymentStatus);
  }

  async getOrder(orderId) {
    if (!this.orderService) {
      throw new Error('SDK not initialized. Call initialize() first.');
    }
    return await this.orderService.getOrder(orderId);
  }

  /**
   * Obtiene solo los platos destacados (excluye items ocultos)
   */
  async getFeaturedItems() {
    try {
      const menu = await this.getFullMenu();
      const featuredItems = [];
      
      menu.forEach(category => {
        const featured = category.items.filter(item => 
          item.isFeatured && 
          item.isAvailable !== false && 
          !item.isHidden // Excluir items ocultos
        );
        featuredItems.push(...featured.map(item => ({
          ...item,
          categoryName: category.name,
          categoryId: category.id
        })));
      });
      
      return featuredItems;
    } catch (error) {
      console.error('Error getting featured items:', error);
      throw error;
    }
  }

  /**
   * Obtiene solo los items disponibles (con stock y no ocultos)
   */
  async getAvailableItems() {
    try {
      const menu = await this.getFullMenu();
      const availableItems = [];
      
      menu.forEach(category => {
        const available = category.items.filter(item => {
          // Si no tiene control de stock, siempre está disponible (si no está oculto)
          if (!item.trackStock) {
            return item.isAvailable !== false && !item.isHidden;
          }
          
          // Si tiene control de stock, verificar que tenga stock y esté disponible
          return item.stock > 0 && item.isAvailable !== false && !item.isHidden;
        });
        
        availableItems.push(...available.map(item => ({
          ...item,
          categoryName: category.name,
          categoryId: category.id
        })));
      });
      
      return availableItems;
    } catch (error) {
      console.error('Error getting available items:', error);
      throw error;
    }
  }

  /**
   * Obtiene el estado del stock de un item específico
   */
  getStockStatus(item) {
    if (!item.trackStock) {
      return {
        status: 'not-tracked',
        text: 'Sin control de stock',
        icon: '📦',
        cssClass: 'stock-normal'
      };
    }

    if (item.isHidden) {
      return {
        status: 'hidden',
        text: 'Oculto',
        icon: '👁️‍🗨️',
        cssClass: 'stock-hidden'
      };
    }

    if (item.isAvailable === false) {
      return {
        status: 'unavailable',
        text: 'No disponible',
        icon: '🚫',
        cssClass: 'stock-unavailable'
      };
    }

    if (item.stock <= 0) {
      return {
        status: 'out-of-stock',
        text: 'Sin stock',
        icon: '❌',
        cssClass: 'stock-empty'
      };
    }

    if (item.stock <= (item.minStock || 5)) {
      return {
        status: 'low-stock',
        text: `Stock bajo (${item.stock})`,
        icon: '⚠️',
        cssClass: 'stock-low'
      };
    }

    return {
      status: 'in-stock',
      text: `En stock (${item.stock})`,
      icon: '✅',
      cssClass: 'stock-normal'
    };
  }
}

export function createMenuSDK(firebaseConfig, businessId) {
  return new MenuSDK(firebaseConfig, businessId);
}
