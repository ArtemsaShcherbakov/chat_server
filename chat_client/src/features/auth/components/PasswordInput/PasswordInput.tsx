import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useTranslation } from '@/lib/i18n';
import { colors, Input, spacing, typography, type InputProps } from '@/ui';

type PasswordInputProps = Omit<InputProps, 'secureTextEntry' | 'rightAccessory'>;

export const PasswordInput = (props: PasswordInputProps) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  return (
    <Input
      autoCapitalize="none"
      autoCorrect={false}
      {...props}
      secureTextEntry={!visible}
      rightAccessory={
        <Pressable
          role="button"
          aria-label={t(visible ? 'auth.fields.hidePassword' : 'auth.fields.showPassword')}
          onPress={() => setVisible((value) => !value)}
          style={styles.toggle}>
          <Text style={[typography.caption, styles.toggleText]}>
            {t(visible ? 'auth.fields.hide' : 'auth.fields.show')}
          </Text>
        </Pressable>
      }
    />
  );
};

const styles = StyleSheet.create({
  toggle: {
    paddingVertical: spacing.two,
    paddingLeft: spacing.two,
  },
  toggleText: {
    color: colors.primary,
  },
});
