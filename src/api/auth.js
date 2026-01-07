import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: 'http://localhost:8000/api/auth',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle token expiration
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

/**
 * Register a new user
 * @param {Object} data - User registration data
 * @param {string} data.username - Username
 * @param {string} data.email - Email address
 * @param {string} [data.first_name] - First name (optional)
 * @param {string} [data.last_name] - Last name (optional)
 * @param {string} data.password - Password
 * @param {string} data.password2 - Password confirmation
 * @returns {Promise} Axios response
 */
export const register = async (data) => {
    return api.post('/register/', data);
};

/**
 * Login user
 * @param {Object} data - Login credentials
 * @param {string} data.username - Username
 * @param {string} data.password - Password
 * @returns {Promise} Axios response with access token
 */
export const login = async (data) => {
    return api.post('/login/', data);
};

/**
 * Get user profile
 * @returns {Promise} Axios response with user profile data
 */
export const getProfile = async () => {
    return api.get('/profile/');
};

export default api;
