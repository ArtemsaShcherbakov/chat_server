import { authApi } from '../../api/authApi';
import { useAuthForm } from '../../hooks/useAuthForm';
import { useSession } from '../../hooks/useSession';
import { normalizeUserName } from '../../validation';
import {
  getRegisterErrorKey,
  validateRegisterForm,
  type RegisterFormValues,
} from './RegisterForm.utils';

const initialValues: RegisterFormValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export const useRegisterForm = () => {
  const { signIn } = useSession();

  return useAuthForm({
    initialValues,
    validate: validateRegisterForm,
    getErrorKey: getRegisterErrorKey,
    clearOnError: ['password', 'confirmPassword'],
    onSubmit: async ({ name, email, password }) => {
      const session = await authApi.register({
        name: normalizeUserName(name),
        email: email.trim(),
        password,
      });
      // The server signs the new user in right away, so this lands on the dashboard
      await signIn(session);
    },
  });
};
