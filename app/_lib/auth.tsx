//
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

// 1. DEFINE VALIDATION RULES
// Ensure input looks like an email and password is at least 8 chars long
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // 2. CONFIGURE EXTERNAL LOGINS (OAUTH)
    // Pass API keys and request specific permissions from GitHub/Google
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
        // STEP A: Validate the format of incoming data
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) throw new CouldNotParseError();

        const { email, password } = parsed.data;

        // STEP B: Search for the user in our Supabase database
        const { data: user, error } = await supabase
          .from('user')
          .select('*')
          .eq('email', email)
          .single();

        if (error || !user || !user.password) throw new UserNotFoundError();
        // STEP C: Compare the provided plain-text password with the stored hash
        const match = await compare(password, user.password);
        if (!match) throw new InvalidPasswordError();
        // STEP D: Return a clean user object (excluding sensitive data like password)
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
  // 4. SETTINGS & REDIRECTS
  pages: {
    signIn: '/login', // Point to our custom login page
  },
  session: {
    strategy: 'jwt', // Use JSON Web Tokens for stateless sessions
  },
  // 5. MIDDLEWARE-LIKE CALLBACKS
  callbacks: {
    // RUNS EVERY TIME A SESSION IS CHECKED:
    // Syncs info from the Token (JWT) into the Session object accessible by the UI
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
        session.user.role = token.role || 'user';
        session.user.provider = token.provider || null;
      }
      return session;
    },
    // RUNS WHEN THE JWT IS CREATED/UPDATED:
    // Persists the user's role and login method inside the encrypted token
    async jwt({ token, user, account }) {
      if (user && account) {
        token.provider = account.provider;
        token.role = user.role || 'user';
      }
      return token;
    },
    // RUNS DURING THE SIGN-IN PROCESS:
    // If using Google/GitHub, check if they exist in our DB. If not, create them.
    async signIn({ user, account }) {
      if (account?.provider === 'google' || account?.provider === 'github') {
        const { email, name, image } = user;
        // Search for existing record
        const { data: existingUser } = await supabase
          .from('user')
          .select('id')
          .eq('email', email)
          .single();

        // If it's a first-time login, "Seed" our database with their profile info
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
