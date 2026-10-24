# WORKFLOW

## 5‑Stage Term Lifecycle

1. **Setup (once per term)**
   - Faculty creates **Section**, **Subject**, and an **Offering** (Subject + Section + Faculty).
   - Students are added manually or imported via CSV.

2. **Class Sessions (every class)**
   - From the *Subject Hub* a faculty member creates a session (`date`, `period`, `topic`).
   - Attendance sheet defaults to **PRESENT** for all enrolled students. Faculty toggles **ABSENT** or **LATE**.
   - Click **Submit & Lock** → session status becomes `LOCKED`. Locked sessions are read‑only unless reopened.

3. **Assessment Cycle**
   - Faculty creates an assessment in **DRAFT** (type IA/ASSIGNMENT/QUIZ, `max_marks`).
   - Marks are entered per student; `NULL` denotes absent.
   - **Publish** → status `PUBLISHED`. Only published assessments are visible to students and counted in stats.

4. **Analytics (automatic)**
   - On every lock/publish the engine recalculates:
     - **Attendance %** = (PRESENT + LATE) / total `LOCKED` sessions × 100.
     - **Subject Performance %** = Σ(obtained) / Σ(max) over published assessments where the student wasn't absent.
     - **Classes Needed** – minimal future sessions required to reach the attendance warning threshold.

5. **Intervention Loop**
   - **Alert Engine** generates:
     - `LOW_ATTENDANCE` (< ATTENDANCE_WARN = 75 % warning, < ATTENDANCE_CRITICAL = 65 % critical).
     - `LOW_MARKS` (performance % < MARKS_LOW = 40 %).
     - `DECLINING_TREND` (two consecutive assessments each lower than the previous).
   - Faculty sees an **At‑Risk** list per offering and can add **Remarks**.
   - Students view alerts and remarks on their dashboard.

## Role‑Wise Journeys
- **Faculty**: Login → My Subjects → Choose Offering → *Subject Hub* (Overview → Sessions → Assessments → Insights) → Record attendance/marks → Review analytics → Add remarks.
- **Student**: Login → Dashboard → Subject cards → Attendance & marks charts → Alerts panel.

## Mermaid Diagrams
```mermaid
flowchart TD
    L[Login] -->|faculty| S[My Subjects]
    L -->|student| D[Dashboard]
    S --> H[Subject Hub]
    H --> O[Overview]
    H --> SE[Sessions]
    H --> A[Assessments]
    H --> I[Insights]
    SE --> CS[Create Session]
    CS --> AT[Toggle Attendance]
    AT --> Lk[Lock Session]
    A --> Cr[Create Draft]
    Cr --> Mk[Enter Marks]
    Mk --> Pub[Publish]
    Lk --> ST[Stats Engine]
    Pub --> ST
    ST --> AL[Alert Engine]
    AL --> AR[At‑Risk List]
    AR --> RM[Add Remark]
    RM --> D
    D --> ST
```

```mermaid
sequenceDiagram
    participant Faculty
    participant UI
    participant API
    participant DB

    Faculty->>UI: Open Subject Hub
    UI->>API: GET /api/offerings/:id
    API->>DB: SELECT offering, students
    DB-->>API: data
    API-->>UI: offering data

    Faculty->>UI: Start Session (date, period, topic)
    UI->>API: POST /api/offerings/:id/sessions
    API->>DB: INSERT class_session (status=OPEN)
    DB-->>API: sessionId
    API-->>UI: sessionId

    Faculty->>UI: Toggle ABSENT for student X
    UI->>API: PUT /api/sessions/:sid/attendance [{studentId, status}]
    API->>DB: UPSERT attendance rows
    DB-->>API: OK
    API-->>UI: updated sheet

    Faculty->>UI: Submit & Lock
    UI->>API: PUT /api/sessions/:sid/lock
    API->>DB: UPDATE class_session SET status='LOCKED'
    DB-->>API: OK
    API-->>UI: locked confirmation

    Faculty->>UI: Create Assessment (draft)
    UI->>API: POST /api/offerings/:id/assessments
    API->>DB: INSERT assessment (status=DRAFT)
    DB-->>API: assessmentId
    API-->>UI: draft created

    Faculty->>UI: Enter marks
    UI->>API: PUT /api/assessments/:aid/marks (bulk)
    API->>DB: UPSERT marks rows
    DB-->>API: OK
    API-->>UI: saved

    Faculty->>UI: Publish
    UI->>API: POST /api/assessments/:aid/publish
    API->>DB: UPDATE assessment SET status='PUBLISHED'
    DB-->>API: OK
    API-->>UI: published

    API->>DB: CALL statsService (attendance %, performance %)
    API->>DB: CALL alertService (generate alerts)
    DB-->>API: stats & alerts
    API-->>UI: refreshed overview

    Student->>UI: Login → Dashboard
    UI->>API: GET /api/me/dashboard
    API->>DB: SELECT stats, alerts, remarks
    DB-->>API: data
    API-->>UI: dashboard payload
```

## Business Rules & Edge Cases
- **Re‑opening a locked session** – Faculty can POST `/api/sessions/:sid/reopen` to set status back to `OPEN`.
- **Absent vs. Zero** – Marks `NULL` means absent; `0` is a valid score.
- **Mid‑term student addition** – New student rows are auto‑included in future session attendance and assessment marks; historic stats treat missing rows as `ABSENT`.
- **Late attendance** – Counted as present for % calculation.
- **Thresholds** – Configurable via env (`ATTENDANCE_WARN`, `ATTENDANCE_CRITICAL`, `MARKS_LOW`).

---

*All documents in Phase 1 are meant to be the single source of truth for subsequent development.*