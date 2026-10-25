import { use } from 'react';

import { SessionContext } from '../components/SessionProvider';

export const useSession = () => {
  const value = use(SessionContext);

  if (!value) {
    throw new Error('useSession must be used inside <SessionProvider>');
  }

  return value;
};
