import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../api/auth';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [timeOfDay, setTimeOfDay] = useState(40);
    const containerRef = useRef(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) { navigate('/login'); return; }
            try {
                const response = await getProfile();
                setUser(response.data);
            } catch (err) {
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                navigate('/login');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [navigate]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeOfDay((prev) => (prev + 0.2) % 100);
        }, 100);
        return () => clearInterval(interval);
    }, []);

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

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        navigate('/login');
    };

    const sunY = Math.sin((timeOfDay / 100) * Math.PI) * 60 + 20;
    const sunX = timeOfDay;

    // Sun is visible from 5% to 95% (rises and sets)
    const sunVisible = timeOfDay > 5 && timeOfDay < 95;
    const sunOpacity = timeOfDay <= 5 ? timeOfDay / 5
        : timeOfDay >= 95 ? (100 - timeOfDay) / 5
            : 1;

    // Moon is only visible during true night (when sun is fully gone)
    const moonOpacity = timeOfDay <= 5 ? 1
        : timeOfDay <= 8 ? (8 - timeOfDay) / 3
            : timeOfDay >= 95 ? (timeOfDay - 95) / 5
                : timeOfDay >= 92 ? (timeOfDay - 92) / 3
                    : 0;

    const isDay = timeOfDay > 10 && timeOfDay < 90;
    const isDawn = (timeOfDay > 5 && timeOfDay <= 25) || (timeOfDay >= 75 && timeOfDay < 95);

    const getSkyGradient = () => {
        if (timeOfDay <= 5 || timeOfDay >= 95) return 'linear-gradient(to bottom, #0f0c29, #302b63, #24243e)';
        if (timeOfDay < 20) return 'linear-gradient(to bottom, #ff7e5f, #feb47b, #86a8e7)';
        if (timeOfDay < 80) return 'linear-gradient(to bottom, #56ccf2, #2f80ed, #a8edea)';
        if (timeOfDay < 95) return 'linear-gradient(to bottom, #ff6b6b, #feca57, #5f27cd)';
        return 'linear-gradient(to bottom, #0f0c29, #302b63, #24243e)';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-900 to-green-700 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-lg">Loading your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="min-h-screen relative overflow-hidden transition-all duration-1000" style={{ background: getSkyGradient() }}>
            {/* Stars */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isDay ? 'opacity-0' : 'opacity-100'}`}>
                {[...Array(60)].map((_, i) => (
                    <div key={i} className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
                        style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 50}%`, animationDelay: `${Math.random() * 3}s` }} />
                ))}
            </div>

            {/* Sun - only visible during day, fades at sunrise/sunset */}
            {sunVisible && (
                <div className="absolute w-24 h-24 rounded-full transition-all duration-500"
                    style={{
                        left: `${sunX}%`, top: `${80 - sunY}%`,
                        opacity: sunOpacity,
                        background: isDawn ? 'radial-gradient(circle, #ff6b6b 0%, #feca57 50%, transparent 70%)' : 'radial-gradient(circle, #fff9c4 0%, #ffd54f 50%, transparent 70%)',
                        boxShadow: isDawn ? '0 0 80px #ff6b6b, 0 0 150px #feca57' : '0 0 100px #ffd54f, 0 0 200px #fff9c4',
                        transform: 'translate(-50%, -50%)',
                    }} />
            )}

            {/* Moon - only visible during true night, after sun has set */}
            {moonOpacity > 0 && (
                <div className="absolute w-20 h-20 rounded-full transition-all duration-500"
                    style={{ right: '10%', top: '12%', opacity: moonOpacity, background: 'radial-gradient(circle at 30% 30%, #f5f5f5 0%, #e0e0e0 50%, #bdbdbd 100%)', boxShadow: `0 0 ${40 * moonOpacity}px rgba(255,255,255,0.4)` }} />
            )}

            {/* Clouds */}
            <div className="absolute w-full h-full pointer-events-none">
                <Cloud style={{ left: '5%', top: '12%', animationDuration: '30s' }} />
                <Cloud style={{ left: '50%', top: '8%', animationDuration: '35s', transform: 'scale(0.9)' }} />
                <Cloud style={{ left: '75%', top: '18%', animationDuration: '28s', transform: 'scale(1.1)' }} />
            </div>

            {/* Mountains */}
            <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ height: '45%' }}>
                <path fill={isDay ? '#2d5016' : '#1a3009'} className="transition-colors duration-1000"
                    d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,234.7C960,224,1056,192,1152,181.3C1248,171,1344,181,1392,186.7L1440,192L1440,320L0,320Z" />
                <path fill={isDay ? '#3d6b1e' : '#2d5016'} className="transition-colors duration-1000"
                    d="M0,256L60,250.7C120,245,240,235,360,229.3C480,224,600,224,720,234.7C840,245,960,267,1080,261.3C1200,256,1320,224,1380,208L1440,192L1440,320L0,320Z" />
                <path fill={isDay ? '#4a7c23' : '#3d6b1e'} className="transition-colors duration-1000"
                    d="M0,288L80,282.7C160,277,320,267,480,272C640,277,800,299,960,293.3C1120,288,1280,256,1360,240L1440,224L1440,320L0,320Z" />
            </svg>

            {/* Trees */}
            <div className="absolute bottom-0 w-full flex justify-around items-end" style={{ height: '28%' }}>
                {[80, 65, 95, 70, 88, 60, 75].map((h, i) => (
                    <Tree key={i} height={`${h}%`} color={isDay ? (i % 2 ? '#22543d' : '#1a472a') : (i % 2 ? '#153726' : '#0d2818')} />
                ))}
            </div>

            {/* Ground */}
            <div className="absolute bottom-0 w-full h-20 transition-colors duration-1000" style={{ background: isDay ? '#3d6b1e' : '#2d4a16' }} />

            {/* Birds (daytime) */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isDay ? 'opacity-100' : 'opacity-0'}`}>
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="absolute animate-bird" style={{ left: `${10 + i * 15}%`, top: `${15 + Math.random() * 20}%`, animationDelay: `${i * 2}s`, animationDuration: `${15 + Math.random() * 10}s` }}>
                        <svg width="30" height="15" viewBox="0 0 30 15">
                            <path d="M0,8 Q7,0 15,8 Q23,0 30,8" stroke="#333" strokeWidth="2" fill="none" />
                        </svg>
                    </div>
                ))}
            </div>

            {/* Fireflies */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isDay ? 'opacity-0' : 'opacity-100'}`}>
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-firefly"
                        style={{ left: `${15 + Math.random() * 70}%`, top: `${45 + Math.random() * 45}%`, animationDelay: `${Math.random() * 4}s`, animationDuration: `${3 + Math.random() * 2}s` }} />
                ))}
            </div>

            {/* Mouse glow effect */}
            <div className="fixed w-8 h-8 rounded-full pointer-events-none mix-blend-screen opacity-40 transition-all duration-75"
                style={{ left: `${mousePos.x}%`, top: `${mousePos.y}%`, transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, transparent 70%)', boxShadow: '0 0 30px rgba(255,255,255,0.6)' }} />

            {/* Dashboard Content */}
            <div className="relative z-10 min-h-screen p-4 md:p-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white drop-shadow-lg" style={{ fontFamily: 'Georgia, serif' }}>Dashboard</h1>
                            <p className="text-white/80 text-sm">Welcome to your space</p>
                        </div>
                    </div>
                    <button onClick={handleLogout}
                        className="px-5 py-2.5 bg-white/20 hover:bg-red-500/80 backdrop-blur-md border border-white/30 text-white font-medium rounded-xl transition-all duration-300 flex items-center space-x-2 hover:scale-105">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                    </button>
                </div>

                {/* Welcome Card */}
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-6 mb-6 border border-white/30 shadow-xl"
                        style={{ transform: `perspective(1000px) rotateY(${(mousePos.x - 50) * 0.01}deg) rotateX(${(mousePos.y - 50) * -0.01}deg)` }}>
                        <div className="flex items-center space-x-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                {user?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-white drop-shadow-lg" style={{ fontFamily: 'Georgia, serif' }}>
                                    Hello, {user?.username || 'Friend'}!
                                </h2>
                                <p className="text-white/80">Your journey continues here</p>
                            </div>
                        </div>
                    </div>

                    {/* Profile Card */}
                    <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/50"
                        style={{ transform: `perspective(1000px) rotateY(${(mousePos.x - 50) * 0.008}deg) rotateX(${(mousePos.y - 50) * -0.008}deg)` }}>

                        {/* Decorative corners */}
                        <div className="absolute -top-4 -right-4 w-16 h-16 opacity-20"><LeafPattern /></div>
                        <div className="absolute -bottom-4 -left-4 w-14 h-14 opacity-20 rotate-180"><LeafPattern /></div>

                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Georgia, serif' }}>Profile Details</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ProfileCard label="User ID" value={user?.id || 'N/A'} icon="🆔" />
                            <ProfileCard label="Username" value={user?.username || 'N/A'} icon="👤" />
                            <ProfileCard label="Email" value={user?.email || 'N/A'} icon="📧" />
                            <ProfileCard label="First Name" value={user?.first_name || 'N/A'} icon="✨" />
                            <ProfileCard label="Last Name" value={user?.last_name || 'N/A'} icon="🌟" />
                            <ProfileCard label="Status" value="Active" icon="🌿" isStatus />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Components
const ProfileCard = ({ label, value, icon, isStatus }) => (
    <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
        <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{icon}</span>
            <span className="text-sm font-medium text-gray-500">{label}</span>
        </div>
        {isStatus ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                {value}
            </span>
        ) : (
            <p className="text-lg font-semibold text-gray-800 truncate group-hover:text-emerald-600 transition-colors">{value}</p>
        )}
    </div>
);

