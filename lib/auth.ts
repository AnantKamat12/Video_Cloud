// Import necessary types and modules from NextAuth and other libraries.
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs"; // Used for comparing hashed passwords.
import { connectToDatabase } from "./db"; // Your database connection utility.
import UserModel from "../models/User"; // Your Mongoose User model.

// This is the main configuration object for NextAuth.js.
export const authOptions: NextAuthOptions = {
  // `providers` is an array of all the authentication methods you want to support (e.g., Google, GitHub, email/password).
  providers: [
    // We are only using the "Credentials" provider, which handles traditional email and password login.
    CredentialsProvider({
      name: "Credentials",
      // `credentials` defines the fields that will be expected on the login form.
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      // The `authorize` function is the core of the login logic. It's called when a user tries to sign in.
      async authorize(credentials) {
        // First, we ensure that both email and password were submitted.
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        try {
          // Establish a connection to the MongoDB database.
          await connectToDatabase();
          // Find a user in the database whose email matches the one provided.
          const user = await UserModel.findOne({ email: credentials.email });

          // If no user is found with that email, the login fails.
          if (!user) {
            throw new Error("No user found with this email");
          }

          // Compare the password submitted by the user with the hashed password stored in the database.
          // `bcrypt.compare` securely handles this comparison.
          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          // If the passwords do not match, the login fails.
          if (!isValid) {
            throw new Error("Invalid password");
          }

          // If everything is valid, return a user object. This object is what gets passed to the JWT callback.
          // It's important to only return non-sensitive information.
          return {
            id: user._id.toString(),
            email: user.email,
          };
        } catch (error) {
          // If any part of the process fails, log the error and rethrow it for NextAuth to handle.
          console.error("Auth error:", error);
          throw error;
        }
      },
    }),
  ],
  // `callbacks` are functions that are called at different points in the authentication flow.
  // They allow you to control and customize the contents of the JWT and the session object.
  callbacks: {
    // The `jwt` callback is executed whenever a JSON Web Token is created or updated.
    async jwt({ token, user }) {
      // The `user` object is only available on the initial sign-in.
      // We take the user's ID from the `user` object and add it to the `token`.
      if (user) {
        token.id = user.id;
      }
      // The token is returned and will be available in subsequent `jwt` and `session` callbacks.
      return token;
    },
    // The `session` callback is executed whenever a session is checked (e.g., when you use `useSession`).
    async session({ session, token }) {
      // We take the user ID that we stored in the token and add it to the session.user object.
      // This makes the user's ID available on the frontend.
      if (session.user) {
        session.user.id = token.id as string;
      }
      // The modified session object is returned.
      return session;
    },
  },
  // `pages` allows you to specify custom URLs for NextAuth's default pages.
  pages: {
    signIn: "/login", // Redirects users to your custom /login page.
    error: "/login",  // Redirects users to /login on authentication errors.
  },
  // `session` configures how the user's session is managed.
  session: {
    strategy: "jwt", // We are using JSON Web Tokens (JWTs) for session management.
    maxAge: 30 * 24 * 60 * 60, // The session will be valid for 30 days.
  },
  // `secret` is a string used to encrypt the JWT. It's read from your environment variables.
  secret: process.env.NEXTAUTH_SECRET,
};