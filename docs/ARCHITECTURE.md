# ARCHITECTURE

## Layered Architecture
```mermaid
graph LR
    subgraph Client
        C1[React UI] --> C2[Axios API calls]
        C2 --> C3[Auth Context]
        C3 --> C4[Protected Routes]
    end
    subgraph Server
        S1[Express] --> S2[Router]
        S2 --> S3[Controller]
        S3 --> S4[Service]
        S4 --> S5[Prisma (MySQL)]
        S4 --> S6[Alert / Stats Service]
        S3 --> S7[Middleware (auth, role, validation)]
    end
    C2 -.-> S2
```

## Client /server responsibilities
- **Client**: UI components, routing, state (AuthContext), API integration, chart rendering.
- **Server**: REST API, business logic, data access, authentication, alert & statistics calculations.

## Folder Structure
```
attendance-tracker/
├─ client/                # React Vite SPA
│  ├─ public/
│  ├─ src/
│  │  ├─ api/            # axios instances & endpoint modules
│  │  ├─ assets/
│  │  ├─ components/     # reusable UI (Navbar, Sidebar, DataTable, Modal, …)
│  │  ├─ charts/         # Chart.js wrapper components
│  │  ├─ context/        # AuthContext
│  │  ├─ hooks/          # custom hooks
│  │  ├─ pages/          # route pages (Login, Faculty, Student)
│  │  ├─ routes/         # AppRoutes with guards
│  │  ├─ styles/         # Tailwind / CSS files
│  │  ├─ utils/          # helpers
│  │  ├─ App.jsx
│  │  └─ main.jsx
│  ├─ .env.example
│  ├─ index.html
│  ├─ package.json
│  └─ vite.config.js
├─ server/                # Express API
│  ├─ prisma/            # Prisma schema + seed
│  ├─ src/
│  │  ├─ config/         # env loader, constants
│  │  ├─ controllers/    # request handlers
│  │  ├─ middleware/     # auth, role, validation, error
│  │  ├─ routes/         # per‑resource routers
│  │  ├─ services/       # business logic (stats, alerts, …)
│  │  ├─ utils/          # ApiError, asyncHandler, JWT helpers
│  │  ├─ validators/     # zod schemas
│  │  ├─ app.js
│  │  └─ server.js
│  ├─ tests/             # jest + supertest
│  ├─ .env.example
│  └─ package.json
├─ docs/                  # Phase‑1 docs (this folder)
├─ postman/               # collection
├─ .github/               # CI workflow
├─ docker‑compose.yml
├─ .gitignore
├─ .editorconfig
├─ package.json           # root scripts
├─ README.md
└─ CLAUDE.md
```

## Auth / RBAC Design
- **JWT** signed with `JWT_SECRET`, expires via `JWT_EXPIRES_IN`.
- `auth` middleware verifies token and attaches `req.user` (id, role).
- `roleGuard` middleware checks `req.user.role` against allowed roles per route.
- `ownership` middleware ensures faculty can only manipulate offerings they own.

## Error Handling
- Central `errorHandler` catches `ApiError` (custom class) and sends `{status, message, details}`.
- Validation errors (zod) translated to 400 responses.

## Configuration & Deployment
| Variable | Description |
|----------|-------------|
| `PORT` | Express listen port |
| `DATABASE_URL` | MySQL connection string |
| `JWT_SECRET` | Secret for signing tokens |
| `JWT_EXPIRES_IN` | e.g. `1h` |
| `CLIENT_URL` | Front‑end origin for CORS |
| `ATTENDANCE_WARN` | 75 |
| `ATTENDANCE_CRITICAL` | 65 |
| `MARKS_LOW` | 40 |

Deploy with Docker‑Compose (MySQL + Adminer + both apps).