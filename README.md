# StudentHub — Enterprise Student & Academic Management System

A secure, full-stack enterprise web application for higher-education academic management, built with **Java 21**, **Spring Boot**, **Spring Security & JWT**, **PostgreSQL (Neon)**, **React 19**, and **Vite**.

Designed for production reliability, college project evaluations, technical interviews, and resume demonstration.

---

## 🌐 Live Deployment

- **Frontend Web Application:** [https://student-management-frontend-svvd.onrender.com](https://student-management-frontend-svvd.onrender.com)
- **Backend REST API:** [https://student-management-system-1lff.onrender.com/api/students](https://student-management-system-1lff.onrender.com/api/students)

---

## 🔑 Default Credentials & Role Access

On initial startup, the backend automatically provisions a default administrator account:

| Portal | Username / Email | Default Password | Role | Capabilities |
|---|---|---|---|---|
| **Admin Console** | `admin` | `Admin@123` | `ROLE_ADMIN` | Full student management, department & curriculum administration, attendance logging, marks entry, and analytics reporting. |
| **Student Portal** | Created by Admin | Set by Admin (default: `Student@123`) | `ROLE_STUDENT` | View personal profile, enrolled courses, attendance records, exam results & report cards, and change account password. |

> **Security Note:** In production, default credentials should be updated immediately or overridden using the `ADMIN_DEFAULT_PASSWORD` environment variable.

---

## ✨ Features & Architecture Highlights

### 1. Security & Authentication Architecture
- **JWT-Based Stateless Authentication:** Tokens issued upon verified authentication containing claims (`username`, `role`, `studentId`).
- **Role-Based Access Control (RBAC):** Strict authorization separation between `ROLE_ADMIN` and `ROLE_STUDENT` using Spring Security filter chains and `@PreAuthorize` method security.
- **BCrypt Password Hashing:** All credentials salted and encrypted via `BCryptPasswordEncoder`.
- **IDOR Prevention:** Student endpoints enforce student ID resolution directly from the verified JWT claims (`UserDetailsImpl`), guaranteeing students can never access or modify other students' records.
- **Centralized Exception Handling:** Uniform JSON responses for validation errors, bad credentials, forbidden access, and conflict conditions.

### 2. Administrator Dashboard
- **Executive Overview:** Real-time counters for students, active departments, curriculum subjects, and institutional attendance rate.
- **Department Distribution:** Visual breakdown of student enrollment share per department.
- **Student Roster Management:** Search by name/email/ID, filter by department and academic year, edit records, view detailed profiles, and generate student login credentials.
- **Department Management:** Add/edit engineering branches with deletion safety guards (blocks deletion if active students or courses are attached).
- **Curriculum & Subject Management:** Define course codes, titles, credit weightings (1-6), and semester allocations.
- **Session Attendance Tracking:** Select date and subject to record daily attendance (`PRESENT`, `ABSENT`, `LATE`) with anti-duplicate constraints for the same student/subject/date.
- **Marks & Examination Grading:** Log evaluation scores against maximum marks with **instant automatic letter grade calculation** ($A+, A, B+, B, C, F$).
- **Academic Analytics & Reports:** Department metrics and **1-click CSV Export** of student rosters for university administration.

### 3. Student Self-Service Portal
- **Personalized Academic Hub:** Instant overview of academic year, department, roll ID, enrolled subjects count, and overall GPA standing.
- **My Courses:** Detailed card view of all enrolled subjects, semester schedules, and credit hours.
- **My Attendance Record:** Session-by-session class attendance logs with automatic attendance percentage calculations and shortage warnings ($<75\%$).
- **My Report Card:** Official academic grade sheet displaying exam categories, marks obtained, percentage scores, and calculated grades.
- **Profile & Security Settings:** Update permitted personal details (e.g., display name) and securely change login passwords.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 8, Modern Vanilla CSS Design System, Responsive Layouts |
| **Backend** | Java 21, Spring Boot, Spring Security, Spring Data JPA, Hibernate ORM |
| **Authentication** | JSON Web Tokens (`jjwt 0.12.6`), BCrypt Password Encryption |
| **Database** | PostgreSQL hosted on Neon Cloud |
| **Containerization** | Multi-stage Dockerfile (`eclipse-temurin:21`) |
| **Hosting & CI/CD** | Render (Web Service & Static Site), GitHub Actions / Webhooks |

---

## 🗄️ Database Entity Relationship Model

```text
       ┌───────────────┐                  ┌──────────────────┐
       │     users     │ 1 ──────────── 0..1 │    students      │
       ├───────────────┤                  ├──────────────────┤
       │ id (PK)       │                  │ id (PK)          │
       │ username (UQ) │                  │ name             │
       │ email (UQ)    │                  │ email (UQ)       │
       │ password_hash │                  │ department       │ (string)
       │ role          │                  │ department_id(FK)│──────┐
       │ active        │                  │ year (1-4)       │      │
       │ user_id (FK)  │◄─────────────────┤ user_id (FK)     │      │
       └───────────────┘                  └────────┬─────────┘      │
                                                   │                │
                        ┌──────────────────────────┼──────────────┐ │
                        │ 1                        │ 1            │ │
                        ▼ *                        ▼ *            │ │
               ┌────────────────┐         ┌────────────────┐      │ │
               │   attendance   │         │     marks      │      │ │
               ├────────────────┤         ├────────────────┤      │ │
               │ id (PK)        │         │ id (PK)        │      │ │
               │ student_id(FK) │         │ student_id(FK) │      │ │
               │ subject_id(FK) │         │ subject_id(FK) │      │ │
               │ date           │         │ exam_type      │      │ │
               │ status         │         │ marks_obtained │      │ │
               │ remarks        │         │ max_marks      │      │ │
               └───────┬────────┘         │ grade          │      │ │
                       │                  └────────┬───────┘      │ │
                       │ *                         │ *            │ │
                       └───────────┬───────────────┘              │ │
                                   │                              │ │
                                   ▼ *                            ▼ 1
                          ┌────────────────┐             ┌────────────────┐
                          │    subjects    │ * ──────── 1│  departments   │
                          ├────────────────┤             ├────────────────┤
                          │ id (PK)        │             │ id (PK)        │
                          │ code (UQ)      │             │ code (UQ)      │
                          │ name           │             │ name           │
                          │ credits        │             │ description    │
                          │ semester (1-8) │             └────────────────┘
                          │ dept_code      │
                          └────────────────┘
```

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Authenticates user; returns JWT token, user info, role, and studentId |
| `GET` | `/api/auth/me` | Authenticated | Returns current authenticated profile |
| `POST` | `/api/auth/change-password` | Authenticated | Updates user password with validation |
| `POST` | `/api/auth/students/{studentId}/create-account` | `ADMIN` | Generates a student portal login account |

### Student Management (`/api/students`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/students` | `ADMIN`, `STUDENT` | Retrieve student roster |
| `GET` | `/api/students/{id}` | `ADMIN`, `STUDENT` | Retrieve student by ID |
| `POST` | `/api/students` | `ADMIN` | Register a new student |
| `PUT` | `/api/students/{id}` | `ADMIN` | Update student details |
| `DELETE` | `/api/students/{id}` | `ADMIN` | Delete student record |

### Departments (`/api/departments`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/departments` | Authenticated | List all academic departments |
| `POST` | `/api/departments` | `ADMIN` | Create a new department |
| `PUT` | `/api/departments/{id}` | `ADMIN` | Update department information |
| `DELETE` | `/api/departments/{id}` | `ADMIN` | Safe delete (blocks if students/courses enrolled) |

### Courses & Subjects (`/api/subjects`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/subjects` | Authenticated | List subjects (optional `?department=CSE`) |
| `POST` | `/api/subjects` | `ADMIN` | Create course/subject |
| `PUT` | `/api/subjects/{id}` | `ADMIN` | Update course details |
| `DELETE` | `/api/subjects/{id}` | `ADMIN` | Delete course record |

### Attendance (`/api/attendance`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/attendance` | `ADMIN` | Filter by `studentId`, `subjectId`, or `date` |
| `GET` | `/api/attendance/summary/{studentId}` | Authenticated | Get student attendance % and breakdown |
| `POST` | `/api/attendance` | `ADMIN` | Record or update daily attendance |
| `DELETE` | `/api/attendance/{id}` | `ADMIN` | Remove an attendance log entry |

### Marks & Grades (`/api/marks`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/marks` | `ADMIN` | Filter by `studentId` or `subjectId` |
| `POST` | `/api/marks` | `ADMIN` | Enter exam marks with auto grading |
| `PUT` | `/api/marks/{id}` | `ADMIN` | Update marks record |
| `DELETE` | `/api/marks/{id}` | `ADMIN` | Delete marks record |

### Academic Reports (`/api/reports`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/reports/summary` | `ADMIN` | Institution-wide analytics |
| `GET` | `/api/reports/department-stats` | `ADMIN` | Department student & course counts |
| `GET` | `/api/reports/students/csv` | `ADMIN` | Export student roster as CSV file |

### Student Portal (`/api/student-portal`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/student-portal/profile` | `STUDENT` | View authenticated student profile |
| `PUT` | `/api/student-portal/profile` | `STUDENT` | Update permitted profile fields |
| `GET` | `/api/student-portal/subjects` | `STUDENT` | View subjects enrolled for department |
| `GET` | `/api/student-portal/attendance` | `STUDENT` | View attendance logs and percentage |
| `GET` | `/api/student-portal/marks` | `STUDENT` | View official exam scores and report card |

---

## ⚙️ Environment Variables

Configure the following environment variables on Render or locally:

| Variable | Description | Example / Default |
|---|---|---|
| `DB_URL` | PostgreSQL JDBC Connection String | `jdbc:postgresql://<neon-host>/student_management?sslmode=require` |
| `DB_USERNAME` | Database username | `neondb_owner` |
| `DB_PASSWORD` | Database password | `<your-neon-password>` |
| `JWT_SECRET` | Secret key used to sign JWTs (min 256 bits) | `<long-random-secret-key>` |
| `JWT_EXPIRATION_MS` | JWT validity duration in ms | `86400000` (24 Hours) |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed frontend origins | `http://localhost:5173,https://student-management-frontend-svvd.onrender.com` |
| `ADMIN_DEFAULT_PASSWORD` | Password for seeded `admin` account | `Admin@123` |
| `VITE_API_URL` *(Frontend)* | Base URL pointing to Spring Boot backend | `https://student-management-system-1lff.onrender.com` |

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Java 21 JDK**
- **Node.js 18+ & npm**
- **PostgreSQL Database** (or free [Neon.tech](https://neon.tech) cloud database)
- **Git**

### 2. Backend Setup
Navigate to `student-management-system`:
```powershell
# Set environment variables in Windows PowerShell
$env:DB_URL="jdbc:postgresql://localhost:5432/student_management"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="your_password"

# Run tests
.\mvnw.cmd test

# Start the Spring Boot backend
.\mvnw.cmd spring-boot:run
```
Backend will be live at `http://localhost:8080`.

### 3. Frontend Setup
In a separate terminal, navigate to `student-management-system/frontend`:
```powershell
npm install
npm run dev
```
Open Vite dev server at `http://localhost:5173`.

---

## 🧪 Testing

The backend includes a comprehensive suite of unit and integration tests covering:
- JWT token generation, claim extraction, and expiration validation.
- Spring Security authentication and BadCredentials handling.
- Department safety constraints preventing deletion of populated departments.
- Daily attendance logging and duplicate record prevention.
- Exam marks scoring and grading policy boundary calculation.

Run the test suite with:
```powershell
.\mvnw.cmd test
```

---

## 👨‍💻 Author

**Prashanth**  
GitHub: [@Prashanthpower](https://github.com/Prashanthpower)
