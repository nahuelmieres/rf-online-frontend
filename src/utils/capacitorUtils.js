import { Capacitor } from '@capacitor/core';

export const isNativePlatform = () => {
  return Capacitor.isNativePlatform();
};

export const getPlatform = () => {
  return Capacitor.getPlatform();
};

export const isWeb = () => {
  return getPlatform() === 'web';
};

export const isIOS = () => {
  return getPlatform() === 'ios';
};

export const isAndroid = () => {
  return getPlatform() === 'android';
};