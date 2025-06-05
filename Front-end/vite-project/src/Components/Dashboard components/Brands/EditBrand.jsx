import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import { FaSave, FaTimes, FaTrademark, FaSpinner } from 'react-icons/fa'
import { useAuth } from '../../../context/AuthContext'
import { useTheme } from '../../../context/ThemeContext'

export default function EditBrand() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { darkMode } = useTheme();
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        logo_url: '',
        website: '',
        color: '#3B82F6',
        founded_year: ''
    });
    const [logoPreview, setLogoPreview] = useState(null);
    
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Fetch brand data
    useEffect(() => {
        const fetchBrand = async () => {
            try {
                setFetchLoading(true);
                const response = await axios.get(`http://localhost:3000/brands/${id}`);
                const brandData = response.data;
                
                setFormData({
                    name: brandData.name || '',
                    description: brandData.description || '',
                    logo_url: brandData.logo_url || '',
                    website: brandData.website || '',
                    color: brandData.color || '#3B82F6',
                    founded_year: brandData.founded_year || ''
                });
                
                if (brandData.logo_url) {
                    setLogoPreview(brandData.logo_url);
                }
            } catch (error) {
                console.error('Error fetching brand:', error);
                setError('Failed to load brand details. Please try again.');
            } finally {
                setFetchLoading(false);
            }
        };
        
        fetchBrand();
    }, [id]);
    
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
            
            const response = await axios.put(`http://localhost:3000/brands/${id}`, {
                ...formData,
                website,
                userId: user.id
            });
            
            if (response.data.success) {
                navigate(`/brands/view/${id}`);
            } else {
                setError(response.data.error || "Failed to update brand");
            }
        } catch (error) {
            console.error("Error updating brand:", error);
            setError(error.response?.data?.error || "Failed to update brand. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <div className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen transition-colors`}>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen transition-colors`}>
            <div className="max-w-3xl mx-auto">
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-5 transition-colors`}>
                    <div className="flex items-center justify-between mb-6">
                        <h1 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Edit Brand</h1>
                        <div className="flex space-x-2">
                            <FaTrademark className={`text-2xl ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                        </div>
                    </div>
                    
                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
                            <p>{error}</p>
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="name" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                Brand Name <span className="text-red-500">*</span>
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
                                placeholder="Brand name"
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
                                placeholder="Brand description"
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
                            <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Upload a logo image for the brand (max 5MB) or leave empty to keep current logo</p>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="website" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                Website URL
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
                                placeholder="https://example.com"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label htmlFor="color" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                    Brand Color
                                </label>
                                <div className="flex">
                                    <input
                                        type="color"
                                        id="color"
                                        name="color"
                                        value={formData.color}
                                        onChange={handleInputChange}
                                        className="h-10 w-10 rounded border-0 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={formData.color}
                                        onChange={handleInputChange}
                                        name="color"
                                        className={`w-full ml-2 rounded-md border ${
                                            darkMode 
                                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                                : 'bg-white border-gray-300 placeholder-gray-500'
                                        } py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        placeholder="#3B82F6"
                                    />
                                </div>
                            </div>

                            <div>
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
                                    placeholder="e.g., 2010"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => navigate(`/brands/view/${id}`)}
                                className={`px-4 py-2 rounded-md ${
                                    darkMode 
                                        ? 'bg-gray-700 text-white hover:bg-gray-600' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                } flex items-center transition-colors`}
                            >
                                <FaTimes className="mr-2" />
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <FaSpinner className="animate-spin mr-2" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <FaSave className="mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
