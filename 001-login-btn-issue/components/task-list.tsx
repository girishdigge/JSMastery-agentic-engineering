import {
  addTaskAction,
  removeTaskAction,
  toggleTaskAction,
} from "@/app/actions/task-actions";
import type { Task } from "@/lib/tasks";

export function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <div className="flex flex-col gap-6">
      <form action={addTaskAction} className="flex gap-2">
        <input
          name="title"
          placeholder="Add a task…"
          required
          className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-900"
        />
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
        >
          Add
        </button>
      </form>

      <ul className="flex flex-col divide-y divide-zinc-200 rounded-md border border-zinc-200">
        {tasks.length === 0 ? (
          <li className="px-4 py-6 text-center text-sm text-zinc-500">
            No tasks yet. Add one above.
          </li>
        ) : (
          tasks.map((task) => (
            <li key={task.id} className="flex items-center gap-3 px-4 py-3">
              <form action={toggleTaskAction} className="flex items-center">
                <input type="hidden" name="id" value={task.id} />
                <button
                  type="submit"
                  aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
                  className={`flex h-5 w-5 items-center justify-center rounded border ${
                    task.completed
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-300"
                  }`}
                >
                  {task.completed ? "✓" : ""}
                </button>
              </form>

              <span
                className={`flex-1 text-sm ${
                  task.completed ? "text-zinc-400 line-through" : "text-zinc-800"
                }`}
              >
                {task.title}
              </span>

              <form action={removeTaskAction}>
                <input type="hidden" name="id" value={task.id} />
                <button
                  type="submit"
                  aria-label="Remove task"
                  className="text-sm text-zinc-400 transition-colors hover:text-red-600"
                >
                  ✕
                </button>
              </form>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
