import { StyleSheet, View } from 'react-native';

import { LanguageSwitcher } from '@/components/language-switcher';
import { LoginForm } from '@/features/auth';
import { KeyboardAvoidingScreen, spacing } from '@/ui';

const LoginScreen = () => (
  <KeyboardAvoidingScreen>
    <View style={styles.switcher}>
      <LanguageSwitcher />
    </View>
    <LoginForm />
  </KeyboardAvoidingScreen>
);

export default LoginScreen;

const styles = StyleSheet.create({
  switcher: {
    alignItems: 'flex-end',
    marginBottom: spacing.five,
  },
});
