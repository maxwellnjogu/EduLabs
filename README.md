# EduLabs — Secure AI-Assisted University Learning & Mini SOC Platform

EduLabs is a university learning and cybersecurity hackathon platform integrating modular student interactive labs, authoritative server grading, lecturer curriculum management, and a real-time threat-detection Security Operations Center (Mini SOC).

## Quick Start Guide

### 1. Backend Setup & Demo Seeding
```powershell
cd C:\Users\Administrator\EduLabs\backend

# Activate virtual environment
.venv\Scripts\activate

# Run database migrations
python manage.py migrate

# Seed institutions, semester, 7 units, users, Lab 1, revision items, and SOC alerts
python manage.py seed_demo

# Run automated tests
python manage.py test tests.test_edulabs_core

# Start backend server
python manage.py runserver 0.0.0.0:8000
```
Backend API will be accessible at: `http://127.0.0.1:8000/`

### 2. Frontend Launch
```powershell
cd C:\Users\Administrator\EduLabs\frontend

# Start Vite development server
npm run dev
```
Frontend will be accessible at: `http://localhost:5173/`

---

## Demonstration Accounts

| Portal | Role | Username / Admission | Password |
| :--- | :--- | :--- | :--- |
| **Student Portal** | Student | `RU-2026-041` (Admission) | `EduLabs@2026Secure!` |
| **Lecturer Portal** | Faculty | `jmwangi` | `EduLabs@2026Secure!` |
| **Mini SOC Portal** | Admin | `admin` | `EduLabs@2026Secure!` |

---

## Detailed Documentation & Hackathon Demonstration Script
For comprehensive system architecture, threat model analysis, and a step-by-step presentation walkthrough, see:
- [DEMO_AND_SYSTEM_GUIDE.md](docs/DEMO_AND_SYSTEM_GUIDE.md)
