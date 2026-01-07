import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/auth';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [timeOfDay, setTimeOfDay] = useState(0); // 0-100 representing sun position
    const containerRef = useRef(null);

    // Animate sun position
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeOfDay((prev) => (prev + 0.3) % 100);
        }, 100);
        return () => clearInterval(interval);
    }, []);

    // Track mouse movement
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setMousePos({
                    x: ((e.clientX - rect.left) / rect.width) * 100,
                    y: ((e.clientY - rect.top) / rect.height) * 100,
                });
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Calculate sun position and sky colors
    const sunY = Math.sin((timeOfDay / 100) * Math.PI) * 60 + 20;
    const sunX = timeOfDay;

    // Sun is visible from 5% to 95% (rises and sets)
    const sunVisible = timeOfDay > 5 && timeOfDay < 95;
    // Calculate sun opacity for smooth fade in/out
    const sunOpacity = timeOfDay <= 5 ? timeOfDay / 5
        : timeOfDay >= 95 ? (100 - timeOfDay) / 5
            : 1;

    // Moon is only visible during true night (0-8% and 92-100%)
    const isNight = timeOfDay <= 8 || timeOfDay >= 92;
    const moonOpacity = timeOfDay <= 5 ? 1
        : timeOfDay <= 8 ? (8 - timeOfDay) / 3
            : timeOfDay >= 95 ? (timeOfDay - 95) / 5
                : timeOfDay >= 92 ? (timeOfDay - 92) / 3
                    : 0;

    const isDay = timeOfDay > 10 && timeOfDay < 90;
    const isDawn = (timeOfDay > 5 && timeOfDay <= 25) || (timeOfDay >= 75 && timeOfDay < 95);

    const getSkyGradient = () => {
        if (timeOfDay <= 5 || timeOfDay >= 95) {
            return 'linear-gradient(to bottom, #0f0c29, #302b63, #24243e)';
        } else if (timeOfDay < 20) {
            return 'linear-gradient(to bottom, #ff7e5f, #feb47b, #86a8e7)';
        } else if (timeOfDay < 80) {
            return 'linear-gradient(to bottom, #56ccf2, #2f80ed, #a8edea)';
        } else if (timeOfDay < 95) {
            return 'linear-gradient(to bottom, #ff6b6b, #feca57, #5f27cd)';
        } else {
            return 'linear-gradient(to bottom, #0f0c29, #302b63, #24243e)';
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name] || errors.general) {
            setErrors((prev) => ({ ...prev, [name]: '', general: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.username.trim()) newErrors.username = 'Please enter your username';
        if (!formData.password) newErrors.password = 'Please enter your password';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsLoading(true);
        setErrors({});

        try {
            const response = await login(formData);
            if (response.data?.access) {
                localStorage.setItem('token', response.data.access);
                if (response.data?.refresh) localStorage.setItem('refreshToken', response.data.refresh);
                navigate('/dashboard');
            } else if (response.data?.token) {
                localStorage.setItem('token', response.data.token);
                navigate('/dashboard');
            }
        } catch (error) {
            if (error.response?.data) {
                const apiErrors = error.response.data;
                if (apiErrors.detail) setErrors({ general: apiErrors.detail });
                else setErrors({ general: 'Invalid credentials. Please try again.' });
            } else {
                setErrors({ general: 'Unable to connect. Please try again later.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            ref={containerRef}
            className="min-h-screen relative overflow-hidden transition-all duration-1000"
            style={{ background: getSkyGradient() }}
        >
            {/* Stars (visible at night) */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isDay ? 'opacity-0' : 'opacity-100'}`}>
                {[...Array(50)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 50}%`,
                            animationDelay: `${Math.random() * 3}s`,
                        }}
                    />
                ))}
            </div>

            {/* Sun - only visible during day, fades at sunrise/sunset */}
            {sunVisible && (
                <div
                    className="absolute w-20 h-20 rounded-full transition-all duration-500"
                    style={{
                        left: `${sunX}%`,
                        top: `${80 - sunY}%`,
                        opacity: sunOpacity,
                        background: isDawn
                            ? 'radial-gradient(circle, #ff6b6b 0%, #feca57 50%, transparent 70%)'
                            : 'radial-gradient(circle, #fff9c4 0%, #ffd54f 50%, transparent 70%)',
                        boxShadow: isDawn
                            ? '0 0 60px #ff6b6b, 0 0 120px #feca57'
                            : '0 0 80px #ffd54f, 0 0 160px #fff9c4',
                        transform: 'translate(-50%, -50%)',
                    }}
                />
            )}

            {/* Moon - only visible during true night, after sun has set */}
            {moonOpacity > 0 && (
                <div
                    className="absolute w-16 h-16 rounded-full transition-all duration-500"
                    style={{
                        right: '15%',
                        top: '15%',
                        opacity: moonOpacity,
                        background: 'radial-gradient(circle at 30% 30%, #f5f5f5 0%, #e0e0e0 50%, #bdbdbd 100%)',
                        boxShadow: `0 0 ${30 * moonOpacity}px rgba(255,255,255,0.3)`,
                    }}
                />
            )}

            {/* Clouds */}
            <div className="absolute w-full h-full pointer-events-none">
                <Cloud style={{ left: '10%', top: '15%', animationDuration: '25s' }} />
                <Cloud style={{ left: '60%', top: '10%', animationDuration: '30s', transform: 'scale(0.8)' }} />
                <Cloud style={{ left: '35%', top: '20%', animationDuration: '35s', transform: 'scale(1.2)' }} />
            </div>

            {/* Mountains */}
            <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ height: '40%' }}>
                <path fill={isDay ? '#2d5016' : '#1a3009'} className="transition-colors duration-1000"
                    d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,234.7C960,224,1056,192,1152,181.3C1248,171,1344,181,1392,186.7L1440,192L1440,320L0,320Z" />
                <path fill={isDay ? '#3d6b1e' : '#2d5016'} className="transition-colors duration-1000"
                    d="M0,256L60,250.7C120,245,240,235,360,229.3C480,224,600,224,720,234.7C840,245,960,267,1080,261.3C1200,256,1320,224,1380,208L1440,192L1440,320L0,320Z" />
                <path fill={isDay ? '#4a7c23' : '#3d6b1e'} className="transition-colors duration-1000"
                    d="M0,288L80,282.7C160,277,320,267,480,272C640,277,800,299,960,293.3C1120,288,1280,256,1360,240L1440,224L1440,320L0,320Z" />
            </svg>

            {/* Trees */}
            <div className="absolute bottom-0 w-full flex justify-around items-end" style={{ height: '25%' }}>
                <Tree height="80%" color={isDay ? '#1a472a' : '#0d2818'} />
                <Tree height="60%" color={isDay ? '#22543d' : '#153726'} />
                <Tree height="90%" color={isDay ? '#1a472a' : '#0d2818'} />
                <Tree height="70%" color={isDay ? '#22543d' : '#153726'} />
                <Tree height="85%" color={isDay ? '#1a472a' : '#0d2818'} />
            </div>

            {/* Ground */}
            <div
                className="absolute bottom-0 w-full h-16 transition-colors duration-1000"
                style={{ background: isDay ? '#3d6b1e' : '#2d4a16' }}
            />

            {/* Fireflies (visible at night) */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isDay ? 'opacity-0' : 'opacity-100'}`}>
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-firefly"
                        style={{
                            left: `${20 + Math.random() * 60}%`,
                            top: `${50 + Math.random() * 40}%`,
                            animationDelay: `${Math.random() * 4}s`,
                            animationDuration: `${3 + Math.random() * 2}s`,
                        }}
                    />
                ))}
            </div>

            {/* Mouse trail effect */}
            <div
                className="fixed w-6 h-6 rounded-full pointer-events-none mix-blend-screen opacity-50 transition-transform duration-100"
                style={{
                    left: `${mousePos.x}%`,
                    top: `${mousePos.y}%`,
                    transform: 'translate(-50%, -50%)',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)',
                    boxShadow: '0 0 20px rgba(255,255,255,0.5)',
                }}
            />

            {/* Login Form Card */}
            <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
                <div
                    className="w-full max-w-md transform transition-transform duration-300"
                    style={{
                        transform: `perspective(1000px) rotateY(${(mousePos.x - 50) * 0.02}deg) rotateX(${(mousePos.y - 50) * -0.02}deg)`,
                    }}
                >
                    {/* Card with nature-inspired design */}
                    <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/50 relative overflow-hidden">
                        {/* Decorative leaf patterns */}
                        <div className="absolute -top-6 -right-6 w-24 h-24 opacity-20">
                            <LeafPattern />
                        </div>
                        <div className="absolute -bottom-6 -left-6 w-20 h-20 opacity-20 rotate-180">
                            <LeafPattern />
                        </div>

                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 mb-4 shadow-lg">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                                Welcome Back
                            </h2>
                            <p className="text-gray-600">Sign in to continue your journey</p>
                        </div>

                        {/* Error Message */}
                        {errors.general && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                                <p className="text-red-700 text-sm">{errors.general}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Username Field */}
                            <div className="group">
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                    Username
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 bg-white/70 border-2 ${errors.username ? 'border-red-300' : 'border-gray-200'
                                            } rounded-xl text-gray-800 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300 hover:border-emerald-300`}
                                        placeholder="Enter your username"
                                    />
                                    {errors.username && (
                                        <p className="mt-2 text-sm text-red-500">{errors.username}</p>
                                    )}
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="group">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 bg-white/70 border-2 ${errors.password ? 'border-red-300' : 'border-gray-200'
                                            } rounded-xl text-gray-800 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300 hover:border-emerald-300`}
                                        placeholder="Enter your password"
                                    />
                                    {errors.password && (
                                        <p className="mt-2 text-sm text-red-500">{errors.password}</p>
                                    )}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Register Link */}
                        <div className="mt-8 text-center">
                            <p className="text-gray-600">
                                New here?{' '}
                                <Link
                                    to="/register"
                                    className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-colors"
                                >
                                    Create an account
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Cloud Component
const Cloud = ({ style }) => (
    <div className="absolute animate-cloud" style={style}>
        <svg width="150" height="60" viewBox="0 0 150 60">
            <ellipse cx="50" cy="40" rx="40" ry="20" fill="rgba(255,255,255,0.8)" />
            <ellipse cx="80" cy="35" rx="35" ry="18" fill="rgba(255,255,255,0.9)" />
            <ellipse cx="110" cy="40" rx="30" ry="15" fill="rgba(255,255,255,0.85)" />
            <ellipse cx="70" cy="25" rx="25" ry="15" fill="rgba(255,255,255,0.95)" />
        </svg>
    </div>
);

// Tree Component
const Tree = ({ height, color }) => (
    <svg width="60" height="120" viewBox="0 0 60 120" style={{ height }} className="transition-colors duration-1000">
        <polygon points="30,10 55,50 40,50 55,80 38,80 50,110 10,110 22,80 5,80 20,50 5,50" fill={color} />
        <rect x="25" y="100" width="10" height="20" fill="#4a3728" />
    </svg>
);

// Leaf Pattern Component
const LeafPattern = () => (
    <svg viewBox="0 0 100 100">
        <path d="M50,10 Q70,30 50,50 Q30,30 50,10" fill="#22c55e" opacity="0.6" />
        <path d="M30,30 Q50,50 30,70 Q10,50 30,30" fill="#16a34a" opacity="0.5" />
        <path d="M70,30 Q90,50 70,70 Q50,50 70,30" fill="#22c55e" opacity="0.4" />
        <path d="M50,50 Q70,70 50,90 Q30,70 50,50" fill="#16a34a" opacity="0.5" />
    </svg>
);

export default Login;
