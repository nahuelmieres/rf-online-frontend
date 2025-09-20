import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

const useSecureStorage = () => {
  const isNative = Capacitor.isNativePlatform();

  const setItem = async (key, value) => {
    try {
      const toStore = typeof value === 'string' ? value : JSON.stringify(value);
      if (isNative) {
        await Preferences.set({ key, value: toStore });
      } else {
        localStorage.setItem(key, toStore);
      }
      return true;
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    }
  };

  const getItem = async (key) => {
    try {
      let value;
      if (isNative) {
        const result = await Preferences.get({ key });
        value = result.value;
      } else {
        value = localStorage.getItem(key);
      }
      try {
        return value ? JSON.parse(value) : value; // si no es JSON, vuelve string
      } catch {
        return value;
      }
    } catch (error) {
      console.error('Error reading data:', error);
      return null;
    }
  };

  const removeItem = async (key) => {
    try {
      if (isNative) {
        await Preferences.remove({ key });
      } else {
        localStorage.removeItem(key);
      }
      return true;
    } catch (error) {
      console.error('Error removing data:', error);
      return false;
    }
  };

  const clear = async () => {
    try {
      if (isNative) await Preferences.clear();
      else localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  };

  const keys = async () => {
    try {
      if (isNative) {
        const result = await Preferences.keys();
        return result.keys;
      }
      return Object.keys(localStorage);
    } catch (error) {
      console.error('Error getting keys:', error);
      return [];
    }
  };

  return { setItem, getItem, removeItem, clear, keys };
};

export default useSecureStorage;