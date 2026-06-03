import { taskService } from "../services/TaskService.js";
import { router } from "../router.js";
import { renderTaskCard, bindTaskCardEvents } from "../ui/taskCard.js";

export function renderDashboardHtml(): string {
  const stats = taskService.getStats();
  const upcoming = taskService
    .filterAndSort(
      { search: "", priority: "all", category: "all", status: "active" },
      "deadline",
      "asc"
    )
    .slice(0, 5);

  const cards =
    upcoming.length > 0
      ? upcoming.map((t) => renderTaskCard(t, { showActions: false })).join("")
      : '<p class="empty-state">Немає активних завдань. Додайте перше!</p>';

  return `
    <div class="page">
      <header class="page-header">
        <h1>Дашборд</h1>
        <p class="page-subtitle">Огляд ваших завдань</p>
      </header>
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-value">${stats.total}</span>
          <span class="stat-label">Усього</span>
        </div>
        <div class="stat-card stat-card--accent">
          <span class="stat-value">${stats.active}</span>
          <span class="stat-label">Активні</span>
        </div>
        <div class="stat-card stat-card--success">
          <span class="stat-value">${stats.completed}</span>
          <span class="stat-label">Виконані</span>
        </div>
        <div class="stat-card stat-card--warning">
          <span class="stat-value">${stats.dueSoon}</span>
          <span class="stat-label">Скоро дедлайн</span>
        </div>
        <div class="stat-card stat-card--danger">
          <span class="stat-value">${stats.overdue}</span>
          <span class="stat-label">Прострочені</span>
        </div>
      </div>
      <section class="section">
        <div class="section-header">
          <h2>Найближчі завдання</h2>
          <a href="#/tasks" class="link">Усі завдання →</a>
        </div>
        <div class="task-list" id="dashboard-tasks">${cards}</div>
      </section>
    </div>
  `;
}

export function bindDashboardPage(container: HTMLElement): void {
  const list = container.querySelector<HTMLElement>("#dashboard-tasks");
  if (!list) return;

  bindTaskCardEvents(list, {
    onToggle: async (id, completed) => {
      await taskService.update(id, { completed });
    },
    onEdit: (id) => router.navigate("task-edit", { id }),
    onDelete: async (id) => {
      await taskService.remove(id);
    },
  });
}
