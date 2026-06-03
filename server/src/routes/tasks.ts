import { Router, type Response } from "express";
import { v4 as uuidv4 } from "uuid";
import {
  authMiddleware,
  type AuthenticatedRequest,
} from "../middleware/auth.js";
import { loadTasks, saveTasks } from "../storage.js";
import type { Priority, TaskCategory, TaskRecord } from "../types.js";

const router = Router();

const VALID_PRIORITIES: Priority[] = ["low", "medium", "high"];
const VALID_CATEGORIES: TaskCategory[] = [
  "work",
  "personal",
  "study",
  "other",
];

function isValidPriority(value: string): value is Priority {
  return VALID_PRIORITIES.includes(value as Priority);
}

function isValidCategory(value: string): value is TaskCategory {
  return VALID_CATEGORIES.includes(value as TaskCategory);
}

router.use(authMiddleware);

router.get("/", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const tasks = await loadTasks();
  res.json(tasks.filter((t) => t.userId === userId));
});

router.post("/", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { title, priority, deadline, category } = req.body as {
    title?: string;
    priority?: string;
    deadline?: string;
    category?: string;
  };

  if (!title?.trim()) {
    res.status(400).json({ message: "Назва завдання обов'язкова" });
    return;
  }
  if (!priority || !isValidPriority(priority)) {
    res.status(400).json({ message: "Невірний пріоритет" });
    return;
  }
  if (!deadline) {
    res.status(400).json({ message: "Вкажіть дедлайн" });
    return;
  }
  if (!category || !isValidCategory(category)) {
    res.status(400).json({ message: "Невірна категорія" });
    return;
  }

  const tasks = await loadTasks();
  const now = new Date().toISOString();
  const task: TaskRecord = {
    id: uuidv4(),
    userId,
    title: title.trim(),
    priority,
    deadline,
    category,
    completed: false,
    createdAt: now,
    updatedAt: now,
  };

  tasks.push(task);
  await saveTasks(tasks);
  res.status(201).json(task);
});

router.put("/:id", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { id } = req.params;
  const body = req.body as Partial<{
    title: string;
    priority: string;
    deadline: string;
    category: string;
    completed: boolean;
  }>;

  const tasks = await loadTasks();
  const index = tasks.findIndex((t) => t.id === id && t.userId === userId);

  if (index === -1) {
    res.status(404).json({ message: "Завдання не знайдено" });
    return;
  }

  const current = tasks[index];

  if (body.title !== undefined) {
    if (!body.title.trim()) {
      res.status(400).json({ message: "Назва не може бути порожньою" });
      return;
    }
    current.title = body.title.trim();
  }
  if (body.priority !== undefined) {
    if (!isValidPriority(body.priority)) {
      res.status(400).json({ message: "Невірний пріоритет" });
      return;
    }
    current.priority = body.priority;
  }
  if (body.deadline !== undefined) {
    current.deadline = body.deadline;
  }
  if (body.category !== undefined) {
    if (!isValidCategory(body.category)) {
      res.status(400).json({ message: "Невірна категорія" });
      return;
    }
    current.category = body.category;
  }
  if (body.completed !== undefined) {
    current.completed = Boolean(body.completed);
  }

  current.updatedAt = new Date().toISOString();
  tasks[index] = current;
  await saveTasks(tasks);
  res.json(current);
});

router.delete("/:id", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { id } = req.params;
  const tasks = await loadTasks();
  const index = tasks.findIndex((t) => t.id === id && t.userId === userId);

  if (index === -1) {
    res.status(404).json({ message: "Завдання не знайдено" });
    return;
  }

  tasks.splice(index, 1);
  await saveTasks(tasks);
  res.status(204).send();
});

export default router;
