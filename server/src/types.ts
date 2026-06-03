export type Priority = "low" | "medium" | "high";
export type TaskCategory = "work" | "personal" | "study" | "other";

/** Користувач у data/users.json (пароль у відкритому вигляді — лише для навчального проекту) */
export interface UserRecord {
  id: string;
  email: string;
  password: string;
  displayName: string;
  createdAt: string;
}

export interface TaskRecord {
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

export interface PublicUser {
  id: string;
  email: string;
  displayName: string;
}
