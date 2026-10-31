# 🚀 Brightloop - Team Setup Guide

Welcome to the **Brightloop Odoo Hackathon 2026** project! Follow this step-by-step guide after pulling the repository to get your local development environment fully up and running.

---

## 📋 Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **npm**: `v10.x` or later
- **Git**

---

## ⚡ Quick Start (After `git pull`)

### 1. Pull the Latest Code
```bash
git checkout <your-branch>
git pull origin <your-branch>
```

---

### 2. Install All Dependencies

From the repository root, install dependencies for the root, frontend, and backend:

```bash
# 1. Install root dependencies (concurrently, etc.)
npm install

# 2. Install frontend dependencies (React, Vite, Tailwind v4, shadcn/ui)
cd frontend
npm install
cd ..

# 3. Install backend dependencies (Express, Prisma, Neon adapter, etc.)
cd backend
npm install
cd ..
```

> **PowerShell one-liner from root:**
> ```powershell
> npm install; npm --prefix frontend install; npm --prefix backend install
> ```

---

### 3. Configure Environment Variables

#### A. Backend Environment (`backend/.env`)
Create a `.env` file inside the `backend/` directory by copying the example:

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and ensure the values match the team Neon PostgreSQL database:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173


# Authentication
JWT_SECRET=brightloop_odoo_hackathon_super_secret_jwt_2026
JWT_EXPIRES_IN=1d
```

> ⚠️ **Important**: Never commit `backend/.env` to GitHub. It is already included in `.gitignore`.

#### B. Frontend Environment (`frontend/.env`)
Ensure `frontend/.env` exists with the following configuration:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

---

### 4. Initialize Database & Prisma Client

Inside the `backend/` directory, generate the Prisma Client:

```bash
cd backend
npx prisma generate
```

*(Optional)* If new models have been added to `backend/prisma/schema.prisma`, sync them with Neon:
```bash
npx prisma db push
```

To visually inspect and manage database tables and records:
```bash
npx prisma studio
```
*(Runs at `http://localhost:5555`)*

---

### 5. Run the Application

From the **repository root**, run both frontend and backend concurrently:

```bash
npm run dev
```

Or run them individually in separate terminals:
- **Frontend only**: `npm run dev:frontend`
- **Backend only**: `npm run dev:backend`

---

## 🔍 Verification Checklist

Open your browser and verify:

1. **Backend Health Check**:
   - URL: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)
   - Expected Response:
     ```json
     {
       "success": true,
       "message": "Brightloop API is running",
       "database": "connected"
     }
     ```

2. **Frontend Application**:
   - URL: [http://localhost:5173](http://localhost:5173)
   - Vite React dashboard loads with Tailwind styling.

3. **Production Build Check**:
   - From the repository root, verify that both apps build cleanly:
     ```bash
     npm run build
     ```

---

## 📂 Project Architecture

```text
brightloop_odoo_subscription_system/
├── frontend/                     # React 19 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui
│   ├── src/
│   │   ├── components/ui/        # shadcn components (button, card, dialog, table, etc.)
│   │   ├── features/             # Business modules (auth, subscriptions, invoices, etc.)
│   │   ├── services/api.ts       # Axios instance with baseURL & credentials
│   │   └── index.css             # Tailwind v4 import & OKLCH color theme variables
│   ├── .env                      # Frontend env (VITE_API_URL)
│   └── vite.config.ts            # Vite config with '@/' path alias & Tailwind v4 plugin
│
├── backend/                      # Express + TypeScript + Prisma + Neon Serverless
│   ├── src/
│   │   ├── config/prisma.ts      # Singleton PrismaClient using @prisma/adapter-neon + ws
│   │   ├── app.ts                # Express app setup, CORS, Helmet, health endpoint
│   │   ├── server.ts             # Server entry point
│   │   └── modules/              # Backend domain logic (subscriptions, payments, etc.)
│   ├── prisma/
│   │   └── schema.prisma         # Prisma schema with pooled runtime & direct migration URLs
│   ├── .env                      # Backend env (DATABASE_URL, DIRECT_URL, JWT_SECRET)
│   └── .env.example              # Template for environment variables
│
├── docs/                         # Technical documentation & architecture designs
├── setup.md                      # This onboarding guide
└── package.json                  # Root runner (npm run dev, npm run build)
```

---

## 🛠️ Common Troubleshooting

### 1. `DATABASE_URL is not configured`
Ensure `backend/.env` exists and contains valid `DATABASE_URL` and `DIRECT_URL` connection strings.

### 2. WebSocket Connection Error with Neon
In Node.js, Neon's serverless connection pooler requires the `ws` package. This is already configured in `backend/src/config/prisma.ts` via `neonConfig.webSocketConstructor = ws;`. Ensure `npm install` was run inside `backend/`.

### 3. Port Already in Use (5000 or 5173)
- Kill the process holding port 5000:
  ```powershell
  # PowerShell
  Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess -Force
  ```
- Or change the `PORT` variable in `backend/.env` and update `frontend/.env` accordingly.

### 4. TypeScript Alias (`@/*`) Not Found
The path alias `@/*` maps to `./src/*`. Ensure your editor is using the workspace TypeScript version.

