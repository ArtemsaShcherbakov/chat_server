import { StyleSheet } from 'react-native';

import { colors, radii, spacing } from '@/ui/tokens';

export const styles = StyleSheet.create({
  container: {
    gap: spacing.four,
  },
  header: {
    gap: spacing.one,
  },
  fields: {
    gap: spacing.three,
  },
  submitError: {
    padding: spacing.three,
    borderRadius: radii.md,
    color: colors.danger,
    backgroundColor: colors.backgroundElement,
  },
});
