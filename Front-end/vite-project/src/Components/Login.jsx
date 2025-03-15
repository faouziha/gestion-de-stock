import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';


const Login = () => {

    const navigate = useNavigate();
    const { login } = useAuth();
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
        axios.get(import.meta.env.VITE_LOGIN_URL)
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
            const response = await axios.post(import.meta.env.VITE_LOGIN_URL, formData);
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
        <div>
            <div className="flex items-center justify-center h-screen">
                <div className="bg-white p-8 w-1/4 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-800 text-center">Manage</h2>
                    <h2 className="text-2xl text-gray-800 text-center">Login</h2>
                    
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    
                    <form className="mt-4" onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                Email
                            </label>
                            <input 
                                type="email" 
                                id="email" 
                                placeholder="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                                required
                            />
                        </div>
                        <div className="mb-6 relative">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                Password
                            </label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    id="password" 
                                    placeholder="******************"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" 
                                    required
                                />
                                <span 
                                    onClick={togglePasswordVisibility} 
                                    className="absolute right-3 top-1/2 transform -translate-y-[calc(50%+5px)] cursor-pointer"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                            <Link to={"/ForgotPassword"} className='text-blue-500 hover:text-blue-700'>Forgot Password?</Link>
                        </div>

                        <Link to={"/Signup"} className='text-blue-500 hover:text-blue-700 mb-4 block'>Don't have an account?</Link>

                        <button 
                            type="submit"
                            disabled={loading}
                            className={`w-full ${loading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-700'} text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;