import axios from 'axios';

import { ApiError, toApiError } from '../utils/errors';
import { isTokenExpired } from '../utils/jwt';
import { getBaseUrl } from './config';

/** Endpoints that must NOT carry a JWT (they are public in user-service). */
const PUBLIC_PATHS = ['/api/users/login', '/api/users/register'];

const isPublic = (url?: string) => !!url && PUBLIC_PATHS.some((p) => url.startsWith(p));

let authToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

export const setAuthToken = (token: string | null): void => {
  authToken = token;
};

/** Called when the backend (or the token's own `exp`) says the session is no longer valid. */
export const setUnauthorizedHandler = (handler: (() => void) | null): void => {
  unauthorizedHandler = handler;
};

export const http = axios.create({
  timeout: 15000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

http.interceptors.request.use((config) => {
  config.baseURL = getBaseUrl();

  if (!isPublic(config.url)) {
    // habit-service answers expired/invalid tokens with 403, and /api/analytics/**
    // would answer 500 — so we never send a request with a token we know is dead.
    if (!authToken || isTokenExpired(authToken, 0)) {
      unauthorizedHandler?.();
      return Promise.reject(new ApiError('unauthorized', 'Your session has expired. Please sign in again.'));
    }
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = toApiError(error);
    const url = axios.isAxiosError(error) ? error.config?.url : undefined;
    if (apiError.kind === 'unauthorized' && !isPublic(url)) {
      unauthorizedHandler?.();
    }
    return Promise.reject(apiError);
  },
);
