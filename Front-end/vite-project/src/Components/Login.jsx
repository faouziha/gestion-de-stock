import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {

    const [showPassword, setShowPassword] = useState(false);

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
            <form className="mt-4">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                        email
                    </label>
                    <input type="text" id="email" placeholder="email"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                        Password
                    </label>

                    <input type={showPassword ? "text" : "password"} id="password" placeholder="******************"
                        className="shadow appearance-none border border-red rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" />
                    <span onClick={togglePasswordVisibility} style={{ 
                                        position: 'absolute', 
                                        right: '40%', 
                                        top: '53.5%', 
                                        transform: 'translateY(-50%)',
                                        cursor: 'pointer',
                                        zIndex: 10
                                    }}>
                        {showPassword ?
                        <FaEyeSlash /> :
                        <FaEye />}
                    </span>
                    <Link to={"/ForgotPassword"} className='text-blue-500 hover:text-blue-700'>Forgot Password?</Link>
                </div>

                <Link to={"/Signup"} className='text-blue-500 hover:text-blue-700 mb-4 block'>Don't have an account?</Link>

                <button type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                    Sign In
                </button>
            </form>
        </div>
    </div>
</div>
);
}

export default Login;