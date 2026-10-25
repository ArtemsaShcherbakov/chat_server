const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? (__DEV__ ? 'http://localhost:3000' : undefined);

if (!apiUrl) {
  throw new Error('EXPO_PUBLIC_API_URL is not set');
}

// Passwords must never travel over plain HTTP outside local development
if (!__DEV__ && !apiUrl.startsWith('https://')) {
  throw new Error('EXPO_PUBLIC_API_URL must use https:// in production builds');
}

export const env = {
  apiUrl: apiUrl.replace(/\/+$/, ''),
} as const;
