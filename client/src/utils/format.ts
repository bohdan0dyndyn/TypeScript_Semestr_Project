export function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString("uk-UA", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function toInputDateValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number): string => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function deadlineStatus(
  deadline: string,
  completed: boolean
): "ok" | "soon" | "overdue" {
  if (completed) return "ok";
  const now = Date.now();
  const end = new Date(deadline).getTime();
  const day = 24 * 60 * 60 * 1000;
  if (end < now) return "overdue";
  if (end - now <= day) return "soon";
  return "ok";
}
