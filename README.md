# Classence - Student Attendance Management System

A complete Node.js/Express backend API with MongoDB for managing student attendance with subject-based sessions and department isolation.

## 🚀 Features

- **JWT Authentication** - Secure user authentication
- **Role-based Access** - Students & Admins with different permissions
- **Department Isolation** - Data separated by departments
- **Subject-based Sessions** - Multiple subjects per day with time-based sessions
- **Digital Signatures** - Students sign digitally for attendance
- **Session Management** - Admins can create, edit, end, and delete sessions
- **Multimedia Updates** - Admins can post text, images, and audio
- **Real-time Dashboard** - Live attendance tracking
- **Attendance Logs** - Complete attendance history with statistics

## 🛠️ Tech Stack

- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcrypt password hashing
- **Environment**: dotenv configuration
- **Email**: Brevo SMTP integration

## 📋 Complete API Documentation

### Authentication Endpoints

#### Student Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "middleName": "Smith", // Optional
  "email": "john@example.com",
  "matricNumber": "CSC/2021/001",
  "password": "password123",
  "departmentId": "6935e0313e2d8f1dd78d54ab"
}
```

**Response:**
```json
{
  "message": "Student registered successfully. Please complete your profile.",
  "userId": "6935e24d3e2d8f1dd78d54bd",
  "requiresSignature": true
}
```

#### Admin Registration
```http
POST /api/auth/register-admin
Content-Type: application/json

