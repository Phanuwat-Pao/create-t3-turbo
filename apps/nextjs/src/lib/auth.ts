export { auth, getSession } from "~/auth/server";

// Re-export auth-related types
export type { Session } from "@acme/auth";

// Device session type for multi-session support
export interface DeviceSession {
  session: {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

// Organization role type
export type OrganizationRole = "owner" | "admin" | "member";
