import type { User } from "../models/User.js";
import type { RouteName } from "../router.js";
import { router } from "../router.js";

export function renderShell(
  container: HTMLElement,
  activeRoute: RouteName,
  user: User,
  contentHtml: string
): void {
  const navItems: { route: RouteName; label: string; icon: string }[] = [
    { route: "dashboard", label: "Дашборд", icon: "📊" },
    { route: "tasks", label: "Завдання", icon: "✅" },
    { route: "settings", label: "Налаштування", icon: "⚙️" },
  ];

  const navLinks = navItems
    .map(
      (item) => `
      <a href="#/${item.route}" class="nav-link ${activeRoute === item.route ? "nav-link--active" : ""}" data-route="${item.route}">
        <span class="nav-icon">${item.icon}</span>
        <span class="nav-label">${item.label}</span>
      </a>`
    )
    .join("");

  container.innerHTML = `
    <div class="app-shell">
      <header class="app-header">
        <div class="brand">
          <span class="brand-icon">📋</span>
          <span class="brand-text">Smart TODO</span>
        </div>
        <button type="button" class="btn btn--primary btn--sm" id="btn-add-task">
          + Додати завдання
        </button>
        <button type="button" class="nav-toggle" id="nav-toggle" aria-label="Меню">☰</button>
      </header>
      <div class="app-body">
        <aside class="sidebar" id="sidebar">
          <nav class="sidebar-nav">${navLinks}</nav>
          <div class="sidebar-user">
            <div class="user-avatar">${user.displayName.charAt(0).toUpperCase()}</div>
            <div class="user-info">
              <div class="user-name">${escapeHtml(user.displayName)}</div>
              <div class="user-email">${escapeHtml(user.email)}</div>
            </div>
          </div>
        </aside>
        <main class="main-content">${contentHtml}</main>
      </div>
    </div>
  `;

  document.getElementById("btn-add-task")?.addEventListener("click", () => {
    router.navigate("task-new");
  });

  document.getElementById("nav-toggle")?.addEventListener("click", () => {
    document.getElementById("sidebar")?.classList.toggle("sidebar--open");
  });

  container.querySelectorAll("[data-route]").forEach((el) => {
    el.addEventListener("click", () => {
      document.getElementById("sidebar")?.classList.remove("sidebar--open");
    });
  });
}

export function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
