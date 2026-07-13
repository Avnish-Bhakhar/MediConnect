# 🏥 MediConnect — Healthcare Appointment Platform

> A full-stack real-time doctor appointment booking platform built with Node.js, Express, MongoDB, Socket.IO, React, Vite, and TypeScript.

![MediConnect](https://img.shields.io/badge/Stack-MERN-blue) ![License](https://img.shields.io/badge/License-MIT-green) ![Status](https://img.shields.io/badge/Status-Active-brightgreen)

---

## ✨ Features

### Patient
- 🔍 Browse & filter doctors by specialization and city
- 📅 Book appointments with time slot selection
- 🔔 Real-time notifications via Socket.IO
- 📋 View & cancel appointments with pagination
- 🔒 JWT-secured authentication

### Doctor
- 👨‍⚕️ Profile setup with availability management
- 📊 Dashboard with live appointment stats
- ✅ Confirm, cancel, complete appointments
- 💊 Add digital prescriptions
- 🔔 Real-time alerts for new bookings

### Admin
- 📊 Platform-wide statistics dashboard
- ✅ Approve / reject doctor registrations
- 👥 User management with block/unblock
- 📋 View all appointments across platform

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript |
| Styling | Plain CSS with animations |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Real-time | Socket.IO |
| Auth | JWT + RBAC + express-session |
| Validation | express-validator |

---

## 📁 Project Structure

```
mediconnect/
├── backend/
│   └── src/
│       ├── config/         # DB connection
│       ├── controllers/    # Business logic
│       ├── middleware/      # Auth, error handling
│       ├── models/         # MongoDB schemas
│       ├── routes/         # Express routes
│       ├── socket/         # Socket.IO handler
│       └── utils/          # Seed data
└── frontend/
    └── src/
        ├── api/            # Axios config
        ├── components/     # Reusable components
        ├── context/        # Auth & Socket contexts
        ├── hooks/          # Custom hooks
        ├── pages/          # All page components
        ├── styles/         # Global CSS
        └── types/          # TypeScript types
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Git

### 1. Clone & Install

```bash
# Clone repo
git clone https://github.com/yourusername/mediconnect.git
cd mediconnect

# Install backend
cd backend
npm install

# Install frontend
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
```

**.env values:**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mediconnect
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
SESSION_SECRET=your_session_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Seed Demo Data

```bash
cd backend
node src/utils/seedData.js
```

### 4. Run the App

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open **http://localhost:5173**

---

## 🔑 Demo Accounts

| Role | Email | Password |
|---|---|---|
| Patient | patient@mediconnect.com | patient123 |
| Doctor | sharma@mediconnect.com | doctor123 |

---

## 📡 API Endpoints

### Auth
| Method | Route | Description |
|---|---|---|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |

### Doctors
| Method | Route | Description |
|---|---|---|
| GET | /api/doctors | List doctors (filter, paginate) |
| GET | /api/doctors/:id | Get doctor details |
| POST | /api/doctors | Create doctor profile |
| PUT | /api/doctors/profile | Update profile |
| PUT | /api/doctors/:id/approve | Admin approve |

### Appointments
| Method | Route | Description |
|---|---|---|
| POST | /api/appointments | Book appointment |
| GET | /api/appointments/my | Patient appointments |
| GET | /api/appointments/doctor | Doctor appointments |
| GET | /api/appointments/all | Admin - all appointments |
| PUT | /api/appointments/:id/status | Update status |

### Admin
| Method | Route | Description |
|---|---|---|
| GET | /api/admin/stats | Platform statistics |
| GET | /api/admin/users | All users |
| PUT | /api/admin/users/:id/toggle | Block/unblock user |

---

## 🌐 Deployment

### Backend (Render)
1. Push to GitHub
2. Create new Web Service on render.com
3. Set environment variables
4. Deploy command: `npm start`

### Frontend (Vercel)
1. Import GitHub repo on vercel.com
2. Set root directory to `frontend`
3. Build command: `npm run build`
4. Output: `dist`

---

## 📚 Syllabus Coverage

| Course | Topic | Implementation |
|---|---|---|
| INT222 | Node.js + npm | Backend foundation |
| INT222 | Express routing | All API routes |
| INT222 | express-validator | Input validation |
| INT222 | Socket.IO | Real-time notifications |
| INT222 | JWT + RBAC | Auth middleware |
| INT222 | express-session | Session middleware |
| INT222 | MongoDB + Mongoose | All data models |
| INT222 | CRUD operations | Full appointment lifecycle |
| INT219 | HTML5 + CSS3 | Semantic frontend |
| INT219 | Flexbox + Grid | Responsive layouts |
| INT219 | TypeScript | Typed components |
| INT219 | DOM manipulation | React + hooks |
| INT219 | Async/await | API calls |

---

## 👥 Team

Built as a semester project for Advanced Web Development (INT222 + INT219).

---

## 📄 License

MIT License — free to use for educational purposes.
