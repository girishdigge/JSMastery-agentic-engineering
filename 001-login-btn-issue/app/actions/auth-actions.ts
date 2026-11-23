"use server";

import { redirect } from "next/navigation";

import { authHandlers } from "@/lib/auth";

export type LoginState = { error?: string };

/**
 * Login action, wired to the login form via useActionState.
 * Dispatches to the shared auth handler registry, then redirects on success.
 */
export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const handler = authHandlers["login"];
  const outcome = await handler?.(formData);

  if (outcome?.success) {
    redirect("/dashboard");
  }

  return { error: outcome?.error };
}

export async function logout(): Promise<void> {
  await authHandlers["logout"]?.(new FormData());
  redirect("/login");
}
