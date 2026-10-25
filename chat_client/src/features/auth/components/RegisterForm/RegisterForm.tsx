import { useRef } from 'react';
import { Text, View, type TextInputInstance } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTranslation } from '@/lib/i18n';
import { Button, Input, typography } from '@/ui';

import { AuthLink } from '../AuthLink';
import { PasswordInput } from '../PasswordInput';
import { styles } from './RegisterForm.styles';
import { useRegisterForm } from './useRegisterForm';

export const RegisterForm = () => {
  const form = useRegisterForm();
  const { t } = useTranslation();
  const emailRef = useRef<TextInputInstance>(null);
  const passwordRef = useRef<TextInputInstance>(null);
  const confirmPasswordRef = useRef<TextInputInstance>(null);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="subtitle">{t('auth.register.title')}</ThemedText>
        <ThemedText themeColor="textSecondary">{t('auth.register.subtitle')}</ThemedText>
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
          autoComplete="username-new"
          textContentType="username"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => emailRef.current?.focus()}
          editable={!form.isSubmitting}
        />

        <Input
          ref={emailRef}
          label={t('auth.fields.email')}
          value={form.values.email}
          onChangeText={form.setField('email')}
          onBlur={form.touchField('email')}
          error={form.getFieldError('email')}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
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
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => confirmPasswordRef.current?.focus()}
          editable={!form.isSubmitting}
        />

        <PasswordInput
          ref={confirmPasswordRef}
          label={t('auth.fields.confirmPassword')}
          value={form.values.confirmPassword}
          onChangeText={form.setField('confirmPassword')}
          onBlur={form.touchField('confirmPassword')}
          error={form.getFieldError('confirmPassword')}
          autoComplete="new-password"
          textContentType="newPassword"
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

      <Button title={t('auth.register.submit')} onPress={form.submit} loading={form.isSubmitting} />

      <AuthLink
        prompt={t('auth.register.haveAccount')}
        action={t('auth.register.toLogin')}
        href="/login"
      />
    </View>
  );
};
