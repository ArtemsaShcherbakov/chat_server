import type { TranslationKey } from '@/lib/i18n';

import { ApiRequestError } from '../../api/authApi';
import type { RegisterRequest } from '../../types';
import {
  validateEmail,
  validatePassword,
  validateUserName,
  type FieldError,
  type FormErrors,
} from '../../validation';

export type RegisterFormValues = RegisterRequest & {
  confirmPassword: string;
};

const validateConfirmPassword = (password: string, confirm: string): FieldError | undefined => {
  if (confirm === password) {
    return undefined;
  }
  return { key: 'auth.validation.passwordsMismatch' };
};

export const validateRegisterForm = (values: RegisterFormValues) => {
  const errors: FormErrors<RegisterFormValues> = {
    name: validateUserName(values.name),
    email: validateEmail(values.email),
    password: validatePassword(values.password),
    confirmPassword: validateConfirmPassword(values.password, values.confirmPassword),
  };
  return errors;
};

export const getRegisterErrorKey = (error: unknown): TranslationKey => {
  if (!(error instanceof ApiRequestError)) {
    return 'auth.errors.unknown';
  }
  switch (error.status) {
    case 0:
      return 'auth.errors.network';
    case 409:
      return 'auth.errors.taken';
    default:
      return 'auth.errors.unknown';
  }
};
