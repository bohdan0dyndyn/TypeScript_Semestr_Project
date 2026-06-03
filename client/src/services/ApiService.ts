import { isStaticHosting } from "../utils/host.js";
import { ApiError } from "./ApiError.js";
import { localJsonRequest } from "./localJsonStorage.js";

export { ApiError };

export class ApiService {
  private userId: string | null = null;

  constructor(private readonly baseUrl: string) {
    this.userId = localStorage.getItem("todo_user_id");
  }

  setUserId(userId: string | null): void {
    this.userId = userId;
    if (userId) {
      localStorage.setItem("todo_user_id", userId);
    } else {
      localStorage.removeItem("todo_user_id");
    }
  }

  getUserId(): string | null {
    return this.userId;
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("PUT", path, body);
  }

  async delete(path: string): Promise<void> {
    await this.request<void>("DELETE", path);
  }

  private useLocalJson(): boolean {
    return isStaticHosting() && !import.meta.env.VITE_API_URL;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    if (this.useLocalJson()) {
      return localJsonRequest<T>(method, path, body, this.userId);
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.userId) {
      headers["X-User-Id"] = this.userId;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (response.status === 204) {
      return undefined as T;
    }

    const data: unknown = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message =
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof (data as { message: unknown }).message === "string"
          ? (data as { message: string }).message
          : `Помилка сервера (${response.status})`;
      throw new ApiError(message, response.status);
    }

    return data as T;
  }
}

const apiBase: string =
  import.meta.env.VITE_API_URL?.toString() || "/api";

export const apiService = new ApiService(apiBase);
