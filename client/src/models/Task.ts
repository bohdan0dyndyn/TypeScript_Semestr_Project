export type Priority = "low" | "medium" | "high";
export type TaskCategory = "work" | "personal" | "study" | "other";

export interface Task {
  id: string;
  userId: string;
  title: string;
  priority: Priority;
  deadline: string;
  category: TaskCategory;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskDraft {
  title: string;
  priority: Priority;
  deadline: string;
  category: TaskCategory;
}

export type SortField = "deadline" | "priority" | "title" | "createdAt";
export type SortDirection = "asc" | "desc";

export interface TaskFilters {
  search: string;
  priority: Priority | "all";
  category: TaskCategory | "all";
  status: "all" | "active" | "completed";
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Низький",
  medium: "Середній",
  high: "Високий",
};

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  work: "Робота",
  personal: "Особисте",
  study: "Навчання",
  other: "Інше",
};

export const PRIORITY_ORDER: Record<Priority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};
