import NextAuth from 'next-auth';
import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      provider?: string | null;
      role?: string | null;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id?: string;
    role?: string | null;
    provider?: string | null;
  }
}

// ✅ move JWT extension into the right module
declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string | null;
    provider?: string | null;
  }
}
