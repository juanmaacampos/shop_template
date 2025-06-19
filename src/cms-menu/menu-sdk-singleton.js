// Menu SDK Singleton Manager
// This ensures only ONE MenuSDK instance per configuration

import { createMenuSDK } from './menu-sdk.js';

class MenuSDKManager {
  constructor() {
    this.instances = new Map();
  }

  getInstance(firebaseConfig, businessId) {
    const key = `${businessId}-${firebaseConfig.projectId}`;
    
    if (!this.instances.has(key)) {
      console.log('🏗️ Creating new MenuSDK instance for:', businessId);
      const sdk = createMenuSDK(firebaseConfig, businessId);
      this.instances.set(key, sdk);
    } else {
      console.log('♻️ Reusing existing MenuSDK instance for:', businessId);
    }
    
    return this.instances.get(key);
  }

  clearInstance(firebaseConfig, businessId) {
    const key = `${businessId}-${firebaseConfig.projectId}`;
    if (this.instances.has(key)) {
      console.log('🗑️ Clearing MenuSDK instance for:', businessId);
      this.instances.delete(key);
    }
  }

  clearAll() {
    console.log('🧹 Clearing all MenuSDK instances');
    this.instances.clear();
  }
}

// Export singleton instance
export const menuSDKManager = new MenuSDKManager();
export default menuSDKManager;
