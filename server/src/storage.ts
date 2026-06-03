import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { TaskRecord, UserRecord } from "./types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const TASKS_FILE = path.join(DATA_DIR, "tasks.json");

async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function loadUsers(): Promise<UserRecord[]> {
  return readJsonFile<UserRecord[]>(USERS_FILE);
}

export async function saveUsers(users: UserRecord[]): Promise<void> {
  await writeJsonFile(USERS_FILE, users);
}

export async function loadTasks(): Promise<TaskRecord[]> {
  return readJsonFile<TaskRecord[]>(TASKS_FILE);
}

export async function saveTasks(tasks: TaskRecord[]): Promise<void> {
  await writeJsonFile(TASKS_FILE, tasks);
}
