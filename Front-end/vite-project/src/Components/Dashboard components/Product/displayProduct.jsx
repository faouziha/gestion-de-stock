import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { FaEdit, FaTrash, FaEye, FaPlus, FaSearch } from 'react-icons/fa'
import { useAuth } from '../../../context/AuthContext'
import { useTheme } from '../../../context/ThemeContext'

export default function DisplayProduct() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth();
    const { darkMode } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                // Pass the user ID as a query parameter to fetch only this user's products
                const response = await axios.get(`http://localhost:3000/produit?userId=${user.id}`);
                
                // Filter products by user_id if needed
                const filteredProducts = user.role === 'admin' 
                    ? response.data 
                    : response.data.filter(product => product.user_id === user.id);
                
                setProducts(filteredProducts);
                setError(null);
            } catch (error) {
                console.error("Error fetching products:", error);
                setError("Failed to load products. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        
        fetchProducts();
    }, [user.id, user.role]);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                // Pass the user ID as a query parameter for permission checking
                await axios.delete(`http://localhost:3000/produit/${id}?userId=${user.id}`);
                setProducts(products.filter(product => product.id !== id));
                alert("Product deleted successfully!");
            } catch (error) {
                console.error("Error deleting product:", error);
                alert("Failed to delete product. Please try again.");
            }
        }
    };

    return (
        <div className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen transition-colors`}>
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
                    <h1 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Products</h1>
                    
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                placeholder="Search products..."
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
                            to="/products/add" 
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center w-full sm:w-auto justify-center sm:justify-start"
                        >
                            <FaPlus className="mr-2" />
                            <span>Add New Product</span>
                        </Link>
                    </div>
                </div>
                
                {loading && (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
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
                
                {/* Filter products based on search term */}
                {(() => {
                    const filteredProducts = products.filter(product => {
                        const searchFields = [
                            product.nom,
                            product.description,
                            product.serial_num,
                            product.numero_serie,
                            product.prix?.toString()
                        ].filter(Boolean).join(' ').toLowerCase();
                        
                        return searchFields.includes(searchTerm.toLowerCase());
                    });
                    
                    if (!loading && filteredProducts.length === 0 && !error) {
                        return (
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 sm:p-8 text-center transition-colors`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 sm:h-16 sm:w-16 ${darkMode ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-4`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>No Products Found</h3>
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>You haven't added any products yet.</p>
                        <Link
                            to="/products/add"
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            <FaPlus className="mr-2" />
                            Add Your First Product
                        </Link>
                    </div>
                );
                    }
                    return null;
                })()}
                
                {/* Display filtered products */}
                {(() => {
                    const filteredProducts = products.filter(product => {
                        const searchFields = [
                            product.nom,
                            product.serial_num,
                            product.description,
                            product.numero_serie,
                            product.prix?.toString()
                        ].filter(Boolean).join(' ').toLowerCase();
                        
                        return searchFields.includes(searchTerm.toLowerCase());
                    });
                    
                    if (filteredProducts.length > 0) {
                        return (
                    <div className={`overflow-x-auto ${darkMode ? 'bg-gray-900' : 'bg-white'} shadow-md rounded-lg transition-colors`}>
                        {/* Desktop Table View */}
                        <table className="min-w-full divide-y divide-gray-200 hidden md:table">
                            <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                                <tr>
                                    <th scope="col" className={`px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                        Image
                                    </th>
                                    <th scope="col" className={`px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                        Product Name
                                    </th>
                                    <th scope="col" className={`px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                        Price
                                    </th>
                                    <th scope="col" className={`px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                        Quantity
                                    </th>
                                    <th scope="col" className={`px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                        Serial Number
                                    </th>
                                    <th scope="col" className={`px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className={`${darkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} transition-colors`}>
                                {filteredProducts.map(product => (
                                    <tr key={product.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex justify-center">
                                                <div className={`h-16 w-16 rounded-md overflow-hidden ${darkMode ? 'bg-gray-600' : 'bg-gray-100'}`}>
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
                                                        <div className="flex h-full items-center justify-center text-gray-400">
                                                            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'} text-center`}>
                                            {product.nom}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'} text-center`}>
                                            ${parseFloat(product.prix).toFixed(2)}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'} text-center`}>
                                            {product.total} units
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'} text-center`}>
                                            {product.serial_num || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                            <div className="flex justify-center space-x-3">
                                                <button 
                                                    onClick={() => navigate(`/products/view/${product.id}`)}
                                                    className="text-indigo-600 hover:text-indigo-900 transition-colors"
                                                    aria-label="View product"
                                                >
                                                    <FaEye className="inline mr-1" /> View
                                                </button>
                                                <button 
                                                    onClick={() => navigate(`/products/edit/${product.id}`)}
                                                    className="text-blue-600 hover:text-blue-900 transition-colors"
                                                    aria-label="Edit product"
                                                >
                                                    <FaEdit className="inline mr-1" /> Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(product.id)} 
                                                    className="text-red-600 hover:text-red-900 transition-colors"
                                                    aria-label="Delete product"
                                                >
                                                    <FaTrash className="inline mr-1" /> Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {/* Mobile Card View */}
                        <div className="md:hidden grid gap-4">
                            {filteredProducts.map(product => (
                                <div key={product.id} className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg overflow-hidden shadow-sm transition-colors`}>
                                    <div className="px-4 py-3 flex items-center">
                                        <div className={`h-16 w-16 rounded-md overflow-hidden ${darkMode ? 'bg-gray-600' : 'bg-gray-100'} flex-shrink-0`}>
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
                                                <div className="flex h-full items-center justify-center text-gray-400">
                                                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{product.nom}</h3>
                                            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>${parseFloat(product.prix).toFixed(2)}</p>
                                        </div>
                                    </div>
                                    
                                    <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase font-semibold`}>Quantity</p>
                                                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{product.total} units</p>
                                            </div>
                                            <div>
                                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase font-semibold`}>Serial Number</p>
                                                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{product.serial_num || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="px-4 py-3 flex justify-between">
                                        <button 
                                            onClick={() => navigate(`/products/view/${product.id}`)}
                                            className="text-indigo-600 hover:text-indigo-900 transition-colors flex items-center"
                                            aria-label="View product"
                                        >
                                            <FaEye className="mr-1" /> View
                                        </button>
                                        <button 
                                            onClick={() => navigate(`/products/edit/${product.id}`)}
                                            className="text-blue-600 hover:text-blue-900 transition-colors flex items-center"
                                            aria-label="Edit product"
                                        >
                                            <FaEdit className="mr-1" /> Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(product.id)} 
                                            className="text-red-600 hover:text-red-900 transition-colors flex items-center"
                                            aria-label="Delete product"
                                        >
                                            <FaTrash className="mr-1" /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                        );
                    }
                    return null;
                })()}
            </div>
        </div>
    );
}
