import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "kitchen" | "ngo" | "recycler" | "admin";
      organizationId: string | null;
      organizationName: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: "kitchen" | "ngo" | "recycler" | "admin";
    organizationId?: string | null;
    organizationName?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "kitchen" | "ngo" | "recycler" | "admin";
    organizationId?: string | null;
    organizationName?: string | null;
  }
}
