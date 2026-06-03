import cors from "cors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/tasks.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "public");
const PORT = Number(process.env.PORT) || 4000;

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "smart-todo-planner" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.use(express.static(PUBLIC_DIR));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    next();
    return;
  }
  res.sendFile(path.join(PUBLIC_DIR, "index.html"), (err) => {
    if (err) {
      res.status(404).send(
        "Клієнт не зібрано. Виконайте: npm run build (у корені проекту)"
      );
    }
  });
});

app.listen(PORT, () => {
  console.log(`Smart TODO Planner: http://localhost:${PORT}`);
});
