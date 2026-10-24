# REQUIREMENTS

## Problem Summary
Build a **Student Attendance and Academic Performance Tracker** for faculty to record attendance, manage internal assessment marks, and enable students to monitor progress.

## Goal
Provide a centralized platform (web SPA + REST API) that supports login, subject/section management, attendance recording, assessment handling, analytics, and alerts.

## Personas
- **Faculty** – creates sections, subjects, offerings; records attendance and marks; views analytics and at‑risk lists.
- **Student** – views personal attendance %, marks, charts, and receives alerts.

## Functional Requirements (FR)
| ID | Description | Acceptance Criteria |
|----|-------------|---------------------|
| FR‑01 | User Authentication | Faculty and Student can login with email/password, receive JWT, and access role‑protected routes. |
| FR‑02 | Manage Sections & Subjects | Faculty can create, read, update, delete sections and subjects via API. |
| FR‑03 | Create Offerings | Faculty can bind a subject to a section and assign themselves as the instructor. |
| FR‑04 | Import Students | Faculty can add students manually or via CSV import. |
| FR‑05 | Record Attendance | Faculty can start a class session, toggle attendance status, submit & lock the session. Locked sessions are read‑only unless reopened. |
| FR‑06 | Manage Assessments | Faculty can create assessments (draft), enter marks, and publish them. Published assessments are visible to students. |
| FR‑07 | Compute Statistics | System calculates attendance % and subject performance % per student automatically. |
| FR‑08 | Alerts & Intervention | System generates alerts (LOW_ATTENDANCE, LOW_MARKS, DECLINING_TREND) and faculty can add remarks. |
| FR‑09 | Student Dashboard | Students see personal stats, charts, alerts, and remarks. |

## Non‑Functional Requirements
- **Performance**: API responses < 300 ms for typical queries.
- **Security**: Passwords hashed with bcrypt, JWT signed, role‑based access control.
- **Scalability**: MySQL 8 with proper indexing; code structured for future horizontal scaling.
- **Usability**: Responsive UI, accessible components, Figma‑ready design.

## User Stories (MoSCoW)
- **Must** – All FR‑01…FR‑09.
- **Should** – Export reports (CSV), email alerts.
- **Could** – Real‑time notifications via WebSocket.
- **Won’t** – Mobile native app in this hackathon.

## Assumptions
- Users have unique email addresses.
- Faculty own only the offerings they create.
- Attendance thresholds are provided via environment variables.

## Constraints
- Stack is fixed (React‑Vite, Node‑Express, MySQL, Prisma, JWT).
- No TypeScript, Redux, or external micro‑services.

## Out‑of‑Scope
- Payment processing, LMS integration, AI‑driven recommendations.
