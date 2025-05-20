import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import { FaSave, FaTimes, FaTag } from 'react-icons/fa'
import { useAuth } from '../../../context/AuthContext'
import { useTheme } from '../../../context/ThemeContext'

export default function EditCategory() {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#3B82F6',
        icon: 'tag'
    });
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saveLoading, setSaveLoading] = useState(false);
    const { user } = useAuth();
    const { darkMode } = useTheme();
    const navigate = useNavigate();
    const { id } = useParams();

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

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:3000/categories/${id}?userId=${user.id}`);
                
                setFormData({
                    name: response.data.name || '',
                    description: response.data.description || '',
                    color: response.data.color || '#3B82F6',
                    icon: response.data.icon || 'tag'
                });
                
                setError(null);
            } catch (error) {
                console.error("Error fetching category:", error);
                setError("Failed to load category. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        
        fetchCategory();
    }, [id, user.id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            setError("Category name is required");
            return;
        }
        
        try {
            setSaveLoading(true);
            setError(null);
            
            const response = await axios.put(`http://localhost:3000/categories/${id}`, {
                ...formData,
                userId: user.id
            });
            
            if (response.data.success) {
                navigate('/categories');
            } else {
                setError(response.data.error || "Failed to update category");
            }
        } catch (error) {
            console.error("Error updating category:", error);
            setError(error.response?.data?.error || "Failed to update category. Please try again.");
        } finally {
            setSaveLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen transition-colors flex justify-center items-center`}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen transition-colors`}>
            <div className="max-w-3xl mx-auto">
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-5 transition-colors`}>
                    <div className="flex items-center justify-between mb-6">
                        <h1 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Edit Category</h1>
                        <button
                            onClick={() => navigate('/categories')}
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
                                Category Name *
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
                                placeholder="e.g. Electronics, Clothing, Food, etc."
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
                                placeholder="Optional description of the category"
                            />
                        </div>
                        
                        <div className="mb-6">
                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                Category Color
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
                        
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/categories')}
                                className={`py-2 px-4 rounded-md ${
                                    darkMode 
                                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                } transition-colors flex items-center`}
                            >
                                <FaTimes className="mr-2" />
                                Cancel
                            </button>
                            
                            <button
                                type="submit"
                                disabled={saveLoading}
                                className={`py-2 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center ${
                                    saveLoading ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                            >
                                {saveLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <FaSave className="mr-2" />
                                        Update Category
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
