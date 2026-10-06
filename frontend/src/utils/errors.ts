import { isAxiosError } from 'axios';

export type ApiErrorKind =
  | 'network'
  | 'timeout'
  | 'unauthorized'
  | 'credentials'
  | 'validation'
  | 'conflict'
  | 'notFound'
  | 'server'
  | 'unknown';

export class ApiError extends Error {
  kind: ApiErrorKind;
  status?: number;
  fieldErrors?: Record<string, string>;

  constructor(
    kind: ApiErrorKind,
    message: string,
    options: { status?: number; fieldErrors?: Record<string, string> } = {},
  ) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = options.status;
    this.fieldErrors = options.fieldErrors;
  }
}

interface ErrorBody {
  message?: unknown;
  errors?: unknown;
}

function asFieldErrors(value: unknown): Record<string, string> | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const out: Record<string, string> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (typeof val === 'string') out[key] = val;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/**
 * Converts anything thrown by axios into a friendly ApiError.
 * Raw Spring/Java messages are never surfaced for 5xx responses.
 */
export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;

  if (isAxiosError(err)) {
    if (!err.response) {
      if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
        return new ApiError('timeout', 'The server is taking too long to respond. Please try again.');
      }
      return new ApiError(
        'network',
        "Can't reach the server. Check your internet connection and the server address.",
      );
    }

    const status = err.response.status;
    const body = (err.response.data ?? {}) as ErrorBody;
    const serverMessage = typeof body.message === 'string' ? body.message : undefined;

    if (status === 400) {
      const fieldErrors = asFieldErrors(body.errors);
      const firstField = fieldErrors ? Object.values(fieldErrors)[0] : undefined;
      return new ApiError('validation', firstField ?? 'Please check the details you entered.', {
        status,
        fieldErrors,
      });
    }
    // user-service answers 401; habit-service (no entry point configured) answers 403
    if (status === 401 || status === 403) {
      return new ApiError('unauthorized', 'Your session has expired. Please sign in again.', { status });
    }
    if (status === 404) {
      return new ApiError('notFound', 'We could not find what you were looking for.', { status });
    }
    if (status === 409) {
      return new ApiError('conflict', serverMessage ?? 'This already exists.', { status });
    }
    if (status >= 500) {
      return new ApiError('server', 'Something went wrong on the server. Please try again in a moment.', {
        status,
      });
    }
    return new ApiError('unknown', 'Something went wrong. Please try again.', { status });
  }

  return new ApiError('unknown', err instanceof Error ? err.message : 'Something went wrong.');
}

export function getErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const apiError = toApiError(err);
  return apiError.message || fallback;
}
