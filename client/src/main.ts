import { authService } from "./services/AuthService.js";
import { taskService } from "./services/TaskService.js";
import { reminderService } from "./services/ReminderService.js";
import { router, type ParsedRoute, type RouteName } from "./router.js";
import { renderShell } from "./ui/layout.js";
import { renderAuthPage, bindAuthPage } from "./pages/authPage.js";
import {
  renderDashboardHtml,
  bindDashboardPage,
} from "./pages/dashboardPage.js";
import { renderTasksHtml, bindTasksPage } from "./pages/tasksPage.js";
import {
  renderTaskFormHtml,
  bindTaskFormPage,
} from "./pages/taskFormPage.js";
import { renderSettingsHtml, bindSettingsPage } from "./pages/settingsPage.js";
import { showToast } from "./ui/toast.js";

const appRoot = document.getElementById("app");
if (!appRoot) {
  throw new Error("Root element #app not found");
}
const app: HTMLElement = appRoot;

const PUBLIC_ROUTES: RouteName[] = ["login", "register"];

function shellRouteName(route: ParsedRoute): RouteName {
  if (route.name === "task-new" || route.name === "task-edit") {
    return "tasks";
  }
  return route.name;
}

async function loadTasks(): Promise<void> {
  if (!authService.isAuthenticated()) return;
  try {
    await taskService.syncFromServer();
    reminderService.start(() => taskService.getTasks());
  } catch (err) {
    showToast(
      err instanceof Error
        ? err.message
        : "Не вдалося завантажити завдання. Перевірте сервер.",
      "error",
      6000
    );
  }
}

function renderRoute(route: ParsedRoute): void {
  if (!authService.isAuthenticated()) {
    if (!PUBLIC_ROUTES.includes(route.name)) {
      router.navigate("login");
      return;
    }
    const mode = route.name === "register" ? "register" : "login";
    app.innerHTML = renderAuthPage(mode);
    bindAuthPage(app, mode);
    return;
  }

  if (PUBLIC_ROUTES.includes(route.name)) {
    router.navigate("dashboard");
    return;
  }

  const user = authService.getUser();
  if (!user) {
    router.navigate("login");
    return;
  }

  let contentHtml = "";
  const refresh = (): void => renderRoute(router.getCurrent());

  switch (route.name) {
    case "dashboard":
      contentHtml = renderDashboardHtml();
      break;
    case "tasks":
      contentHtml = renderTasksHtml();
      break;
    case "task-new":
      contentHtml = renderTaskFormHtml();
      break;
    case "task-edit": {
      const task = taskService
        .getTasks()
        .find((t) => t.id === route.params.id);
      contentHtml = renderTaskFormHtml(task);
      break;
    }
    case "settings":
      contentHtml = renderSettingsHtml();
      break;
    default:
      contentHtml = renderDashboardHtml();
  }

  renderShell(app, shellRouteName(route), user, contentHtml);

  switch (route.name) {
    case "dashboard":
      bindDashboardPage(app);
      break;
    case "tasks":
      bindTasksPage(app, refresh);
      break;
    case "task-new":
      bindTaskFormPage(app);
      break;
    case "task-edit":
      bindTaskFormPage(app, route.params.id);
      break;
    case "settings":
      bindSettingsPage(app);
      break;
  }
}

authService.subscribe(() => {
  void loadTasks().then(() => renderRoute(router.getCurrent()));
});

taskService.subscribe(() => {
  if (authService.isAuthenticated()) {
    renderRoute(router.getCurrent());
  }
});

router.init((route) => {
  renderRoute(route);
});

void loadTasks().then(() => {
  if (authService.isAuthenticated() && !window.location.hash) {
    router.navigate("dashboard");
  }
});
