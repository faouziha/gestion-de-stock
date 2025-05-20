import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FaEdit, FaArrowLeft, FaTag, FaBox } from 'react-icons/fa'
import { useAuth } from '../../../context/AuthContext'
import { useTheme } from '../../../context/ThemeContext'

export default function ViewCategory() {
    const [category, setCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const { darkMode } = useTheme();
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch category details
                const categoryResponse = await axios.get(`http://localhost:3000/categories/${id}?userId=${user.id}`);
                setCategory(categoryResponse.data);
                
                // Fetch products in this category
                const productsResponse = await axios.get(`http://localhost:3000/produit?userId=${user.id}`);
                // Filter products that belong to this category
                const categoryProducts = productsResponse.data.filter(product => product.category_id === parseInt(id));
                setProducts(categoryProducts);
                
                setError(null);
            } catch (error) {
                console.error("Error fetching category details:", error);
                setError("Failed to load category details. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [id, user.id]);

    if (loading) {
        return (
            <div className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen transition-colors flex justify-center items-center`}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen transition-colors`}>
                <div className="max-w-5xl mx-auto">
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
                        <p>{error}</p>
                        <button 
                            onClick={() => navigate('/categories')}
                            className="mt-2 text-red-600 hover:text-red-800 font-medium"
                        >
                            Back to Categories
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!category) {
        return (
            <div className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen transition-colors`}>
                <div className="max-w-5xl mx-auto">
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-5 text-center`}>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>Category not found</p>
                        <button 
                            onClick={() => navigate('/categories')}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Back to Categories
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen transition-colors`}>
            <div className="max-w-5xl mx-auto">
                {/* Back button and page heading */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
                    <div className="flex items-center">
                        <button
                            onClick={() => navigate('/categories')}
                            className={`mr-4 p-2 rounded-full ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} shadow-sm transition-colors`}
                        >
                            <FaArrowLeft className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                        </button>
                        <h1 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            Category Details
                        </h1>
                    </div>
                    
                    <Link
                        to={`/categories/edit/${id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center"
                    >
                        <FaEdit className="mr-2" />
                        Edit Category
                    </Link>
                </div>
                
                {/* Category details card */}
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden mb-8`}>
                    <div 
                        className="h-4" 
                        style={{ backgroundColor: category.color || '#3B82F6' }}
                    ></div>
                    <div className="p-6">
                        <div className="flex items-center mb-4">
                            <div 
                                className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
                                style={{ backgroundColor: category.color || '#3B82F6' }}
                            >
                                <FaTag className="text-white text-xl" />
                            </div>
                            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                {category.name}
                            </h2>
                        </div>
                        
                        {category.description && (
                            <div className="mb-6">
                                <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase mb-2`}>
                                    Description
                                </h3>
                                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {category.description}
                                </p>
                            </div>
                        )}
                        
                        <div className="flex flex-wrap gap-4">
                            <div className={`rounded-lg p-4 flex items-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                <FaBox className={`mr-3 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                <div>
                                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Products</p>
                                    <p className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                        {category.product_count || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Products in this category */}
                <div className="mb-8">
                    <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        Products in this Category
                    </h2>
                    
                    {products.length === 0 ? (
                        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 text-center`}>
                            <FaBox className={`mx-auto text-4xl mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                                No products in this category yet
                            </p>
                            <Link
                                to="/products/add"
                                className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Add a Product
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {products.map(product => (
                                <Link 
                                    key={product.id} 
                                    to={`/products/view/${product.id}`}
                                    className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} rounded-lg shadow-md p-4 flex items-center transition-colors`}
                                >
                                    <div className={`w-16 h-16 mr-4 rounded-md overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex-shrink-0`}>
                                        {product.image ? (
                                            <img 
                                                src={product.image} 
                                                alt={product.nom} 
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                                                }}
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center">
                                                <FaBox className={`${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-grow overflow-hidden">
                                        <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'} mb-1 truncate`}>
                                            {product.nom}
                                        </h3>
                                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            ${parseFloat(product.prix).toFixed(2)} • {product.total || 0} in stock
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
