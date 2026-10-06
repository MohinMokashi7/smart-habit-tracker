import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'sht.token';
const API_URL_KEY = 'sht.apiUrl';

/** SecureStore keys may only contain [A-Za-z0-9._-]. */
const nameKey = (email: string) => `sht.name.${email.toLowerCase().replace(/[^A-Za-z0-9._-]/g, '_')}`;

async function safeGet(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function safeSet(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    // Storage failures should never crash the app; the session just won't persist.
  }
}

async function safeDelete(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    // ignore
  }
}

export const loadToken = () => safeGet(TOKEN_KEY);
export const saveToken = (token: string) => safeSet(TOKEN_KEY, token);
export const clearToken = () => safeDelete(TOKEN_KEY);

export const loadApiUrl = () => safeGet(API_URL_KEY);
export const saveApiUrl = (url: string) => safeSet(API_URL_KEY, url);
export const clearApiUrl = () => safeDelete(API_URL_KEY);

/**
 * The backend's login response and JWT do not contain the user's full name,
 * so we remember the name entered at registration on this device (keyed by email).
 */
export const loadFullName = (email: string) => safeGet(nameKey(email));
export const saveFullName = (email: string, fullName: string) => safeSet(nameKey(email), fullName);
