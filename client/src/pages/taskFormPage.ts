import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  type Priority,
  type Task,
  type TaskCategory,
  type TaskDraft,
} from "../models/Task.js";
import { taskService } from "../services/TaskService.js";
import { router } from "../router.js";
import { showToast } from "../ui/toast.js";
import { toInputDateValue } from "../utils/format.js";

function defaultDeadline(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return toInputDateValue(d.toISOString());
}

export function renderTaskFormHtml(task?: Task): string {
  const isEdit = Boolean(task);
  const draft: TaskDraft = task
    ? {
        title: task.title,
        priority: task.priority,
        deadline: toInputDateValue(task.deadline),
        category: task.category,
      }
    : {
        title: "",
        priority: "medium",
        deadline: defaultDeadline(),
        category: "personal",
      };

  const priorityOptions = (["low", "medium", "high"] as Priority[])
    .map(
      (p) =>
        `<option value="${p}" ${draft.priority === p ? "selected" : ""}>${PRIORITY_LABELS[p]}</option>`
    )
    .join("");

  const categoryOptions = (["work", "personal", "study", "other"] as TaskCategory[])
    .map(
      (c) =>
        `<option value="${c}" ${draft.category === c ? "selected" : ""}>${CATEGORY_LABELS[c]}</option>`
    )
    .join("");

  return `
    <div class="page page--narrow">
      <header class="page-header">
        <h1>${isEdit ? "Редагування завдання" : "Нове завдання"}</h1>
        <p class="page-subtitle">${isEdit ? "Змініть дані та збережіть" : "Заповніть форму для створення"}</p>
      </header>
      <form id="task-form" class="card form-card" novalidate>
        <div class="form-group">
          <label for="title">Назва</label>
          <input type="text" id="title" name="title" required value="${draft.title.replace(/"/g, "&quot;")}" placeholder="Назва завдання" />
        </div>
        <div class="form-group">
          <label for="priority">Пріоритет</label>
          <select id="priority" name="priority" class="select">${priorityOptions}</select>
        </div>
        <div class="form-group">
          <label for="deadline">Дедлайн</label>
          <input type="date" id="deadline" name="deadline" required value="${draft.deadline}" />
        </div>
        <div class="form-group">
          <label for="category">Категорія</label>
          <select id="category" name="category" class="select">${categoryOptions}</select>
        </div>
        <p class="form-error" id="form-error" hidden></p>
        <div class="form-actions">
          <button type="submit" class="btn btn--primary">Зберегти</button>
          <button type="button" class="btn btn--secondary" id="btn-cancel">Скасувати</button>
        </div>
      </form>
    </div>
  `;
}

export function bindTaskFormPage(
  container: HTMLElement,
  taskId?: string
): void {
  const form = container.querySelector<HTMLFormElement>("#task-form");
  const errorEl = container.querySelector<HTMLElement>("#form-error");

  container.querySelector("#btn-cancel")?.addEventListener("click", () => {
    router.navigate("tasks");
  });

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form || !errorEl) return;

    errorEl.hidden = true;
    const draft: TaskDraft = {
      title: (form.querySelector("#title") as HTMLInputElement).value,
      priority: (form.querySelector("#priority") as HTMLSelectElement)
        .value as Priority,
      deadline: (form.querySelector("#deadline") as HTMLInputElement).value,
      category: (form.querySelector("#category") as HTMLSelectElement)
        .value as TaskCategory,
    };

    if (!draft.title.trim()) {
      errorEl.textContent = "Вкажіть назву завдання";
      errorEl.hidden = false;
      return;
    }

    const deadlineIso = new Date(draft.deadline + "T23:59:59").toISOString();

    try {
      if (taskId) {
        await taskService.update(taskId, { ...draft, deadline: deadlineIso });
        showToast("Завдання оновлено", "success");
      } else {
        await taskService.create({ ...draft, deadline: deadlineIso });
        showToast("Завдання створено", "success");
      }
      router.navigate("tasks");
    } catch (err) {
      errorEl.textContent =
        err instanceof Error ? err.message : "Помилка збереження";
      errorEl.hidden = false;
    }
  });
}
