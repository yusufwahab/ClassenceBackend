# Student Attendance Management System API

A complete Node.js/Express backend API with MongoDB for managing student attendance with department-based data isolation.

## Features

- JWT Authentication
- Role-based access (Students & Admins)
- Department-based data isolation
- Attendance tracking
- Department updates/announcements
- Admin dashboard with statistics
- Attendance export functionality

## Tech Stack

- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcrypt for hashing
- **Environment Variables**: dotenv

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file with:
   ```
   MONGODB_URI=your_mongodb_connection_string
   PORT=5000
   JWT_SECRET=your_jwt_secret_key
   ADMIN_CODE=your_admin_registration_code
   ```

3. **Start Server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm run serve
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Student registration
- `POST /api/auth/register-admin` - Admin registration with department creation
- `POST /api/auth/login` - User login

### Student Endpoints (Authenticated)
- `GET /api/student/dashboard` - Student dashboard data
- `POST /api/student/attendance` - Mark attendance
- `GET /api/student/updates` - View department updates

### Admin Endpoints (Authenticated + Admin Role)
- `GET /api/admin/dashboard` - Admin dashboard statistics
- `GET /api/admin/students` - List all students with attendance
- `POST /api/admin/updates` - Post department update
- `GET /api/admin/attendance/export` - Export attendance report

### Shared Endpoints
- `GET /api/departments` - List all departments

## Database Models

### User
- firstName, lastName, email, password (hashed)
- role (student/admin)
- departmentId (reference)

### Department
- name (unique)
- adminId (reference)

### Attendance
- studentId, date, timeIn, status
- Compound index on (studentId, date) for uniqueness

### Update
- departmentId, title, content, createdBy

## Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT tokens with expiration
- Role-based access control
- Department-based data isolation
- Input validation and sanitization

## Testing

Use tools like Postman or Thunder Client to test the endpoints. All protected routes require the Authorization header:
```
Authorization: Bearer <jwt_token>
```