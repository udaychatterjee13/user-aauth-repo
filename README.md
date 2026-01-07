# User Authentication Frontend

A modern, responsive user authentication frontend built with React, Vite, and Tailwind CSS. This application provides a beautiful user interface for registration, login, and profile management.

## 🚀 Features

- **User Registration** - Complete registration form with validation
- **User Login** - Secure login with JWT token management
- **Protected Dashboard** - Profile display with authentication check
- **Modern UI** - Glass morphism design with smooth animations
- **Responsive Design** - Mobile-first approach, works on all devices
- **Error Handling** - User-friendly error messages and loading states

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls

## 📦 Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd user-auth-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173`

## 🔧 Configuration

### API Base URL

The application expects a Django REST backend running on `http://localhost:8000`. To change this, edit `src/api/auth.js`:

```javascript
const api = axios.create({
  baseURL: 'http://localhost:8000/api/auth',
  // ...
});
```

### Backend API Endpoints

The frontend expects the following API endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | User registration |
| POST | `/api/auth/login/` | User login (returns JWT) |
| GET | `/api/auth/profile/` | Get user profile |

### Expected API Response Formats

**Login Response:**
```json
{
  "access": "jwt_access_token",
  "refresh": "jwt_refresh_token"
}
```

**Profile Response:**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe"
}
```

## 📁 Project Structure

```
src/
├── api/
│   └── auth.js          # API service with axios
├── pages/
│   ├── Register.jsx     # Registration page
│   ├── Login.jsx        # Login page
│   └── Dashboard.jsx    # Protected dashboard
├── App.jsx              # Main app with routing
├── main.jsx             # Entry point
└── index.css            # Tailwind imports & custom styles
```

## 🎨 Design Features

- **Glass Morphism** - Modern frosted glass effect
- **Gradient Backgrounds** - Beautiful color transitions
- **Smooth Animations** - Fade-in, slide-up effects
- **Responsive Layout** - Adapts to all screen sizes
- **Loading States** - Spinner animations during API calls
- **Error States** - Clear error messaging with icons

## 🔐 Security

- JWT tokens stored in localStorage
- Automatic token attachment to API requests
- Token clearance on logout
- Protected route redirection
- No sensitive data in error messages

## 📱 Responsive Breakpoints

- **Mobile** (< 640px): Full-width cards
- **Tablet** (640px - 1024px): Medium-width centered
- **Desktop** (> 1024px): Max 400px forms

## 🚀 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 📝 License

MIT License - Feel free to use this project as you wish.

---

Built with ❤️ using React + Vite + Tailwind CSS
