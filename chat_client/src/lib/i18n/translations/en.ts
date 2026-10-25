export const en = {
  auth: {
    fields: {
      userName: 'User name',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Repeat password',
      show: 'Show',
      hide: 'Hide',
      showPassword: 'Show password',
      hidePassword: 'Hide password',
    },
    login: {
      title: 'Sign in',
      subtitle: 'Enter your user name and password',
      submit: 'Sign in',
      noAccount: 'No account yet?',
      toRegister: 'Sign up',
    },
    register: {
      title: 'Create account',
      subtitle: 'Choose a user name and password',
      submit: 'Sign up',
      haveAccount: 'Already have an account?',
      toLogin: 'Sign in',
    },
    validation: {
      nameRequired: 'Enter your user name',
      nameLength: 'User name must be {min}–{max} characters',
      nameChars: 'Use only letters, digits, ".", "_" and "-"',
      emailRequired: 'Enter your email',
      emailInvalid: 'Enter a valid email address',
      passwordRequired: 'Enter your password',
      passwordLength: 'Password must be {min}–{max} characters',
      passwordComplexity: 'Password must contain a letter and a digit',
      passwordsMismatch: 'Passwords do not match',
    },
    errors: {
      invalidCredentials: 'Invalid user name or password',
      locked: 'Too many failed login attempts. Try again in 15 minutes',
      taken: 'This user name or email is already taken',
      network: 'No connection to the server. Check your network and try again.',
      unknown: 'Something went wrong. Please try again.',
    },
  },
  dashboard: {
    greeting: 'Hi, {name}',
    signedIn: 'You are signed in.',
    signOut: 'Sign out',
  },
  language: {
    label: 'Language',
  },
};

export type Translations = typeof en;
