import type { AuthResponse, User } from "../models/User.js";
import { apiService } from "./ApiService.js";

const USER_KEY = "todo_current_user";

export class AuthService {
  private currentUser: User | null = null;
  private listeners: Array<(user: User | null) => void> = [];

  constructor() {
    const stored = localStorage.getItem(USER_KEY);
    if (stored) {
      try {
        this.currentUser = JSON.parse(stored) as User;
        apiService.setUserId(this.currentUser.id);
      } catch {
        this.currentUser = null;
      }
    }
  }

  getUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return Boolean(this.currentUser && apiService.getUserId());
  }

  subscribe(listener: (user: User | null) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.currentUser);
    }
  }

  private persistUser(user: User | null): void {
    this.currentUser = user;
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      apiService.setUserId(user.id);
    } else {
      localStorage.removeItem(USER_KEY);
      apiService.setUserId(null);
    }
    this.notify();
  }

  async register(
    email: string,
    password: string,
    displayName: string
  ): Promise<User> {
    const response = await apiService.post<AuthResponse>("/auth/register", {
      email,
      password,
      displayName,
    });
    this.persistUser(response.user);
    return response.user;
  }

  async login(email: string, password: string): Promise<User> {
    const response = await apiService.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    this.persistUser(response.user);
    return response.user;
  }

  logout(): void {
    this.persistUser(null);
  }
}

export const authService = new AuthService();
