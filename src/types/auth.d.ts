export interface JwtUserPayload {
  id: string;
  role: string;
  iat?: number;
  exp?: number;
}
