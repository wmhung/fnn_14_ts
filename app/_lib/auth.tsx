import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import { supabaseAdmin } from './supabase-admin'; // [FIX 4] was: supabase
import { compare } from 'bcryptjs';
import { z } from 'zod';
import {
  CouldNotParseError,
  UserNotFoundError,
  InvalidPasswordError,
} from './errors';

// 1. DEFINE VALIDATION RULES
// Ensure input looks like an email and password is at least 8 chars long
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // 2. CONFIGURE EXTERNAL LOGINS (OAUTH)
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
    // 3. CONFIGURE MANUAL LOGIN (EMAIL/PASSWORD)
    Credentials({
      authorize: async (credentials) => {
        // Validate the format of incoming data
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) throw new CouldNotParseError();

        const { email, password } = parsed.data;

        // Search for the user in our Supabase database
        const { data: user, error } = await supabaseAdmin
          .from('user')
          .select('*')
          .eq('email', email)
          .single();

        if (error || !user || !user.password) throw new UserNotFoundError();

        // Compare the provided plain-text password with the stored hash
        const match = await compare(password, user.password);
        if (!match) throw new InvalidPasswordError();

        // Return a clean user object (excluding sensitive data like password)
        return {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          avatar: user.avatar || null,
          role: user.role || 'user',
        };
      },
    }),
  ],
  // 4. SETTINGS & REDIRECTS
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  // 5. MIDDLEWARE-LIKE CALLBACKS
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

        const { data: existingUser } = await supabaseAdmin
          .from('user')
          .select('id')
          .eq('email', email)
          .single();

        if (!existingUser) {
          await supabaseAdmin.from('user').insert([
            {
              email,
              full_name: name,
              avatar: image,
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
