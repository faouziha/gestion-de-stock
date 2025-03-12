import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';

const SignUp = () => {
const navigate = useNavigate();
const [showPassword, setShowPassword] = useState(false);
const [data, setData] = useState([]);
const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
});
const [error, setError] = useState('');

const togglePasswordVisibility = (e) => {
e.preventDefault();
setShowPassword(!showPassword);
};

const handleChange = (e) => {
    setFormData({
        ...formData,
        [e.target.id]: e.target.value
    });
};

const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name || !formData.lastName || !formData.email || !formData.password) {
        setError('All fields are required');
        return;
    }
    
    if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
    }
    
    try {
        const response = await axios.post('http://localhost:3000/register', {
            name: formData.name,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password
        });
        
        console.log('Registration successful:', response.data);
        // Redirect to login page after successful registration
        navigate('/Login');
    } catch (err) {
        console.error('Registration error:', err.response?.data || err.message);
        setError(err.response?.data?.error || 'Registration failed. Please try again.');
    }
};

useEffect(() => {
    axios.get("http://localhost:3000/users")
    .then((res) => {
        console.log(res.data);
        setData(res.data);
    })
    .catch((err) => {
        console.log(err);
    });
}, []);


return (
<div className='mt-10 mx-auto text-center'>
    <div className="flex items-center justify-center h-screen">
        <div className="bg-white p-8 w-1/4 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 text-center">Manage</h2>
            <h2 className="text-2xl text-gray-800 text-center">Sign Up</h2>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <form className="mt-6" onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                        Name
                    </label>
                    <input 
                        type="text" 
                        id="name" 
                        placeholder="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">
                        Last name
                    </label>
                    <input 
                        type="text" 
                        id="lastName" 
                        placeholder="last name"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                    />
                </div>
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
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                        Password
                    </label>

                    <input 
                        type={showPassword ? "text" : "password" } 
                        id="password" 
                        placeholder="******************"
                        value={formData.password}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" 
                    />
                    <span onClick={togglePasswordVisibility} style={{ 
                                        position: 'absolute', 
                                        right: '40%', 
                                        top: '68%', 
                                        transform: 'translateY(-50%)',
                                        cursor: 'pointer',
                                        zIndex: 10
                                    }}>
                        {showPassword ?
                        <FaEyeSlash /> :
                        <FaEye />}
                    </span>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                            Confirm password
                        </label>
                        <input 
                            type={showPassword ? "text" : "password" } 
                            id="confirmPassword" 
                            placeholder="******************"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" 
                        />
                    </div>
                </div>

                <Link to={"/Login"} className='text-blue-500 hover:text-blue-700 mb-4 block'>Already have an account?
                </Link>

                <button 
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    Sign Up
                </button>
            </form>
        </div>
    </div>
</div>
);
}

export default SignUp;