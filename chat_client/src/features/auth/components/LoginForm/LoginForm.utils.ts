import type { TranslationKey } from '@/lib/i18n';

import { ApiRequestError } from '../../api/authApi';
import type { LoginRequest } from '../../types';
import { validatePassword, validateUserName, type FormErrors } from '../../validation';

export type LoginFormValues = LoginRequest;

export const validateLoginForm = ({ name, password }: LoginFormValues) => {
  const errors: FormErrors<LoginFormValues> = {
    name: validateUserName(name),
    password: validatePassword(password),
  };
  return errors;
};

export const getLoginErrorKey = (error: unknown): TranslationKey => {
  if (!(error instanceof ApiRequestError)) {
    return 'auth.errors.unknown';
  }
  switch (error.status) {
    case 0:
      return 'auth.errors.network';
    case 401:
      return 'auth.errors.invalidCredentials';
    case 423:
      return 'auth.errors.locked';
    default:
      return 'auth.errors.unknown';
  }
};
