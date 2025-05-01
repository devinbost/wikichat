// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";

// Extend the User type to include a role field
declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string; // Add the role field
    } & DefaultSession["user"]; // Include default fields
  }

  interface User extends DefaultUser {
    role?: string; // Add the role field to User as well
  }
}