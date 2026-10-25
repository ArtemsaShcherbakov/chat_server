import { env } from '@/config/env';
import { stringifyJson } from '@/lib/json';

import type { ApiResponse, AuthSession, LoginRequest, RegisterRequest } from '../types';

export class ApiRequestError extends Error {
  constructor(
    message: string,
    // 0 when the server could not be reached
    readonly status: number,
  ) {
    super(message);
  }
}

const post = async <T>(path: string, body: unknown): Promise<T> => {
  const payload = stringifyJson(body);

  if (payload === null) {
    throw new Error(`Request body for ${path} is not serializable`);
  }

  let response: Response;
  try {
    response = await fetch(`${env.apiUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    });
  } catch {
    throw new ApiRequestError('Unable to reach the server', 0);
  }

  const json = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !json || json.error) {
    throw new ApiRequestError(
      json?.error?.message ?? 'Unexpected server response',
      response.status,
    );
  }

  return json.data as T;
};

export const authApi = {
  login: (request: LoginRequest) => post<AuthSession>('/auth/login', request),
  register: (request: RegisterRequest) => post<AuthSession>('/auth/register', request),
  logout: (refreshToken: string) => post<null>('/auth/logout', { refreshToken }),
};
