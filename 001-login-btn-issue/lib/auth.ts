import "server-only";

import { createSession, deleteSession } from "@/lib/session";

// --- User store (in-memory, demo only) -------------------------------------

export type User = {
  id: string;
  email: string;
  password: string;
};

const USERS: User[] = [
  { id: "u_1", email: "demo@example.com", password: "password123" },
];

/**
 * Core authentication check. Correct in isolation: given valid credentials it
 * returns the matching user, otherwise null. Nothing else in the app should
 * compare passwords directly.
 */
export function verifyCredentials(email: string, password: string): User | null {
  const user = USERS.find((u) => u.email === email);
  if (!user || user.password !== password) {
    return null;
  }
  return user;
}

export function getUserById(id: string): User | null {
  return USERS.find((u) => u.id === id) ?? null;
}

// --- Auth handler registry -------------------------------------------------

export type AuthOutcome = { success: boolean; error?: string };

export type AuthHandler = (formData: FormData) => Promise<AuthOutcome>;

/**
 * Registry of auth handlers, dispatched by key from the auth actions layer.
 * Add new auth flows (magic link, sso, ...) as additional entries here.
 */
export const authHandlers: Record<string, AuthHandler> = {
  authenticate: async (formData) => {
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const user = verifyCredentials(email, password);
    if (!user) {
      return { success: false, error: "Invalid email or password." };
    }

    await createSession(user.id);
    return { success: true };
  },

  logout: async () => {
    await deleteSession();
    return { success: true };
  },
};
