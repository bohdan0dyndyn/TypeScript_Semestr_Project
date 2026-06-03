/** GitHub Pages та інший статичний хостинг без Node API */
export function isStaticHosting(): boolean {
  if (import.meta.env.VITE_STATIC_STORAGE === "true") {
    return true;
  }
  if (typeof window === "undefined") {
    return false;
  }
  return window.location.hostname.endsWith("github.io");
}
