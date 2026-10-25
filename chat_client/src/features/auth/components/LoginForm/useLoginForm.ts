import { authApi } from '../../api/authApi';
import { useAuthForm } from '../../hooks/useAuthForm';
import { useSession } from '../../hooks/useSession';
import { normalizeUserName } from '../../validation';
import { getLoginErrorKey, validateLoginForm, type LoginFormValues } from './LoginForm.utils';

const initialValues: LoginFormValues = { name: '', password: '' };

export const useLoginForm = () => {
  const { signIn } = useSession();

  return useAuthForm({
    initialValues,
    validate: validateLoginForm,
    getErrorKey: getLoginErrorKey,
    clearOnError: ['password'],
    onSubmit: async ({ name, password }) => {
      const session = await authApi.login({ name: normalizeUserName(name), password });
      // Flips the Stack.Protected guards in the root layout, which moves the user to the dashboard
      await signIn(session);
    },
  });
};
