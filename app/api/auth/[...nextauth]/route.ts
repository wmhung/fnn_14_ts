// v2
import { handlers } from '@/app/_lib/auth';
export const { GET, POST } = handlers;

// v3
export const publicRoutes = ['/'];

export const parklistPrefix = ['/parklist'];

export const authRoutes = ['/login', '/register'];

export const apiAuthPrefix = ['/api/auth'];

export const DEFAULT_LOGIN_REDIRECT = '/';
