# Complete API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 📋 AUTHENTICATION ENDPOINTS

### 1. Admin Registration
**POST** `/auth/register-admin`

**Description:** Creates new admin user and department

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Admin",
  "email": "admin@cs.edu",
  "password": "password123",
  "newDepartmentName": "Computer Science",
  "adminCode": "ADMIN_SECRET_2024"
}
```

**Response (201):**
```json
{
  "message": "Admin registered successfully",
  "departmentId": "67a123b456c789d012e345f6"
}
```

**Errors:**
- 400: Invalid admin code, department exists, user exists
- 500: Server error

---

### 2. Student Registration
**POST** `/auth/register`

**Description:** Registers new student (requires signature completion)

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Student",
  "email": "student@cs.edu",
  "matricNumber": "CS/2024/001",
  "password": "password123",
  "departmentId": "67a123b456c789d012e345f6"
}
```

**Response (201):**
```json
{
  "message": "Student registered successfully. Please complete your profile.",
  "userId": "67a123b456c789d012e345f7",
  "requiresSignature": true
}
```

**Errors:**
- 400: Missing fields, email/matric exists, invalid department
- 500: Server error

---

### 3. User Login
**POST** `/auth/login`

**Description:** Authenticates user and returns JWT token

**Request Body:**
```json
{
  "email": "user@email.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "67a123b456c789d012e345f7",
    "firstName": "Jane",
    "lastName": "Student",
    "role": "student",
    "departmentId": "67a123b456c789d012e345f6",
    "departmentName": "Computer Science"
  }
}
```

**Errors:**
- 401: Invalid credentials
- 500: Server error

---

## 👤 PROFILE ENDPOINTS

### 4. Save Signature
**POST** `/profile/signature`
**Auth Required:** Yes

**Description:** Saves student signature and completes profile

**Request Body:**
```json
{
  "signatureImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**Response (200):**
```json
{
  "message": "Signature saved successfully. Profile completed!",
  "profileCompleted": true
}
```

**Errors:**
- 400: Missing signature
- 403: Only students can save signatures
- 404: User not found
- 500: Server error

---

### 5. Get Profile
**GET** `/profile/me`
**Auth Required:** Yes

**Description:** Gets current user profile information

**Response (200):**
```json
{
  "user": {
    "id": "67a123b456c789d012e345f7",
    "firstName": "Jane",
    "lastName": "Student",
    "email": "student@cs.edu",
    "matricNumber": "CS/2024/001",
    "role": "student",
    "departmentId": "67a123b456c789d012e345f6",
    "departmentName": "Computer Science",
    "profileCompleted": true,
    "hasSignature": true
  }
}
```

**Errors:**
- 404: User not found
- 500: Server error

---

## 🎓 STUDENT ENDPOINTS

### 6. Student Dashboard
**GET** `/student/dashboard`
**Auth Required:** Yes (Student)

**Description:** Gets student dashboard data

**Response (200):**
```json
{
  "user": {
    "firstName": "Jane",
    "lastName": "Student",
    "departmentName": "Computer Science"
  },
  "todayAttendance": {
    "marked": true,
    "time": "9:45:30 AM"
  },
  "recentUpdates": [
    {
      "_id": "67a123b456c789d012e345f8",
      "title": "Important Notice",
      "content": "Classes resume Monday",
      "createdBy": {
        "firstName": "John",
        "lastName": "Admin"
      },
      "createdAt": "2024-12-05T10:00:00.000Z"
    }
  ]
}
```

**Errors:**
- 500: Server error

---

### 7. Mark Attendance
**POST** `/student/attendance`
**Auth Required:** Yes (Student)

**Description:** Marks student attendance (one-click, auto-collects all data)

**Request Body:** None (auto-collects from user profile)

**Response (201):**
```json
{
  "message": "Attendance marked successfully!",
  "attendance": {
    "name": "Jane Student",
    "matricNumber": "CS/2024/001",
    "date": "2024-12-05",
    "timeIn": "9:45 AM",
    "status": "present"
  }
}
```

**Errors:**
- 400: Already marked today, profile incomplete
- 404: Student not found
- 500: Server error

**Error Response Examples:**
```json
// Already marked
{
  "message": "You have already marked attendance today",
  "markedAt": "2024-12-05T09:45:00.000Z"
}

