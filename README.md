# ProjectsHub

A project and task management web app, developed as part of an association technical test.

Users create projects, add tasks to them, assign tasks to other users and track progress on a
To do / In progress / Done board.

- **Backend:** Django 5 + Django REST Framework, JWT authentication (SimpleJWT), SQLite
- **Frontend:** React 19 + React Router, built with Vite

## Features

- Register, log in and log out (JWT access + refresh tokens, refreshed automatically)
- Create, edit and delete projects with an optional due date
- Add tasks to a project, assign them to a user, set a status and a due date
- Task board grouped by status with a progress bar per project
- Role-based access:
  - **Members** see the projects they own and the projects where a task is assigned to them
  - **Project owners** manage their project and its tasks
  - **Admins** see and manage every project

## Project structure

```
ProjectsHub/
├── backend/                 # Django API
│   ├── config/              # settings and root URLs
│   ├── api/                 # models, serializers, views, permissions, URLs
│   ├── manage.py
│   └── requirements.txt
└── frontend/                # React app (Vite)
    └── src/
        ├── api.js           # fetch wrapper: base URL, JWT header, token refresh
        ├── auth/            # auth context and provider
        └── pages/           # Home, Login, Register, create_project, ProjectDetail, components/
```

## Getting started

Requirements: Python 3.10+ and Node.js 20+.

### 1. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows  (macOS/Linux: source venv/bin/activate)
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver      # http://127.0.0.1:8000
```

To get an admin account, run `python manage.py createsuperuser`, log in at
http://127.0.0.1:8000/admin/ and set that user's **role** to `admin`.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev                     # http://localhost:5173
```

The frontend calls the API at `http://127.0.0.1:8000` by default. To use another address,
create `frontend/.env` with:

```
VITE_API_URL=http://your-api-host:8000
```

If the frontend runs on an origin other than `localhost:5173`, add it to
`CORS_ALLOWED_ORIGINS` in `backend/config/settings.py`.

## API

All endpoints except `register/` and `token/` require an `Authorization: Bearer <access>` header.

| Method | Endpoint | Description | Who |
|---|---|---|---|
| POST | `/register/` | Create an account (`username`, `password`) | Anyone |
| POST | `/token/` | Get `access` and `refresh` tokens | Anyone |
| POST | `/token/refresh/` | Get a new access token | Anyone with a refresh token |
| GET | `/me/` | Current user (`id`, `username`, `role`) | Logged in |
| GET | `/users/` | List users (for task assignment) | Logged in |
| GET | `/` | List visible projects | Logged in |
| POST | `/` | Create a project (you become the owner) | Logged in |
| GET | `/project/<id>/` | Project details | Users who can see it |
| PUT/PATCH/DELETE | `/project/<id>/` | Edit or delete a project | Owner or admin |
| GET | `/project/<id>/tasks/` | List the project's tasks | Users who can see it |
| POST | `/project/<id>/tasks/` | Create a task | Owner or admin |
| GET/PUT/PATCH/DELETE | `/project/<id>/tasks/<task_id>/` | View, edit or delete a task | Owner or admin |

Task `status` values used by the UI: `todo`, `in_progress`, `done`.

## Before deploying

The settings are for local development. Before deploying, set `DEBUG = False`, move
`SECRET_KEY` to an environment variable, fill in `ALLOWED_HOSTS`, and use a production database.
