export type Role = 'user' | 'owner' | 'admin';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  created_at: string;
  image?: string | null;
}

export type UpdateUser = {
  fullName: string;
  email: string;
  numOfKids?: number;
  gender?: string;
  avatar?: string;
  role: 'user' | 'owner';
};
