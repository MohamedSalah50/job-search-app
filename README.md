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

```env
PORT=3000
MONGO_URI=mongodb://...
ACCESS_SECRET=
REFRESH_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
EMAIL_USER=
EMAIL_PASS=
WEB_CLIENT_IDS=
```

---

## 🏃 Running the App

```bash
# Install dependencies
npm install

# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

---

## 📌 Notes

- All paginated endpoints support `?page=1&limit=10&sort=createdAt&sortOrder=DESC`
- Soft delete is used for companies (sets `deletedAt`) — hard delete triggers cascade hooks
- Mobile numbers are AES-encrypted at rest and decrypted on read
- JWT tokens are invalidated on password change via `changeCredentialTime`