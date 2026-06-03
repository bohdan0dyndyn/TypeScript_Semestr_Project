import type { NextFunction, Request, Response } from "express";
import { loadUsers } from "../storage.js";
import type { PublicUser } from "../types.js";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function toPublicUser(user: {
  id: string;
  email: string;
  displayName: string;
}): PublicUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
  };
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.headers["x-user-id"];
  if (typeof userId !== "string" || !userId.trim()) {
    res.status(401).json({ message: "Потрібен заголовок X-User-Id" });
    return;
  }

  const users = await loadUsers();
  if (!users.some((u) => u.id === userId)) {
    res.status(401).json({ message: "Користувача не знайдено" });
    return;
  }

  req.userId = userId;
  next();
}
