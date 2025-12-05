# Frontend API Integration Guide

## Base Configuration
```javascript
const API_BASE_URL = 'http://localhost:5000/api';

// Set authorization header for protected routes
const setAuthHeader = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
});
```

## Complete Registration & Signature Flow

### 1. Get Departments (for registration form)
```javascript
const getDepartments = async () => {
  const response = await fetch(`${API_BASE_URL}/departments`);
  return await response.json();
  // Returns: [{ id: "...", name: "Computer Science" }]
};
```

### 2. Admin Registration
```javascript
const registerAdmin = async (adminData) => {
  const response = await fetch(`${API_BASE_URL}/auth/register-admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      email: adminData.email,
      password: adminData.password,
      newDepartmentName: adminData.departmentName,
      adminCode: "ADMIN_SECRET_2024"
    })
  });
  return await response.json();
};
```

### 3. Student Registration (Updated)
```javascript
const registerStudent = async (studentData) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      email: studentData.email,
      matricNumber: studentData.matricNumber, // NEW FIELD
      password: studentData.password,
      departmentId: studentData.selectedDepartmentId
    })
  });
  
  const result = await response.json();
  
  // Check if signature is required
  if (result.requiresSignature) {
    // Redirect to signature setup page
    window.location.href = '/signature-setup';
  }
  
  return result;
};
```

### 4. Save Signature (New - After Registration)
```javascript
const saveSignature = async (signatureDataURL) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/profile/signature`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      signatureImage: signatureDataURL // Base64 string from canvas
    })
  });
  
  const result = await response.json();
  
  if (result.profileCompleted) {
    // Show success message and redirect to login
    alert('Profile completed! You can now log in.');
    window.location.href = '/login';
  }
  
  return result;
};
```

### 5. Get Profile Status (New)
```javascript
const getProfileStatus = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/profile/me`, {
    headers: setAuthHeader(token)
  });
  return await response.json();
  // Returns: { user: { profileCompleted: true, hasSignature: true, ... } }
};
```

### 6. Login (Both Admin & Student)
```javascript
const login = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password
    })
  });
  const data = await response.json();
  
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
};
```

## Student Dashboard Integration

### Get Dashboard Data
```javascript
const getStudentDashboard = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/student/dashboard`, {
    headers: setAuthHeader(token)
  });
  return await response.json();
  // Returns: { user, todayAttendance, recentUpdates }
};
```

### Mark Attendance (Enhanced - One Click)
```javascript
const markAttendance = async () => {
  const token = localStorage.getItem('token');
  
  // Show loading state
  const button = document.getElementById('attendance-btn');
  button.disabled = true;
  button.textContent = 'Marking...';
  
  try {
    const response = await fetch(`${API_BASE_URL}/student/attendance`, {
      method: 'POST',
      headers: setAuthHeader(token)
      // No body needed - auto-collects name, matric, signature, date, time
    });
    
    const result = await response.json();
    
    if (response.ok) {
      // Success - update UI
      showSuccessMessage('✅ Attendance marked successfully!');
      updateAttendanceCard(result.attendance);
      button.textContent = 'Already Marked';
      button.style.backgroundColor = '#gray';
    } else {
      // Handle errors
      if (result.requiresSignature) {
        window.location.href = '/signature-setup';
      } else {
        showErrorMessage(result.message);
      }
      button.disabled = false;
      button.textContent = 'Mark Attendance';
    }
  } catch (error) {
    showErrorMessage('Network error. Please try again.');
    button.disabled = false;
    button.textContent = 'Mark Attendance';
  }
};

// Helper function to update attendance card
const updateAttendanceCard = (attendance) => {
  document.getElementById('attendance-status').innerHTML = `
    <div class="success-card">
      <h3>✓ Attendance Marked Successfully</h3>
      <p><strong>Name:</strong> ${attendance.name}</p>
      <p><strong>Matric:</strong> ${attendance.matricNumber}</p>
      <p><strong>Time:</strong> ${attendance.timeIn}</p>
      <p><strong>Date:</strong> ${attendance.date}</p>
    </div>
  `;
};
```

### Get Department Updates
```javascript
const getUpdates = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/student/updates`, {
    headers: setAuthHeader(token)
  });
  return await response.json();
};
```

## Admin Dashboard Integration

### Get Admin Dashboard
```javascript
const getAdminDashboard = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
    headers: setAuthHeader(token)
  });
  return await response.json();
  // Returns: { departmentName, totalStudents, todayAttendance, recentStudents }
};
```

### Get Students List
```javascript
const getStudents = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/admin/students`, {
    headers: setAuthHeader(token)
  });
  return await response.json();
};
```