{
  "firstName": "Admin",
  "lastName": "User",
  "middleName": "Middle", // Optional
  "email": "admin@example.com",
  "password": "password123",
  "newDepartmentName": "Computer Science",
  "adminCode": "YAB3T5VLKX9"
}
```

**Response:**
```json
{
  "message": "Admin registered successfully",
  "departmentId": "6935e0313e2d8f1dd78d54ab"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6935e24d3e2d8f1dd78d54bd",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student",
    "departmentId": "6935e0313e2d8f1dd78d54ab",
    "departmentName": "Computer Science"
  }
}
```

### Student Endpoints

#### Get Dashboard
```http
GET /api/student/dashboard
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "user": {
    "firstName": "John",
    "lastName": "Doe",
    "matricNumber": "CSC/2021/001",
    "departmentName": "Computer Science"
  },
  "todayAttendance": {
    "marked": true,
    "time": "8:30:00 AM"
  },
  "recentUpdates": [
    {
      "_id": "674a1b2c3d4e5f6789012345",
      "title": "Class Announcement",
      "content": "Tomorrow's class is moved to 10 AM",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "createdBy": {
        "firstName": "Prof",
        "lastName": "Smith"
      }
    }
  ]
}
```

#### Get Active Sessions
```http
GET /api/subject-attendance/active
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "id": "6935f3c585f34366729fdde6",
    "subjectName": "Mathematics",
    "subjectCode": "MTH101",
    "startTime": "2025-12-07T21:39:00.000Z",
    "endTime": "2025-12-07T22:39:00.000Z",
    "hasAttended": false,
    "timeRemaining": 45
  }
]
```

#### Mark Session Attendance
```http
POST /api/subject-attendance/mark/:sessionId
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Subject attendance marked successfully!",
  "attendance": {
    "subjectName": "Mathematics",
    "subjectCode": "MTH101",
    "name": "John Smith Doe",
    "matricNumber": "CSC/2021/001",
    "date": "2025-12-07",
    "timeIn": "9:30 PM",
    "status": "present"
  }
}
```

#### Get Attendance Log
```http
GET /api/student/attendance-log
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "attendanceLog": [
    {
      "id": "674a1b2c3d4e5f6789012345",
      "date": "2025-01-15",
      "timeMarked": "2025-01-15T08:30:00.000Z",
      "status": "present"
    }
  ],
  "stats": {
    "totalPresent": 25,
    "thisMonth": 8,
    "averageTime": "8:45 AM"
  }
}
```

#### Get Updates
```http
GET /api/student/updates
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "_id": "674a1b2c3d4e5f6789012345",
    "title": "Important Notice",
    "content": "Class schedule updated",
    "imageUrl": "data:image/png;base64,...",
    "audioUrl": "data:audio/mp3;base64,...",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "createdBy": {
      "firstName": "Prof",
      "lastName": "Smith"
    }
  }
]
```

### Admin Endpoints

#### Get Admin Dashboard
```http
GET /api/admin/dashboard
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "departmentName": "Computer Science",
  "totalStudents": 150,
  "todayAttendance": {
    "present": 120,
    "absent": 30
  },
  "recentStudents": [
    {
      "_id": "6935e24d3e2d8f1dd78d54bd",
      "name": "John Smith Doe",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "createdAt": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

#### Get All Students
```http
GET /api/admin/students
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "id": "6935e24d3e2d8f1dd78d54bd",
    "name": "John Smith Doe",
    "firstName": "John",
    "middleName": "Smith",
    "lastName": "Doe",
    "email": "john@example.com",
    "matricNumber": "CSC/2021/001",
    "profileCompleted": true,
    "totalAttendance": 25,
    "lastAttendance": "2025-01-15"
  }
]
```

#### Create Subject
```http
POST /api/subjects
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Mathematics",
  "code": "MTH101",
  "description": "Basic Mathematics Course"
}
```

**Response:**
```json
{
  "message": "Subject created successfully",
  "subject": {
    "id": "6935e31e3e2d8f1dd78d54e8",
    "name": "Mathematics",
    "code": "MTH101",
    "description": "Basic Mathematics Course",
    "departmentId": "6935e0313e2d8f1dd78d54ab"
  }
}
```

#### Create Attendance Session
```http
POST /api/subject-attendance/sessions
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "subjectId": "6935e31e3e2d8f1dd78d54e8",
  "startTime": "2025-12-07T21:39:00.000+01:00",
  "endTime": "2025-12-07T22:39:00.000+01:00"
}
```

**Response:**
```json
{
  "message": "Subject attendance session created successfully",
  "session": {
    "id": "6935f3c585f34366729fdde6",
    "subjectName": "Mathematics",
    "subjectCode": "MTH101",
    "startTime": "2025-12-07T21:39:00.000Z",
    "endTime": "2025-12-07T22:39:00.000Z",
    "isActive": true
  }
}
```

#### Get Today's Attendance
```http
GET /api/subject-attendance/admin/today
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "sessionId": "6935f3c585f34366729fdde6",
    "subjectName": "Mathematics",
    "subjectCode": "MTH101",
    "startTime": "2025-12-07T21:39:00.000Z",
    "endTime": "2025-12-07T22:39:00.000Z",
    "isActive": true,
    "attendanceCount": 15,
    "attendanceRecords": [
      {
        "id": "674a1b2c3d4e5f6789012345",
        "studentName": "John Smith Doe",
        "matricNumber": "CSC/2021/001",
        "timeIn": "2025-12-07T21:45:00.000Z",
        "status": "present",
        "signatureImage": "data:image/png;base64,..."
      }
    ]
  }
]
```

#### Edit Session
```http
PUT /api/subject-attendance/sessions/:sessionId
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "startTime": "2025-12-07T22:00:00.000+01:00",
  "endTime": "2025-12-07T23:00:00.000+01:00"
}
```

#### End Session
```http
PATCH /api/subject-attendance/sessions/:sessionId/end
Authorization: Bearer <jwt_token>
```

#### Delete Session
```http
DELETE /api/subject-attendance/sessions/:sessionId
Authorization: Bearer <jwt_token>
```

#### Post Update
```http
POST /api/admin/updates
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Important Notice",
  "content": "Class schedule has been updated",
  "imageUrl": "data:image/png;base64,...", // Optional
  "audioUrl": "data:audio/mp3;base64,..." // Optional
}
```

**Response:**
```json
{
  "message": "Update posted successfully",
  "updateId": "674a1b2c3d4e5f6789012345",
  "update": {
    "title": "Important Notice",
    "content": "Class schedule has been updated",
    "hasImage": true,
    "hasAudio": false
  }
}
```

### Profile Endpoints

#### Save Signature
```http
POST /api/profile/signature
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "signatureImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAA..."
}
```

**Response:**
```json
{
  "message": "Signature saved successfully. Profile completed!",
  "profileCompleted": true
}
```

#### Get Profile
```http
GET /api/profile/me
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "user": {
    "id": "6935e24d3e2d8f1dd78d54bd",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "matricNumber": "CSC/2021/001",
    "role": "student",
    "departmentId": "6935e0313e2d8f1dd78d54ab",
    "departmentName": "Computer Science",
    "profileCompleted": true,
    "hasSignature": true
  }
}
```

### Shared Endpoints

#### Get Departments
```http
GET /api/departments
```

**Response:**
```json
[
  {
    "_id": "6935e0313e2d8f1dd78d54ab",
    "name": "Computer Science",
    "adminId": "6935e0303e2d8f1dd78d54a9"
  }
]
```

#### Get Dashboard (Role-based)
```http
GET /api/dashboard
Authorization: Bearer <jwt_token>
```

**Response:** Returns admin or student dashboard based on user role.

### Utility Endpoints

#### Fix Database Indexes
```http
DELETE /api/subject-attendance/fix-indexes
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Database indexes fixed! You can now create multiple sessions per subject per day.",
  "details": "Fixed both Attendance and AttendanceSession indexes"
}
```

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yusufwahab/classence-backend.git
   cd classence-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create `.env` file:
   ```
   MONGODB_URI=your_mongodb_connection_string
   PORT=5000
   JWT_SECRET=your_jwt_secret_key
   ADMIN_CODE=your_admin_registration_code
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 🌐 Deployment

This backend is deployed on [Render](https://render.com) and ready for production use.

**Live API URL:** https://classencebackend.onrender.com

### Deployment Steps:
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy with automatic builds on push

## 📱 Frontend Integration

The backend supports any frontend framework. Check the API documentation for complete endpoint details and request/response formats.

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Department-based data isolation
- Input validation and sanitization

## 📊 Database Models

### User Model
```javascript
{
  firstName: String,
  lastName: String,
  middleName: String, // Optional
  email: String, // Unique
  matricNumber: String, // Required for students
  password: String, // Hashed
  role: String, // 'student' | 'admin'
  departmentId: ObjectId,
  signatureImage: String, // Base64
  profileCompleted: Boolean
}
```

### Department Model
```javascript
{
  name: String, // Unique
  adminId: ObjectId
}
```

### Subject Model
```javascript
{
  name: String,
  code: String, // Unique per department
  description: String,
  departmentId: ObjectId,
  createdBy: ObjectId
}
```

### AttendanceSession Model
```javascript
{
  subjectId: ObjectId,
  date: String, // "YYYY-MM-DD"
  startTime: Date,
  endTime: Date,
  isActive: Boolean,
  createdBy: ObjectId
}
```

### Attendance Model
```javascript
{
  studentId: ObjectId,
  sessionId: ObjectId,
  subjectId: ObjectId,
  name: String, // Full name with middle name
  matricNumber: String,
  signatureImage: String, // Base64
  date: String,
  timeIn: Date,
  status: String // 'present' | 'absent'
}
```

### Update Model
```javascript
{
  departmentId: ObjectId,
  title: String,
  content: String,
  imageUrl: String, // Base64
  audioUrl: String, // Base64
  createdBy: ObjectId
}
```

## 🌐 Environment Variables

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
PORT=5000
JWT_SECRET=your_jwt_secret_key
ADMIN_CODE=your_admin_registration_code

# Email Configuration (Optional)
BREVO_SMTP_USER=your_brevo_smtp_user
BREVO_SMTP_KEY=your_brevo_smtp_key
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_sender_email
BREVO_SENDER_NAME=your_sender_name
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Yusuf Abdulwahab**
- GitHub: [@yusufwahab](https://github.com/yusufwahab)

---

Built with ❤️ for educational institutions to streamline attendance management.

## 🛠️ Development

### Project Structure:
```
classence-backend/
├── controllers/          # Route handlers
├── models/              # Database models
├── routes/              # API routes
├── middleware/          # Authentication middleware
├── db.js                # Database connection
├── index.js             # Main server file
└── package.json         # Dependencies
```

### Available Scripts:
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
```

## 📝 API Testing

You can test the API using tools like:
- **Postman**: Import the endpoints and test with sample payloads
- **Thunder Client**: VS Code extension for API testing
- **curl**: Command line testing

### Sample curl command:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

## 🔄 Version History

- **v1.0.0** - Initial release with basic attendance
- **v2.0.0** - Added subject-based sessions
- **v2.1.0** - Added middle name support and session management
- **v2.2.0** - Added attendance logs and statistics

## 📞 Contact

**Yusuf Abdulwahab**
- GitHub: [@yusufwahab](https://github.com/yusufwahab)
- Email: yabvil25@gmail.com