# User Authentication Backend API

A complete Django REST Framework backend for User Management & Authentication with MySQL database and JWT token-based authentication.

## 🚀 Tech Stack

- **Framework:** Django 5.0.1
- **API:** Django REST Framework 3.14.0
- **Authentication:** JWT (Simple JWT)
- **Database:** MySQL
- **CORS:** django-cors-headers
- **Environment:** python-decouple

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.10+** - [Download Python](https://www.python.org/downloads/)
- **MySQL Server 8.0+** - [Download MySQL](https://dev.mysql.com/downloads/mysql/)
- **MySQL Workbench** (optional) - For database management
- **pip** - Python package manager (comes with Python)

## 🗄️ Database Setup

### 1. Start MySQL Server
Make sure your MySQL server is running.

### 2. Create MySQL Database
Open MySQL command line or MySQL Workbench and run:

```sql
CREATE DATABASE user_auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Verify Database Creation
```sql
SHOW DATABASES;
```

You should see `user_auth_db` in the list.

## ⚙️ Installation & Setup

### 1. Navigate to Backend Directory
```bash
cd user-auth-backend
```

### 2. Create Virtual Environment
```bash
python -m venv venv
```

### 3. Activate Virtual Environment

**On Windows:**
```bash
venv\Scripts\activate
```

**On macOS/Linux:**
```bash
source venv/bin/activate
```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

### 5. Environment Configuration

Copy `.env.example` to `.env`:
```bash
# Windows
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

Update `.env` file with your MySQL credentials:
```env
SECRET_KEY=django-insecure-generate-random-secret-key-here-123456789
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=user_auth_db
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### 6. Run Database Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 7. Create Superuser (Optional - for Admin Access)
```bash
python manage.py createsuperuser
```

### 8. Run Development Server
```bash
python manage.py runserver
```

The server will start at: `http://localhost:8000`

## 🔌 API Endpoints

### Base URL
```
http://localhost:8000/api/auth/
```

### Endpoint Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register/` | Register new user | No |
| POST | `/api/auth/login/` | Login & get tokens | No |
| GET | `/api/auth/profile/` | Get logged-in user profile | Yes |
| POST | `/api/auth/logout/` | Logout (blacklist token) | Yes |
| POST | `/api/auth/token/refresh/` | Refresh access token | No |
| GET | `/api/auth/health/` | API health check | No |

---

## 📝 API Documentation

### 1. User Registration

**Endpoint:** `POST /api/auth/register/`

**Description:** Register a new user account.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "password": "SecurePass123!",
  "password2": "SecurePass123!"
}
```

**Validation Rules:**
- `username`: 3-30 characters, alphanumeric with `_`, `-`, `.` allowed, unique
- `email`: Valid email format, unique
- `first_name`: 2-50 characters, required
- `last_name`: 2-50 characters, required
- `password`: Minimum 8 characters, not too common, not entirely numeric
- `password2`: Must match `password`

**Success Response (201 Created):**
```json
{
  "message": "User registered successfully.",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe",
    "profile_picture": null,
    "created_at": "2026-01-08T00:00:00.000000Z",
    "updated_at": "2026-01-08T00:00:00.000000Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "username": ["A user with that username already exists."],
  "email": ["A user with this email address already exists."],
  "password": ["This password is too short. It must contain at least 8 characters."],
  "password2": ["Passwords don't match."]
}
```

---

### 2. User Login

**Endpoint:** `POST /api/auth/login/`

**Description:** Authenticate user and receive JWT tokens.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "SecurePass123!"
}
```

**Success Response (200 OK):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Error Response (401 Unauthorized):**
```json
{
  "detail": "No active account found with the given credentials"
}
```

**Token Lifetimes:**
- Access Token: 24 hours (1 day)
- Refresh Token: 7 days

---

### 3. Get User Profile

**Endpoint:** `GET /api/auth/profile/`

**Description:** Retrieve the authenticated user's profile information.

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "full_name": "John Doe",
  "profile_picture": null,
  "created_at": "2026-01-08T00:00:00.000000Z",
  "updated_at": "2026-01-08T00:00:00.000000Z"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "detail": "Authentication credentials were not provided."
}
```

---

### 4. Logout

**Endpoint:** `POST /api/auth/logout/`

**Description:** Logout by blacklisting the refresh token.

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Success Response (200 OK):**
```json
{
  "message": "Successfully logged out."
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Refresh token is required."
}
```

---

### 5. Refresh Token

**Endpoint:** `POST /api/auth/token/refresh/`

**Description:** Get a new access token using the refresh token.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Success Response (200 OK):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Error Response (401 Unauthorized):**
```json
{
  "detail": "Token is invalid or expired",
  "code": "token_not_valid"
}
```

---

### 6. Health Check

**Endpoint:** `GET /api/auth/health/`

**Description:** Check if the API is running.

**Success Response (200 OK):**
```json
{
  "status": "healthy",
  "message": "User Authentication API is running."
}
```

---

## 🔐 Security Features

- **Password Hashing:** Django's PBKDF2 algorithm with SHA256
- **JWT Authentication:** Secure token-based authentication
- **Token Expiry:** 
  - Access Token: 24 hours
  - Refresh Token: 7 days
- **Token Blacklisting:** Revoked tokens are blacklisted
- **CORS Protection:** Only allowed origins can access the API
- **Input Validation:** All user inputs are validated
- **SQL Injection Protection:** Django ORM prevents SQL injection
- **Password Validation:** Enforces minimum requirements

---

## 🧪 Testing

### Run All Tests
```bash
python manage.py test users
```

### Run Tests with Verbosity
```bash
python manage.py test users -v 2
```

### Run Specific Test Class
```bash
python manage.py test users.tests.RegisterAPITests
```

### Test Coverage (requires coverage package)
```bash
pip install coverage
coverage run --source='.' manage.py test users
coverage report
```

---

## 📮 Testing with cURL

### Register New User
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User",
    "password": "SecurePass123!",
    "password2": "SecurePass123!"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "SecurePass123!"
  }'
```

