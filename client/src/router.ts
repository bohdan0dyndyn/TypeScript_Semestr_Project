export type RouteName =
  | "login"
  | "register"
  | "dashboard"
  | "tasks"
  | "task-new"
  | "task-edit"
  | "settings";

export interface RouteParams {
  id?: string;
}

export interface ParsedRoute {
  name: RouteName;
  params: RouteParams;
}

const ROUTE_PATTERN: Record<RouteName, RegExp> = {
  login: /^login$/,
  register: /^register$/,
  dashboard: /^dashboard$/,
  tasks: /^tasks$/,
  "task-new": /^tasks\/new$/,
  "task-edit": /^tasks\/edit\/(.+)$/,
  settings: /^settings$/,
};

function parseHash(): ParsedRoute {
  const hash = window.location.hash.replace(/^#\/?/, "");
  const path = hash || "dashboard";

  for (const [name, pattern] of Object.entries(ROUTE_PATTERN) as [
    RouteName,
    RegExp,
  ][]) {
    const match = path.match(pattern);
    if (match) {
      if (name === "task-edit" && match[1]) {
        return { name, params: { id: match[1] } };
      }
      return { name, params: {} };
    }
  }

  return { name: "dashboard", params: {} };
}

export type RouteHandler = (route: ParsedRoute) => void;

export class Router {
  private handler: RouteHandler | null = null;

  init(handler: RouteHandler): void {
    this.handler = handler;
    window.addEventListener("hashchange", () => this.emit());
    this.emit();
  }

  navigate(name: RouteName, params: RouteParams = {}): void {
    let path: string;
    if (name === "task-new") {
      path = "tasks/new";
    } else if (name === "task-edit" && params.id) {
      path = `tasks/edit/${params.id}`;
    } else {
      path = name;
    }
    window.location.hash = `#/${path}`;
  }

  getCurrent(): ParsedRoute {
    return parseHash();
  }

  private emit(): void {
    if (this.handler) {
      this.handler(parseHash());
    }
  }
}

export const router = new Router();
