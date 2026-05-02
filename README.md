# TaskFlow — Team Task Manager

A full-stack web application for team project management with role-based access control. Create projects, assign tasks, track progress, and collaborate with your team.

## 🚀 Live Demo

**Live URL:** [Deployed on Railway]

## ✨ Features

- **Authentication** — Signup & Login with JWT-based sessions
- **Project Management** — Create, edit, and delete projects
- **Team Management** — Add members by email, assign Admin/Member roles
- **Task Tracking** — Create tasks with priority, due dates, and assignees
- **Kanban Board** — Visual task board with TODO / In Progress / Done columns
- **Status Transitions** — Move tasks between columns with one click
- **Dashboard** — Overview with stats, overdue tasks, and project summaries
- **Role-Based Access Control (RBAC)**:
  - **Admin**: Full access — manage members, edit/delete any task, delete project
  - **Member**: Create tasks, update assigned tasks, view project

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT + bcrypt |
| Deployment | Railway |

## 📁 Project Structure

```
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── api/            # API client
│   │   ├── components/     # Reusable components
│   │   ├── context/        # Auth context
│   │   ├── pages/          # Page components
│   │   └── index.css       # Design system
│   └── index.html
├── server/                 # Express backend
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── src/
│       ├── middleware/      # Auth & RBAC middleware
│       ├── routes/          # API routes
│       └── index.js        # Server entry point
├── package.json            # Root monorepo config
└── Procfile                # Railway deployment
```

## 🗄 Database Schema

- **User** — id, name, email, password_hash
- **Project** — id, name, description
- **ProjectMember** — user ↔ project mapping with role (ADMIN/MEMBER)
- **Task** — title, description, status, priority, due_date, assignee

## 📡 REST API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project details |
| PUT | `/api/projects/:id` | Update project (Admin) |
| DELETE | `/api/projects/:id` | Delete project (Admin) |

### Members
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/:id/members` | List members |
| POST | `/api/projects/:id/members` | Add member (Admin) |
| PUT | `/api/projects/:id/members/:userId` | Change role (Admin) |
| DELETE | `/api/projects/:id/members/:userId` | Remove member (Admin) |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/:id/tasks` | List tasks |
| POST | `/api/projects/:id/tasks` | Create task |
| PUT | `/api/projects/:id/tasks/:taskId` | Update task |
| DELETE | `/api/projects/:id/tasks/:taskId` | Delete task (Admin) |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Aggregated stats |

## 🏗 Local Setup

```bash
# 1. Clone the repo
git clone <repo-url>
cd team-task-manager

# 2. Create .env file
cp .env.example .env
# Edit .env with your PostgreSQL DATABASE_URL and JWT_SECRET

# 3. Install dependencies
cd server && npm install && npx prisma migrate dev --name init && cd ..
cd client && npm install && cd ..

# 4. Run development servers
# Terminal 1: Backend
cd server && npx nodemon src/index.js

# Terminal 2: Frontend
cd client && npm run dev
```

## 🚀 Railway Deployment

1. Push code to GitHub
2. Create a new project on [Railway](https://railway.app)
3. Add a **PostgreSQL** database service
4. Connect your GitHub repo as a new service
5. Set environment variables:
   - `DATABASE_URL` — auto-linked from PostgreSQL service
   - `JWT_SECRET` — any secure random string
6. Railway auto-deploys on push

## 👤 Author

Built as a full-stack assignment project.