### Post Department Update
```javascript
const postUpdate = async (updateData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/admin/updates`, {
    method: 'POST',
    headers: setAuthHeader(token),
    body: JSON.stringify({
      title: updateData.title,
      content: updateData.content
    })
  });
  return await response.json();
};
```

### Today's Attendance Table (New)
```javascript
const getTodayAttendance = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/admin/attendance/today`, {
    headers: setAuthHeader(token)
  });
  
  const data = await response.json();
  
  // Update attendance table
  const tableBody = document.getElementById('attendance-table-body');
  tableBody.innerHTML = '';
  
  data.attendanceRecords.forEach(record => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${record.serialNumber}</td>
      <td>${record.name}</td>
      <td>${record.matricNumber}</td>
      <td><img src="${record.signatureImage}" alt="Signature" style="max-width: 100px; height: 50px; border: 1px solid #ccc;"></td>
      <td>${record.timeIn}</td>
    `;
    tableBody.appendChild(row);
  });
  
  // Update summary
  document.getElementById('total-present').textContent = data.totalPresent;
  document.getElementById('attendance-date').textContent = data.date;
  
  return data;
};
```

### Export Attendance Report
```javascript
const exportAttendance = async (startDate, endDate) => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    `${API_BASE_URL}/admin/attendance/export?startDate=${startDate}&endDate=${endDate}`,
    { headers: setAuthHeader(token) }
  );
  return await response.json();
};
```

## Error Handling

```javascript
const handleApiResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }
  return await response.json();
};

// Usage example
try {
  const data = await handleApiResponse(
    await fetch(`${API_BASE_URL}/student/dashboard`, {
      headers: setAuthHeader(token)
    })
  );
} catch (error) {
  console.error('Dashboard error:', error.message);
}
```

## Route Protection

```javascript
// Check if user is authenticated
const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

// Check user role
const getUserRole = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.role;
};

// Logout function
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Redirect to login page
};
```

## Complete Registration Flow Example

```javascript
// Registration Form Component
const StudentRegistration = () => {
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    matricNumber: '', // NEW FIELD
    password: '',
    departmentId: ''
  });

  useEffect(() => {
    // Load departments for dropdown
    const loadDepartments = async () => {
      const depts = await getDepartments();
      setDepartments(depts);
    };
    loadDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await registerStudent(formData);
    
    if (result.requiresSignature) {
      // Redirect to signature setup
      window.location.href = '/signature-setup';
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text" 
        placeholder="First Name"
        value={formData.firstName}
        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
        required
      />
      
      <input 
        type="text" 
        placeholder="Last Name"
        value={formData.lastName}
        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
        required
      />
      
      <input 
        type="email" 
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        required
      />
      
      <input 
        type="text" 
        placeholder="Matric Number (e.g., CS/2024/001)"
        value={formData.matricNumber}
        onChange={(e) => setFormData({...formData, matricNumber: e.target.value})}
        required
      />
      
      <select 
        value={formData.departmentId}
        onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
        required
      >
        <option value="">Select Department</option>
        {departments.map(dept => (
          <option key={dept.id} value={dept.id}>
            {dept.name}
          </option>
        ))}
      </select>
      
      <input 
        type="password" 
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
        required
      />
      
      <button type="submit">Register</button>
    </form>
  );
};
```

## Signature Setup Component

```javascript
const SignatureSetup = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = async () => {
    const canvas = canvasRef.current;
    const signatureDataURL = canvas.toDataURL('image/png');
    
    const result = await saveSignature(signatureDataURL);
    
    if (result.profileCompleted) {
      alert('Profile completed! You can now log in.');
      window.location.href = '/login';
    }
  };

  return (
    <div className="signature-setup">
      <h2>Complete Your Profile - Create Your Signature</h2>
      <p>Draw your signature below. This will be used for attendance marking.</p>
      
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        style={{ border: '1px solid #ccc', cursor: 'crosshair' }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
      
      <div className="signature-buttons">
        <button onClick={clearSignature}>Clear</button>
        <button onClick={saveSignature}>Save & Continue</button>
      </div>
      
      <div className="upload-option">
        <p>Or upload a signature image:</p>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
      </div>
    </div>
  );
};
```

## React Hook Example

```javascript
import { useState, useEffect } from 'react';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    const data = await response.json();
    
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    
    return data;
  };

  return { user, token, login, logout };
};
```

## Status Codes

- **200**: Success
- **201**: Created successfully
- **400**: Bad request (validation error)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **500**: Server error

## New API Endpoints Summary

### Profile Management
- `POST /api/profile/signature` - Save signature after registration
- `GET /api/profile/me` - Get profile completion status

### Enhanced Attendance
- `POST /api/student/attendance` - One-click attendance (auto-collects all data)
- `GET /api/admin/attendance/today` - Today's attendance table with signatures

## Complete User Journey

### Student Flow:
1. **Registration** → Fill form with matric number
2. **Signature Setup** → Draw/upload signature  
3. **Login** → Access dashboard
4. **One-Click Attendance** → System auto-collects name, matric, signature, time
5. **View Updates** → See department announcements

### Admin Flow:
1. **Registration** → Create department
2. **Login** → Access admin dashboard
3. **View Today's Table** → See all attendance with signatures
4. **Manage Students** → View all registered students
5. **Post Updates** → Send announcements
6. **Export Reports** → Download attendance data

## Required Headers

**Protected Routes:**
```javascript
{
  'Authorization': 'Bearer <jwt_token>',
  'Content-Type': 'application/json'
}
```

**Public Routes:**
```javascript
{
  'Content-Type': 'application/json'
}
```

## Key Features

✅ **Matric Number Integration** - Students register with matric numbers  
✅ **Signature Management** - Digital signature collection and storage  
✅ **One-Click Attendance** - Auto-collects all student data  
✅ **Admin Table View** - Complete attendance records with signatures  
✅ **Profile Completion** - Ensures students have signatures before attendance  
✅ **Real-time Updates** - Live attendance table for admins