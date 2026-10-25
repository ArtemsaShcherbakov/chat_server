import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LANGUAGES, useTranslation } from '@/lib/i18n';
import { colors, radii, spacing, typography } from '@/ui';

export const LanguageSwitcher = () => {
  const { language, setLanguage, t } = useTranslation();

  return (
    <View role="radiogroup" aria-label={t('language.label')} style={styles.container}>
      {LANGUAGES.map(({ code, label }) => {
        const selected = code === language;

        return (
          <Pressable
            key={code}
            role="radio"
            aria-checked={selected}
            onPress={() => setLanguage(code)}
            style={[styles.option, selected && styles.optionSelected]}>
            <Text style={[typography.label, selected ? styles.labelSelected : styles.label]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    padding: spacing.half,
    borderRadius: radii.pill,
    backgroundColor: colors.backgroundElement,
  },
  option: {
    minWidth: 44,
    alignItems: 'center',
    paddingVertical: spacing.one,
    paddingHorizontal: spacing.three,
    borderRadius: radii.pill,
  },
  optionSelected: {
    backgroundColor: colors.primary,
  },
  label: {
    color: colors.textSecondary,
  },
  labelSelected: {
    color: colors.onPrimary,
  },
});
