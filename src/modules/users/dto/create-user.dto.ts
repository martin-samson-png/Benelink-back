export interface CreateUserDTO {
  avatar?: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}
