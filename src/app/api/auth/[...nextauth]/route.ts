// /app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from 'axios';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export const authOptions: NextAuthOptions = {
  // 🔑 Tell NextAuth to use YOUR secret for signing & encrypting
  secret: process.env.NEXTAUTH_SECRET,

  // Use JWT sessions (instead of default database sessions)
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Explicitly pass the same secret into the JWT config
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    // encryption: true, // enable this if you want encrypted JWTs
  },

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email:    { label: 'Email',    type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const res = await axios.post(`${apiBaseUrl}/users/login`, {
          email:    credentials?.email,
          password: credentials?.password,
        });

        if (res.data?.token) {
          return {
            id:    String(res.data.user?.id ?? 'unknown'),
            email: credentials?.email  ?? '',
            name:  res.data.user?.username ?? '',
            // store the API token on the user object so we can
            // copy it into the JWT in the `jwt` callback below
            apiToken: res.data.token,
          };
        }
        return null;
      }
    }),
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID  || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],

  callbacks: {
    // runs whenever a JWT is created (on sign-in) or updated
    async jwt({ token, user }) {
      if (user) {
        token.id       = user.id;
        token.email    = user.email;
        token.apiToken = (user as any).apiToken;
      }
      return token;
    },

    // runs whenever `useSession()` or `getSession()` is called in the client
    async session({ session, token }) {
      session.user.id       = token.id as string;
      (session as any).apiToken = token.apiToken as string;
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error:  '/login',
  },

  debug: true, // keep this on while you troubleshoot
};

// NextAuth handler for both GET and POST
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
