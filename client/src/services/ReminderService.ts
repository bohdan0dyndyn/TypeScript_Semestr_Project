import type { Task } from "../models/Task.js";
import { showToast } from "../ui/toast.js";

const REMINDER_KEY = "todo_reminder_notified";
const CHECK_INTERVAL_MS = 60_000;

export class ReminderService {
  private intervalId: number | null = null;
  private enabled = true;

  start(getTasks: () => Task[]): void {
    this.stop();
    this.check(getTasks);
    this.intervalId = window.setInterval(() => {
      this.check(getTasks);
    }, CHECK_INTERVAL_MS);
  }

  stop(): void {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    localStorage.setItem("todo_reminders_enabled", String(enabled));
  }

  isEnabled(): boolean {
    const stored = localStorage.getItem("todo_reminders_enabled");
    if (stored === null) return this.enabled;
    return stored === "true";
  }

  private getNotifiedIds(): Set<string> {
    try {
      const raw = sessionStorage.getItem(REMINDER_KEY);
      if (!raw) return new Set();
      return new Set(JSON.parse(raw) as string[]);
    } catch {
      return new Set();
    }
  }

  private saveNotifiedIds(ids: Set<string>): void {
    sessionStorage.setItem(REMINDER_KEY, JSON.stringify([...ids]));
  }

  private check(getTasks: () => Task[]): void {
    if (!this.isEnabled()) return;

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const notified = this.getNotifiedIds();
    const updated = new Set(notified);

    for (const task of getTasks()) {
      if (task.completed) continue;

      const deadline = new Date(task.deadline).getTime();
      const diff = deadline - now;
      const key = `${task.id}-${task.deadline}`;

      if (diff < 0 && !notified.has(key)) {
        showToast(
          `Прострочено: «${task.title}»`,
          "warning",
          8000
        );
        updated.add(key);
        this.tryBrowserNotification(task.title, "Дедлайн минув!");
      } else if (diff >= 0 && diff <= dayMs && !notified.has(key)) {
        showToast(
          `Скоро дедлайн: «${task.title}»`,
          "info",
          6000
        );
        updated.add(key);
        this.tryBrowserNotification(task.title, "Дедлайн протягом 24 годин");
      }
    }

    this.saveNotifiedIds(updated);
  }

  private tryBrowserNotification(title: string, body: string): void {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    new Notification(title, { body, icon: "📋" });
  }

  async requestNotificationPermission(): Promise<boolean> {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;
    const result = await Notification.requestPermission();
    return result === "granted";
  }
}

export const reminderService = new ReminderService();
