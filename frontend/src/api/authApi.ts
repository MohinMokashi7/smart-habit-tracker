import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../types/api';
import { ApiError, toApiError } from '../utils/errors';
import { http } from './client';

/** POST /api/users/register  ->  201 RegisterResponse | 400 {errors} | 409 {message} */
export async function register(request: RegisterRequest): Promise<RegisterResponse> {
  try {
    const { data } = await http.post<RegisterResponse>('/api/users/register', request);
    return data;
  } catch (e) {
    throw toApiError(e);
  }
}

/**
 * POST /api/users/login  ->  200 { token, message }
 *
 * user-service currently throws a plain RuntimeException for wrong credentials,
 * which Spring turns into HTTP 500 (no handler). A 401 is accepted too so this
 * keeps working if that is later fixed on the backend.
 */
export async function login(request: LoginRequest): Promise<LoginResponse> {
  try {
    const { data } = await http.post<LoginResponse>('/api/users/login', request);
    return data;
  } catch (e) {
    const error = toApiError(e);
    if (error.status === 401 || error.status === 500) {
      throw new ApiError('credentials', 'Invalid email or password.', { status: error.status });
    }
    throw error;
  }
}
