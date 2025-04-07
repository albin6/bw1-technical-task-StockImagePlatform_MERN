export interface JwtPayload {
  id: string;
  role?: "user" | "admin";
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
}
