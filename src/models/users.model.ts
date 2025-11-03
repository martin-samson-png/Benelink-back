export interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: "user" | "volunteer" | "association_member" | "admin";
  reset_token: string;
  reset_token_expiration: string;
}
