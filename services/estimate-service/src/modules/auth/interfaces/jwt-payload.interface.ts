export interface JwtPayload {
  sub: string; // user ID
  email: string;
  roles: string[];
  permissions: string[];
  iat?: number;
  exp?: number;
}
