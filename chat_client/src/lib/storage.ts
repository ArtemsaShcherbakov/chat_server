import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Native: iOS Keychain / Android Keystore via expo-secure-store.
// Web: expo-secure-store is unsupported, so fall back to localStorage.
const getWebStorage = () => (typeof localStorage === 'undefined' ? null : localStorage);

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return getWebStorage()?.getItem(key) ?? null;
    }

    return SecureStore.getItemAsync(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      getWebStorage()?.setItem(key, value);

      return;
    }

    await SecureStore.setItemAsync(key, value);
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      getWebStorage()?.removeItem(key);
      return;
    }

    await SecureStore.deleteItemAsync(key);
  },
};
