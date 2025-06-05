import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { FaSave, FaTimes, FaTrademark, FaSpinner } from 'react-icons/fa'
import { useAuth } from '../../../context/AuthContext'
import { useTheme } from '../../../context/ThemeContext'

export default function AddBrand() {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        logo_url: '',
        website: '',
        color: '#3B82F6', // Default blue color
        founded_year: ''
    });
    const [logoPreview, setLogoPreview] = useState(null);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const { darkMode } = useTheme();
    const navigate = useNavigate();

    // List of predefined colors for users to choose from
    const colorOptions = [
        { name: 'Blue', value: '#3B82F6' },
        { name: 'Red', value: '#EF4444' },
        { name: 'Green', value: '#10B981' },
        { name: 'Yellow', value: '#F59E0B' },
        { name: 'Purple', value: '#8B5CF6' },
        { name: 'Pink', value: '#EC4899' },
        { name: 'Indigo', value: '#6366F1' },
        { name: 'Teal', value: '#14B8A6' }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };
    
    const handleLogoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            
            // Check if file is an image
            if (!selectedFile.type.startsWith('image/')) {
                setError('Please select an image file (JPEG, PNG, etc.)');
                return;
            }
            
            // Check file size (max 5MB)
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB');
                return;
            }
            
            // Create a preview
            setLogoPreview(URL.createObjectURL(selectedFile));
            
            // Resize and compress image before converting to Base64
            const img = new Image();
            img.onload = () => {
                // Create a canvas to resize the image
                const canvas = document.createElement('canvas');
                
                // Determine new dimensions (max 400px width/height while maintaining aspect ratio)
                const MAX_SIZE = 400;
                let width = img.width;
                let height = img.height;
                
                if (width > height) {
                    if (width > MAX_SIZE) {
                        height = Math.round((height * MAX_SIZE) / width);
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width = Math.round((width * MAX_SIZE) / height);
                        height = MAX_SIZE;
                    }
                }
                
                // Set canvas dimensions and draw resized image
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to compressed JPEG format
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7); // 0.7 quality = good balance
                
                setFormData({
                    ...formData,
                    logo_url: compressedDataUrl
                });
            };
            
            // Load the image from the file
            img.src = URL.createObjectURL(selectedFile);
            
            setError(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            setError("Brand name is required");
            return;
        }
        
        try {
            setLoading(true);
            setError(null);
            
            // Format the website URL properly if it doesn't start with http:// or https://
            let website = formData.website.trim();
            if (website && !website.startsWith('http://') && !website.startsWith('https://')) {
                website = `https://${website}`;
            }
            
            const response = await axios.post('http://localhost:3000/brands', {
                ...formData,
                website,
                userId: user.id
            });
            
            if (response.data.success) {
                navigate('/brands');
            } else {
                setError(response.data.error || "Failed to create brand");
            }
        } catch (error) {
            console.error("Error creating brand:", error);
            setError(error.response?.data?.error || "Failed to create brand. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen transition-colors`}>
            <div className="max-w-3xl mx-auto">
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-5 transition-colors`}>
                    <div className="flex items-center justify-between mb-6">
                        <h1 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Add New Brand</h1>
                        <button
                            onClick={() => navigate('/brands')}
                            className={`p-2 rounded-md ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                        >
                            <FaTimes className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                        </button>
                    </div>
                    
                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="name" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                Brand Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`w-full rounded-md border ${
                                    darkMode 
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                        : 'bg-white border-gray-300 placeholder-gray-500'
                                } py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                placeholder="e.g. Apple, Samsung, Nike, etc."
                                required
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label htmlFor="description" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="3"
                                className={`w-full rounded-md border ${
                                    darkMode 
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                        : 'bg-white border-gray-300 placeholder-gray-500'
                                } py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                placeholder="Optional description of the brand"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="website" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                Website
                            </label>
                            <input
                                type="text"
                                id="website"
                                name="website"
                                value={formData.website}
                                onChange={handleInputChange}
                                className={`w-full rounded-md border ${
                                    darkMode 
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                        : 'bg-white border-gray-300 placeholder-gray-500'
                                } py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                placeholder="e.g. www.example.com"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="logo" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                Brand Logo
                            </label>
                            <input 
                                type="file" 
                                id="logo"
                                name="logo"
                                onChange={handleLogoChange}
                                className={`w-full px-3 py-2 border ${
                                    darkMode 
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                        : 'bg-white border-gray-300 placeholder-gray-500'
                                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm`} 
                                accept="image/*"
                            />
                            {logoPreview && (
                                <div className="mt-2">
                                    <img 
                                        src={logoPreview} 
                                        alt="Brand logo preview" 
                                        className="h-40 object-contain rounded-md"
                                    />
                                </div>
                            )}
                            <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Upload a logo image for the brand (max 5MB)</p>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="founded_year" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                Founded Year
                            </label>
                            <input
                                type="number"
                                id="founded_year"
                                name="founded_year"
                                value={formData.founded_year}
                                onChange={handleInputChange}
                                min="1800"
                                max={new Date().getFullYear()}
                                className={`w-full rounded-md border ${
                                    darkMode 
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                        : 'bg-white border-gray-300 placeholder-gray-500'
                                } py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                placeholder="e.g. 1976"
                            />
                        </div>
                        
                        <div className="mb-6">
                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                Brand Color
                            </label>
                            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                                {colorOptions.map(color => (
                                    <div 
                                        key={color.value} 
                                        className={`
                                            w-full h-10 rounded-md cursor-pointer border-2 p-1
                                            ${formData.color === color.value 
                                                ? 'border-blue-500 dark:border-blue-400' 
                                                : `border-transparent ${darkMode ? 'hover:border-gray-600' : 'hover:border-gray-300'}`
                                            }
                                        `}
                                        onClick={() => setFormData({...formData, color: color.value})}
                                    >
                                        <div 
                                            className="w-full h-full rounded" 
                                            style={{backgroundColor: color.value}}
                                            title={color.name}
                                        ></div>
                                    </div>
                                ))}
                                
                                <div className="w-full h-10 rounded-md flex items-center">
                                    <input
                                        type="color"
                                        id="color"
                                        name="color"
                                        value={formData.color}
                                        onChange={handleInputChange}
                                        className="h-8 w-full cursor-pointer rounded-md"
                                        title="Custom color"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => navigate('/brands')}
                                className={`py-2 px-3 sm:px-4 rounded-md ${
                                    darkMode 
                                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                } transition-colors flex items-center justify-center w-full sm:w-auto text-sm sm:text-base`}
                            >
                                <FaTimes className="mr-1 sm:mr-2" size={14} />
                                Cancel
                            </button>
                            
                            <button
                                type="submit"
                                disabled={loading}
                                className={`py-2 px-3 sm:px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center w-full sm:w-auto text-sm sm:text-base ${
                                    loading ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-1 sm:mr-2"></div>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaSave className="mr-1 sm:mr-2" size={14} />
                                        <span>Save Brand</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
