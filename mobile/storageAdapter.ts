// Mobile storage adapter - wraps AsyncStorage to match localStorage API
import AsyncStorage from '@react-native-async-storage/async-storage';

class MobileStorage {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting item:', error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
}

// Export singleton instance
export const mobileStorage = new MobileStorage();

// Polyfill localStorage for mobile - make it synchronous for compatibility
if (typeof global.localStorage === 'undefined') {
  let storageCache: { [key: string]: string | null } = {};
  
  // Load all items into cache on startup
  AsyncStorage.getAllKeys().then(keys => {
    if (keys.length > 0) {
      AsyncStorage.multiGet(keys).then(items => {
        items.forEach(([key, value]) => {
          storageCache[key] = value;
        });
      });
    }
  });

  (global as any).localStorage = {
    getItem: (key: string): string | null => {
      // Try cache first for synchronous access
      if (key in storageCache) {
        return storageCache[key];
      }
      // Fallback to async (will return null initially, but cache for next time)
      mobileStorage.getItem(key).then(value => {
        storageCache[key] = value;
      });
      return storageCache[key] || null;
    },
    setItem: (key: string, value: string): void => {
      storageCache[key] = value;
      mobileStorage.setItem(key, value);
    },
    removeItem: (key: string): void => {
      delete storageCache[key];
      mobileStorage.removeItem(key);
    },
    clear: (): void => {
      storageCache = {};
      mobileStorage.clear();
    },
  };
}

