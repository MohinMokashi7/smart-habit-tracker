import { Platform } from 'react-native';

/**
 * The single entry point to the backend is the API Gateway (port 8080).
 * Override with EXPO_PUBLIC_API_URL (see .env.example) or at runtime from the
 * "Server" link on the login screen.
 *
 *  - Android emulator  -> http://10.0.2.2:8080  (alias for your computer's localhost)
 *  - iOS simulator     -> http://localhost:8080
 *  - Physical device   -> http://<your-computer-LAN-IP>:8080
 */
export const DEFAULT_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_URL ?? (Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080');

let baseUrl = DEFAULT_BASE_URL;

export const getBaseUrl = (): string => baseUrl;

export const setBaseUrl = (url: string): void => {
  baseUrl = url;
};

export function normalizeBaseUrl(input: string): string {
  let url = input.trim();
  if (!url) return DEFAULT_BASE_URL;
  if (!/^https?:\/\//i.test(url)) url = `http://${url}`;
  return url.replace(/\/+$/, '');
}
