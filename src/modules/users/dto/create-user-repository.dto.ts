export interface CreateUserRepositoryDTO {
  id: string;
  avatar?: string | null;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phone?: string | null;
  roleId: number;
}
