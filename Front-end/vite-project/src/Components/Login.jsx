import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { API_URLS } from '../config/api';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { darkMode } = useTheme();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    useEffect(() => {
        axios.get(API_URLS.users)
        .then((res) => {
            console.log(res.data);
            setUsers(res.data);
        })
        .catch((err) => {
            console.log(err);
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const response = await axios.post(API_URLS.login, formData);
            console.log("Login successful:", response.data);
            
            // Use the login function from context instead of directly using localStorage
            login(response.data.user, response.data.token || 'dummy-token');
            
            // Redirect to dashboard
            navigate('/dashboard');
        } catch (err) {
            console.error("Login error:", err);
            setError(err.response?.data?.error || 'Failed to login. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = (e) => {
        e.preventDefault();
        setShowPassword(!showPassword);
    };
    
    return (
        <div className={`min-h-screen flex items-center justify-center py-8 ${darkMode ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 via-white to-blue-100'}`}>
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute left-1/3 top-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute right-1/3 top-1/3 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-1/3 left-1/2 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>
            
            <div className="flex flex-col md:flex-row w-full max-w-5xl mx-auto overflow-hidden rounded-2xl shadow-xl z-10 m-4">
                {/* Left side - Illustration/Info */}
                <div className="hidden md:block md:w-1/2 bg-gradient-to-tr from-blue-600 to-blue-400 p-8 lg:p-12 text-white">
                    <div className="flex flex-col h-full justify-between">
                        <div>
                            <h2 className="text-4xl font-bold mb-6">Welcome Back!</h2>
                            <p className="text-blue-100 mb-8">Log in to access your inventory management dashboard and take control of your business operations.</p>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <div className="bg-blue-500 p-2 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p>Real-time inventory tracking</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="bg-blue-500 p-2 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p>Order management system</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="bg-blue-500 p-2 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p>Supplier and client management</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Right side - Login Form */}
                <div className={`w-full md:w-1/2 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} p-6 sm:p-8 md:p-12`}>
                    {/* Mobile-only header with logo/branding */}
                    <div className="md:hidden mb-8 bg-gradient-to-r from-blue-600 to-blue-400 -mx-6 -mt-6 p-6 text-white">
                        <h2 className="text-2xl font-bold">Welcome Back!</h2>
                        <p className="text-blue-100 text-sm mt-2">Sign in to continue to your dashboard</p>
                    </div>
                    <div className="mb-8">
                        <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Manage</h2>
                        <h3 className={`text-xl mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Sign in to your account</h3>
                    </div>
                    
                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6" role="alert">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span className="block sm:inline">{error}</span>
                            </div>
                        </div>
                    )}
                    
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className={`block ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium mb-2`} htmlFor="email">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className={`h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                    </svg>
                                </div>
                                <input 
                                    type="email" 
                                    id="email" 
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`pl-10 shadow-sm block w-full sm:text-sm border-gray-300 rounded-md py-3 px-4 ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' : 'bg-white text-gray-700 focus:ring-blue-500 focus:border-blue-500'} transition-colors`} 
                                    required
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className={`block ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium mb-2`} htmlFor="password">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className={`h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    id="password" 
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`pl-10 shadow-sm block w-full sm:text-sm border-gray-300 rounded-md py-3 px-4 ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' : 'bg-white text-gray-700 focus:ring-blue-500 focus:border-blue-500'} transition-colors`} 
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                                    onClick={togglePasswordVisibility}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className={`h-4 w-4 ${darkMode ? 'bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500' : 'bg-white border-gray-300 text-blue-600 focus:ring-blue-500'} rounded`}
                                />
                                <label htmlFor="remember-me" className={`ml-2 block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Remember me
                                </label>
                            </div>
                            <Link to="/forgot-password" className={`text-sm font-medium ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}>
                                Forgot password?
                            </Link>
                        </div>
                        
                        <div>
                            <button 
                                type="submit" 
                                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                disabled={loading}
                            >
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                        
                        <div className="text-center mt-6 pt-4 border-t border-gray-300">
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Don't have an account?{' '}
                                <Link to="/signup" className={`font-medium ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}>
                                    Sign up now
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;