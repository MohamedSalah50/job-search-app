# 🔍 Job Search Application API

A full-featured **Job Search Platform** REST API built with **NestJS**, **MongoDB**, **GraphQL**, and **Socket.IO** — supporting real-time chat, JWT authentication, role-based access control, cloud media uploads, and more.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS (TypeScript) |
| Database | MongoDB + Mongoose |
| Authentication | JWT (Access + Refresh Tokens) |
| Real-Time | Socket.IO |
| API Styles | REST + GraphQL |
| Cloud Storage | Cloudinary |
| Email | Nodemailer + Event Emitter |
| OAuth | Google OAuth2 |
| Encryption | bcrypt + AES |
| Containerization | Docker + Docker Compose |


![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![GraphQL](https://img.shields.io/badge/GraphQL-E10098?style=flat&logo=graphql&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socketdotio&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=flat&logo=cloudinary&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)

---

## 📁 Project Structure

```
src/
├── common/          # Enums, interfaces, decorators, guards
├── db/              # Mongoose models + generic repository pattern
├── modules/
│   ├── auth/        # Authentication module
│   ├── user/        # User profile management
│   ├── company/     # Company management
│   ├── job/         # Job listings & applications
│   ├── chat/        # Real-time chat (Socket.IO + REST)
│   ├── admin/       # Admin panel (GraphQL)
│   └── realtime/    # WebSocket gateway
└── utils/           # Security, email, encryption helpers
```

---

## 🔐 Authentication APIs `POST /auth`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/signup` | Register new user | Public |
| POST | `/auth/login` | Login with email & password | Public |
| PATCH | `/auth/confirmEmail` | Confirm email via OTP | Public |
| POST | `/auth/resendConfirmEmailOtp` | Resend confirmation OTP | Public |
| POST | `/auth/sendForgotPassword` | Send forgot password OTP | Public |
| POST | `/auth/resetForgotPassword` | Reset password via OTP | Public |
| POST | `/auth/refresh-token` | Refresh access token | 🔒 Refresh Token |
| POST | `/auth/login-with-gmail` | Login via Google OAuth2 | Public |
| POST | `/auth/signup-with-gmail` | Register via Google OAuth2 | Public |

**Security features:**
- Hashed passwords with bcrypt
- Encrypted mobile numbers (AES)
- OTP expiry (10 min for email, 3 min for password reset)
- Token revocation (JTI blacklist)
- `changeCredentialTime` invalidates old tokens on password change

---

## 👤 User APIs `GET|PATCH /user`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/user/profile` | Get current user profile | 🔒 User/Admin |
| GET | `/user/get-login-user-account-data` | Get full account data | 🔒 User/Admin |
| GET | `/user/profile/:userId` | View another user's profile | 🔒 User/Admin |
| PATCH | `/user/update-basic-profile` | Update name, gender, DOB, mobile | 🔒 User/Admin |
| PATCH | `/user/update-password` | Change password | 🔒 User/Admin |
| PATCH | `/user/freeze-account` | Freeze/archive account | 🔒 User/Admin |
| PATCH | `/user/profile-picture` | Upload profile picture | 🔒 User/Admin |
| PATCH | `/user/profile-pic/delete` | Delete profile picture | 🔒 User/Admin |

---

## 🏢 Company APIs `GET|POST|PATCH|DELETE /company`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/company/add-company` | Create a new company | 🔒 User/Admin |
| GET | `/company?companyName=` | Search company by name | Public |
| GET | `/company/:companyId` | Get company by ID | Public |
| GET | `/company/:companyId/jobs` | Get all jobs of a company | Public |
| PATCH | `/company/:companyId` | Update company data (owner only) | 🔒 Owner |
| DELETE | `/company/:companyId` | Soft delete company | 🔒 Owner/Admin |

---

## 💼 Job APIs `GET|POST|PATCH|DELETE /job`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/job/add-job` | Add a new job | 🔒 HR/Owner |
| PATCH | `/job/:jobId` | Update job details | 🔒 Job Creator |
| DELETE | `/job/:jobId` | Close/delete job | 🔒 HR/Owner |
| GET | `/job/jobs` | Get all jobs (with filters) | Public |
| GET | `/job/companies/:companyId/jobs` | Get all jobs for a company | 🔒 |
| GET | `/job/companies/:companyId/jobs/:jobId` | Get specific company job | 🔒 |
| GET | `/job/:jobId/applications` | Get all applications for a job | 🔒 HR/Owner |
| POST | `/job/apply-jobApplication` | Apply for a job | 🔒 User |
| PATCH | `/job/applications/:applicationId/status` | Accept/Reject application | 🔒 HR/Owner |

**Job filters supported:** `jobTitle`, `jobLocation`, `workingTime`, `seniorityLevel`, `technicalSkills`

**Application status email notifications:** Automatic emails sent to applicants on Accept/Reject.

---

## 💬 Chat APIs

### REST
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/chat/:userId` | Get chat history with pagination | 🔒 User/HR/Owner |

### Socket.IO Events (Real-Time)

Connect: `ws://localhost:3000`
Auth: pass token in `headers.authorization` or `auth.authorization`

| Event (emit) | Payload | Description |
|---|---|---|
| `sendMessage` | `{ recieverId, message }` | Send a real-time message |
| `markAsSeen` | `{ senderId }` | Mark messages as seen |

| Event (listen) | Description |
|---|---|
| `recieveMessage` | Incoming message (sender & receiver both get it) |
| `messagesSeen` | Notification that messages were seen |
| `exception` | Error event |

**Business Rules:**
- Only HR or Company Owner can **initiate** a conversation with a regular user
- Regular users can only **reply** to existing conversations
- All connected devices/tabs receive messages simultaneously

---

## 🛡️ Admin Panel (GraphQL) `/graphql`

| Operation | Type | Description |
|-----------|------|-------------|
| `adminDashboard` | Query | Get all users & companies with pagination |
| `banUser` | Mutation | Ban a specific user |
| `unbanUser` | Mutation | Unban a specific user |
| `banCompany` | Mutation | Ban a specific company |
| `unbanCompany` | Mutation | Unban a specific company |
| `approveCompany` | Mutation | Approve a company listing |

All admin operations require `Admin` role.

---

## 🗑️ Cascade Delete (Mongoose Hooks)

Deleting any entity automatically cleans up related documents:

```
Company deleted  →  Jobs deleted  →  Applications deleted
                →  Messages deleted (HR/Owner conversations)

Job deleted      →  Applications deleted

User deleted     →  Applications deleted
                →  Messages deleted (sent & received)
```

---

## 🔒 Roles & Permissions

| Role | Description |
|------|-------------|
| `user` | Regular job seeker |
| `hr` | HR manager of a company |
| `companyOwner` | Owner of a company |
| `admin` | Platform administrator |

---

## ⚙️ Environment Variables

The app reads its environment file from `config/.env.dev` (see [Project Structure](#-project-structure)).

```env
PORT=3000
APP_NAME="job search app"

# Use ONE of the following, depending on where MongoDB is running:

# Option A — MongoDB Atlas (cloud)
# MONGO_URI=mongodb+srv://<user>:<password>@cluster0.yffv1sx.mongodb.net/job-SerchApp

# Option B — Local MongoDB container (via docker-compose)
MONGO_URI=mongodb://mongodb:27017/job-SerchApp

ACCESS_SECRET=
REFRESH_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
EMAIL_USER=
EMAIL_PASS=
WEB_CLIENT_IDS=
```

> ⚠️ **Note on `MONGO_URI` hostnames:**
> - When connecting to **Atlas**, the URI works the same whether you run the app locally or inside Docker (it just needs internet access).
> - When connecting to the **local `mongodb` container**, the host must be `mongodb` (the service name in `docker-compose.yaml`) — **not** `localhost`. Containers reach each other by service name over the Docker network, not `localhost`.

---

## 🏃 Running the App (without Docker)

```bash
# Clone the repository
git clone https://github.com/MohamedSalah50/job-search-app.git
cd job-search-app

# Install dependencies
npm install

# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

---

## 🐳 Running with Docker

The app is fully dockerized for development, including a live-reload workflow via `docker compose watch`.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and **running**
- A `config/.env.dev` file with the required environment variables (see [Environment Variables](#️-environment-variables))

### Project Docker files

| File | Purpose |
|---|---|
| `Dockerfile` | Builds the NestJS app image (Node.js base, installs deps, runs `npm run start:dev`) |
| `docker-compose.yaml` | Orchestrates the app container + local MongoDB container |
| `.dockerignore` | Excludes `node_modules`, `dist`, and `config/.env.dev` from the build context |

### 1. Build and start the containers

```bash
docker compose up --build
```

This will:
- Build the app image from the `Dockerfile`
- Start the `job-search-app` container, mapped to `http://localhost:4000`
- Start a local `mongodb` container, exposed on port `27017`, with data persisted in the `mongo_data` volume

> Make sure `MONGO_URI` in `config/.env.dev` points to `mongodb://mongodb:27017/job-SerchApp` (the local container) rather than the Atlas URI — otherwise the app will talk to Atlas instead of the container, and the `mongodb` service will just sit idle.

### 2. Live reload while developing

Instead of `up`, you can run:

```bash
docker compose watch
```

This syncs local file changes into the running container automatically (excluding `node_modules`), so you don't need to rebuild the image on every change.

### 3. Stopping the containers

```bash
docker compose down
```

Add `-v` if you also want to remove the MongoDB volume (this **deletes all local Mongo data**):

```bash
docker compose down -v
```

### Ports

| Service | Container Port | Host Port |
|---|---|---|
| `job-search-app` | 3000 | 4000 |
| `mongodb` | 27017 | 27017 |

So once running, the API is reachable at **`http://localhost:4000`**, not `3000` — the app listens on `3000` *inside* the container, but it's mapped to `4000` on your machine.

### Switching between Atlas and local MongoDB

You don't have to use the local `mongodb` container — it's provided for convenience. To use MongoDB Atlas instead:
1. Comment out the local `MONGO_URI` line in `config/.env.dev` and uncomment/use the Atlas one.
2. Optionally remove the `mongodb` service from `docker-compose.yaml` if you won't use it at all.

---

## 📬 Postman Collection

> Test all endpoints with the published collection:

[![Postman](https://img.shields.io/badge/Postman-Collection-FF6C37?style=flat&logo=postman&logoColor=white)](https://documenter.getpostman.com/view/42944447/2sBXqRiGfQ)

---

## 📌 Notes

- All paginated endpoints support `?page=1&limit=10&sort=createdAt&sortOrder=DESC`
- Soft delete is used for companies (sets `deletedAt`) — hard delete triggers cascade hooks
- Mobile numbers are AES-encrypted at rest and decrypted on read
- JWT tokens are invalidated on password change via `changeCredentialTime`
- When running via Docker, the API is available on `http://localhost:4000` (see [Running with Docker](#-running-with-docker))
