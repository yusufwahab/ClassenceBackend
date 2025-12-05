# Signature-Based Attendance API Guide

## Updated Registration & Attendance Flow

### 1. Student Registration (Updated)
**POST** `/api/auth/register`
```json
{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john@student.edu",
  "matricNumber": "CS/2024/001",
  "password": "password123",
  "departmentId": "department_id_here"
}
```

**Response:**
```json
{
  "message": "Student registered successfully. Please complete your profile.",
  "userId": "user_id",
  "requiresSignature": true
}
```

### 2. Save Signature (New Endpoint)
**POST** `/api/profile/signature`
**Headers:** `Authorization: Bearer <token>`
```json
{
  "signatureImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**Response:**
```json
{
  "message": "Signature saved successfully. Profile completed!",
  "profileCompleted": true
}
```

### 3. Get Profile Status (New Endpoint)
**GET** `/api/profile/me`
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@student.edu",
    "matricNumber": "CS/2024/001",
    "role": "student",
    "departmentId": "dept_id",
    "departmentName": "Computer Science",
    "profileCompleted": true,
    "hasSignature": true
  }
}
```

### 4. Mark Attendance (Enhanced)
**POST** `/api/student/attendance`
**Headers:** `Authorization: Bearer <token>`
**Body:** None (all data auto-collected)

**Success Response:**
```json
{
  "message": "Attendance marked successfully!",
  "attendance": {
    "name": "John Doe",
    "matricNumber": "CS/2024/001", 
    "date": "2024-12-05",
    "timeIn": "9:45 AM",
    "status": "present"
  }
}
```

**Error Responses:**
```json
// Already marked today
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

### 5. Admin - Today's Attendance Table (New)
**GET** `/api/admin/attendance/today`
**Headers:** `Authorization: Bearer <admin_token>`

**Response:**
```json
{
  "date": "2024-12-05",
  "totalPresent": 3,
  "attendanceRecords": [
    {
      "serialNumber": 1,
      "name": "John Doe",
      "matricNumber": "CS/2024/001",
      "signatureImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
      "timeIn": "9:45 AM",
      "date": "2024-12-05"
    },
    {
      "serialNumber": 2,
      "name": "Jane Smith", 
      "matricNumber": "CS/2024/002",
      "signatureImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
      "timeIn": "10:15 AM",
      "date": "2024-12-05"
    }
  ]
}
```

## Frontend Implementation Examples

### Registration Flow
```javascript
// Step 1: Register student
const registerStudent = async (formData) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      matricNumber: formData.matricNumber,
      password: formData.password,
      departmentId: formData.departmentId
    })
  });
  
  const result = await response.json();
  
  if (result.requiresSignature) {
    // Redirect to signature setup page
    window.location.href = '/signature-setup';
  }
  
  return result;
};

// Step 2: Save signature
const saveSignature = async (signatureDataURL) => {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/profile/signature', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      signatureImage: signatureDataURL
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

### Attendance Marking
```javascript
const markAttendance = async () => {
  const token = localStorage.getItem('token');
  
  // Show loading state
  const button = document.getElementById('attendance-btn');
  button.disabled = true;
  button.textContent = 'Marking...';
  
  try {
    const response = await fetch('/api/student/attendance', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
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
```

### Admin Attendance Table
```javascript
const loadTodayAttendance = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/admin/attendance/today', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  
  // Update table
  const tableBody = document.getElementById('attendance-table-body');
  tableBody.innerHTML = '';
  
  data.attendanceRecords.forEach(record => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${record.serialNumber}</td>
      <td>${record.name}</td>
      <td>${record.matricNumber}</td>
      <td><img src="${record.signatureImage}" alt="Signature" style="max-width: 100px; height: 50px;"></td>
      <td>${record.timeIn}</td>
    `;
    tableBody.appendChild(row);
  });
  
  // Update summary
  document.getElementById('total-present').textContent = data.totalPresent;
  document.getElementById('attendance-date').textContent = data.date;
};
```

## Key Changes Made:

1. **User Model**: Added `matricNumber`, `signatureImage`, `profileCompleted`
2. **Attendance Model**: Added `name`, `matricNumber`, `signatureImage` 
3. **New Profile Controller**: Handles signature saving and profile completion
4. **Enhanced Attendance**: Auto-collects all student data when marking
5. **Admin Table View**: New endpoint for today's attendance with signatures
6. **Registration Flow**: Now requires signature completion after registration

## Database Changes:
- Students must have unique matric numbers
- Signatures stored as base64 strings
- Profile completion tracking
- Attendance records include full student details for admin table view