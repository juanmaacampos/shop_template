import { useState, useEffect, useRef } from 'react';
import { collection, doc, onSnapshot } from 'firebase/firestore';

/**
 * Hook para monitorear stock en tiempo real de productos específicos
 * @param {Array} productIds - Array de IDs de productos a monitorear
 * @param {string} businessId - ID del negocio
 * @param {boolean} enabled - Si el monitoreo está habilitado
 * @param {Object} db - Instancia de Firestore database
 */
export function useRealTimeStock(productIds = [], businessId, enabled = true, db = null) {
  const [stockData, setStockData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const unsubscribersRef = useRef(new Map());

  useEffect(() => {
    if (!enabled || !businessId || !productIds.length || !db) {
      // Limpiar listeners si no está habilitado
      unsubscribersRef.current.forEach(unsubscriber => unsubscriber());
      unsubscribersRef.current.clear();
      setIsRealTimeActive(false);
      return;
    }

    setLoading(true);
    setError(null);

    const setupStockListeners = async () => {
      try {
        console.log('📦 Setting up real-time stock listeners for products:', productIds);

        // Limpiar listeners anteriores
        unsubscribersRef.current.forEach(unsubscriber => unsubscriber());
        unsubscribersRef.current.clear();

        // Crear listener para cada producto
        for (const productData of productIds) {
          const { id: productId, categoryId } = productData;
          
          if (!productId || !categoryId) {
            console.warn('⚠️ Product missing ID or categoryId:', productData);
            continue;
          }

          const productRef = doc(db, 'businesses', businessId, 'menu', categoryId, 'items', productId);
          
          const unsubscriber = onSnapshot(
            productRef,
            (docSnapshot) => {
              if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                console.log(`📦 Stock update for ${productId}:`, {
                  stock: data.stock,
                  isAvailable: data.isAvailable,
                  trackStock: data.trackStock
                });
                
                setStockData(prev => ({
                  ...prev,
                  [productId]: {
                    id: productId,
                    categoryId,
                    stock: data.stock || 0,
                    isAvailable: data.isAvailable !== false, // default true
                    trackStock: data.trackStock || false,
                    name: data.name,
                    price: data.price,
                    lastUpdated: new Date()
                  }
                }));
                
                setLastUpdated(new Date());
              } else {
                // Producto no existe, remover del stock
                setStockData(prev => {
                  const newData = { ...prev };
                  delete newData[productId];
                  return newData;
                });
              }
            },
            (err) => {
              console.error(`❌ Stock listener error for product ${productId}:`, err);
              setError(err.message);
            }
          );

          unsubscribersRef.current.set(productId, unsubscriber);
        }

        setIsRealTimeActive(true);
        setLoading(false);
        
      } catch (err) {
        console.error('❌ Error setting up stock listeners:', err);
        setError(err.message);
        setLoading(false);
        setIsRealTimeActive(false);
      }
    };

    setupStockListeners();

    return () => {
      console.log('🧹 Cleaning up stock listeners');
      unsubscribersRef.current.forEach(unsubscriber => unsubscriber());
      unsubscribersRef.current.clear();
      setIsRealTimeActive(false);
    };
  }, [productIds.map(p => `${p.id}-${p.categoryId}`).join(','), businessId, enabled, db]);

  return {
    stockData,
    loading,
    error,
    isRealTimeActive,
    lastUpdated,
    // Funciones de utilidad
    getProductStock: (productId) => stockData[productId]?.stock || 0,
    isProductAvailable: (productId) => stockData[productId]?.isAvailable !== false,
    isStockTracked: (productId) => stockData[productId]?.trackStock || false,
    getStockStatus: (productId) => {
      const product = stockData[productId];
      if (!product) return 'unknown';
      if (!product.trackStock) return 'not-tracked';
      if (!product.isAvailable) return 'unavailable';
      if (product.stock <= 0) return 'out-of-stock';
      if (product.stock <= 5) return 'low-stock';
      return 'in-stock';
    }
  };
}

/**
 * Hook para monitorear stock de todos los productos de una categoría
 * @param {string} categoryId - ID de la categoría
 * @param {string} businessId - ID del negocio
 * @param {boolean} enabled - Si el monitoreo está habilitado
 * @param {Object} db - Instancia de Firestore database
 */
export function useRealTimeStockByCategory(categoryId, businessId, enabled = true, db = null) {
  const [stockData, setStockData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const unsubscriberRef = useRef(null);

  useEffect(() => {
    if (!enabled || !businessId || !categoryId || !db) {
      if (unsubscriberRef.current) {
        unsubscriberRef.current();
        unsubscriberRef.current = null;
      }
      setIsRealTimeActive(false);
      return;
    }

    setLoading(true);
    setError(null);

    const setupCategoryStockListener = async () => {
      try {
        console.log(`📦 Setting up category stock listener for category: ${categoryId}`);

        // Limpiar listener anterior
        if (unsubscriberRef.current) {
          unsubscriberRef.current();
        }

        const itemsRef = collection(db, 'businesses', businessId, 'menu', categoryId, 'items');
        
        unsubscriberRef.current = onSnapshot(
          itemsRef,
          (querySnapshot) => {
            const newStockData = {};
            
            querySnapshot.forEach((doc) => {
              const data = doc.data();
              newStockData[doc.id] = {
                id: doc.id,
                categoryId,
                stock: data.stock || 0,
                isAvailable: data.isAvailable !== false,
                trackStock: data.trackStock || false,
                name: data.name,
                price: data.price,
                lastUpdated: new Date()
              };
            });

            console.log(`📦 Category stock update for ${categoryId}:`, Object.keys(newStockData).length, 'products');
            setStockData(newStockData);
            setLastUpdated(new Date());
            setIsRealTimeActive(true);
            setLoading(false);
          },
          (err) => {
            console.error(`❌ Category stock listener error for ${categoryId}:`, err);
            setError(err.message);
            setLoading(false);
            setIsRealTimeActive(false);
          }
        );
        
      } catch (err) {
        console.error('❌ Error setting up category stock listener:', err);
        setError(err.message);
        setLoading(false);
        setIsRealTimeActive(false);
      }
    };

    setupCategoryStockListener();

    return () => {
      console.log(`🧹 Cleaning up category stock listener for ${categoryId}`);
      if (unsubscriberRef.current) {
        unsubscriberRef.current();
        unsubscriberRef.current = null;
      }
      setIsRealTimeActive(false);
    };
  }, [categoryId, businessId, enabled, db]);

  return {
    stockData,
    loading,
    error,
    isRealTimeActive,
    lastUpdated,
    // Funciones de utilidad
    getProductStock: (productId) => stockData[productId]?.stock || 0,
    isProductAvailable: (productId) => stockData[productId]?.isAvailable !== false,
    isStockTracked: (productId) => stockData[productId]?.trackStock || false,
    getStockStatus: (productId) => {
      const product = stockData[productId];
      if (!product) return 'unknown';
      if (!product.trackStock) return 'not-tracked';
      if (!product.isAvailable) return 'unavailable';
      if (product.stock <= 0) return 'out-of-stock';
      if (product.stock <= 5) return 'low-stock';
      return 'in-stock';
    },
    getAllProducts: () => Object.values(stockData)
  };
}