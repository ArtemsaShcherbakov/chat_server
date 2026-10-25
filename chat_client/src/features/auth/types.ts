export type PublicUser = {
  id: number;
  name: string;
  email: string;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
};

export type LoginRequest = {
  name: string;
  password: string;
};

export type RegisterRequest = LoginRequest & {
  email: string;
};

// Every backend route responds with this envelope
export type ApiResponse<T> = {
  data: T | null;
  error: { statusCode: number; message: string; details?: string[] } | null;
};

export type SessionStatus = 'loading' | 'signedIn' | 'signedOut';
