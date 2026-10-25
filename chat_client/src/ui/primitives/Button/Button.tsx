import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { colors, radii, spacing, typography } from '@/ui/tokens';

export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
};

const variants = {
  primary: { background: colors.primary, foreground: colors.onPrimary },
  secondary: { background: colors.backgroundElement, foreground: colors.text },
} as const;

export const Button = ({
  title,
  loading = false,
  disabled,
  variant = 'primary',
  ...rest
}: ButtonProps) => {
  const isDisabled = Boolean(disabled) || loading;
  const { background, foreground } = variants[variant];

  return (
    <Pressable
      role="button"
      aria-busy={loading}
      {...rest}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: background },
        pressed && styles.pressed,
        isDisabled && styles.disabled,
      ]}>
      {loading ? (
        <ActivityIndicator color={foreground} />
      ) : (
        <Text style={[typography.button, { color: foreground }]}>{title}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radii.md,
    paddingHorizontal: spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.6,
  },
});
