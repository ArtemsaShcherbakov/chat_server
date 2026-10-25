import { StyleSheet, View } from 'react-native';

import { LanguageSwitcher } from '@/components/language-switcher';
import { RegisterForm } from '@/features/auth';
import { KeyboardAvoidingScreen, spacing } from '@/ui';

const RegisterScreen = () => (
  <KeyboardAvoidingScreen>
    <View style={styles.switcher}>
      <LanguageSwitcher />
    </View>
    <RegisterForm />
  </KeyboardAvoidingScreen>
);

export default RegisterScreen;

const styles = StyleSheet.create({
  switcher: {
    alignItems: 'flex-end',
    marginBottom: spacing.five,
  },
});
