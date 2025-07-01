import { useState, useEffect } from 'react';
import CustomerForm from './CustomerForm';
import PaymentSelection from './PaymentSelection';
import { OrderService } from '../../cms-menu/order-service';
import { paymentService } from '../../cms-menu/payment-service';
import { MENU_CONFIG } from '../../cms-menu/config';
import BankInfo from '../../../integration-sdk/src/core/BankInfo.jsx';
import './Cart.css';
import { FaTrashAlt } from 'react-icons/fa';

const Cart = ({ cart = [], updateQuantity, removeFromCart, clearCart, total = 0, onClose, firebaseManager }) => {
  const [currentStep, setCurrentStep] = useState('cart'); // 'cart', 'payment', 'customer', 'bankinfo'
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderService, setOrderService] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);

  // Ensure total is always a number
  const safeTotal = typeof total === 'number' ? total : 0;
  const cartCount = Array.isArray(cart) ? cart.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;

  // Debug: Log props to verify what we're receiving
  useEffect(() => {
    console.log('🛒 Cart component props:', {
      cart: cart.length,
      total,
      firebaseManager: !!firebaseManager,
      orderService: !!orderService
    });
  }, [cart, total, firebaseManager, orderService]);

  // Initialize OrderService when firebaseManager is available
  useEffect(() => {
    const initializeOrderService = async () => {
      if (firebaseManager) {
        console.log('✅ Initializing OrderService with Firebase manager');
        setOrderService(new OrderService(firebaseManager, MENU_CONFIG.businessId));
      } else {
        // Try to get firebaseManager from global Firebase manager if available
        try {
          const { globalFirebaseManager } = await import('../../cms-menu/firebase-manager.js');
          if (globalFirebaseManager) {
            console.log('✅ Initializing OrderService with global Firebase manager');
            setOrderService(new OrderService(globalFirebaseManager, MENU_CONFIG.businessId));
          }
        } catch (error) {
          console.warn('⚠️ Could not initialize OrderService:', error.message);
        }
      }
    };

    initializeOrderService();
  }, [firebaseManager]);

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
    setCurrentStep('customer');
  };

  const handleCustomerSubmit = async (customerData) => {
    if (!orderService) {
      // Try to initialize OrderService one more time
      try {
        const { globalFirebaseManager } = await import('../../cms-menu/firebase-manager.js');
        const tempOrderService = new OrderService(globalFirebaseManager, MENU_CONFIG.businessId);
        setOrderService(tempOrderService);
        
        // Continue with the original order service
        return handleCustomerSubmit(customerData);
      } catch (error) {
        console.error('❌ Failed to initialize OrderService:', error);
        alert('Error: Servicio de pedidos no disponible. Por favor recarga la página e intenta nuevamente.');
        return;
      }
    }

    setLoading(true);
    
    try {
      // Generate unique order ID
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      if (selectedPaymentMethod === 'mercadopago') {
        // MercadoPago payment flow
        await handleMercadoPagoPayment(orderId, customerData);
      } else if (selectedPaymentMethod === 'transfer') {
        // Transfer payment flow
        await handleTransferPayment(orderId, customerData);
      } else {
        // Cash payment flow (default)
        await handleCashPayment(orderId, customerData);
      }
      
    } catch (error) {
      console.error('❌ Checkout error:', error);
      alert(`Error al procesar el pedido: ${error.message}\n\nPor favor intenta nuevamente.`);
    } finally {
      setLoading(false);
    }
  };

  const handleCashPayment = async (orderId, customerData) => {
    // Create order in Firebase with cash payment
    const orderData = {
      items: cart,
      customer: customerData,
      total: safeTotal,
      notes: customerData.notes,
      paymentMethod: 'cash'
    };

    const order = await orderService.createOrder(orderData);
    console.log('✅ Cash order created:', order);
    
    // Show success message for cash payment
    alert(`¡Pedido confirmado!` + '\n\nID: ' + order.orderId + '\n\nTe contactaremos por WhatsApp para coordinar el retiro.\n\nTotal a pagar: $' + safeTotal.toFixed(2) + ' ARS');
    
    clearCart();
    onClose();
  };

  const handleTransferPayment = async (orderId, customerData) => {
    // Create order in Firebase with transfer payment
    const orderData = {
      items: cart,
      customer: customerData,
      total: safeTotal,
      notes: customerData.notes,
      paymentMethod: 'transfer'
    };

    const order = await orderService.createOrder(orderData);
    console.log('✅ Transfer order created:', order);
    
    // Store order info and show bank information instead of alert
    setCurrentOrder({
      ...order,
      total: safeTotal,
      customer: customerData
    });
    setCurrentStep('bankinfo');
  };

  const handleMercadoPagoPayment = async (orderId, customerData) => {
    console.log('🔄 Processing MercadoPago payment...');

    // Generate back URLs
    const baseUrl = window.location.origin;
    const backUrls = paymentService.generateBackUrls(baseUrl, orderId);

    // Prepare order data for MercadoPago
    const orderData = {
      businessId: MENU_CONFIG.businessId,
      items: cart.map(item => ({
        name: item.name,
        unit_price: item.price,
        quantity: item.quantity
      })),
      customer: {
        name: customerData.name,
        phone: customerData.phone,
        email: customerData.email || '',
        address: customerData.address || ''
      },
      totalAmount: total || 0,
      orderId: orderId,
      backUrls: backUrls,
      notes: customerData.notes || ''
    };

    try {
      // Create MercadoPago preference using Cloud Function
      const result = await paymentService.createMercadoPagoPreference(orderData);
      
      if (result.success && result.init_point) {
        console.log('✅ Redirecting to MercadoPago:', result.init_point);
        
        // Clear cart before redirecting
        clearCart();
        
        // Redirect to MercadoPago checkout
        window.location.href = result.init_point;
      } else {
        throw new Error('Failed to create payment preference');
      }
      
    } catch (error) {
      console.error('❌ MercadoPago error:', error);
      throw new Error(`Error con MercadoPago: ${error.message}`);
    }
  };

  // Funciones para manejar la información bancaria
  const handleBankInfoConfirm = () => {
    // Cuando el usuario confirma que realizó la transferencia
    alert('¡Gracias! Te contactaremos por WhatsApp cuando recibamos la transferencia.');
    clearCart();
    onClose();
  };

  const handleBankInfoCancel = () => {
    // Volver al paso anterior (customer form)
    setCurrentStep('customer');
    setCurrentOrder(null);
  };

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <p>Tu carrito está vacío</p>
        <button onClick={onClose} className="close-btn">Cerrar</button>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>Tu Pedido</h2>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="cart-main-container scrollable-content">
        {currentStep === 'cart' && (
          <>
            <div className="cart-items">
              {cart.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <p className="item-price">${item.price}</p>
                  </div>
                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="remove-btn"
                  >
                    <FaTrashAlt style={{ color: '#888' }} />
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-total">
              <h3>Total: ${safeTotal.toFixed(2)} ARS</h3>
            </div>

            <div className="cart-actions">
              <button onClick={clearCart} className="clear-btn">
                Vaciar Carrito
              </button>
              <button 
                onClick={() => setCurrentStep('payment')}
                className="checkout-btn"
              >
                Continuar
              </button>
            </div>
          </>
        )}

        {currentStep === 'payment' && (
          <PaymentSelection
            onSelect={handlePaymentMethodSelect}
            onBack={() => setCurrentStep('cart')}
            total={total}
          />
        )}

        {currentStep === 'customer' && (
          <CustomerForm
            onSubmit={handleCustomerSubmit}
            loading={loading}
            paymentMethod={selectedPaymentMethod}
            onBack={() => setCurrentStep('payment')}
          />
        )}

        {currentStep === 'bankinfo' && currentOrder && (
          <BankInfo
            bankInfo={{
              bankName: "Banco Santander",
              accountType: "Cuenta Corriente", 
              accountNumber: "123-456789-0",
              cbu: "0720123188000041234567",
              alias: "RESTAURANT.ALIAS",
              holderName: "Restaurante Demo",
              holderDni: "12.345.678"
            }}
            totalAmount={currentOrder.total}
            orderNumber={currentOrder.orderId}
            onConfirm={handleBankInfoConfirm}
            onCancel={handleBankInfoCancel}
            whatsappNumber="+54 9 11 1234-5678"
          />
        )}
      </div>
    </div>
  );
};

export default Cart;
