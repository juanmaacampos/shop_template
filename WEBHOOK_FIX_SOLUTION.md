# 🔧 SOLUCIÓN - Problema de Webhooks MercadoPago

## 📋 Problema Identificado

El pedido llegaba al CMS pero no se confirmaba automáticamente, permanecía en estado "PENDIENTE" a pesar de que MercadoPago indicaba "RECIBIDO".

## 🔍 Causa Raíz

El webhook `mercadoPagoWebhookV3` estaba intentando usar un token general:
```javascript
const secretName = 'SHOP_TEMPLATE_MP_ACCESS_TOKEN_GENERAL';
```

Pero el token real está configurado con el business ID específico:
```
SHOP_TEMPLATE_MP_ACCESS_TOKEN_OANNHilb2kZOVQKx7fb80hPrAL92
```

## ✅ Solución Implementada

### 1. **Corrección del Token en el Webhook**
- Cambiamos de `SHOP_TEMPLATE_MP_ACCESS_TOKEN_GENERAL` 
- A `SHOP_TEMPLATE_MP_ACCESS_TOKEN_OANNHilb2kZOVQKx7fb80hPrAL92`

### 2. **Código Corregido**
```javascript
async function handlePaymentNotification(paymentId) {
  const projectId = process.env.GCLOUD_PROJECT;
  const knownBusinessId = 'OANNHilb2kZOVQKx7fb80hPrAL92'; // Business ID del config
  let secretName = `SHOP_TEMPLATE_MP_ACCESS_TOKEN_${knownBusinessId}`;
  // ... resto del código
}
```

### 3. **Función Desplegada**
- ✅ Función `mercadoPagoWebhookV3` actualizada y desplegada
- 🌐 URL: `https://mercadopagowebhookv3-pmav4zp6aq-uc.a.run.app`

## 🧪 Cómo Probar

### Opción 1: Hacer un pago real
1. Hacer un pedido desde tu página web
2. Procesar el pago con MercadoPago
3. Verificar que el estado cambie automáticamente en el CMS

### Opción 2: Usar el simulador de webhooks
1. Ve al simulador de webhooks de MercadoPago
2. Usa la URL: `https://mercadopagowebhookv3-pmav4zp6aq-uc.a.run.app`
3. Simula un pago aprobado

### Opción 3: Script de prueba
```javascript
// Ejecutar en la consola del navegador
testWebhookFix();
```

## 📊 Estados Esperados

| Estado MercadoPago | Estado CMS | Payment Status |
|-------------------|------------|----------------|
| `approved` | `confirmed` | `paid` |
| `pending` | `pending` | `pending` |
| `rejected` | `cancelled` | `failed` |
| `in_process` | `pending` | `processing` |

## 🔐 Configuración de Secrets

Asegúrate de tener configurado en Secret Manager:
```
SHOP_TEMPLATE_MP_ACCESS_TOKEN_OANNHilb2kZOVQKx7fb80hPrAL92
```

## ⚙️ Archivos Modificados

- `functions/index.js` - Función `handlePaymentNotification()` actualizada
- Desplegada automáticamente en Cloud Functions

## 🎯 Resultado Esperado

Ahora cuando se haga un pago:
1. 💳 El pago se procesa en MercadoPago
2. 🔔 MercadoPago envía webhook a tu función
3. ✅ La función usa el token correcto
4. 📊 El pedido se actualiza automáticamente en el CMS
5. 🎉 El estado cambia de "PENDIENTE" a "RECIBIDO" (confirmado)

---

*Fecha: 5 de agosto de 2025*  
*Estado: ✅ Solución implementada y desplegada*
