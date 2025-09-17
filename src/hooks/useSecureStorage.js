// src/hooks/useSecureStorage.js
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

const useSecureStorage = () => {
  const isNative = Capacitor.isNativePlatform();

  const serialize = (key, value) => {
    // guarda token como string puro
    if (typeof value === 'string' || value instanceof String) return value;
    return JSON.stringify(value);
  };

  const setItem = async (key, value) => {
    try {
      const serialized = serialize(key, value);
      if (isNative) {
        await Preferences.set({ key, value: serialized });
        localStorage.setItem(key, serialized);
      } else {
        localStorage.setItem(key, serialized);
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
        value = result.value ?? localStorage.getItem(key);
      } else {
        value = localStorage.getItem(key);
      }
      if (value == null) return null;
      try { return JSON.parse(value); } catch { return value; }
    } catch (error) {
      console.error('Error reading data:', error);
      return null;
    }
  };

  const removeItem = async (key) => {
    try {
      if (isNative) {
        await Preferences.remove({ key });
      }
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing data:', error);
      return false;
    }
  };

  const clear = async () => {
    try {
      if (isNative) await Preferences.clear();
      localStorage.clear();
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
        return Array.from(new Set([...(result.keys || []), ...Object.keys(localStorage)]));
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