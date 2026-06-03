import type {
  SortDirection,
  SortField,
  Task,
  TaskDraft,
  TaskFilters,
} from "../models/Task.js";
import { PRIORITY_ORDER } from "../models/Task.js";
import { apiService } from "./ApiService.js";

export class TaskService {
  private tasks: Task[] = [];
  private listeners: Array<(tasks: Task[]) => void> = [];

  subscribe(listener: (tasks: Task[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.tasks);
    }
  }

  getTasks(): Task[] {
    return [...this.tasks];
  }

  async syncFromServer(): Promise<void> {
    const tasks = await apiService.get<Task[]>("/tasks");
    this.tasks = tasks;
    this.notify();
  }

  async create(draft: TaskDraft): Promise<Task> {
    const task = await apiService.post<Task>("/tasks", draft);
    this.tasks.push(task);
    this.notify();
    return task;
  }

  async update(
    id: string,
    patch: Partial<TaskDraft & { completed: boolean }>
  ): Promise<Task> {
    const task = await apiService.put<Task>(`/tasks/${id}`, patch);
    this.tasks = this.tasks.map((t) => (t.id === id ? task : t));
    this.notify();
    return task;
  }

  async remove(id: string): Promise<void> {
    await apiService.delete(`/tasks/${id}`);
    this.tasks = this.tasks.filter((t) => t.id !== id);
    this.notify();
  }

  filterAndSort(
    filters: TaskFilters,
    sortField: SortField,
    sortDirection: SortDirection
  ): Task[] {
    let result = [...this.tasks];

    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      result = result.filter((t) => t.title.toLowerCase().includes(q));
    }
    if (filters.priority !== "all") {
      result = result.filter((t) => t.priority === filters.priority);
    }
    if (filters.category !== "all") {
      result = result.filter((t) => t.category === filters.category);
    }
    if (filters.status === "active") {
      result = result.filter((t) => !t.completed);
    } else if (filters.status === "completed") {
      result = result.filter((t) => t.completed);
    }

    const dir = sortDirection === "asc" ? 1 : -1;

    result.sort((a, b) => {
      switch (sortField) {
        case "priority":
          return (
            (PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]) * dir
          );
        case "title":
          return a.title.localeCompare(b.title, "uk") * dir;
        case "createdAt":
          return (
            (new Date(a.createdAt).getTime() -
              new Date(b.createdAt).getTime()) *
            dir
          );
        case "deadline":
        default:
          return (
            (new Date(a.deadline).getTime() - new Date(b.deadline).getTime()) *
            dir
          );
      }
    });

    return result;
  }

  getStats(): {
    total: number;
    active: number;
    completed: number;
    overdue: number;
    dueSoon: number;
  } {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    let overdue = 0;
    let dueSoon = 0;

    for (const task of this.tasks) {
      if (task.completed) continue;
      const deadline = new Date(task.deadline).getTime();
      if (deadline < now) overdue += 1;
      else if (deadline - now <= dayMs) dueSoon += 1;
    }

    return {
      total: this.tasks.length,
      active: this.tasks.filter((t) => !t.completed).length,
      completed: this.tasks.filter((t) => t.completed).length,
      overdue,
      dueSoon,
    };
  }
}

export const taskService = new TaskService();
