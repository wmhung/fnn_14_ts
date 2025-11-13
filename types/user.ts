export type Role = 'user' | 'owner' | 'admin';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  created_at: string;
  image?: string | null;
}