// Missing signature
{
  "message": "Please complete your profile by adding your signature first",
  "requiresSignature": true
}
```

---

### 8. Get Department Updates
**GET** `/student/updates`
**Auth Required:** Yes (Student)

**Description:** Gets all department updates for student

**Response (200):**
```json
[
  {
    "_id": "67a123b456c789d012e345f8",
    "title": "Important Notice",
    "content": "Classes will resume next Monday at 8 AM",
    "createdBy": {
      "firstName": "John",
      "lastName": "Admin"
    },
    "createdAt": "2024-12-05T10:00:00.000Z"
  }
]
```

**Errors:**
- 500: Server error

---

## 👨‍💼 ADMIN ENDPOINTS

### 9. Admin Dashboard
**GET** `/admin/dashboard`
**Auth Required:** Yes (Admin)

**Description:** Gets admin dashboard statistics

**Response (200):**
```json
{
  "departmentName": "Computer Science",
  "totalStudents": 50,
  "todayAttendance": {
    "present": 45,
    "absent": 5
  },
  "recentStudents": [
    {
      "_id": "67a123b456c789d012e345f7",
      "firstName": "Jane",
      "lastName": "Student",
      "email": "student@cs.edu",
      "createdAt": "2024-12-05T10:00:00.000Z"
    }
  ]
}
```

**Errors:**
- 403: Admin access required
- 500: Server error

---

### 10. Get All Students
**GET** `/admin/students`
**Auth Required:** Yes (Admin)

**Description:** Gets all students in admin's department with attendance stats

**Response (200):**
```json
[
  {
    "id": "67a123b456c789d012e345f7",
    "firstName": "Jane",
    "lastName": "Student",
    "email": "student@cs.edu",
    "matricNumber": "CS/2024/001",
    "profileCompleted": true,
    "totalAttendance": 25,
    "lastAttendance": "2024-12-05"
  }
]
```

**Errors:**
- 403: Admin access required
- 500: Server error

---

### 11. Today's Attendance Table
**GET** `/admin/attendance/today`
**Auth Required:** Yes (Admin)

**Description:** Gets today's attendance records with signatures

**Response (200):**
```json
{
  "date": "2024-12-05",
  "totalPresent": 3,
  "attendanceRecords": [
    {
      "serialNumber": 1,
      "name": "Jane Student",
      "matricNumber": "CS/2024/001",
      "signatureImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
      "timeIn": "9:45 AM",
      "date": "2024-12-05"
    },
    {
      "serialNumber": 2,
      "name": "John Doe",
      "matricNumber": "CS/2024/002",
      "signatureImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
      "timeIn": "10:15 AM",
      "date": "2024-12-05"
    }
  ]
}
```

**Errors:**
- 403: Admin access required
- 500: Server error

---

### 12. Post Department Update
**POST** `/admin/updates`
**Auth Required:** Yes (Admin)

**Description:** Creates new department announcement

**Request Body:**
```json
{
  "title": "Important Notice",
  "content": "Classes will resume next Monday at 8 AM"
}
```

**Response (201):**
```json
{
  "message": "Update posted successfully",
  "updateId": "67a123b456c789d012e345f8"
}
```

**Errors:**
- 400: Missing title or content
- 403: Admin access required
- 500: Server error

---

### 13. Export Attendance Report
**GET** `/admin/attendance/export?startDate=2024-01-01&endDate=2024-12-31`
**Auth Required:** Yes (Admin)

**Description:** Exports attendance data for date range

**Query Parameters:**
- `startDate` (required): Start date in YYYY-MM-DD format
- `endDate` (required): End date in YYYY-MM-DD format

**Response (200):**
```json
{
  "dateRange": {
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  },
  "data": [
    {
      "student": {
        "name": "Jane Student",
        "email": "student@cs.edu"
      },
      "attendance": [
        {
          "date": "2024-12-05",
          "timeIn": "2024-12-05T09:45:00.000Z",
          "status": "present"
        }
      ]
    }
  ]
}
```

**Errors:**
- 400: Missing start/end date
- 403: Admin access required
- 500: Server error

---

## 🌐 SHARED ENDPOINTS

### 14. Get All Departments
**GET** `/departments`
**Auth Required:** No

**Description:** Gets list of all departments (for registration dropdown)

**Response (200):**
```json
[
  {
    "id": "67a123b456c789d012e345f6",
    "name": "Computer Science"
  },
  {
    "id": "67a123b456c789d012e345f9",
    "name": "Mathematics"
  }
]
```

**Errors:**
- 500: Server error

---

## 🔐 HTTP STATUS CODES

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad request (validation error) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not found |
| 500 | Server error |

---

## 🔄 COMPLETE USER FLOWS

### Student Registration Flow
1. `GET /departments` - Get department list
2. `POST /auth/register` - Register with matric number
3. `POST /profile/signature` - Save signature
4. `POST /auth/login` - Login to system
5. `GET /student/dashboard` - Access dashboard
6. `POST /student/attendance` - Mark attendance (one-click)

### Admin Management Flow
1. `POST /auth/register-admin` - Create admin & department
2. `POST /auth/login` - Login as admin
3. `GET /admin/dashboard` - View statistics
4. `GET /admin/attendance/today` - View today's attendance table
5. `POST /admin/updates` - Post announcements
6. `GET /admin/students` - Manage students

### Daily Attendance Flow
1. Student: `POST /student/attendance` (auto-collects name, matric, signature, time)
2. Admin: `GET /admin/attendance/today` (view complete table with signatures)

---

## 🛡️ SECURITY FEATURES

- **JWT Authentication** - 24-hour token expiration
- **Password Hashing** - bcrypt with 10 salt rounds
- **Role-Based Access** - Student/Admin permissions
- **Department Isolation** - Users only see their department data
- **Input Validation** - All endpoints validate required fields
- **Unique Constraints** - Email and matric number uniqueness
- **Profile Completion** - Signature required before attendance

---

## 📱 FRONTEND INTEGRATION EXAMPLES

### JavaScript Fetch Examples
```javascript
// Register student
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: 'Jane',
    lastName: 'Student',
    email: 'student@cs.edu',
    matricNumber: 'CS/2024/001',
    password: 'password123',
    departmentId: 'dept_id'
  })
});

// Mark attendance (one-click)
const response = await fetch('/api/student/attendance', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
  // No body needed - auto-collects all data
});

// Get today's attendance table
const response = await fetch('/api/admin/attendance/today', {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});
```

This documentation covers all 14 endpoints with complete request/response examples, error handling, and integration guidance.