# Smart TODO Planner

## Сайт після push у `main`

1. На GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Зробіть `git push origin main`.
3. Через 1–2 хв сайт буде доступний:

   **https://bohdan0dyndyn.github.io/TypeScript_Semestr_Project/**

На GitHub Pages дані (користувачі та завдання) зберігаються в **localStorage** браузера у форматі JSON — без окремого сервера. Локально з повним API:

```powershell
npm run install:all
npm run build
cd server
node dist/server.js
```

→ http://localhost:3000 (файли `server/data/users.json`, `tasks.json`).

## Розробка

```powershell
npm run dev:server
npm run dev:client
```

## Посилання для звіту

| | URL |
|---|-----|
| Додаток | https://bohdan0dyndyn.github.io/TypeScript_Semestr_Project/ |
| Репозиторій | https://github.com/bohdan0dyndyn/TypeScript_Semestr_Project |
