import "server-only";

import { cookies } from "next/headers";

const SESSION_COOKIE = "session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type Session = {
  userId: string;
};

function encode(session: Session): string {
  return Buffer.from(JSON.stringify(session)).toString("base64");
}

function decode(value: string | undefined): Session | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64").toString("utf8"));
    if (parsed && typeof parsed.userId === "string") {
      return { userId: parsed.userId };
    }
    return null;
  } catch {
    return null;
  }
}

/** Create a session cookie for the given user. */
export async function createSession(userId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, encode({ userId }), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

/** Read the current session from the cookie, or null if not signed in. */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  return decode(cookieStore.get(SESSION_COOKIE)?.value);
}

/** Clear the session cookie (logout). */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
