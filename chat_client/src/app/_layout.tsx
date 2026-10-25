import { DarkTheme, Stack, ThemeProvider, type Theme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { SessionProvider, useSession } from '@/features/auth';
import { I18nProvider } from '@/lib/i18n';
import { colors } from '@/ui';

void SplashScreen.preventAutoHideAsync();

const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.backgroundElement,
    text: colors.text,
    border: colors.backgroundSelected,
  },
};

const RootNavigator = () => {
  const { status } = useSession();
  const isLoading = status === 'loading';

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hide();
    }
  }, [isLoading]);

  // Keep the native splash screen up until the stored session is read
  if (isLoading) {
    return null;
  }

  const isSignedIn = status === 'signedIn';
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="(main)" />
      </Stack.Protected>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
};

const RootLayout = () => (
  <ThemeProvider value={navigationTheme}>
    <I18nProvider>
      <SessionProvider>
        <RootNavigator />
      </SessionProvider>
    </I18nProvider>
  </ThemeProvider>
);

export default RootLayout;
