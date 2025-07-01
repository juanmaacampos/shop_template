// Exportaciones principales del SDK
export { default as MenuComponents } from './core/MenuComponents.jsx'
export { default as OrderConfirmation } from './core/OrderConfirmation.jsx'
export { default as PaymentFlow } from './core/PaymentFlow.jsx'
export { default as BankInfo } from './core/BankInfo.jsx'
export { default as useMenu } from './core/useMenu.js'
export { default as config } from './core/config.js'

// Re-exportar todo desde menu-sdk.js si existe
export * from './core/menu-sdk.js'

// CSS
import './core/MenuComponents.css'