const Cloud = ({ style }) => (
    <div className="absolute animate-cloud" style={style}>
        <svg width="180" height="70" viewBox="0 0 180 70">
            <ellipse cx="60" cy="45" rx="50" ry="22" fill="rgba(255,255,255,0.75)" />
            <ellipse cx="100" cy="40" rx="40" ry="20" fill="rgba(255,255,255,0.85)" />
            <ellipse cx="140" cy="45" rx="35" ry="18" fill="rgba(255,255,255,0.8)" />
            <ellipse cx="90" cy="28" rx="30" ry="18" fill="rgba(255,255,255,0.9)" />
        </svg>
    </div>
);

const Tree = ({ height, color }) => (
    <svg width="50" height="100" viewBox="0 0 60 120" style={{ height }} className="transition-colors duration-1000">
        <polygon points="30,10 55,50 40,50 55,80 38,80 50,110 10,110 22,80 5,80 20,50 5,50" fill={color} />
        <rect x="25" y="100" width="10" height="20" fill="#4a3728" />
    </svg>
);

const LeafPattern = () => (
    <svg viewBox="0 0 100 100">
        <path d="M50,10 Q70,30 50,50 Q30,30 50,10" fill="#22c55e" opacity="0.6" />
        <path d="M30,30 Q50,50 30,70 Q10,50 30,30" fill="#16a34a" opacity="0.5" />
        <path d="M70,30 Q90,50 70,70 Q50,50 70,30" fill="#22c55e" opacity="0.4" />
    </svg>
);

export default Dashboard;
