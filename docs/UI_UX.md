# UI_UX

## Page Map
| Route | Component | Description |
|-------|-----------|-------------|
| `/login` | `Login.jsx` | Email/password login, redirects based on role. |
| `/faculty` | `MySubjects.jsx` | Cards showing each offering (subject, section, attendance avg, performance avg, at‑risk count). |
| `/faculty/setup` | `Setup.jsx` (tabs) | Manage Sections, Subjects, Offerings, Students (manual + CSV). |
| `/faculty/offerings/:id` | `SubjectHub.jsx` (tabs) | Overview, Sessions, Assessments, Insights. |
| `/faculty/offerings/:id/sessions` | `AttendanceSheet.jsx` | Grid of students with attendance toggles, Submit & Lock button. |
| `/faculty/offerings/:id/assessments` | `MarksGrid.jsx` | Draft assessment list, bulk marks entry, Publish action. |
| `/faculty/offerings/:id/insights` | `Insights.jsx` | Charts, at‑risk table, remarks modal. |
| `/student` | `StudentDashboard.jsx` | Tiles for overall attendance, performance, alerts list. |
| `/student/subjects/:offeringId` | `SubjectDetail.jsx` | Attendance timeline, marks table, "classes needed" calculator, alerts. |
| `*` | `NotFound.jsx` | 404 page. |

## Component Breakdown
- **Common UI**: `Navbar`, `Sidebar` (role‑aware links), `DataTable` (sortable, pagination), `Modal` (generic), `AlertBanner` (color‑coded), `Loader`, `Tabs`, `ProtectedRoute`.
- **Chart Components** (wrapper around `react-chartjs-2`):
  - `AttendanceDoughnut.jsx` – doughnut showing PRESENT vs ABSENT vs LATE.
  - `PerformanceBar.jsx` – bar per subject performance %.
  - `MarksTrendLine.jsx` – line chart of marks across assessments.
  - `ClassAvgCompare.jsx` – bar comparing class average vs student.

## Wireframe Descriptions
- **Login**: centered form, email & password fields, submit button, error toast.
- **MySubjects (Faculty)**: responsive grid of cards (subject code, section, avg attendance % badge, avg performance % badge, at‑risk count badge). Clicking a card navigates to Subject Hub.
- **Setup Tabs**: four tabs – Sections, Subjects, Offerings, Students. Each tab contains a list table with Add/Edit/Delete actions. Student tab includes CSV upload button.
- **Subject Hub Tabs**:
  - *Overview*: summary stats, quick actions, recent alerts.
  - *Sessions*: list of sessions + "Start Session" button → opens AttendanceSheet modal.
  - *Assessments*: list of assessments (draft/published) + create button → opens MarksGrid.
  - *Insights*: charts (above) + at‑risk table with Remark button.
- **AttendanceSheet**: table rows = students, columns = status toggle (radio icons). Footer shows counts and Submit/Lock.
- **MarksGrid**: similar table, editable numeric inputs, validation (0–max), Save button, Publish button.
- **Student Dashboard**: top row tiles (attendance %, performance %, alerts count), below row of subject cards (subject name, doughnut, bar). Alerts panel shows colour‑coded badges.

## Chart Specs
- **AttendanceDoughnut**: data = [presentCount, lateCount, absentCount]; colors = green, orange, red.
- **PerformanceBar**: X‑axis = subjects, Y‑axis = performance % (0‑100). Tooltip shows exact %.
- **MarksTrendLine**: X‑axis = assessment dates, Y‑axis = marks; separate line per student (optional) or just student vs class avg.
- **ClassAvgCompare**: grouped bar, two bars per assessment (class avg, student).

## Responsive Rules
- Mobile: side navigation collapses to hamburger, tables become vertical cards.
- Desktop: grid layout, fixed sidebar width 240 px.

## Figma Hand‑off Checklist
- Export component dimensions & spacing tokens.
- Provide colour palette (primary, success, warning, error).
- Document interaction states (hover, disabled, loading).
- Share SVG icons for attendance statuses.

---

*All UI/UX specifications are aligned with the docs in Phase 1 and will guide component implementation.*