### Get Profile (replace YOUR_ACCESS_TOKEN)
```bash
curl -X GET http://localhost:8000/api/auth/profile/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Refresh Token
```bash
curl -X POST http://localhost:8000/api/auth/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "YOUR_REFRESH_TOKEN"
  }'
```

---

## 📮 Testing with Postman

1. **Import Collection:** Create a new collection in Postman
2. **Add Requests:** Add the above endpoints to your collection
3. **Environment Variables:** 
   - Create `base_url` = `http://localhost:8000`
   - Create `access_token` = (set after login)
   - Create `refresh_token` = (set after login)
4. **Authorization:** 
   - Select "Bearer Token" type
   - Use `{{access_token}}` variable
5. **Auto-Set Tokens:** In Login request's "Tests" tab, add:
   ```javascript
   if (pm.response.code === 200) {
       var jsonData = pm.response.json();
       pm.environment.set("access_token", jsonData.access);
       pm.environment.set("refresh_token", jsonData.refresh);
   }
   ```

---

## 👨‍💼 Admin Panel

Access the Django admin panel at: `http://localhost:8000/admin/`

**Features:**
- View/Create/Edit/Delete users
- Filter users by status, staff, creation date
- Search users by username, email, name
- View user activity and timestamps

**Default Superuser:** Create one using:
```bash
python manage.py createsuperuser
```

---

## 🛠️ Troubleshooting

### MySQL Connection Error
```
django.db.utils.OperationalError: (2003, "Can't connect to MySQL server")
```
**Solution:**
- Ensure MySQL server is running
- Check database credentials in `.env`
- Verify MySQL is accepting connections on port 3306

### Database Does Not Exist
```
django.db.utils.OperationalError: (1049, "Unknown database 'user_auth_db'")
```
**Solution:**
Create the database:
```sql
CREATE DATABASE user_auth_db;
```

### Migration Issues
```bash
# Reset migrations (if needed)
python manage.py makemigrations --empty users
python manage.py migrate --run-syncdb
```

### Port Already in Use
```bash
# Use a different port
python manage.py runserver 8001
```

### ModuleNotFoundError
```bash
# Ensure virtual environment is activated
# Windows:
venv\Scripts\activate
# Then reinstall:
pip install -r requirements.txt
```

### CORS Issues
Ensure your frontend URL is in `CORS_ALLOWED_ORIGINS` in `.env`:
```
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

---

## 📁 Project Structure

```
user-auth-backend/
├── config/                     # Main Django project folder
│   ├── __init__.py
│   ├── settings.py            # Main settings (DB, JWT, CORS, DRF)
│   ├── urls.py                # Root URL routing
│   ├── wsgi.py                # WSGI config for deployment
│   └── asgi.py                # ASGI config for async
│
├── users/                      # User management app
│   ├── migrations/            # Database migrations
│   │   └── __init__.py
│   ├── __init__.py
│   ├── admin.py               # Admin panel configuration
│   ├── apps.py                # App configuration
│   ├── models.py              # Custom User model
│   ├── serializers.py         # DRF serializers
│   ├── views.py               # API views (Register, Profile, Logout)
│   ├── urls.py                # App URL routing
│   └── tests.py               # Unit tests
│
├── venv/                       # Virtual environment (not in git)
├── manage.py                   # Django management script
├── requirements.txt            # Python dependencies
├── .env                        # Environment variables (not in git)
├── .env.example                # Example environment file
├── .gitignore                  # Git ignore patterns
└── README.md                   # This file
```

---

## 🎯 Design Decisions

| Decision | Reason |
|----------|--------|
| **MySQL over SQLite** | Production-ready, better for concurrent connections and scalability |
| **JWT over Sessions** | Stateless authentication ideal for REST APIs and SPAs |
| **AbstractUser extension** | Flexibility to add custom fields like `profile_picture` |
| **Environment Variables** | Security best practice for sensitive configuration |
| **Django REST Framework** | Industry standard with built-in serialization, validation, authentication |
| **Token Blacklisting** | Secure logout by invalidating refresh tokens |
| **Separate Serializers** | Clean separation between registration and profile data |

---

## 🔗 Frontend Integration

This backend is designed to work with the React frontend running on `http://localhost:5173`.

### Frontend API Service Example

```javascript
// api.js
const API_BASE = 'http://localhost:8000/api/auth';

export const authAPI = {
  register: (data) => 
    fetch(`${API_BASE}/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),
    
  login: (data) => 
    fetch(`${API_BASE}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),
    
  getProfile: (token) => 
    fetch(`${API_BASE}/profile/`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      }
    }),
};
```

---

## 📄 License

This project is created for educational purposes.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📞 Support

If you encounter any issues, please check the Troubleshooting section above or open an issue in the repository.
