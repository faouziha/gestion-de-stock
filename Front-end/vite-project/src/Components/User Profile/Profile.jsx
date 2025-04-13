import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaEdit, FaSave, FaTimes, FaPhone, FaMapMarkerAlt, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Profile() {
  const { user, login } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    currentPassword: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      // Initialize form data with user information
      setFormData({
        name: user.name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        currentPassword: '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });

    // Clear password-specific errors when user types
    if (['currentPassword', 'password', 'confirmPassword'].includes(e.target.id)) {
      setPasswordErrors({
        ...passwordErrors,
        [e.target.id]: ''
      });
    }
  };

  const validatePasswordFields = () => {
    let isValid = true;
    const newErrors = {
      currentPassword: '',
      password: '',
      confirmPassword: '',
    };

    // Only validate password fields if the user is trying to change password
    if (formData.password || formData.confirmPassword) {
      // Current password is required if changing password
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
        isValid = false;
      }

      // New password validation
      if (!formData.password) {
        newErrors.password = 'New password is required';
        isValid = false;
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
        isValid = false;
      }

      // Confirm password validation
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your new password';
        isValid = false;
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
        isValid = false;
      }
    }

    setPasswordErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate password fields if user is changing password
    if (!validatePasswordFields()) {
      setLoading(false);
      return;
    }

    try {
      // Prepare data for API call
      const dataToSend = {
        name: formData.name,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      };

      // Only include password fields if user is changing password
      if (formData.password) {
        dataToSend.currentPassword = formData.currentPassword;
        dataToSend.password = formData.password;
      }

      // Make API call to update user profile
      const response = await axios.put(`${import.meta.env.VITE_USERS_URL}/${user.id}`, dataToSend);
      
      // Update user in context
      login(response.data.user, localStorage.getItem('token'));
      
      setSuccess('Profile updated successfully');
      setIsEditing(false);

      // Reset password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        password: '',
        confirmPassword: '',
      }));
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.error || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    // Reset form data to original user data
    if (user) {
      setFormData({
        name: user.name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        currentPassword: '',
        password: '',
        confirmPassword: '',
      });
    }
    setIsEditing(false);
    setError('');
    setPasswordErrors({
      currentPassword: '',
      password: '',
      confirmPassword: '',
    });
  };

  const togglePasswordVisibility = (field) => {
    switch (field) {
      case 'currentPassword':
        setShowCurrentPassword(!showCurrentPassword);
        break;
      case 'password':
        setShowNewPassword(!showNewPassword);
        break;
      case 'confirmPassword':
        setShowConfirmPassword(!showConfirmPassword);
        break;
      default:
        break;
    }
  };

  if (!user) {
    return (
      <div className={`flex items-center justify-center min-h-[calc(100vh-64px)] p-4 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
        <div className="text-center">
          <p>Please log in to view your profile.</p>
          <button 
            onClick={() => navigate('/Login')}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-6 md:p-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'} min-h-[calc(100vh-64px)]`}>
      <div className={`max-w-4xl mx-auto ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden transition-all`}>
        {/* Header */}
        <div className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-700' : 'bg-blue-500'} text-white`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl sm:text-2xl font-bold">User Profile</h2>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center bg-white text-blue-500 hover:bg-gray-100 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base"
              >
                <FaEdit className="mr-2" /> Edit Profile
              </button>
            ) : (
              <div className="hidden sm:flex space-x-2">
                <button 
                  onClick={cancelEdit}
                  className="flex items-center bg-gray-200 text-gray-700 hover:bg-gray-300 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base"
                >
                  <FaTimes className="mr-2" /> Cancel
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`flex items-center ${loading ? 'bg-blue-300' : 'bg-white hover:bg-gray-100'} text-blue-500 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base`}
                >
                  <FaSave className="mr-2" /> {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Name */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} htmlFor="name">
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 sm:px-4 sm:py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                    required
                  />
                ) : (
                  <div className={`flex items-center px-3 py-2 sm:px-4 sm:py-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <FaUser className={`mr-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className="truncate">{user.name}</span>
                  </div>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} htmlFor="lastName">
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 sm:px-4 sm:py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                    required
                  />
                ) : (
                  <div className={`flex items-center px-3 py-2 sm:px-4 sm:py-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <FaUser className={`mr-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className="truncate">{user.last_name}</span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} htmlFor="email">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 sm:px-4 sm:py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                    required
                  />
                ) : (
                  <div className={`flex items-center px-3 py-2 sm:px-4 sm:py-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <FaEnvelope className={`mr-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex-shrink-0`} />
                    <span className="truncate">{user.email}</span>
                  </div>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} htmlFor="phone">
                  Phone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 sm:px-4 sm:py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                  />
                ) : (
                  <div className={`flex items-center px-3 py-2 sm:px-4 sm:py-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <FaPhone className={`mr-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex-shrink-0`} />
                    <span className="truncate">{user.phone || 'Not provided'}</span>
                  </div>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2 space-y-2">
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} htmlFor="address">
                  Address
                </label>
                {isEditing ? (
                  <textarea
                    id="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    className={`w-full px-3 py-2 sm:px-4 sm:py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                  />
                ) : (
                  <div className={`flex items-start px-3 py-2 sm:px-4 sm:py-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <FaMapMarkerAlt className={`mr-3 mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex-shrink-0`} />
                    <span>{user.address || 'Not provided'}</span>
                  </div>
                )}
              </div>

              {/* Password Fields - Only visible in edit mode */}
              {isEditing && (
                <>
                  <div className="md:col-span-2">
                    <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Change Password (Optional)
                    </h3>
                  </div>

                  {/* Current Password */}
                  <div className="space-y-2 md:col-span-2">
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} htmlFor="currentPassword">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        id="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 sm:px-4 sm:py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-10`}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => togglePasswordVisibility('currentPassword')}
                      >
                        {showCurrentPassword ? (
                          <FaEyeSlash className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        ) : (
                          <FaEye className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        )}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword}</p>
                    )}
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} htmlFor="password">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        id="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 sm:px-4 sm:py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-10`}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => togglePasswordVisibility('password')}
                      >
                        {showNewPassword ? (
                          <FaEyeSlash className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        ) : (
                          <FaEye className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        )}
                      </button>
                    </div>
                    {passwordErrors.password && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.password}</p>
                    )}
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} htmlFor="confirmPassword">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 sm:px-4 sm:py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-10`}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => togglePasswordVisibility('confirmPassword')}
                      >
                        {showConfirmPassword ? (
                          <FaEyeSlash className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        ) : (
                          <FaEye className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        )}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Submit button - only visible when form is being submitted on mobile */}
            {isEditing && (
              <div className="mt-6 flex flex-col w-full gap-3 sm:hidden">
                <button
                  type="submit"
                  disabled={loading}
                  className={`${loading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'} text-white px-4 py-3 rounded-lg transition-colors text-sm w-full flex items-center justify-center`}
                >
                  <FaSave className="mr-2" /> {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-3 rounded-lg transition-colors text-sm w-full flex items-center justify-center"
                >
                  <FaTimes className="mr-2" /> Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
