import { useRef } from 'react';
import { Text, View, type TextInputInstance } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTranslation } from '@/lib/i18n';
import { Button, Input, typography } from '@/ui';

import { AuthLink } from '../AuthLink';
import { PasswordInput } from '../PasswordInput';
import { styles } from './LoginForm.styles';
import { useLoginForm } from './useLoginForm';

export const LoginForm = () => {
  const form = useLoginForm();
  const { t } = useTranslation();
  const passwordRef = useRef<TextInputInstance>(null);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="subtitle">{t('auth.login.title')}</ThemedText>
        <ThemedText themeColor="textSecondary">{t('auth.login.subtitle')}</ThemedText>
      </View>

      <View style={styles.fields}>
        <Input
          label={t('auth.fields.userName')}
          value={form.values.name}
          onChangeText={form.setField('name')}
          onBlur={form.touchField('name')}
          error={form.getFieldError('name')}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="username"
          textContentType="username"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => passwordRef.current?.focus()}
          editable={!form.isSubmitting}
        />

        <PasswordInput
          ref={passwordRef}
          label={t('auth.fields.password')}
          value={form.values.password}
          onChangeText={form.setField('password')}
          onBlur={form.touchField('password')}
          error={form.getFieldError('password')}
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={form.submit}
          editable={!form.isSubmitting}
        />
      </View>

      {form.submitError ? (
        <Text role="alert" style={[typography.caption, styles.submitError]}>
          {form.submitError}
        </Text>
      ) : null}

      <Button title={t('auth.login.submit')} onPress={form.submit} loading={form.isSubmitting} />

      <AuthLink
        prompt={t('auth.login.noAccount')}
        action={t('auth.login.toRegister')}
        href="/register"
      />
    </View>
  );
};
