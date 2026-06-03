import type { SortDirection, SortField, TaskFilters } from "../models/Task.js";
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  type Priority,
  type TaskCategory,
} from "../models/Task.js";
import { taskService } from "../services/TaskService.js";
import { router } from "../router.js";
import { renderTaskCard, bindTaskCardEvents } from "../ui/taskCard.js";
import { showToast } from "../ui/toast.js";

let filters: TaskFilters = {
  search: "",
  priority: "all",
  category: "all",
  status: "all",
};
let sortField: SortField = "deadline";
let sortDirection: SortDirection = "asc";

export function renderTasksHtml(): string {
  const tasks = taskService.filterAndSort(filters, sortField, sortDirection);
  const listHtml =
    tasks.length > 0
      ? tasks.map((t) => renderTaskCard(t)).join("")
      : '<p class="empty-state">Завдань не знайдено. Змініть фільтри або додайте нове.</p>';

  return `
    <div class="page">
      <header class="page-header">
        <h1>Завдання</h1>
        <p class="page-subtitle">Список усіх завдань з фільтрацією та сортуванням</p>
      </header>
      <div class="toolbar card">
        <div class="toolbar-row">
          <input type="search" id="filter-search" class="input" placeholder="Пошук..." value="${filters.search}" />
          <select id="filter-priority" class="select">
            <option value="all">Усі пріоритети</option>
            ${(["low", "medium", "high"] as Priority[])
              .map(
                (p) =>
                  `<option value="${p}" ${filters.priority === p ? "selected" : ""}>${PRIORITY_LABELS[p]}</option>`
              )
              .join("")}
          </select>
          <select id="filter-category" class="select">
            <option value="all">Усі категорії</option>
            ${(["work", "personal", "study", "other"] as TaskCategory[])
              .map(
                (c) =>
                  `<option value="${c}" ${filters.category === c ? "selected" : ""}>${CATEGORY_LABELS[c]}</option>`
              )
              .join("")}
          </select>
          <select id="filter-status" class="select">
            <option value="all" ${filters.status === "all" ? "selected" : ""}>Усі статуси</option>
            <option value="active" ${filters.status === "active" ? "selected" : ""}>Активні</option>
            <option value="completed" ${filters.status === "completed" ? "selected" : ""}>Виконані</option>
          </select>
        </div>
        <div class="toolbar-row">
          <select id="sort-field" class="select">
            <option value="deadline" ${sortField === "deadline" ? "selected" : ""}>За дедлайном</option>
            <option value="priority" ${sortField === "priority" ? "selected" : ""}>За пріоритетом</option>
            <option value="title" ${sortField === "title" ? "selected" : ""}>За назвою</option>
            <option value="createdAt" ${sortField === "createdAt" ? "selected" : ""}>За датою створення</option>
          </select>
          <select id="sort-direction" class="select">
            <option value="asc" ${sortDirection === "asc" ? "selected" : ""}>За зростанням</option>
            <option value="desc" ${sortDirection === "desc" ? "selected" : ""}>За спаданням</option>
          </select>
          <button type="button" class="btn btn--secondary" id="btn-sync">🔄 Синхронізувати</button>
        </div>
      </div>
      <div class="task-list" id="tasks-list">${listHtml}</div>
    </div>
  `;
}

export function bindTasksPage(container: HTMLElement, onRefresh: () => void): void {
  const applyFilters = (): void => {
    filters = {
      search: (container.querySelector("#filter-search") as HTMLInputElement).value,
      priority: (container.querySelector("#filter-priority") as HTMLSelectElement)
        .value as TaskFilters["priority"],
      category: (container.querySelector("#filter-category") as HTMLSelectElement)
        .value as TaskFilters["category"],
      status: (container.querySelector("#filter-status") as HTMLSelectElement)
        .value as TaskFilters["status"],
    };
    sortField = (container.querySelector("#sort-field") as HTMLSelectElement)
      .value as SortField;
    sortDirection = (container.querySelector("#sort-direction") as HTMLSelectElement)
      .value as SortDirection;
    onRefresh();
  };

  container.querySelector("#filter-search")?.addEventListener("input", applyFilters);
  ["#filter-priority", "#filter-category", "#filter-status", "#sort-field", "#sort-direction"].forEach(
    (sel) => container.querySelector(sel)?.addEventListener("change", applyFilters)
  );

  container.querySelector("#btn-sync")?.addEventListener("click", async () => {
    try {
      await taskService.syncFromServer();
      showToast("Синхронізовано з сервером", "success");
      onRefresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Помилка синхронізації", "error");
    }
  });

  const list = container.querySelector<HTMLElement>("#tasks-list");
  if (list) {
    bindTaskCardEvents(list, {
      onToggle: async (id, completed) => {
        await taskService.update(id, { completed });
      },
      onEdit: (id) => router.navigate("task-edit", { id }),
      onDelete: async (id) => {
        await taskService.remove(id);
        onRefresh();
      },
    });
  }
}
