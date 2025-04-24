import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { axiosBackendInstance } from "@/lib/api/apiClient";
import axios from "axios";

// Define the Google profile type to avoid TypeScript errors
type GoogleProfile = {
  email: string;
  email_verified?: boolean;
  name?: string;
  image?: string;
  picture?: string;
  sub?: string;
  [key: string]: any; // For any other properties that might be present
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await axiosBackendInstance.post("/users/login", {
            email: credentials.email,
            password: credentials.password,
          });

          const data = response.data;
          
          if (data.status === 200 && data.token) {
            return {
              id: data.user.id.toString(),
              email: data.user.email,
              name: data.user.username,
              role: data.user.role,
              token: data.token,
            };
          }
          
          return null;
        } catch (error) {
          console.error("NextAuth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Only process Google accounts
      if (account?.provider === 'google' && profile) {
        try {
          // Cast profile to our defined type for better type safety
          const googleProfile = profile as GoogleProfile;
          console.log("Google sign-in, profile:", JSON.stringify(googleProfile));
          
          // Make sure we have an email
          if (!googleProfile.email) {
            console.error("No email provided in Google profile");
            return false;
          }
          
          // Check if profile is verified (recommended security practice)
          const emailVerified = googleProfile.email_verified || false;
          if (!emailVerified) {
            console.warn("Google email not verified:", googleProfile.email);
            // You may choose to still allow unverified emails - continue here
          }
          
          try {
            // Register or login with the backend - handles account linking by email
            // Use direct axios call to avoid auth token requirements on this endpoint
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
            console.log("Attempting to authenticate with backend:", `${backendUrl}/users/oauth/google`);
            
            const response = await axios.post(`${backendUrl}/users/oauth/google`, {
              email: googleProfile.email,
              name: googleProfile.name || "",
              picture: googleProfile.picture || googleProfile.image || "",
              sub: googleProfile.sub || "",
            });
            
            const data = response.data;
            console.log("Backend response:", data);
            
            if ((data.status === 200 || data.status === 201) && data.token) {
              // Save backend token to user object for the jwt callback
              user.id = data.user.id.toString();
              user.role = data.user.role;
              user.token = data.token;
              return true;
            }
            
            console.error("Backend auth failed:", data);
            return false;
          } catch (error: any) {
            // Check if this is a credentials conflict error
            console.error("Google OAuth backend error details:", 
              error.response?.status,
              error.response?.data,
              error.message
            );
                
            if (error.response?.status === 409 || 
                (error.response?.data?.message && 
                 error.response?.data?.message.includes("email exists"))) {
              console.log("Account exists with different provider. Attempting to link...");
              
              // You can redirect to a special page here or handle linking differently
              // For now, we'll return false but with a specific error URL
              return `/login?error=AccountExists&email=${encodeURIComponent(googleProfile.email)}`;
            }
            
            console.error("Google OAuth backend error:", error);
            return false; // Don't allow sign in if backend fails
          }
        } catch (error) {
          console.error("Google OAuth processing error:", error);
          return false;
        }
      }
      
      return true;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role || "user"; // Default role for OAuth users
        
        // For credential auth, use the token from the backend
        if (user.token) {
          token.accessToken = user.token;
        }
        // For OAuth providers, use the access token from the account
        else if (account?.provider === "google" && account?.access_token) {
          token.accessToken = account.access_token;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",  // Redirect to login page on error
  },
  // Handle account linking in the signIn callback instead
  debug: process.env.NODE_ENV === "development", // Only enable debug in development
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 