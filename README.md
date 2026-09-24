# Smart Hospital Management System with AI

An intelligent, secure, production-ready Patient-Centric Healthcare Application.

## Architecture Highlights
- **Patient-Only Authentication**: Built exclusively for patient UX.
- **AI Medical Engine**: Doctor recommendations, medical report analysis, and symptom navigation.
- **Emergency SOS Unit**: One-click ambulance dispatch and emergency status tracking.
- **Full Digital Workflow**: Online booking, prescriptions, lab results, and patient medical history.

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js v18+
- PostgreSQL v14+

### 1. Database Setup
Execute the SQL migration scripts in your PostgreSQL console:

```bash
psql -U postgres -d hospital_db -f schema.sql
psql -U postgres -d hospital_db -f seed.sql
