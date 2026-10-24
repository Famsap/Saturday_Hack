# TESTING

## Test Strategy
- **Unit Tests** – focus on pure functions in `services/` (statsService, alertService) and utility helpers.
- **Integration Tests** – use `supertest` against the Express app for auth, CRUD endpoints, session/attendance flow.
- **End‑to‑End (Manual)** – run the full stack, login as faculty and student, verify UI updates via Cypress (optional for stretch).

## Test Cases (selected)
### Auth
| Test | Description |
|------|-------------|
| `login_success` | Valid credentials return JWT and user object. |
| `login_failure` | Wrong password returns 401. |
| `me_authorized` | Valid JWT returns correct user profile. |
| `me_unauthorized` | Missing/invalid token returns 401. |

### Sections & Subjects
| Test | Description |
|------|-------------|
| `create_section` | POST creates a section, returns 201 and object with unique constraint handling. |
| `update_section_invalid` | PUT with missing fields returns 400 validation error. |
| `delete_subject` | DELETE removes subject, subsequent GET returns 404. |

### Offerings
| Test | Description |
|------|-------------|
| `create_offering_owned` | Faculty can create offering linking to own subjects/sections. |
| `ownership_violation` | Faculty cannot edit offering they don't own – 403. |

### Class Sessions & Attendance
| Test | Description |
|------|-------------|
| `start_session` | POST creates session with status `OPEN`. |
| `lock_session` | PUT /lock changes status to `LOCKED` and triggers stats recompute. |
| `reopen_session` | POST /reopen changes back to `OPEN`. |
| `attendance_bulk_save` | PUT attendance updates multiple rows, respects enum values. |

### Assessments & Marks
| Test | Description |
|------|-------------|
| `create_assessment_draft` | POST creates assessment with status `DRAFT`. |
| `publish_assessment` | POST /publish switches to `PUBLISHED` and triggers alert generation. |
| `marks_null_absent` | Marks `null` accepted, `0` accepted, >max rejected (400). |

### Stats & Alerts
| Test | Description |
|------|-------------|
| `attendance_percentage` | Service returns correct % based on locked sessions. |
| `performance_percentage` | Service calculates correctly ignoring absent (`null`). |
| `alert_low_attendance` | Generates `LOW_ATTENDANCE` when below env threshold. |
| `alert_declining_trend` | Detects two consecutive decreasing marks. |

## Running Tests
```bash
# From root
npm run test          # runs jest for both client and server (via workspaces)
npm run test:watch    # watch mode during development
```

## CI Integration
GitHub Actions workflow (`.github/workflows/ci.yml`) runs:
1. Install deps (`npm ci`).
2. Start MySQL container (`docker compose up -d mysql`).
3. Run Prisma migrate & seed.
4. Execute `npm run lint`.
5. Execute `npm test`.
All steps must pass for a PR to be merged.

---

*Documentation of tests is kept in sync with the actual test files under `server/tests/`. Update both when adding new features.*