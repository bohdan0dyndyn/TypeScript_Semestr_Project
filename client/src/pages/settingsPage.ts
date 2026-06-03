import { authService } from "../services/AuthService.js";
import { reminderService } from "../services/ReminderService.js";
import { taskService } from "../services/TaskService.js";
import { router } from "../router.js";
import { showToast } from "../ui/toast.js";
import { escapeHtml } from "../ui/layout.js";

export function renderSettingsHtml(): string {
  const user = authService.getUser();
  const remindersOn = reminderService.isEnabled();

  return `
    <div class="page page--narrow">
      <header class="page-header">
        <h1>Налаштування</h1>
        <p class="page-subtitle">Профіль та параметри додатку</p>
      </header>
      <section class="card settings-section">
        <h2>Профіль</h2>
        <dl class="settings-dl">
          <dt>Ім'я</dt>
          <dd>${user ? escapeHtml(user.displayName) : "—"}</dd>
          <dt>Email</dt>
          <dd>${user ? escapeHtml(user.email) : "—"}</dd>
        </dl>
      </section>
      <section class="card settings-section">
        <h2>Нагадування</h2>
        <label class="toggle-row">
          <input type="checkbox" id="reminders-enabled" ${remindersOn ? "checked" : ""} />
          <span>Сповіщення про дедлайни (в додатку та браузері)</span>
        </label>
        <button type="button" class="btn btn--secondary" id="btn-notify-permission">
          Дозволити push-сповіщення браузера
        </button>
      </section>
      <section class="card settings-section">
        <h2>Синхронізація</h2>
        <p class="text-muted">Завдання зберігаються на сервері та доступні після входу з будь-якого пристрою.</p>
        <button type="button" class="btn btn--secondary" id="btn-settings-sync">Синхронізувати зараз</button>
      </section>
      <section class="card settings-section settings-section--danger">
        <h2>Сесія</h2>
        <button type="button" class="btn btn--danger" id="btn-logout">Вийти з облікового запису</button>
      </section>
    </div>
  `;
}

export function bindSettingsPage(container: HTMLElement): void {
  container.querySelector("#reminders-enabled")?.addEventListener("change", (e) => {
    const checked = (e.target as HTMLInputElement).checked;
    reminderService.setEnabled(checked);
    showToast(checked ? "Нагадування увімкнено" : "Нагадування вимкнено", "info");
  });

  container.querySelector("#btn-notify-permission")?.addEventListener("click", async () => {
    const ok = await reminderService.requestNotificationPermission();
    showToast(
      ok ? "Дозвіл надано" : "Дозвіл не надано або не підтримується",
      ok ? "success" : "warning"
    );
  });

  container.querySelector("#btn-settings-sync")?.addEventListener("click", async () => {
    try {
      await taskService.syncFromServer();
      showToast("Дані синхронізовано", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Помилка", "error");
    }
  });

  container.querySelector("#btn-logout")?.addEventListener("click", () => {
    authService.logout();
    reminderService.stop();
    router.navigate("login");
    showToast("Ви вийшли з облікового запису", "info");
  });
}
