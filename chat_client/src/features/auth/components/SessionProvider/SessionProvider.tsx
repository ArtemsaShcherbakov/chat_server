import { createContext, useEffect, useState, type PropsWithChildren } from 'react';

import { parseJson, stringifyJson } from '@/lib/json';
import { secureStorage } from '@/lib/storage';

import { authApi } from '../../api/authApi';
import type { AuthSession, SessionStatus } from '../../types';

const SESSION_KEY = 'auth.session';

type SessionContextValue = {
  status: SessionStatus;
  session: AuthSession | null;
  signIn: (session: AuthSession) => Promise<void>;
  signOut: () => Promise<void>;
};

export const SessionContext = createContext<SessionContextValue | null>(null);

export const SessionProvider = ({ children }: PropsWithChildren) => {
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    secureStorage
      .getItem(SESSION_KEY)
      .then((raw) => {
        const stored = parseJson<AuthSession>(raw);

        // Drop an entry that exists but cannot be parsed, so it does not linger
        if (raw !== null && stored === null) {
          void secureStorage.removeItem(SESSION_KEY);
        }

        setSession(stored);
        setStatus(stored ? 'signedIn' : 'signedOut');
      })
      .catch(() => setStatus('signedOut'));
  }, []);

  const signIn = async (next: AuthSession) => {
    const serialized = stringifyJson(next);

    // If the session cannot be persisted, the user stays signed in until the app restarts
    if (serialized !== null) {
      await secureStorage.setItem(SESSION_KEY, serialized);
    }

    setSession(next);
    setStatus('signedIn');
  };

  const signOut = async () => {
    const refreshToken = session?.refreshToken;

    setSession(null);
    setStatus('signedOut');

    await secureStorage.removeItem(SESSION_KEY);

    // Server-side revocation is best effort; the local session is already gone
    if (refreshToken) {
      await authApi.logout(refreshToken).catch(() => undefined);
    }
  };

  return <SessionContext value={{ status, session, signIn, signOut }}>{children}</SessionContext>;
};
