import { authService } from "../services/AuthService.js";
import { router } from "../router.js";
import { showToast } from "../ui/toast.js";
export function renderAuthPage(mode: "login" | "register"): string {
  const isLogin = mode === "login";
  return `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <span class="auth-logo">📋</span>
          <h1>Smart TODO Planner</h1>
          <p>${isLogin ? "Увійдіть до облікового запису" : "Створіть обліковий запис"}</p>
        </div>
        <form id="auth-form" class="auth-form" novalidate>
          ${
            !isLogin
              ? `<div class="form-group">
            <label for="displayName">Ім'я</label>
            <input type="text" id="displayName" name="displayName" placeholder="Ваше ім'я" autocomplete="name" />
          </div>`
              : ""
          }
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required placeholder="you@example.com" autocomplete="email" />
          </div>
          <div class="form-group">
            <label for="password">Пароль</label>
            <input type="password" id="password" name="password" required minlength="6" placeholder="мін. 6 символів" autocomplete="${isLogin ? "current-password" : "new-password"}" />
          </div>
          <p class="form-error" id="auth-error" hidden></p>
          <button type="submit" class="btn btn--primary btn--block">
            ${isLogin ? "Увійти" : "Зареєструватися"}
          </button>
        </form>
        <p class="auth-switch">
          ${
            isLogin
              ? `Немає облікового запису? <a href="#/register">Зареєструватися</a>`
              : `Вже є обліковий запис? <a href="#/login">Увійти</a>`
          }
        </p>
      </div>
    </div>
  `;
}

export function bindAuthPage(container: HTMLElement, mode: "login" | "register"): void {
  const form = container.querySelector<HTMLFormElement>("#auth-form");
  const errorEl = container.querySelector<HTMLElement>("#auth-error");

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!errorEl) return;

    errorEl.hidden = true;
    const email = (form.querySelector("#email") as HTMLInputElement).value;
    const password = (form.querySelector("#password") as HTMLInputElement).value;
    const displayNameInput = form.querySelector("#displayName") as HTMLInputElement | null;
    const displayName = displayNameInput?.value ?? "";

    try {
      if (mode === "login") {
        await authService.login(email, password);
        showToast("Вітаємо!", "success");
      } else {
        await authService.register(email, password, displayName);
        showToast("Реєстрацію завершено!", "success");
      }
      router.navigate("dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Помилка авторизації";
      errorEl.textContent = message;
      errorEl.hidden = false;
    }
  });
}
