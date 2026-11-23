import "server-only";

export type Task = {
  id: string;
  title: string;
  completed: boolean;
};

// In-memory task store, keyed by user id. Resets when the server restarts —
// persistence is intentionally out of scope for this demo.
const tasksByUser = new Map<string, Task[]>();

let nextId = 1;

function listFor(userId: string): Task[] {
  let tasks = tasksByUser.get(userId);
  if (!tasks) {
    tasks = [
      { id: "t_seed_1", title: "Read the codebase end to end", completed: true },
      { id: "t_seed_2", title: "Find the login bug", completed: false },
    ];
    tasksByUser.set(userId, tasks);
  }
  return tasks;
}

export function getTasks(userId: string): Task[] {
  return listFor(userId);
}

export function addTask(userId: string, title: string): Task {
  const task: Task = { id: `t_${nextId++}`, title, completed: false };
  listFor(userId).push(task);
  return task;
}

export function toggleTask(userId: string, id: string): void {
  const task = listFor(userId).find((t) => t.id === id);
  if (task) {
    task.completed = !task.completed;
  }
}

export function removeTask(userId: string, id: string): void {
  const tasks = listFor(userId);
  const index = tasks.findIndex((t) => t.id === id);
  if (index !== -1) {
    tasks.splice(index, 1);
  }
}
