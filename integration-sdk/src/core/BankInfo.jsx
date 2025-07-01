import React, { useState } from 'react';
import './MenuComponents.css';

const BankInfo = ({ 
  bankInfo, 
  totalAmount, 
  orderNumber = '', 
  onConfirm, 
  onCancel,
  whatsappNumber = ''
}) => {
  const [copiedField, setCopiedField] = useState('');

  // Función para copiar al portapapeles
  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000);
    }
  };

  if (!bankInfo) {
    return (
      <div className="bank-info-section">
        <div className="bank-info-error">
          <h3>⚠️ Información bancaria no disponible</h3>
          <p>Los datos bancarios no están configurados. Por favor contacta al restaurante.</p>
          <button onClick={onCancel} className="btn-secondary">
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bank-info-section">
      <h3>💳 Datos para transferencia bancaria</h3>
      
      <div className="bank-info-instructions">
        <p>
          <strong>📋 Instrucciones:</strong>
        </p>
        <ol>
          <li>Realiza la transferencia por el monto exacto indicado</li>
          <li>Una vez realizada la transferencia, confirma tu pedido</li>
          <li>Te enviaremos un mensaje por WhatsApp cuando recibamos la transferencia</li>
        </ol>
      </div>
      
      <div className="bank-details">
        {bankInfo.cbu && (
          <div className="bank-detail-item">
            <span className="bank-label">CBU:</span>
            <div className="bank-value-container">
              <span className="bank-value" onClick={() => copyToClipboard(bankInfo.cbu, 'cbu')}>
                {bankInfo.cbu}
              </span>
              <button 
                type="button"
                className={`copy-btn ${copiedField === 'cbu' ? 'copied' : ''}`}
                onClick={() => copyToClipboard(bankInfo.cbu, 'cbu')}
                title="Copiar CBU"
              >
                {copiedField === 'cbu' ? '✅ Copiado' : '📋 Copiar'}
              </button>
            </div>
          </div>
        )}
        
        {bankInfo.alias && (
          <div className="bank-detail-item">
            <span className="bank-label">Alias:</span>
            <div className="bank-value-container">
              <span className="bank-value" onClick={() => copyToClipboard(bankInfo.alias, 'alias')}>
                {bankInfo.alias}
              </span>
              <button 
                type="button"
                className={`copy-btn ${copiedField === 'alias' ? 'copied' : ''}`}
                onClick={() => copyToClipboard(bankInfo.alias, 'alias')}
                title="Copiar Alias"
              >
                {copiedField === 'alias' ? '✅ Copiado' : '📋 Copiar'}
              </button>
            </div>
          </div>
        )}
        
        {bankInfo.bankName && (
          <div className="bank-detail-item">
            <span className="bank-label">Banco:</span>
            <div className="bank-value-container">
              <span className="bank-value" onClick={() => copyToClipboard(bankInfo.bankName, 'bankName')}>
                {bankInfo.bankName}
              </span>
              <button 
                type="button"
                className={`copy-btn ${copiedField === 'bankName' ? 'copied' : ''}`}
                onClick={() => copyToClipboard(bankInfo.bankName, 'bankName')}
                title="Copiar Banco"
              >
                {copiedField === 'bankName' ? '✅ Copiado' : '📋 Copiar'}
              </button>
            </div>
          </div>
        )}
        
        {bankInfo.accountHolder && (
          <div className="bank-detail-item">
            <span className="bank-label">Titular:</span>
            <div className="bank-value-container">
              <span className="bank-value" onClick={() => copyToClipboard(bankInfo.accountHolder, 'accountHolder')}>
                {bankInfo.accountHolder}
              </span>
              <button 
                type="button"
                className={`copy-btn ${copiedField === 'accountHolder' ? 'copied' : ''}`}
                onClick={() => copyToClipboard(bankInfo.accountHolder, 'accountHolder')}
                title="Copiar Titular"
              >
                {copiedField === 'accountHolder' ? '✅ Copiado' : '📋 Copiar'}
              </button>
            </div>
          </div>
        )}
        
        {orderNumber && (
          <div className="bank-detail-item">
            <span className="bank-label">Pedido N°:</span>
            <div className="bank-value-container">
              <span className="bank-value" onClick={() => copyToClipboard(orderNumber, 'orderNumber')}>
                {orderNumber}
              </span>
              <button 
                type="button"
                className={`copy-btn ${copiedField === 'orderNumber' ? 'copied' : ''}`}
                onClick={() => copyToClipboard(orderNumber, 'orderNumber')}
                title="Copiar Número de Pedido"
              >
                {copiedField === 'orderNumber' ? '✅ Copiado' : '📋 Copiar'}
              </button>
            </div>
          </div>
        )}
        
        <div className="bank-detail-item highlight">
          <span className="bank-label">Monto a transferir:</span>
          <div className="bank-value-container">
            <span className="bank-value total-amount">${totalAmount.toFixed(2)} ARS</span>
            <button 
              type="button"
              className={`copy-btn ${copiedField === 'totalAmount' ? 'copied' : ''}`}
              onClick={() => copyToClipboard(totalAmount.toFixed(2), 'totalAmount')}
              title="Copiar Monto"
            >
              {copiedField === 'totalAmount' ? '✅ Copiado' : '📋 Copiar'}
            </button>
          </div>
        </div>
      </div>

      <div className="whatsapp-notice">
        <p>
          📱 <strong>Confirmación por WhatsApp:</strong> Una vez que realices la transferencia, 
          recibirás un mensaje de confirmación {whatsappNumber && `al ${whatsappNumber}`} 
          cuando se reciba la transferencia y tu pedido será procesado.
        </p>
      </div>
      
      <div className="bank-info-actions">
        <button 
          onClick={onCancel} 
          className="btn-secondary"
        >
          ← Cambiar método de pago
        </button>
        <button 
          onClick={onConfirm} 
          className="btn-primary"
        >
          Confirmar pedido →
        </button>
      </div>
    </div>
  );
};

export default BankInfo;
