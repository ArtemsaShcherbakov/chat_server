import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, maxContentWidth, spacing } from '@/ui/tokens';

export const KeyboardAvoidingScreen = ({ children }: PropsWithChildren) => (
  <KeyboardAvoidingView
    style={[styles.root, styles.background]}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </SafeAreaView>
  </KeyboardAvoidingView>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  background: {
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: maxContentWidth / 2,
    padding: spacing.four,
  },
});
