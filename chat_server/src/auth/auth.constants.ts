export const MAX_FAILED_LOGIN_ATTEMPTS = 5;
export const LOCK_DURATION_MS = 15 * 60 * 1000;
export const BCRYPT_ROUNDS = 12;

// Keep in sync with chat_client/src/features/auth/validation.ts
export const USER_NAME_MIN_LENGTH = 2;
export const USER_NAME_MAX_LENGTH = 32;
export const USER_NAME_PATTERN = /^[a-z0-9._-]+$/;

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 12;
export const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).+$/;

export const INVALID_CREDENTIALS_MESSAGE = 'Invalid user name or password';
export const ACCOUNT_LOCKED_MESSAGE =
  'Too many failed login attempts. Try again in 15 minutes';
export const INVALID_REFRESH_TOKEN_MESSAGE = 'Invalid or expired session';
