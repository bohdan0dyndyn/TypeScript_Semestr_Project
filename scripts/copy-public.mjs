import { cpSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const clientDist = path.join(root, "client", "dist");
const serverPublic = path.join(root, "server", "dist", "public");

if (!existsSync(clientDist)) {
  console.error("Спочатку зберіть клієнт: npm run build --prefix client");
  process.exit(1);
}

cpSync(clientDist, serverPublic, { recursive: true });
console.log("Клієнт скопійовано → server/dist/public");
