import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useSession } from '@/features/auth';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/ui';

const DashboardScreen = () => {
  const { session, signOut } = useSession();
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle">
          {t('dashboard.greeting', { name: session?.user.name ?? '' })}
        </ThemedText>
        <ThemedText themeColor="textSecondary">{t('dashboard.signedIn')}</ThemedText>
        <Button title={t('dashboard.signOut')} variant="secondary" onPress={signOut} />
        <LanguageSwitcher />
      </SafeAreaView>
    </ThemedView>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    maxWidth: MaxContentWidth,
  },
});
