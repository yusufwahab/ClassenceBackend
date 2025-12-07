# Email Verification API Documentation

## Overview
Email verification system using Brevo SMTP to send 6-digit verification codes to users upon registration.

## Flow
1. User registers → Receives verification code via email
2. User enters code on verification page
3. After verification → Redirected to login page
4. Login requires verified email

---

## API Endpoints

### 1. Register Student (Modified)
**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "middleName": "Smith",
  "email": "john.doe@example.com",
  "matricNumber": "CSC/2021/001",
  "password": "password123",
  "departmentId": "department_id_here"
}
```

**Success Response (201):**
```json
{
  "message": "Registration successful! Please check your email for verification code.",
  "userId": "user_id_here",
  "email": "john.doe@example.com",
  "requiresVerification": true
}
```

**Email Sent:**
- Subject: "Verify Your Email - Classence"
- Contains: 6-digit verification code
- Expires: 10 minutes

---

### 2. Register Admin (Modified)
**Endpoint:** `POST /api/auth/register-admin`

**Request Body:**
```json
{
  "firstName": "Admin",
  "lastName": "User",
  "middleName": "Middle",
  "email": "admin@example.com",
  "password": "admin123",
  "newDepartmentName": "Computer Science",
  "adminCode": "your_admin_code"
}
```

**Success Response (201):**
```json
{
  "message": "Admin registered successfully! Please check your email for verification code.",
  "userId": "admin_user_id",
  "email": "admin@example.com",
  "departmentId": "department_id",
  "requiresVerification": true
}
```

---

### 3. Verify Email
**Endpoint:** `POST /api/auth/verify-email`

**Request Body:**
```json
{
  "userId": "user_id_from_registration",
  "code": "123456"
}
```

**Success Response (200):**
```json
{
  "message": "Email verified successfully! You can now log in.",
  "verified": true
}
```

**Error Responses:**
- `400` - Invalid or expired code
- `404` - User not found

---

### 4. Resend Verification Code
**Endpoint:** `POST /api/auth/resend-code`

**Request Body:**
```json
{
  "userId": "user_id_here"
}
```

**Success Response (200):**
```json
{
  "message": "Verification code sent to your email",
  "email": "john.doe@example.com"
}
```

---

### 5. Login (Modified)
**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student",
    "departmentId": "dept_id",
    "departmentName": "Computer Science"
  }
}
```

**Error Response - Unverified Email (403):**
```json
{
  "message": "Please verify your email before logging in",
  "requiresVerification": true,
  "userId": "user_id_here",
  "email": "john.doe@example.com"
}
```

---

## Frontend Integration Guide

### Registration Flow
```javascript
// 1. Register user
const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    matricNumber: 'CSC/2021/001',
    password: 'password123',
    departmentId: 'dept_id'
  })
});

const data = await registerResponse.json();

if (data.requiresVerification) {
  // Store userId and email for verification page
  localStorage.setItem('pendingUserId', data.userId);
  localStorage.setItem('pendingEmail', data.email);
  
  // Redirect to verification page
  navigate('/verify-email');
}
```

### Verification Page
```javascript
// 2. Verify email with code
const verifyEmail = async (code) => {
  const userId = localStorage.getItem('pendingUserId');
  
  const response = await fetch('http://localhost:5000/api/auth/verify-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, code })
  });
  
  const data = await response.json();
  
  if (data.verified) {
    // Clear stored data
    localStorage.removeItem('pendingUserId');
    localStorage.removeItem('pendingEmail');
    
    // Show success message
    alert(data.message);
    
    // Redirect to login
    navigate('/login');
  }
};

// 3. Resend code if needed
const resendCode = async () => {
  const userId = localStorage.getItem('pendingUserId');
  
  const response = await fetch('http://localhost:5000/api/auth/resend-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  
  const data = await response.json();
  alert(data.message);
};
```

### Login Flow
```javascript
// 4. Login (after verification)
const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'password123'
  })
});

const data = await loginResponse.json();

if (data.requiresVerification) {
  // User hasn't verified email yet
  localStorage.setItem('pendingUserId', data.userId);
  localStorage.setItem('pendingEmail', data.email);
  navigate('/verify-email');
} else if (data.token) {
  // Login successful
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  navigate('/dashboard');
}
```

---

## Email Template
The verification email includes:
- Welcome header with Classence branding
- Personalized greeting with user's first name
- 6-digit verification code (large, centered)
- Expiration notice (10 minutes)
- Professional footer

---

## Environment Variables Required
```env
BREVO_SMTP_USER=your_brevo_smtp_user
BREVO_SMTP_KEY=your_brevo_smtp_key
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_sender_email@example.com
BREVO_SENDER_NAME=Your App Name
```

---

## Testing

### Test Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "matricNumber": "TST/2024/001",
    "password": "test123",
    "departmentId": "dept_id"
  }'
```

### Test Verification
```bash
curl -X POST http://localhost:5000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_id_from_registration",
    "code": "123456"
  }'
```

---

## Notes
- Verification codes expire after 10 minutes
- Users can request new codes via resend endpoint
- Login is blocked until email is verified
- Both student and admin registration require email verification
