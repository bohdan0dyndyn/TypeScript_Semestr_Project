export type ToastType = "info" | "success" | "warning" | "error";

export function showToast(
  message: string,
  type: ToastType = "info",
  durationMs = 4000
): void {
  const root = document.getElementById("toast-root");
  if (!root) return;

  const el = document.createElement("div");
  el.className = `toast toast--${type}`;
  el.textContent = message;
  root.appendChild(el);

  requestAnimationFrame(() => el.classList.add("toast--visible"));

  window.setTimeout(() => {
    el.classList.remove("toast--visible");
    window.setTimeout(() => el.remove(), 300);
  }, durationMs);
}
