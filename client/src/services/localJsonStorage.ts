import type { Task } from "../models/Task.js";
import type { User } from "../models/User.js";
import { ApiError } from "./ApiError.js";

interface StoredUser {
  id: string;
  email: string;
  password: string;
  displayName: string;
  createdAt: string;
}

const USERS_KEY = "stp_users_json";
const TASKS_KEY = "stp_tasks_json";

function loadUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredUser[];
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Task[];
  } catch {
    return [];
  }
}

function saveTasks(tasks: Task[]): void {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

function toPublicUser(user: StoredUser): User {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
  };
}

function newId(): string {
  return crypto.randomUUID();
}

export async function localJsonRequest<T>(
  method: string,
  path: string,
  body: unknown,
  userId: string | null
): Promise<T> {
  await Promise.resolve();

  if (method === "POST" && path === "/auth/register") {
    const { email, password, displayName } = body as {
      email?: string;
      password?: string;
      displayName?: string;
    };
    if (!email?.trim() || !password) {
      throw new ApiError("Вкажіть email і пароль", 400);
    }
    const users = loadUsers();
    const normalizedEmail = email.trim().toLowerCase();
    if (users.some((u) => u.email === normalizedEmail)) {
      throw new ApiError("Користувач з таким email вже існує", 409);
    }
    const newUser: StoredUser = {
      id: newId(),
      email: normalizedEmail,
      password,
      displayName: displayName?.trim() || normalizedEmail.split("@")[0],
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveUsers(users);
    return { user: toPublicUser(newUser) } as T;
  }

  if (method === "POST" && path === "/auth/login") {
    const { email, password } = body as { email?: string; password?: string };
    if (!email?.trim() || !password) {
      throw new ApiError("Вкажіть email і пароль", 400);
    }
    const normalizedEmail = email.trim().toLowerCase();
    const user = loadUsers().find(
      (u) => u.email === normalizedEmail && u.password === password
    );
    if (!user) {
      throw new ApiError("Невірний email або пароль", 401);
    }
    return { user: toPublicUser(user) } as T;
  }

  if (method === "GET" && path === "/auth/users") {
    return loadUsers().map((u) => toPublicUser(u)) as T;
  }

  if (!userId) {
    throw new ApiError("Потрібна авторизація", 401);
  }

  if (method === "GET" && path === "/tasks") {
    return loadTasks().filter((t) => t.userId === userId) as T;
  }

  if (method === "POST" && path === "/tasks") {
    const draft = body as {
      title?: string;
      priority?: Task["priority"];
      deadline?: string;
      category?: Task["category"];
    };
    if (!draft.title?.trim()) {
      throw new ApiError("Назва завдання обов'язкова", 400);
    }
    const now = new Date().toISOString();
    const task: Task = {
      id: newId(),
      userId,
      title: draft.title.trim(),
      priority: draft.priority ?? "medium",
      deadline: draft.deadline ?? now,
      category: draft.category ?? "personal",
      completed: false,
      createdAt: now,
      updatedAt: now,
    };
    const tasks = loadTasks();
    tasks.push(task);
    saveTasks(tasks);
    return task as T;
  }

  const taskMatch = path.match(/^\/tasks\/([^/]+)$/);
  if (taskMatch) {
    const taskId = taskMatch[1];
    const tasks = loadTasks();
    const index = tasks.findIndex((t) => t.id === taskId && t.userId === userId);

    if (method === "PUT" && index !== -1) {
      const patch = body as Partial<Task>;
      const current = tasks[index];
      if (patch.title !== undefined) current.title = patch.title.trim();
      if (patch.priority !== undefined) current.priority = patch.priority;
      if (patch.deadline !== undefined) current.deadline = patch.deadline;
      if (patch.category !== undefined) current.category = patch.category;
      if (patch.completed !== undefined) current.completed = patch.completed;
      current.updatedAt = new Date().toISOString();
      tasks[index] = current;
      saveTasks(tasks);
      return current as T;
    }

    if (method === "DELETE" && index !== -1) {
      tasks.splice(index, 1);
      saveTasks(tasks);
      return undefined as T;
    }

    if (index === -1) {
      throw new ApiError("Завдання не знайдено", 404);
    }
  }

  throw new ApiError(`Невідомий запит: ${method} ${path}`, 404);
}
