# API

## Authentication
| Method | Path | Role | Request Body | Response |
|--------|------|------|--------------|----------|
| POST | `/api/auth/login` | PUBLIC | `{ "email": "string", "password": "string" }` | `{ "token": "jwt", "user": { "id": number, "name": "string", "role": "FACULTY|STUDENT" }}` |
| GET | `/api/auth/me` | FACULTY/STUDENT | Header `Authorization: Bearer <token>` | User profile (same shape as above) |
| POST | `/api/auth/change-password` | FACULTY/STUDENT | `{ "oldPassword": "string", "newPassword": "string" }` | `{ "message": "Password updated" }` |

## Sections
| Method | Path | Role | Request | Response |
|--------|------|------|---------|----------|
| GET | `/api/sections` | FACULTY | – | `[{id, name, semester, academic_year}]` |
| POST | `/api/sections` | FACULTY | `{ name, semester, academic_year }` | created object |
| GET | `/api/sections/:id` | FACULTY | – | single object |
| PUT | `/api/sections/:id` | FACULTY | same as POST | updated object |
| DELETE | `/api/sections/:id` | FACULTY | – | `{ message: "deleted" }` |

## Subjects
| Method | Path | Role | Request | Response |
|--------|------|------|---------|----------|
| GET | `/api/subjects` | FACULTY | – | list |
| POST | `/api/subjects` | FACULTY | `{ code, name, credits }` | created |
| GET | `/api/subjects/:id` | FACULTY | – | object |
| PUT | `/api/subjects/:id` | FACULTY | same as POST | updated |
| DELETE | `/api/subjects/:id` | FACULTY | – | `{ message: "deleted" }` |

## Offerings (Subject Hub)
| Method | Path | Role | Request | Response |
|--------|------|------|---------|----------|
| GET | `/api/offerings` | FACULTY | – | list of offerings belonging to faculty |
| POST | `/api/offerings` | FACULTY | `{ subjectId, sectionId }` | created offering |
| GET | `/api/offerings/:id` | FACULTY | – | offering detail (subject, section, students) |
| PUT | `/api/offerings/:id` | FACULTY | `{ subjectId?, sectionId? }` | updated |
| DELETE | `/api/offerings/:id` | FACULTY | – | `{ message:"deleted" }` |

## Students
| Method | Path | Role | Request | Response |
|--------|------|------|---------|----------|
| GET | `/api/students` | FACULTY | – | list |
| POST | `/api/students` | FACULTY | `{ name, email, usn, sectionId }` | created |
| POST | `/api/students/import` | FACULTY | multipart/form-data `file` (CSV) | `{ inserted: n, errors: [] }` |
| GET | `/api/students/:id` | FACULTY | – | object |
| PUT | `/api/students/:id` | FACULTY | same as POST | updated |
| DELETE | `/api/students/:id` | FACULTY | – | `{ message:"deleted" }` |

## Class Sessions & Attendance
| Method | Path | Role | Request | Response |
|--------|------|------|---------|----------|
| POST | `/api/offerings/:id/sessions` | FACULTY | `{ date, period, topic }` | created session (status OPEN) |
| GET | `/api/offerings/:id/sessions` | FACULTY | – | list of sessions |
| GET | `/api/sessions/:sid/sheet` | FACULTY | – | `{ students: [{id, name, status}] }` |
| PUT | `/api/sessions/:sid/attendance` | FACULTY | `[{ studentId, status }]` | `{ message:"attendance saved" }` |
| PUT | `/api/sessions/:sid/lock` | FACULTY | – | `{ message:"locked" }` |
| POST | `/api/sessions/:sid/reopen` | FACULTY | – | `{ message:"opened" }` |

## Assessments & Marks
| Method | Path | Role | Request | Response |
|--------|------|------|---------|----------|
| POST | `/api/offerings/:id/assessments` | FACULTY | `{ title, type, max_marks, conducted_on }` | created (status DRAFT) |
| GET | `/api/offerings/:id/assessments` | FACULTY | – | list |
| PUT | `/api/assessments/:aid` | FACULTY | same as POST (allows edit while DRAFT) | updated |
| DELETE | `/api/assessments/:aid` | FACULTY | – | `{ message:"deleted" }` |
| POST | `/api/assessments/:aid/publish` | FACULTY | – | `{ message:"published" }` |
| GET | `/api/assessments/:aid/marks` | FACULTY | – | list of marks |
| PUT | `/api/assessments/:aid/marks` | FACULTY | `[{ studentId, marks_obtained }]` (bulk) | `{ message:"saved" }` |

## Stats & Dashboard
| Method | Path | Role | Request | Response |
|--------|------|------|---------|----------|
| GET | `/api/me/dashboard` | STUDENT | – | `{ attendancePct, performancePct, alerts, remarks }` |
| GET | `/api/offerings/:id/stats` | FACULTY | – | `{ attendanceAvg, performanceAvg, atRiskCount }` |
| GET | `/api/offerings/:id/at-risk` | FACULTY | – | list of student ids + alerts |

## Remarks
| Method | Path | Role | Request | Response |
|--------|------|------|---------|----------|
| GET | `/api/students/:id/remarks` | FACULTY | – | list |
| POST | `/api/students/:id/remarks` | FACULTY | `{ note }` | created remark |

## Errors (common)
- **401 Unauthorized** – missing/invalid JWT.
- **403 Forbidden** – role or ownership violation.
- **404 Not Found** – resource does not exist.
- **400 Bad Request** – validation error, includes `details` array.

All responses follow `{ success: true, data: ..., message?: string }` convention for consistency.
