import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { FaEdit, FaTrash, FaEye, FaPlus, FaSearch, FaTag } from 'react-icons/fa'
import { useAuth } from '../../../context/AuthContext'
import { useTheme } from '../../../context/ThemeContext'

export default function DisplayCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth();
    const { darkMode } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                // Pass the user ID as a query parameter to fetch only this user's categories
                const response = await axios.get(`http://localhost:3000/categories?userId=${user.id}`);
                setCategories(response.data);
                setError(null);
            } catch (error) {
                console.error("Error fetching categories:", error);
                setError("Failed to load categories. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        
        fetchCategories();
    }, [user.id]);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this category? Products in this category will be kept but will no longer be assigned to any category.")) {
            try {
                // Pass the user ID as a query parameter for permission checking
                await axios.delete(`http://localhost:3000/categories/${id}?userId=${user.id}`);
                setCategories(categories.filter(category => category.id !== id));
                alert("Category deleted successfully!");
            } catch (error) {
                console.error("Error deleting category:", error);
                alert("Failed to delete category. Please try again.");
            }
        }
    };

    // Function to get different colors for category badges
    const getCategoryColor = (color) => {
        return color || "#3B82F6"; // Default to blue if no color specified
    };

    return (
        <div className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen transition-colors`}>
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
                    <h1 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Categories</h1>
                    
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                placeholder="Search categories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full pl-10 pr-4 py-2 rounded-md border ${
                                    darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 placeholder-gray-500'
                                }`}
                            />
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                <FaSearch />
                            </div>
                        </div>
                        
                        <Link 
                            to="/categories/add" 
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-md transition-colors flex items-center w-full sm:w-auto justify-center text-sm sm:text-base"
                        >
                            <FaPlus className="mr-1 sm:mr-2" size={14} />
                            <span>Add New Category</span>
                        </Link>
                    </div>
                </div>
                
                {loading && (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                )}
                
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm">
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
                
                {/* Filter categories based on search term */}
                {(() => {
                    const filteredCategories = categories.filter(category => {
                        const searchFields = [
                            category.name,
                            category.description
                        ].filter(Boolean).join(' ').toLowerCase();
                        
                        return searchFields.includes(searchTerm.toLowerCase());
                    });
                    
                    if (!loading && filteredCategories.length === 0 && !error) {
                        return (
                            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 sm:p-8 text-center transition-colors`}>
                                <FaTag className={`h-12 w-12 sm:h-16 sm:w-16 ${darkMode ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-4`} />
                                <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>No Categories Found</h3>
                                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>You haven't added any categories yet.</p>
                                <Link
                                    to="/categories/add"
                                    className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto justify-center"
                                >
                                    <FaPlus className="mr-1 sm:mr-2" size={14} />
                                    Add Your First Category
                                </Link>
                            </div>
                        );
                    }
                    return null;
                })()}
                
                {/* Display filtered categories */}
                {(() => {
                    const filteredCategories = categories.filter(category => {
                        const searchFields = [
                            category.name,
                            category.description
                        ].filter(Boolean).join(' ').toLowerCase();
                        
                        return searchFields.includes(searchTerm.toLowerCase());
                    });
                    
                    if (filteredCategories.length > 0) {
                        return (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {filteredCategories.map(category => (
                                    <div 
                                        key={category.id} 
                                        className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 transition-all hover:shadow-lg relative`}
                                    >
                                        <div 
                                            className="w-full h-2 rounded-t-lg absolute top-0 left-0 right-0" 
                                            style={{ backgroundColor: getCategoryColor(category.color) }}
                                        />
                                        <div className="mt-2">
                                            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'} truncate`}>
                                                {category.name}
                                            </h3>
                                            {category.description && (
                                                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm mb-3 line-clamp-2`}>
                                                    {category.description}
                                                </p>
                                            )}
                                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center mb-3`}>
                                                <span className="font-medium">{category.product_count || 0}</span>
                                                <span className="ml-1">{category.product_count === 1 ? 'product' : 'products'}</span>
                                            </div>
                                            <div className="flex justify-end space-x-2 mt-2">
                                                <Link 
                                                    to={`/categories/view/${category.id}`} 
                                                    className={`p-1.5 sm:p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                                                    aria-label="View category"
                                                >
                                                    <FaEye className={`${darkMode ? 'text-blue-400' : 'text-blue-600'} text-sm sm:text-base`} />
                                                </Link>
                                                <Link 
                                                    to={`/categories/edit/${category.id}`} 
                                                    className={`p-1.5 sm:p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                                                    aria-label="Edit category"
                                                >
                                                    <FaEdit className={`${darkMode ? 'text-green-400' : 'text-green-600'} text-sm sm:text-base`} />
                                                </Link>
                                                <button 
                                                    onClick={() => handleDelete(category.id)} 
                                                    className={`p-1.5 sm:p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                                                    aria-label="Delete category"
                                                >
                                                    <FaTrash className={`${darkMode ? 'text-red-400' : 'text-red-600'} text-sm sm:text-base`} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    }
                    return null;
                })()}
            </div>
        </div>
    );
}
