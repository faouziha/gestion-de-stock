import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { FaEdit, FaTrash, FaEye, FaPlus, FaSearch, FaFilter, FaChevronDown } from 'react-icons/fa'
import { useAuth } from '../../../context/AuthContext'
import { useTheme } from '../../../context/ThemeContext'

export default function DisplayProduct() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [filterType, setFilterType] = useState(null);
    const [activeFilters, setActiveFilters] = useState({
        category: null,
        price: null,
        stock: null
    });
    const filterMenuRef = useRef(null);
    const { user } = useAuth();
    const { darkMode } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch products
                const productsResponse = await axios.get(`http://localhost:3000/produit?userId=${user.id}`);
                
                // Filter products by user_id if needed
                const filteredProducts = user.role === 'admin' 
                    ? productsResponse.data 
                    : productsResponse.data.filter(product => product.user_id === user.id);
                
                setProducts(filteredProducts);
                
                // Fetch categories
                const categoriesResponse = await axios.get(`http://localhost:3000/categories?userId=${user.id}`);
                setCategories(categoriesResponse.data);
                
                setError(null);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Failed to load data. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [user.id, user.role]);
    
    // Close filter menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
                setShowFilterMenu(false);
            }
        }
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

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
                        
                        {/* Filter Dropdown */}
                        <div className="relative" ref={filterMenuRef}>
                            <button 
                                onClick={() => setShowFilterMenu(!showFilterMenu)}
                                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md border ${
                                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'
                                } w-full sm:w-auto`}
                            >
                                <FaFilter className={`${Object.values(activeFilters).some(v => v !== null) ? 'text-blue-500' : ''}`} />
                                <span>Filter</span>
                                <FaChevronDown className="text-xs" />
                            </button>
                            
                            {showFilterMenu && (
                                <div className={`absolute z-10 mt-1 w-56 rounded-md shadow-lg ${
                                    darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                                } right-0`}>
                                    <div className="py-1">
                                        {/* Filter by Category */}
                                        <div 
                                            className={`px-4 py-2 text-sm ${
                                                darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                                            } cursor-pointer flex justify-between items-center group`}
                                            onMouseEnter={() => setFilterType('category')}
                                        >
                                            <span>Filter by Category</span>
                                            <FaChevronDown className="text-xs" />
                                            
                                            {filterType === 'category' && (
                                                <div className={`absolute left-full top-0 ml-0.5 w-48 rounded-md shadow-lg ${
                                                    darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                                                }`}>
                                                    <div className="py-1">
                                                        <div 
                                                            className={`px-4 py-2 text-sm ${
                                                                darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                                                            } cursor-pointer ${activeFilters.category === null ? 'font-bold' : ''}`}
                                                            onClick={() => {
                                                                setActiveFilters({...activeFilters, category: null});
                                                                setShowFilterMenu(false);
                                                            }}
                                                        >
                                                            All Categories
                                                        </div>
                                                        {categories.map(category => (
                                                            <div 
                                                                key={category.id}
                                                                className={`px-4 py-2 text-sm ${
                                                                    darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                                                                } cursor-pointer ${activeFilters.category === category.id ? 'font-bold' : ''}`}
                                                                onClick={() => {
                                                                    setActiveFilters({...activeFilters, category: category.id});
                                                                    setShowFilterMenu(false);
                                                                }}
                                                            >
                                                                <div className="flex items-center">
                                                                    <div 
                                                                        className="w-3 h-3 rounded-full mr-2" 
                                                                        style={{ backgroundColor: category.color || '#3B82F6' }}
                                                                    ></div>
                                                                    {category.name}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Filter by Price */}
                                        <div 
                                            className={`px-4 py-2 text-sm ${
                                                darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                                            } cursor-pointer flex justify-between items-center`}
                                            onMouseEnter={() => setFilterType('price')}
                                        >
                                            <span>Filter by Price</span>
                                            <FaChevronDown className="text-xs" />
                                            
                                            {filterType === 'price' && (
                                                <div className={`absolute left-full top-0 ml-0.5 w-48 rounded-md shadow-lg ${
                                                    darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                                                }`}>
                                                    <div className="py-1">
                                                        <div 
                                                            className={`px-4 py-2 text-sm ${
                                                                darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                                                            } cursor-pointer ${activeFilters.price === null ? 'font-bold' : ''}`}
                                                            onClick={() => {
                                                                setActiveFilters({...activeFilters, price: null});
                                                                setShowFilterMenu(false);
                                                            }}
                                                        >
                                                            All Prices
                                                        </div>
                                                        <div 
                                                            className={`px-4 py-2 text-sm ${
                                                                darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                                                            } cursor-pointer ${activeFilters.price === 'low' ? 'font-bold' : ''}`}
                                                            onClick={() => {
                                                                setActiveFilters({...activeFilters, price: 'low'});
                                                                setShowFilterMenu(false);
                                                            }}
                                                        >
                                                            Low to High
                                                        </div>
                                                        <div 
                                                            className={`px-4 py-2 text-sm ${
                                                                darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                                                            } cursor-pointer ${activeFilters.price === 'high' ? 'font-bold' : ''}`}
                                                            onClick={() => {
                                                                setActiveFilters({...activeFilters, price: 'high'});
                                                                setShowFilterMenu(false);
                                                            }}
                                                        >
                                                            High to Low
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Filter by Stock */}
                                        <div 
                                            className={`px-4 py-2 text-sm ${
                                                darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                                            } cursor-pointer flex justify-between items-center`}
                                            onMouseEnter={() => setFilterType('stock')}
                                        >
                                            <span>Filter by Stock</span>
                                            <FaChevronDown className="text-xs" />
                                            
                                            {filterType === 'stock' && (
                                                <div className={`absolute left-full top-0 ml-0.5 w-48 rounded-md shadow-lg ${
                                                    darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                                                }`}>
                                                    <div className="py-1">
                                                        <div 
                                                            className={`px-4 py-2 text-sm ${
                                                                darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                                                            } cursor-pointer ${activeFilters.stock === null ? 'font-bold' : ''}`}
                                                            onClick={() => {
                                                                setActiveFilters({...activeFilters, stock: null});
                                                                setShowFilterMenu(false);
                                                            }}
                                                        >
                                                            All Stock Levels
                                                        </div>
                                                        <div 
                                                            className={`px-4 py-2 text-sm ${
                                                                darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                                                            } cursor-pointer ${activeFilters.stock === 'instock' ? 'font-bold' : ''}`}
                                                            onClick={() => {
                                                                setActiveFilters({...activeFilters, stock: 'instock'});
                                                                setShowFilterMenu(false);
                                                            }}
                                                        >
                                                            In Stock ({'>'}0)
                                                        </div>
                                                        <div 
                                                            className={`px-4 py-2 text-sm ${
                                                                darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                                                            } cursor-pointer ${activeFilters.stock === 'low' ? 'font-bold' : ''}`}
                                                            onClick={() => {
                                                                setActiveFilters({...activeFilters, stock: 'low'});
                                                                setShowFilterMenu(false);
                                                            }}
                                                        >
                                                            Low Stock (≤10)
                                                        </div>
                                                        <div 
                                                            className={`px-4 py-2 text-sm ${
                                                                darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                                                            } cursor-pointer ${activeFilters.stock === 'outofstock' ? 'font-bold' : ''}`}
                                                            onClick={() => {
                                                                setActiveFilters({...activeFilters, stock: 'outofstock'});
                                                                setShowFilterMenu(false);
                                                            }}
                                                        >
                                                            Out of Stock (0)
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Reset Filters */}
                                        {Object.values(activeFilters).some(v => v !== null) && (
                                            <div 
                                                className={`px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 cursor-pointer ${
                                                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-50'
                                                }`}
                                                onClick={() => {
                                                    setActiveFilters({
                                                        category: null,
                                                        price: null,
                                                        stock: null
                                                    });
                                                    setShowFilterMenu(false);
                                                }}
                                            >
                                                Reset All Filters
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <Link 
                            to="/products/add" 
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-md transition-colors flex items-center w-full sm:w-auto justify-center text-sm sm:text-base"
                        >
                            <FaPlus className="mr-1 sm:mr-2" size={14} />
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
                
                {/* Apply filters and search */}
                {(() => {
                    // Apply all filters
                    let filteredProducts = products.filter(product => {
                        // Search filter
                        const searchFields = [
                            product.nom,
                            product.description,
                            product.serial_num,
                            product.numero_serie,
                            product.prix?.toString()
                        ].filter(Boolean).join(' ').toLowerCase();
                        
                        const matchesSearch = searchFields.includes(searchTerm.toLowerCase());
                        
                        // Category filter
                        const matchesCategory = activeFilters.category === null || 
                            (product.category_id && product.category_id.toString() === activeFilters.category.toString());
                        
                        // Stock filter
                        let matchesStock = true;
                        if (activeFilters.stock === 'instock') {
                            matchesStock = parseInt(product.total) > 0;
                        } else if (activeFilters.stock === 'low') {
                            matchesStock = parseInt(product.total) > 0 && parseInt(product.total) <= 10;
                        } else if (activeFilters.stock === 'outofstock') {
                            matchesStock = parseInt(product.total) === 0;
                        }
                        
                        return matchesSearch && matchesCategory && matchesStock;
                    });
                    
                    // Apply price sorting
                    if (activeFilters.price === 'low') {
                        filteredProducts.sort((a, b) => parseFloat(a.prix) - parseFloat(b.prix));
                    } else if (activeFilters.price === 'high') {
                        filteredProducts.sort((a, b) => parseFloat(b.prix) - parseFloat(a.prix));
                    }
                    
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
                    // Apply all filters
                    let filteredProducts = products.filter(product => {
                        // Search filter
                        const searchFields = [
                            product.nom,
                            product.description,
                            product.serial_num,
                            product.numero_serie,
                            product.prix?.toString()
                        ].filter(Boolean).join(' ').toLowerCase();
                        
                        const matchesSearch = searchFields.includes(searchTerm.toLowerCase());
                        
                        // Category filter
                        const matchesCategory = activeFilters.category === null || 
                            (product.category_id && product.category_id.toString() === activeFilters.category.toString());
                        
                        // Stock filter
                        let matchesStock = true;
                        if (activeFilters.stock === 'instock') {
                            matchesStock = parseInt(product.total) > 0;
                        } else if (activeFilters.stock === 'low') {
                            matchesStock = parseInt(product.total) > 0 && parseInt(product.total) <= 10;
                        } else if (activeFilters.stock === 'outofstock') {
                            matchesStock = parseInt(product.total) === 0;
                        }
                        
                        return matchesSearch && matchesCategory && matchesStock;
                    });
                    
                    // Apply price sorting
                    if (activeFilters.price === 'low') {
                        filteredProducts.sort((a, b) => parseFloat(a.prix) - parseFloat(b.prix));
                    } else if (activeFilters.price === 'high') {
                        filteredProducts.sort((a, b) => parseFloat(b.prix) - parseFloat(a.prix));
                    }
                    
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
                                        Category
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
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {product.category_name ? (
                                                <div className="flex items-center justify-center space-x-2">
                                                    <div 
                                                        className="w-3 h-3 rounded-full" 
                                                        style={{ backgroundColor: product.category_color || '#3B82F6' }}
                                                    ></div>
                                                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        {product.category_name}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className={`text-sm italic ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                                    None
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
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
