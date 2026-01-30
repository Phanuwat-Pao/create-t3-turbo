export { auth, getSession } from "~/auth/server";

// Re-export auth-related types
export type { Session } from "@acme/auth";

// Device session type for multi-session support
export interface DeviceSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
}

// Organization role type
export type OrganizationRole = "owner" | "admin" | "member";
