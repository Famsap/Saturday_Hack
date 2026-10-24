# Project Context & AI Rules

## Core Directives
- **Strict Stack**: React (Vite) + Node.js/Express + MySQL 8 (Prisma ORM).
- **Rule**: NEVER introduce MongoDB, Mongoose, PostgreSQL, or SQLite. Keep it strictly MySQL 8 with Prisma.
- **Rule**: Do NOT use TypeScript, Redux, or microservices unless explicitly commanded.
- **Workflow Architecture**: "Term Lifecycle + Intervention Loop" (Setup -> Class Sessions -> Assessment Cycle -> Analytics -> Intervention Loop).
- **Monorepo Structure**: Two independent packages `/client` and `/server`.
- **Docs as Truth**: Always consult `/docs` for API contracts, database schema, and UI flows.

## Commands
- Install all: `npm run install:all`
- Start dev (concurrently): `npm run dev`
- Run DB migrations: `npm run db:migrate`
- Seed database: `npm run db:seed`
- Run tests: `npm run test`
- Lint code: `npm run lint`

## Seed Credentials
- Faculty: `faculty@demo.com` / `Password@123`
- Student: `student1@demo.com` / `Password@123`
