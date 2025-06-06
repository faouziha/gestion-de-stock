import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { FaEdit, FaArrowLeft, FaExternalLinkAlt, FaTrademark, FaBox } from 'react-icons/fa'
import { useAuth } from '../../../context/AuthContext'
import { useTheme } from '../../../context/ThemeContext'

export default function ViewBrand() {
    const [brand, setBrand] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const { darkMode } = useTheme();
    const { id } = useParams();
    const navigate = useNavigate();
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                console.log(`Fetching brand with ID: ${id}`);
                
                // First try to get just the basic brand info without products
                const basicResponse = await axios.get(`http://localhost:3000/brands/${id}?basic=true`);
                
                // Set basic brand data immediately so we have something to show
                if (basicResponse.data) {
                    setBrand(basicResponse.data);
                    console.log('Loaded basic brand data');
                }
                
                // Then try to get the full brand data with products
                try {
                    const fullResponse = await axios.get(`http://localhost:3000/brands/${id}`);
                    setBrand(fullResponse.data);
                    console.log('Loaded full brand data with products');
                } catch (productError) {
                    console.error("Error loading products for brand:", productError);
                    // We already have basic brand data, so just log this error
                }
                
                // Fetch all products and filter by brand_id
                const productsResponse = await axios.get(`http://localhost:3000/produit?userId=${user.id}`);
                // Filter products that belong to this brand
                const brandProducts = productsResponse.data.filter(product => product.brand_id === parseInt(id));
                setProducts(brandProducts);
                console.log('Loaded products for brand:', brandProducts.length);
                
            } catch (error) {
                console.error("Error fetching brand:", error);
                if (error.response) {
                    console.error("Response data:", error.response.data);
                    console.error("Response status:", error.response.status);
                    setError(`Failed to load brand details (${error.response.status}): ${error.response.data.message || error.message}`);
                } else {
                    setError(`Failed to load brand details: ${error.message}`);
                }
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [id, user.id]);

    if (loading) {
        return (
            <div className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen transition-colors`}>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error || !brand) {
        return (
            <div className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen transition-colors`}>
                <div className="max-w-3xl mx-auto">
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm">{error || "Brand not found"}</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/brands')} 
                        className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} px-4 py-2 rounded-md transition-colors flex items-center`}
                    >
                        <FaArrowLeft className="mr-2" />
                        Back to Brands
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen transition-colors`}>
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
                    <h1 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        Brand Details
                    </h1>
                    
                    <div className="flex space-x-3 w-full sm:w-auto">
                        <button
                            onClick={() => navigate('/brands')} 
                            className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} px-4 py-2 rounded-md transition-colors flex items-center w-1/2 sm:w-auto justify-center`}
                        >
                            <FaArrowLeft className="mr-2" />
                            Back
                        </button>
                        
                        <Link
                            to={`/brands/edit/${id}`}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center w-1/2 sm:w-auto justify-center"
                        >
                            <FaEdit className="mr-2" />
                            Edit
                        </Link>
                    </div>
                </div>
                
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden transition-colors`}>
                    {/* Header Color Bar */}
                    <div 
                        className="w-full h-3"
                        style={{ backgroundColor: brand.color || '#3B82F6' }}
                    />
                    
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Logo */}
                            <div className="md:w-1/3 flex justify-center">
                                {brand.logo_url ? (
                                    <div className="mb-6 flex justify-center">
                                        <img 
                                            src={brand.logo_url} 
                                            alt={`${brand.name} logo`}
                                            className="object-contain max-h-48 rounded-md shadow-sm"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://via.placeholder.com/200?text=No+Logo';
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className={`h-32 w-32 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                        <FaTrademark className={`h-16 w-16 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                    </div>
                                )}
                            </div>
                            
                            {/* Details */}
                            <div className="md:w-2/3">
                                <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                    {brand.name}
                                </h2>
                                
                                {brand.description && (
                                    <div className="mb-4">
                                        <h3 className={`text-sm font-semibold mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                            Description
                                        </h3>
                                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {brand.description}
                                        </p>
                                    </div>
                                )}
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                    {brand.founded_year && (
                                        <div>
                                            <h3 className={`text-sm font-semibold mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                Founded Year
                                            </h3>
                                            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {brand.founded_year}
                                            </p>
                                        </div>
                                    )}
                                    
                                    {brand.website && (
                                        <div>
                                            <h3 className={`text-sm font-semibold mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                Website
                                            </h3>
                                            <a 
                                                href={brand.website.startsWith('http') ? brand.website : `https://${brand.website}`}
                                                target="_blank"
                                                rel="noopener noreferrer" 
                                                className="text-blue-500 hover:text-blue-600 flex items-center"
                                            >
                                                Visit Website <FaExternalLinkAlt className="ml-1 text-xs" />
                                            </a>
                                        </div>
                                    )}
                                    
                                    <div>
                                        <h3 className={`text-sm font-semibold mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                            Brand Color
                                        </h3>
                                        <div className="flex items-center">
                                            <div 
                                                className="w-6 h-6 rounded-full mr-2 border border-gray-300" 
                                                style={{ backgroundColor: brand.color || '#3B82F6' }}
                                            />
                                            <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {brand.color || '#3B82F6'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h3 className={`text-sm font-semibold mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                            Products Count
                                        </h3>
                                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {brand.product_count || 0} {brand.product_count === 1 ? 'product' : 'products'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Products Section */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                Products in this Brand
                            </h3>
                            
                            {products.length === 0 ? (
                                <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-6 text-center`}>
                                    <FaBox className={`mx-auto text-4xl mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                                        No products in this brand yet
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
                                            className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} rounded-lg p-4 transition-colors flex items-center`}
                                        >
                                            <div className="w-16 h-16 mr-4 rounded-md overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex-shrink-0">
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
                                            <div>
                                                <h4 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'} text-sm`}>
                                                    {product.nom}
                                                </h4>
                                                {product.prix && (
                                                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        {product.prix} $
                                                    </p>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
