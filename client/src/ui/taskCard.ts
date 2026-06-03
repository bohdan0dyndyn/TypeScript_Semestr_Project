import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  type Task,
} from "../models/Task.js";
import { deadlineStatus, formatDate } from "../utils/format.js";
import { escapeHtml } from "./layout.js";

export function renderTaskCard(
  task: Task,
  options: { showActions?: boolean } = {}
): string {
  const showActions = options.showActions !== false;
  const status = deadlineStatus(task.deadline, task.completed);
  const statusClass =
    status === "overdue"
      ? "task-card--overdue"
      : status === "soon"
        ? "task-card--soon"
        : "";

  return `
    <article class="task-card ${task.completed ? "task-card--done" : ""} ${statusClass}" data-id="${task.id}">
      <label class="task-check">
        <input type="checkbox" class="task-toggle" data-id="${task.id}" ${task.completed ? "checked" : ""} />
        <span class="checkmark"></span>
      </label>
      <div class="task-body">
        <h3 class="task-title">${escapeHtml(task.title)}</h3>
        <div class="task-meta">
          <span class="badge badge--priority-${task.priority}">${PRIORITY_LABELS[task.priority]}</span>
          <span class="badge badge--category">${CATEGORY_LABELS[task.category]}</span>
          <span class="task-deadline">📅 ${formatDate(task.deadline)}</span>
        </div>
      </div>
      ${
        showActions
          ? `<div class="task-actions">
        <button type="button" class="btn btn--ghost btn--icon task-edit" data-id="${task.id}" title="Редагувати">✏️</button>
        <button type="button" class="btn btn--ghost btn--icon task-delete" data-id="${task.id}" title="Видалити">🗑️</button>
      </div>`
          : ""
      }
    </article>
  `;
}

export function bindTaskCardEvents(
  root: HTMLElement,
  handlers: {
    onToggle: (id: string, completed: boolean) => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
  }
): void {
  root.querySelectorAll<HTMLInputElement>(".task-toggle").forEach((input) => {
    input.addEventListener("change", () => {
      const id = input.dataset.id;
      if (id) handlers.onToggle(id, input.checked);
    });
  });

  root.querySelectorAll(".task-edit").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = (btn as HTMLElement).dataset.id;
      if (id) handlers.onEdit(id);
    });
  });

  root.querySelectorAll(".task-delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = (btn as HTMLElement).dataset.id;
      if (id && confirm("Видалити це завдання?")) handlers.onDelete(id);
    });
  });
}
