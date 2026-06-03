import { Router, type Request, type Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { toPublicUser } from "../middleware/auth.js";
import { loadUsers, saveUsers } from "../storage.js";
import type { UserRecord } from "../types.js";

const router = Router();

router.post("/register", async (req: Request, res: Response): Promise<void> => {
  const { email, password, displayName } = req.body as {
    email?: string;
    password?: string;
    displayName?: string;
  };

  if (!email?.trim() || !password) {
    res.status(400).json({ message: "Вкажіть email і пароль" });
    return;
  }

  const users = await loadUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (users.some((u) => u.email === normalizedEmail)) {
    res.status(409).json({ message: "Користувач з таким email вже існує" });
    return;
  }

  const newUser: UserRecord = {
    id: uuidv4(),
    email: normalizedEmail,
    password,
    displayName: displayName?.trim() || normalizedEmail.split("@")[0],
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  await saveUsers(users);

  res.status(201).json({ user: toPublicUser(newUser) });
});

router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email?.trim() || !password) {
    res.status(400).json({ message: "Вкажіть email і пароль" });
    return;
  }

  const users = await loadUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find(
    (u) => u.email === normalizedEmail && u.password === password
  );

  if (!user) {
    res.status(401).json({ message: "Невірний email або пароль" });
    return;
  }

  res.json({ user: toPublicUser(user) });
});

/** Список користувачів (без паролів) — для перевірки JSON */
router.get("/users", async (_req: Request, res: Response): Promise<void> => {
  const users = await loadUsers();
  res.json(users.map((u) => toPublicUser(u)));
});

export default router;
