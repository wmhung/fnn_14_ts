export type Role = 'user' | 'owner' | 'admin';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  created_at: string;
  image?: string | null;
}

export type UpdateUser = {
  id?: string; // optional
  full_name: string;
  email: string;
  num_of_kids?: number;
  gender?: string;
  avatar?: string;
  role: Role; // ✅ use Role ('user' | 'owner' | 'admin')
};
