import { redirect } from "next/navigation";

import { logout } from "@/app/actions/auth-actions";
import { TaskList } from "@/components/task-list";
import { getUserById } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { getTasks } from "@/lib/tasks";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const user = getUserById(session.userId);
  const tasks = getTasks(session.userId);

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900">Your tasks</h1>
            <p className="text-sm text-zinc-500">
              Signed in as {user?.email ?? "unknown"}
            </p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
            >
              Log out
            </button>
          </form>
        </header>

        <TaskList tasks={tasks} />
      </div>
    </div>
  );
}
