import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useTheme } from '../../../context/ThemeContext'
import { FaArrowLeft, FaEdit, FaSpinner } from 'react-icons/fa'

export default function ViewProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { darkMode } = useTheme();
    
    const [product, setProduct] = useState(null);
    const [supplier, setSupplier] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:3000/produit/${id}`);
                setProduct(response.data);
                
                // Fetch supplier details if supplier ID exists
                if (response.data.fournisseur_id) {
                    const supplierResponse = await axios.get(`http://localhost:3000/fournisseur/${response.data.fournisseur_id}`);
                    setSupplier(supplierResponse.data);
                }
                
                setError(null);
            } catch (error) {
                console.error("Error fetching product:", error);
                setError("Failed to load product data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen transition-colors`}>
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 sm:gap-0">
                    <h1 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Product Details</h1>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={() => navigate('/displayProduct')}
                            className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} px-4 py-2 rounded-md transition-colors flex items-center justify-center flex-1 sm:flex-none`}
                        >
                            <FaArrowLeft className="mr-2" />
                            Back to Products
                        </button>
                        {(user.role === 'admin' || (product && product.user_id === user.id)) && (
                            <button
                                onClick={() => navigate(`/products/edit/${id}`)}
                                className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center flex-1 sm:flex-none`}
                            >
                                <FaEdit className="mr-2" />
                                Edit Product
                            </button>
                        )}
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
                
                {!loading && !error && product && (
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg overflow-hidden transition-colors`}>
                        {/* Product Header with Image */}
                        <div className={`relative h-48 sm:h-64 md:h-80 bg-gray-200 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            {product.image ? (
                                <img 
                                    src={product.image} 
                                    alt={product.nom} 
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div className={`flex items-center justify-center h-full ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    <span>No image available</span>
                                </div>
                            )}
                        </div>
                        
                        {/* Product Information */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div>
                                    <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{product.nom}</h2>
                                    
                                    <div className="mb-4">
                                        <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Description</h3>
                                        <p className={`mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                            {product.description || 'No description available'}
                                        </p>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Price</h3>
                                            <p className={`mt-1 text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                                ${parseFloat(product.prix).toFixed(2)}
                                            </p>
                                        </div>
                                        
                                        <div>
                                            <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Quantity in Stock</h3>
                                            <p className={`mt-1 text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                                {product.total} units
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {product.serial_num && (
                                        <div className="mb-4">
                                            <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Serial Number</h3>
                                            <p className={`mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{product.serial_num}</p>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Right Column */}
                                <div>
                                    {supplier && (
                                        <div className={`p-4 rounded-lg mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                            <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Supplier Information</h3>
                                            <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{supplier.nom_entreprise}</p>
                                            {supplier.email && <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Email: {supplier.email}</p>}
                                            {supplier.telephone && <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Phone: {supplier.telephone}</p>}
                                            {supplier.adresse && <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Address: {supplier.adresse}</p>}
                                        </div>
                                    )}
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Created At</h3>
                                            <p className={`mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                                {formatDate(product.created_at)}
                                            </p>
                                        </div>
                                        
                                        <div>
                                            <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Last Updated</h3>
                                            <p className={`mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                                {formatDate(product.updated_at)}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* Product Status */}
                                    <div className="mt-4">
                                        <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Status</h3>
                                        <div className="mt-1">
                                            <span 
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    parseInt(product.total) > 0 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}
                                            >
                                                {parseInt(product.total) > 0 ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
