# Classence - Student Attendance Management System

A complete Node.js/Express backend API with MongoDB for managing student attendance with department-based data isolation.

## 🚀 Features

- **JWT Authentication** - Secure user authentication
- **Role-based Access** - Students & Admins with different permissions
- **Department Isolation** - Data separated by departments
- **Digital Signatures** - Students sign digitally for attendance
- **Multimedia Updates** - Admins can post text, images, and audio
- **Real-time Dashboard** - Live attendance tracking
- **Export Reports** - Download attendance data

## 🛠️ Tech Stack

- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcrypt password hashing
- **Environment**: dotenv configuration

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Student registration
- `POST /api/auth/register-admin` - Admin registration
- `POST /api/auth/login` - User login

### Student Features
- `GET /api/student/dashboard` - Dashboard data
- `POST /api/student/attendance` - Mark attendance (one-click)
- `GET /api/student/updates` - View department updates
- `POST /api/profile/signature` - Save digital signature

### Admin Features
- `GET /api/admin/dashboard` - Admin statistics
- `GET /api/admin/students` - List all students
- `GET /api/admin/attendance/today` - Today's attendance table
- `POST /api/admin/updates` - Post multimedia updates
- `PUT /api/admin/updates/:id` - Edit updates
- `DELETE /api/admin/updates/:id` - Delete updates

### Shared
- `GET /api/departments` - List all departments

## 🔧 Installation

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

## 📱 Frontend Integration

The backend supports any frontend framework. Check the API documentation for complete endpoint details and request/response formats.

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Department-based data isolation
- Input validation and sanitization

## 📊 Database Models

- **User** - Students and admins with profiles
- **Department** - Academic departments
- **Attendance** - Daily attendance records with signatures
- **Update** - Multimedia announcements

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