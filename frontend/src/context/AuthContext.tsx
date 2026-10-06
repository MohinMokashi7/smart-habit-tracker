import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import * as authApi from '../api/authApi';
import { setAuthToken, setUnauthorizedHandler } from '../api/client';
import { normalizeBaseUrl, setBaseUrl } from '../api/config';
import {
  clearToken,
  loadApiUrl,
  loadFullName,
  loadToken,
  saveFullName,
  saveToken,
} from '../storage/secureStorage';
import { ApiError } from '../utils/errors';
import { displayNameFromEmail } from '../utils/format';
import { isTokenExpired, parseJwt } from '../utils/jwt';

type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

interface Session {
  status: AuthStatus;
  email: string | null;
  userId: number | null;
  fullName: string | null;
}

interface AuthContextValue {
  status: AuthStatus;
  email: string | null;
  userId: number | null;
  /** Full name when known on this device, otherwise a name derived from the email. */
  displayName: string;
  /** Shown once on the login screen, e.g. "Your session has expired". */
  sessionNotice: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (fullName: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearNotice: () => void;
}

const SIGNED_OUT: Session = { status: 'signedOut', email: null, userId: null, fullName: null };

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>({ ...SIGNED_OUT, status: 'loading' });
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);
  const statusRef = useRef<AuthStatus>('loading');
  statusRef.current = session.status;

  const startSession = useCallback(async (token: string, knownName?: string | null) => {
    const payload = parseJwt(token);
    if (!payload?.sub) {
      throw new ApiError('unknown', 'The server returned an invalid session. Please try again.');
    }
    await saveToken(token);
    setAuthToken(token);
    const fullName = knownName ?? (await loadFullName(payload.sub));
    setSession({ status: 'signedIn', email: payload.sub, userId: payload.userId ?? null, fullName });
  }, []);

  const endSession = useCallback(async (notice?: string) => {
    await clearToken();
    setAuthToken(null);
    setSession(SIGNED_OUT);
    setSessionNotice(notice ?? null);
  }, []);

  // Restore the session on launch.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const savedUrl = await loadApiUrl();
      if (savedUrl) setBaseUrl(normalizeBaseUrl(savedUrl));

      const token = await loadToken();
      if (cancelled) return;
      if (token && !isTokenExpired(token)) {
        try {
          await startSession(token);
          return;
        } catch {
          // fall through to signed-out
        }
      }
      if (token) {
        await endSession('Your session has expired. Please sign in again.');
      } else {
        setSession(SIGNED_OUT);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [startSession, endSession]);

  // Any 401/403 (or locally detected expiry) sends the user back to login.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (statusRef.current === 'signedIn') {
        void endSession('Your session has expired. Please sign in again.');
      }
    });
    return () => setUnauthorizedHandler(null);
  }, [endSession]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setSessionNotice(null);
      const { token } = await authApi.login({ email: email.trim(), password });
      await startSession(token);
    },
    [startSession],
  );

  const signUp = useCallback(
    async (fullName: string, email: string, password: string) => {
      setSessionNotice(null);
      const cleanEmail = email.trim();
      const cleanName = fullName.trim();
      await authApi.register({ fullName: cleanName, email: cleanEmail, password });
      await saveFullName(cleanEmail, cleanName);
      try {
        const { token } = await authApi.login({ email: cleanEmail, password });
        await startSession(token, cleanName);
      } catch {
        throw new ApiError('unknown', 'Your account was created. Please sign in to continue.');
      }
    },
    [startSession],
  );

  const signOut = useCallback(() => endSession(), [endSession]);
  const clearNotice = useCallback(() => setSessionNotice(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status: session.status,
      email: session.email,
      userId: session.userId,
      displayName: session.fullName ?? (session.email ? displayNameFromEmail(session.email) : 'there'),
      sessionNotice,
      signIn,
      signUp,
      signOut,
      clearNotice,
    }),
    [session, sessionNotice, signIn, signUp, signOut, clearNotice],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
