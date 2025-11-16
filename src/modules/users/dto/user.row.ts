export interface UserRow {
  id: string;
  avatar: string | null;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
  roles: string;
  reset_token: string | null;
  reset_token_expiration: string | null;
}
