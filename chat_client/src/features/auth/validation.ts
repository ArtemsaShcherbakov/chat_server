import type { TranslationKey } from '@/lib/i18n';

// Mirrors chat_server/src/auth/auth.constants.ts
const USER_NAME_MIN_LENGTH = 2;
const USER_NAME_MAX_LENGTH = 32;
// Case-insensitive: the server lowercases user names itself
const USER_NAME_PATTERN = /^[a-z0-9._-]+$/i;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 12;
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Errors are stored as translation keys so they re-render in the current language
export type FieldError = { key: TranslationKey; params?: Record<string, number> };
export type FormErrors<Values> = Partial<Record<keyof Values, FieldError>>;

export const normalizeUserName = (name: string) => name.trim();

export const validateUserName = (name: string): FieldError | undefined => {
  const userName = normalizeUserName(name);

  if (!userName) {
    return { key: 'auth.validation.nameRequired' };
  }
  if (userName.length < USER_NAME_MIN_LENGTH || userName.length > USER_NAME_MAX_LENGTH) {
    return {
      key: 'auth.validation.nameLength',
      params: { min: USER_NAME_MIN_LENGTH, max: USER_NAME_MAX_LENGTH },
    };
  }
  if (!USER_NAME_PATTERN.test(userName)) {
    return { key: 'auth.validation.nameChars' };
  }
  return undefined;
};

export const validatePassword = (password: string): FieldError | undefined => {
  if (!password) {
    return { key: 'auth.validation.passwordRequired' };
  }
  if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
    return {
      key: 'auth.validation.passwordLength',
      params: { min: PASSWORD_MIN_LENGTH, max: PASSWORD_MAX_LENGTH },
    };
  }
  if (!PASSWORD_PATTERN.test(password)) {
    return { key: 'auth.validation.passwordComplexity' };
  }
  return undefined;
};

export const validateEmail = (email: string): FieldError | undefined => {
  const value = email.trim();

  if (!value) {
    return { key: 'auth.validation.emailRequired' };
  }
  if (!EMAIL_PATTERN.test(value)) {
    return { key: 'auth.validation.emailInvalid' };
  }
  return undefined;
};
