# TEAM_PLAN

## Team Composition (3 members)
| Member | Primary Focus | Secondary Tasks |
|--------|---------------|-----------------|
| **Alice** (Backend Engineer) | DB schema, Prisma models, server services (stats, alerts), auth & RBAC, seed data | Write unit tests, write API docs, CI config |
| **Bob** (Frontend Engineer) | React component hierarchy, routing, AuthContext, UI layout, Tailwind setup | Implement chart components, integrate API calls, responsive design |
| **Carol** (Full‑stack / DevOps) | Postman collection, CI pipeline, Docker Compose, documentation, integration testing | Assist with any missing frontend/back‑end pieces, demo script |

## 2‑Day Sprint Plan (Weekend Hackathon)
### Day 1 – Morning (3 h)
1. **Project scaffold** – run `npm run init` (root script) to generate monorepo, install deps.
2. **Backend base** – set up Prisma schema, migrate, seed (Alice).
3. **Auth** – JWT login + `/me` endpoint (Alice).
4. **Frontend auth** – login page, AuthContext, protected routes (Bob).

### Day 1 – Afternoon (3 h)
5. **Section / Subject CRUD** – API endpoints + basic UI forms (Alice + Bob).
6. **Offering & Student import** – CSV parser backend, UI upload component (Alice + Bob).
7. **Write docs** – update API.md, DB.md with actual endpoints (Carol).

### Day 2 – Morning (3 h)
8. **Class Sessions** – create/lock session API, attendance sheet UI (Alice + Bob).
9. **Assessments** – draft/create, marks entry UI, publish endpoint (Alice + Bob).
10. **Stats Service** – attendance % & performance % calculations (Alice).

### Day 2 – Afternoon (3 h)
11. **Alert Service** – generate alerts, at‑risk list (Alice).
12. **Charts** – integrate `react-chartjs-2` components with dummy data (Bob).
13. **Postman collection** – import all endpoints, add auth scripts (Carol).
14. **CI / Docker** – GitHub Actions workflow, docker‑compose up, ensure tests pass (Carol).

### End of Hackathon – Demo Prep (30 min)
- Run `npm run dev` – both client & server.
- Show login flow for faculty and student.
- Demonstrate start session → lock → attendance stats.
- Show assessment draft → publish → performance chart.
- Highlight alert panel and at‑risk remarks.

## Git Branching & Commit Conventions
- **main** – stable, always buildable.
- **feature/<name>** – each feature branch (e.g., `feature/auth`, `feature/sessions`).
- Commits follow **Conventional Commits**:
  - `feat: add login endpoint`
  - `chore: install prisma client`
  - `docs: update API documentation`
  - `test: add statsService unit tests`

## PR Checklist
- [ ] Lint passes (`npm run lint`).
- [ ] Tests pass (`npm test`).
- [ ] Docs updated (`README.md` links).
- [ ] CI passes.

## Definition of Done (per feature)
1. API endpoint implemented with validation & error handling.
2. Prisma schema updated & migration applied.
3. Frontend page/component consumes the endpoint.
4. Unit / integration test covering happy path & error case.
5. Docs (API, DB, UI) reflect the new feature.

## 5‑Minute Demo Script
1. Open browser → login as faculty (`faculty@demo.com`).
2. Navigate to **My Subjects**, open a Subject Hub.
3. Start a class session, toggle a few absences, lock it.
4. Create an assessment, enter marks, publish.
5. Switch to student view, observe updated attendance %, performance chart, and alerts.
6. Show at‑risk list for faculty, add a remark, verify it appears on student dashboard.

---

*This plan aligns with the Phase‑1 documentation and provides a clear division of work to deliver a functional MVP by the end of the weekend.*