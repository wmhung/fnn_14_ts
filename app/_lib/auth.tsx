// app/_lib/auth.js
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import { supabase } from './supabase';
import { compare } from 'bcryptjs';
import { z } from 'zod';
import {
  CouldNotParseError,
  UserNotFoundError,
  InvalidPasswordError,
} from './errors';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    Credentials({
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) throw new CouldNotParseError();

        const { email, password } = parsed.data;

        const { data: user, error } = await supabase
          .from('user')
          .select('*')
          .eq('email', email)
          .single();

        if (error || !user || !user.password) throw new UserNotFoundError();

        const match = await compare(password, user.password);
        if (!match) throw new InvalidPasswordError();

        return {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          avatar: user.avatar || null,
          role: user.role || 'user',
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
        session.user.role = token.role || 'user';
        session.user.provider = token.provider || null;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user && account) {
        token.provider = account.provider;
        token.role = user.role || 'user';
      }
      return token;
    },
    async signIn({ user, account }) {
      if (account?.provider === 'google' || account?.provider === 'github') {
        const { email, name, image } = user;
        const { data: existingUser } = await supabase
          .from('user')
          .select('id')
          .eq('email', email)
          .single();

        if (!existingUser) {
          await supabase.from('user').insert([
            {
              email,
              fullName: name,
              image,
              role: 'user',
            },
          ]);
        }
        return true;
      }
      return true;
    },
  },
});
