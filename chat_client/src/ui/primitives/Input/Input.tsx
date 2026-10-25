import { useState, type ReactNode, type Ref } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputInstance,
  type TextInputProps,
} from 'react-native';

import { colors, radii, spacing, typography } from '@/ui/tokens';

export type InputProps = TextInputProps & {
  label: string;
  error?: string;
  rightAccessory?: ReactNode;
  ref?: Ref<TextInputInstance>;
};

export const Input = ({
  label,
  error,
  rightAccessory,
  style,
  onFocus,
  onBlur,
  ref,
  ...rest
}: InputProps) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={[typography.label, styles.label]}>{label}</Text>
      {/* No border: focus is shown by a lighter fill instead */}
      <View style={[styles.box, focused && styles.boxFocused]}>
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          aria-invalid={Boolean(error)}
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, typography.body, style]}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...rest}
        />
        {rightAccessory}
      </View>
      {error ? (
        <Text role="alert" style={[typography.caption, styles.error]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  field: {
    gap: spacing.one,
  },
  label: {
    color: colors.text,
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.md,
    paddingHorizontal: spacing.three,
    backgroundColor: colors.backgroundElement,
  },
  boxFocused: {
    backgroundColor: colors.backgroundSelected,
  },
  input: {
    flex: 1,
    minHeight: 48,
    paddingVertical: spacing.two,
    color: colors.text,
    // Removes the browser focus ring on web
    outlineWidth: 0,
  },
  error: {
    color: colors.danger,
  },
});
