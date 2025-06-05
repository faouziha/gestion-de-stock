import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { FaChevronDown, FaChevronRight, FaBars, FaTimes, FaHome, FaBox, FaShoppingCart, FaTruck, FaUsers, FaSun, FaMoon, FaUserCircle, FaUserShield, FaTag, FaTrademark } from 'react-icons/fa'
import ThemeToggle from './ThemeToggle'

export default function DashboardLayout() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [productsMenuOpen, setProductsMenuOpen] = useState(true); 
  const [clientOrdersMenuOpen, setClientOrdersMenuOpen] = useState(false);
  const [suppliersMenuOpen, setSuppliersMenuOpen] = useState(false);
  const [supplierOrdersMenuOpen, setSupplierOrdersMenuOpen] = useState(false);
  const [clientsMenuOpen, setClientsMenuOpen] = useState(false);
  const [facturesMenuOpen, setFacturesMenuOpen] = useState(false);
  const [categoriesMenuOpen, setCategoriesMenuOpen] = useState(false);
  const [brandsMenuOpen, setBrandsMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.includes('product') || location.pathname.includes('products')) {
      setProductsMenuOpen(true);
    }
    if (location.pathname.includes('/clientorders')) {
      setClientOrdersMenuOpen(true);
    }
    if (location.pathname.includes('/supplier') || location.pathname.includes('/suppliers') && !location.pathname.includes('supplier-orders')) {
      setSuppliersMenuOpen(true);
    }
    if (location.pathname.includes('supplier-orders')) {
      setSupplierOrdersMenuOpen(true);
    }
    if (location.pathname.includes('client') || location.pathname.includes('clients')) {
      setClientsMenuOpen(true);
    }
    if (location.pathname.includes('facture') || location.pathname.includes('factures')) {
      setFacturesMenuOpen(true);
    }
    if (location.pathname.includes('categories')) {
      setCategoriesMenuOpen(true);
    }
    if (location.pathname.includes('brands')) {
      setBrandsMenuOpen(true);
    }
  }, [location.pathname]);

  // Close sidebar when navigating on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      }
      // Don't automatically close sidebar on resize to mobile
      // This allows users to keep the sidebar open if they want
    };

    // Set initial state based on screen size
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`flex mt-16 relative ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} min-h-[calc(100vh-4rem)]`}>
      {/* Mobile Sidebar Toggle */}
      <button 
        className="md:hidden fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar Navigation */}
      <div 
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:static top-16 left-0 bottom-0 w-64 ${
          darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
        } h-[calc(100vh-4rem)] md:h-auto overflow-y-auto overscroll-contain touch-pan-y pt-6 pb-20 transition-all duration-300 ease-in-out z-50 shadow-lg`}
      >
        <div className="px-6 mb-8 flex justify-between items-center">
          <div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Dashboard</h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>Welcome, {user.name}!</p>
          </div>
        </div>
        <div className="flex flex-col space-y-3 px-4">
          {/* Dashboard Home */}
          <Link 
            to="/dashboard" 
            className={`px-4 py-3 rounded-lg flex items-center transition-all duration-200 ${
              location.pathname === '/dashboard' 
                ? `${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'} shadow-md` 
                : `${darkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-200 text-gray-700 hover:text-gray-900'}`
            }`}
            onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
          >
            <FaHome className="mr-3" />
            <span>Dashboard Home</span>
          </Link>
          
          {/* Categories with dropdown */}
          <div className="relative">
            <button 
              onClick={() => setCategoriesMenuOpen(!categoriesMenuOpen)}
              className={`w-full flex justify-between items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                location.pathname.includes('categories')
                  ? `${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'} shadow-md` 
                  : `${darkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-200 text-gray-700 hover:text-gray-900'}`
              }`}
            >
              <div className="flex items-center">
                <FaTag className="mr-3" />
                <span>Categories</span>
              </div>
              {categoriesMenuOpen ? <FaChevronDown className="ml-2" /> : <FaChevronRight className="ml-2" />}
            </button>
            
            {categoriesMenuOpen && (
              <div className="ml-4 mt-2 flex flex-col space-y-2 rounded-lg overflow-hidden">
                <Link 
                  to="/categories" 
                  className={`px-4 py-2.5 rounded-lg transition-all duration-200 text-sm flex items-center ${
                    location.pathname === '/categories' 
                      ? `${darkMode ? 'bg-blue-500 text-white' : 'bg-blue-400 text-white'}` 
                      : `${darkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-200 text-gray-700 hover:text-gray-900'}`
                  }`}
                  onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                >
                  <span className={`w-2 h-2 ${darkMode ? 'bg-blue-400' : 'bg-blue-500'} rounded-full mr-2`}></span>
                  Display Categories
                </Link>
                <Link 
                  to="/categories/add" 
                  className={`px-4 py-2.5 rounded-lg transition-all duration-200 text-sm flex items-center ${
                    location.pathname === '/categories/add' 
                      ? `${darkMode ? 'bg-blue-500 text-white' : 'bg-blue-400 text-white'}` 
                      : `${darkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-200 text-gray-700 hover:text-gray-900'}`
                  }`}
                  onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                >
                  <span className={`w-2 h-2 ${darkMode ? 'bg-blue-400' : 'bg-blue-500'} rounded-full mr-2`}></span>
                  Add New Category
                </Link>
              </div>
            )}
          </div>
          
          {/* Brands with dropdown */}
          <div className="relative">
            <button 
              onClick={() => setBrandsMenuOpen(!brandsMenuOpen)}
              className={`w-full flex justify-between items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                location.pathname.includes('brands')
                  ? `${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'} shadow-md` 
                  : `${darkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-200 text-gray-700 hover:text-gray-900'}`
              }`}
            >
              <div className="flex items-center">
                <FaTrademark className="mr-3" />
                <span>Brands</span>
              </div>
              {brandsMenuOpen ? <FaChevronDown className="ml-2" /> : <FaChevronRight className="ml-2" />}
            </button>
            
            {brandsMenuOpen && (
              <div className="ml-4 mt-2 flex flex-col space-y-2 rounded-lg overflow-hidden">
                <Link 
                  to="/brands" 
                  className={`px-4 py-2.5 rounded-lg transition-all duration-200 text-sm flex items-center ${
                    location.pathname === '/brands' 
                      ? `${darkMode ? 'bg-blue-500 text-white' : 'bg-blue-400 text-white'}` 
                      : `${darkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-200 text-gray-700 hover:text-gray-900'}`
                  }`}
                  onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                >
                  <span className={`w-2 h-2 ${darkMode ? 'bg-blue-400' : 'bg-blue-500'} rounded-full mr-2`}></span>
                  Display Brands
                </Link>
                <Link 
                  to="/brands/add" 
                  className={`px-4 py-2.5 rounded-lg transition-all duration-200 text-sm flex items-center ${
                    location.pathname === '/brands/add' 
                      ? `${darkMode ? 'bg-blue-500 text-white' : 'bg-blue-400 text-white'}` 
                      : `${darkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-200 text-gray-700 hover:text-gray-900'}`
                  }`}
                  onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                >
                  <span className={`w-2 h-2 ${darkMode ? 'bg-blue-400' : 'bg-blue-500'} rounded-full mr-2`}></span>
                  Add New Brand
                </Link>
              </div>
            )}
          </div>
          
          {/* Products with dropdown */}
          <div className="relative">
            <button 
              onClick={() => setProductsMenuOpen(!productsMenuOpen)}
              className={`w-full flex justify-between items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                location.pathname.includes('product') || location.pathname.includes('products')
                  ? `${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'} shadow-md` 
                  : `${darkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-200 text-gray-700 hover:text-gray-900'}`
              }`}
            >
              <div className="flex items-center">
                <FaBox className="mr-3" />
                <span>Products</span>
              </div>
              {productsMenuOpen ? <FaChevronDown className="ml-2" /> : <FaChevronRight className="ml-2" />}
            </button>
            
            {productsMenuOpen && (
              <div className="ml-4 mt-2 flex flex-col space-y-2 rounded-lg overflow-hidden">
                <Link 
                  to="/displayProduct" 
                  className={`px-4 py-2.5 rounded-lg transition-all duration-200 text-sm flex items-center ${
                    location.pathname === '/displayProduct' 
                      ? `${darkMode ? 'bg-blue-500 text-white' : 'bg-blue-400 text-white'}` 
                      : `${darkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-200 text-gray-700 hover:text-gray-900'}`
                  }`}
                  onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                >
                  <span className={`w-2 h-2 ${darkMode ? 'bg-blue-400' : 'bg-blue-500'} rounded-full mr-2`}></span>
                  Display Products
                </Link>
                <Link 
                  to="/products/add" 
                  className={`px-4 py-2.5 rounded-lg transition-all duration-200 text-sm flex items-center ${
                    location.pathname === '/products/add' 
                      ? `${darkMode ? 'bg-blue-500 text-white' : 'bg-blue-400 text-white'}` 
                      : `${darkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-200 text-gray-700 hover:text-gray-900'}`
                  }`}
                  onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                >
                  <span className={`w-2 h-2 ${darkMode ? 'bg-blue-400' : 'bg-blue-500'} rounded-full mr-2`}></span>
                  Add New Product
                </Link>
              </div>
            )}
          </div>
          
          {/* Client Orders with dropdown */}
          <div className="relative">
            <button 
              onClick={() => setClientOrdersMenuOpen(!clientOrdersMenuOpen)}
              className={`w-full flex justify-between items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                location.pathname.includes('/clientorders')
                  ? `${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'} shadow-md` 
                  : `${darkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-200 text-gray-700 hover:text-gray-900'}`
              }`}
            >
              <div className="flex items-center">
                <FaShoppingCart className="mr-3" />
                <span>Client Orders</span>
              </div>
              {clientOrdersMenuOpen ? <FaChevronDown className="ml-2" /> : <FaChevronRight className="ml-2" />}
            </button>
            
            {clientOrdersMenuOpen && (
              <div className="ml-4 mt-2 flex flex-col space-y-2 rounded-lg overflow-hidden">
                <Link 
                  to="/clientorders" 
                  className={`px-4 py-2.5 rounded-lg transition-all duration-200 text-sm flex items-center ${
                    location.pathname === '/clientorders' 
                      ? `${darkMode ? 'bg-blue-500 text-white' : 'bg-blue-400 text-white'}` 
                      : `${darkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-200 text-gray-700 hover:text-gray-900'}`
                  }`}
                  onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                >
                  <span className={`w-2 h-2 ${darkMode ? 'bg-blue-400' : 'bg-blue-500'} rounded-full mr-2`}></span>
                  Display Orders
                </Link>
                <Link 
                  to="/clientorders/create" 
                  className={`px-4 py-2.5 rounded-lg transition-all duration-200 text-sm flex items-center ${
                    location.pathname === '/clientorders/create' 
                      ? `${darkMode ? 'bg-blue-500 text-white' : 'bg-blue-400 text-white'}` 
                      : `${darkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-200 text-gray-700 hover:text-gray-900'}`
                  }`}
                  onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                >
                  <span className={`w-2 h-2 ${darkMode ? 'bg-blue-400' : 'bg-blue-500'} rounded-full mr-2`}></span>
                  Create New Order
                </Link>
              </div>
            )}
          </div>
          
          {/* Supplier Orders with dropdown */}
          <div className="relative">
            <button 
              onClick={() => setSupplierOrdersMenuOpen(!supplierOrdersMenuOpen)}
              className={`w-full flex justify-between items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                location.pathname.includes('supplier-orders')
                  ? `${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'} shadow-md` 
                  : `${darkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-200 text-gray-700 hover:text-gray-900'}`
              }`}
            >
              <div className="flex items-center">
                <FaShoppingCart className="mr-3" />
                <span>Supplier Orders</span>
              </div>
              {supplierOrdersMenuOpen ? <FaChevronDown className="ml-2" /> : <FaChevronRight className="ml-2" />}
            </button>
            
            {supplierOrdersMenuOpen && (
              <div className="ml-4 mt-2 flex flex-col space-y-2 rounded-lg overflow-hidden">
                <Link 
                  to="/supplier-orders" 
                  className={`px-4 py-2.5 rounded-lg transition-all duration-200 text-sm flex items-center ${
                    location.pathname === '/supplier-orders' 
                      ? `${darkMode ? 'bg-blue-500 text-white' : 'bg-blue-400 text-white'}` 
                      : `${darkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-200 text-gray-700 hover:text-gray-900'}`
                  }`}
                  onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                >
                  <span className={`w-2 h-2 ${darkMode ? 'bg-blue-400' : 'bg-blue-500'} rounded-full mr-2`}></span>
                  Display Supplier Orders
                </Link>
                <Link 
                  to="/add-supplier-order" 
                  className={`px-4 py-2.5 rounded-lg transition-all duration-200 text-sm flex items-center ${
                    location.pathname === '/add-supplier-order' 
                      ? `${darkMode ? 'bg-blue-500 text-white' : 'bg-blue-400 text-white'}` 
                      : `${darkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-200 text-gray-700 hover:text-gray-900'}`
                  }`}
                  onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                >
                  <span className={`w-2 h-2 ${darkMode ? 'bg-blue-400' : 'bg-blue-500'} rounded-full mr-2`}></span>
                  Add New Supplier Order
                </Link>
              </div>
            )}
          </div>
          
          {/* Suppliers with dropdown */}
          <div className="relative">
            <button 
              onClick={() => setSuppliersMenuOpen(!suppliersMenuOpen)}
              className={`w-full flex justify-between items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                location.pathname.includes('supplier') || location.pathname.includes('suppliers')
                  ? `${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'} shadow-md` 
                  : `${darkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-200 text-gray-700 hover:text-gray-900'}`
              }`}
            >
              <div className="flex items-center">
                <FaTruck className="mr-3" />
                <span>Suppliers</span>
              </div>
              {suppliersMenuOpen ? <FaChevronDown className="ml-2" /> : <FaChevronRight className="ml-2" />}
            </button>
            
            {suppliersMenuOpen && (
              <div className="ml-4 mt-2 flex flex-col space-y-2 rounded-lg overflow-hidden">
                <Link 
                  to="/suppliers" 
                  className={`px-4 py-2.5 rounded-lg transition-all duration-200 text-sm flex items-center ${
                    location.pathname === '/suppliers' 
                      ? `${darkMode ? 'bg-blue-500 text-white' : 'bg-blue-400 text-white'}` 
                      : `${darkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-200 text-gray-700 hover:text-gray-900'}`
                  }`}
                  onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                >
                  <span className={`w-2 h-2 ${darkMode ? 'bg-blue-400' : 'bg-blue-500'} rounded-full mr-2`}></span>
                  Display Suppliers
                </Link>
                <Link 
                  to="/suppliers/add" 
                  className={`px-4 py-2.5 rounded-lg transition-all duration-200 text-sm flex items-center ${
                    location.pathname === '/suppliers/add' 
                      ? `${darkMode ? 'bg-blue-500 text-white' : 'bg-blue-400 text-white'}` 
                      : `${darkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-200 text-gray-700 hover:text-gray-900'}`
                  }`}
                  onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                >
                  <span className={`w-2 h-2 ${darkMode ? 'bg-blue-400' : 'bg-blue-500'} rounded-full mr-2`}></span>
                  Add New Supplier
                </Link>
              </div>
            )}
          </div>
          
          {/* Clients with dropdown */}
          <div className="relative">
            <button 
              onClick={() => setClientsMenuOpen(!clientsMenuOpen)}
              className={`w-full flex justify-between items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                location.pathname.includes('client') || location.pathname.includes('clients')
                  ? `${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'} shadow-md` 
                  : `${darkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-200 text-gray-700 hover:text-gray-900'}`
              }`}
            >
              <div className="flex items-center">
                <FaUsers className="mr-3" />
                <span>Clients</span>
              </div>
              {clientsMenuOpen ? <FaChevronDown className="ml-2" /> : <FaChevronRight className="ml-2" />}
            </button>
            
            {clientsMenuOpen && (
              <div className="ml-4 mt-2 flex flex-col space-y-2 rounded-lg overflow-hidden">
                <Link 
                  to="/clients" 
                  className={`px-4 py-2.5 rounded-lg transition-all duration-200 text-sm flex items-center ${
                    location.pathname === '/clients' 
                      ? `${darkMode ? 'bg-blue-500 text-white' : 'bg-blue-400 text-white'}` 
                      : `${darkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-200 text-gray-700 hover:text-gray-900'}`
                  }`}
                  onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                >
                  <span className={`w-2 h-2 ${darkMode ? 'bg-blue-400' : 'bg-blue-500'} rounded-full mr-2`}></span>
                  Display Clients
                </Link>
                <Link 
                  to="/clients/add" 
                  className={`px-4 py-2.5 rounded-lg transition-all duration-200 text-sm flex items-center ${
                    location.pathname === '/clients/add' 
                      ? `${darkMode ? 'bg-blue-500 text-white' : 'bg-blue-400 text-white'}` 
                      : `${darkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-200 text-gray-700 hover:text-gray-900'}`
                  }`}
                  onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                >
                  <span className={`w-2 h-2 ${darkMode ? 'bg-blue-400' : 'bg-blue-500'} rounded-full mr-2`}></span>
                  Add New Client
                </Link>
                <Link 
                  to="/clients/soldes" 
                  className={`px-4 py-2.5 rounded-lg transition-all duration-200 text-sm flex items-center ${
                    location.pathname === '/clients/soldes' 
                      ? `${darkMode ? 'bg-blue-500 text-white' : 'bg-blue-400 text-white'}` 
                      : `${darkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-200 text-gray-700 hover:text-gray-900'}`
                  }`}
                  onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                >
                  <span className={`w-2 h-2 ${darkMode ? 'bg-blue-400' : 'bg-blue-500'} rounded-full mr-2`}></span>
                  Client Balances
                </Link>
              </div>
            )}
          </div>
          
          {/* Factures with dropdown */}
          <div className="relative">
            <button 
              onClick={() => setFacturesMenuOpen(!facturesMenuOpen)}
              className={`w-full flex justify-between items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                location.pathname.includes('facture') || location.pathname.includes('factures')
                  ? `${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'} shadow-md` 
                  : `${darkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-200 text-gray-700 hover:text-gray-900'}`
              }`}
            >
              <div className="flex items-center">
                <FaUsers className="mr-3" />
                <span>Factures</span>
              </div>
              {facturesMenuOpen ? <FaChevronDown className="ml-2" /> : <FaChevronRight className="ml-2" />}
            </button>
            
            {facturesMenuOpen && (
              <div className="ml-4 mt-2 flex flex-col space-y-2 rounded-lg overflow-hidden">
                <Link 
                  to="/factures" 
                  className={`px-4 py-2.5 rounded-lg transition-all duration-200 text-sm flex items-center ${
                    location.pathname === '/factures' 
                      ? `${darkMode ? 'bg-blue-500 text-white' : 'bg-blue-400 text-white'}` 
                      : `${darkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-200 text-gray-700 hover:text-gray-900'}`
                  }`}
                  onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                >
                  <span className={`w-2 h-2 ${darkMode ? 'bg-blue-400' : 'bg-blue-500'} rounded-full mr-2`}></span>
                  Display Factures
                </Link>
                <Link 
                  to="/factures/add" 
                  className={`px-4 py-2.5 rounded-lg transition-all duration-200 text-sm flex items-center ${
                    location.pathname === '/factures/add' 
                      ? `${darkMode ? 'bg-blue-500 text-white' : 'bg-blue-400 text-white'}` 
                      : `${darkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-200 text-gray-700 hover:text-gray-900'}`
                  }`}
                  onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                >
                  <span className={`w-2 h-2 ${darkMode ? 'bg-blue-400' : 'bg-blue-500'} rounded-full mr-2`}></span>
                  Add New Facture
                </Link>
              </div>
            )}
          </div>
          
          {/* Admin Link - Only show for admin users */}
          {user.role === 'admin' && (
            <Link 
              to="/admin" 
              className={`px-4 py-3 rounded-lg flex items-center transition-all duration-200 ${
                location.pathname === '/admin' 
                  ? `${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'} shadow-md` 
                  : `${darkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-200 text-gray-700 hover:text-gray-900'}`
              }`}
              onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
            >
              <FaUserShield className="mr-3" />
              <span>User Management</span>
            </Link>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className={`flex-1 overflow-auto p-4 md:p-6 pb-4 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'} min-h-[calc(100vh-4rem)]`}>
        <Outlet />
      </div>
    </div>
  )
}
