# QuizPro Sentinel 🚀

**QuizPro Sentinel** is a premium, SaaS-level Online Examination Platform designed for modern educational institutions and corporate training programs. It features a high-fidelity Student Portal and a robust Admin Question Builder, built with a focus on stability, real-time synchronization, and professional UX.

---

## ✨ Key Features

### 👨‍🎓 Student Portal
- **Sentinel Exam Mode**: A secure, immersive examination environment inspired by LeetCode and HackerRank.
- **Immediate Auto-Save**: Zero-latency answer synchronization to ensure no data is lost during network interruptions.
- **Performance Analytics**: Detailed post-exam review with accuracy rates, global ranking, and conceptual rationale.
- **Competitive Leaderboards**: Real-time ranking based on scores and submission speed.

### 👩‍💼 Admin Dashboard
- **SaaS Exam Builder**: A professional 2-column editor for creating complex assessments.
- **Intelligence Node Bank**: Support for MCQ, Short-Answer, and Coding questions.
- **Monaco Editor Integration**: Write and review code questions using the same engine as VS Code.
- **Live Integrity Check**: Real-time validation panel to ensure exam quality before publishing.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | Turso (LibSQL), SQLite |
| **ORM** | Drizzle ORM |
| **Icons** | Lucide React |
| **Editor** | Monaco Editor |

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v16+)
- npm or yarn
- A Turso Database token (or local SQLite)

### 2. Installation
Clone the repository and install dependencies for both layers:

```bash
# Install Backend dependencies
cd backend
npm install

# Install Frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Configuration
Create a `.env` file in the `backend` directory:

```env
PORT=5000
DATABASE_URL=libsql://your-db-url.turso.io
DATABASE_AUTH_TOKEN=your-auth-token
JWT_SECRET=your-secret-key
```

And in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Database Setup
```bash
cd backend
npm run db:push  # Sync schema with Turso
npm run seed     # (Optional) Seed initial exam data
```

### 5. Running the Project
Open two terminals:

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

---

## 📂 Project Structure

```text
Onlinequiz02/
├── backend/                # Express Server & Drizzle Logic
│   ├── src/
│   │   ├── controllers/    # API Request Handlers
│   │   ├── db/             # Schema & Database Connection
│   │   ├── middleware/     # Auth & Error Handling
│   │   ├── routes/         # API Endpoints
│   │   └── services/       # Core Business Logic
├── frontend/               # Vite + React Application
│   ├── src/
│   │   ├── components/     # Shared UI Components
│   │   ├── context/        # Auth & Global State
│   │   ├── pages/          # Student & Admin Views
│   │   └── services/       # API Integration
└── .gitignore              # Global Exclusions
```

---

## 🛡️ Security
- **JWT Authentication**: Secure stateless sessions for students and admins.
- **Sentinel Mode**: Prevents unauthorized access and handles session recovery seamlessly.
- **Input Validation**: Strict typing with TypeScript and Drizzle schema enforcement.

---

## 📄 License
This project is for demonstration purposes. All rights reserved.

---
*Built with ❤️ by Antigravity AI*
