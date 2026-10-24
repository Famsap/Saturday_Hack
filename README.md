# Attendance Tracker Project

## Overview

**Student Attendance and Academic Performance Tracker** is a web application that enables faculty to record attendance, manage internal assessment marks, and provide students with dashboards to monitor their academic progress. The platform follows a **React (Vite) + Node.js/Express** stack with **MySQL 8** using **Prisma ORM**.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, React Router, Axios, Tailwind CSS, Chart.js (react-chartjs-2) |
| Backend | Node.js, Express, JWT, bcrypt, Prisma (MySQL) |
| Database | MySQL 8 (InnoDB, utf8mb4) |
| DevOps | Docker‑Compose, GitHub Actions, Postman |

## Repository Structure

```
attendance-tracker/
├─ client/                # React SPA
├─ server/                # Express API
├─ docs/                  # Phase‑1 documentation (REQUIREMENTS, WORKFLOW, ...)
├─ postman/               # Postman collection
├─ .github/               # CI workflow
├─ docker-compose.yml
├─ .gitignore
├─ .editorconfig
├─ package.json           # root scripts
├─ README.md              # you are reading it
└─ CLAUDE.md              # AI‑assistant conventions
```

## Setup & Development

1. **Clone the repo**
   ```bash
   git clone <repo-url>
   cd attendance-tracker
   ```
2. **Install all dependencies** (root script installs client & server)
   ```bash
   npm run install:all   # runs `npm ci` in each workspace
   ```
3. **Start MySQL & Adminer** (Docker Compose)
   ```bash
   docker compose up -d mysql adminer
   ```
4. **Run Prisma migrations & seed**
   ```bash
   npm run db:migrate   # creates tables
   npm run db:seed      # inserts demo data (faculty@demo.com / Password@123)
   ```
5. **Run the development servers**
   ```bash
   npm run dev          # concurrently starts client and server
   ```
   - Client: http://localhost:5173
   - Server: http://localhost:3000

## Scripts (root `package.json`)
- `install:all` – install dependencies for client & server.
- `dev` – start both apps with `concurrently`.
- `lint` – run ESLint/Prettier.
- `test` – run Jest tests for both packages.
- `db:migrate` – Prisma migrate.
- `db:seed` – run seed script.

## Environment Variables
See `.env.example` files in `client/` and `server/` for required variables (API URLs, JWT secret, MySQL connection string, thresholds, etc.).

## Documentation
All design docs are in the `docs/` folder:
- `REQUIREMENTS.md`
- `WORKFLOW.md`
- `ARCHITECTURE.md`
- `DATABASE.md`
- `API.md`
- `UI_UX.md`
- `TEAM_PLAN.md`
- `TESTING.md`

## Contributing
- Follow **Conventional Commits** for commit messages.
- Create feature branches (`feature/<name>`).
- Ensure linting and tests pass before opening a PR.
- Update documentation when adding new endpoints or features.

## Demo
After running `npm run dev`, open the browser and log in using the seeded faculty credentials:
- Email: `faculty@demo.com`
- Password: `Password@123`

You can also log in as a student (seeded accounts are listed in the seed script).

---

*The current repository includes only the scaffold and Phase‑1 documentation. Phase‑2 (full project initialization) will be started after approval.*