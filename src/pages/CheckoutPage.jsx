/**
 * Example Page: How to use the CheckoutForm component
 * This demonstrates the integration of the CheckoutForm in a restaurant page
 */

import React, { useEffect } from 'react';
import CheckoutForm from '../components/CheckoutForm.jsx';

const CheckoutPage = () => {
  useEffect(() => {
    // Example: Add some sample store items to localStorage for testing
    const sampleCartItems = [
      {
        name: "Smartphone Samsung Galaxy",
        price: 85000,
        quantity: 1
      },
      {
        name: "Auriculares Bluetooth",
        price: 12500,
        quantity: 2
      }
    ];
    
    const sampleTotal = 110000;

    // Only add sample data if cart is empty
    const existingCart = localStorage.getItem('cartItems');
    if (!existingCart) {
      localStorage.setItem('cartItems', JSON.stringify(sampleCartItems));
      localStorage.setItem('cartTotal', sampleTotal.toString());
      console.log('📦 Sample store items added for testing');
    }
  }, []);

  return (
    <div className="checkout-page">
      <div className="container">
        <CheckoutForm />
      </div>
      
      <style jsx>{`
        .checkout-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px 0;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 20px;
        }
      `}</style>
    </div>
  );
};

export default CheckoutPage;
