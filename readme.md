# Chat App

**Author:** Anugrah M V

A simple chat app using Node.js, Express, MongoDB, Socket.io

---

## Getting Started

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production
npm start
```

---

## API Endpoints

### User Authentication

#### 1. Signup (Initiate)

**POST** `/api/v1/auth/signup`

Initiates user signup and sends OTP to email.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
    "email": "john@example.com",
    "username": "johndoe",
    "fullname": "John Doe",
    "password": "SecurePass123"
}
```

**Success Response (200):**
```json
{
    "success": true,
    "message": "Signup initiated. Please verify your email with the OTP sent",
    "data": {
        "message": "Signup initiated. Please verify your email with the OTP sent",
        "email": "john@example.com"
    }
}
```

**Validation Rules:**
| Field | Rules |
|-------|-------|
| email | Valid email, max 254 chars |
| username | 3-30 chars, alphanumeric + underscore |
| fullname | 2-50 chars, letters and spaces only |
| password | Min 8 chars, 1 uppercase, 1 lowercase, 1 number |

---

#### 2. Verify OTP (Complete Signup)

**POST** `/api/v1/auth/verify-otp`

Verifies OTP and creates user account.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
    "email": "john@example.com",
    "otp": "123456"
}
```

**Success Response (201):**
```json
{
    "success": true,
    "message": "Account created successfully",
    "data": {
        "user": {
            "id": "...",
            "email": "john@example.com",
            "username": "johndoe",
            "fullname": "John Doe",
            "profilePicture": "",
            "isEmailVerified": true,
            "createdAt": "2026-02-04T17:47:23.045Z"
        },
        "accessToken": "eyJhbG...",
        "refreshToken": "eyJhbG..."
    }
}
```

> ⚠️ **Dev Mode:** OTP is logged to server console when SMTP is not configured.

---

#### 3. Resend OTP

**POST** `/api/v1/auth/resend-otp`

Resends OTP to email (1 minute cooldown between requests).

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
    "email": "john@example.com"
}
```

**Success Response (200):**
```json
{
    "success": true,
    "message": "OTP has been resent to your email",
    "data": {
        "message": "OTP has been resent to your email",
        "email": "john@example.com"
    }
}
```

---

#### 4. Health Check

**GET** `/api/v1/health`

**Success Response (200):**
```json
{
    "status": "API working",
    "timestamp": "2026-02-04T17:47:23.045Z"
}
```

---

## Error Responses

**Validation Error (422):**
```json
{
    "success": false,
    "message": "Validation failed",
    "errors": [
        { "field": "email", "message": "Please provide a valid email address" },
        { "field": "password", "message": "Password must be at least 8 characters long" }
    ]
}
```

**Rate Limit Error (429):**
```json
{
    "success": false,
    "message": "Too many requests. Please try again later"
}
```

---

## Environment Variables

```env
# Database
MONGO_URI=your-mongodb-uri

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# SMTP (for production email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@chatapp.com

# OTP
OTP_EXPIRES_IN_MINUTES=10
OTP_MAX_ATTEMPTS=3
```