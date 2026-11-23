"use server";

import { revalidatePath } from "next/cache";

import { getSession } from "@/lib/session";
import { addTask, removeTask, toggleTask } from "@/lib/tasks";

async function requireUserId(): Promise<string> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session.userId;
}

export async function addTaskAction(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const title = String(formData.get("title") ?? "").trim();
  if (title) {
    addTask(userId, title);
  }
  revalidatePath("/dashboard");
}

export async function toggleTaskAction(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const id = String(formData.get("id") ?? "");
  toggleTask(userId, id);
  revalidatePath("/dashboard");
}

export async function removeTaskAction(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const id = String(formData.get("id") ?? "");
  removeTask(userId, id);
  revalidatePath("/dashboard");
}
