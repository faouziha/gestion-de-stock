import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { FaChevronDown, FaChevronRight, FaBars, FaTimes, FaHome, FaBox, FaShoppingCart, FaTruck, FaUsers, FaSun, FaMoon } from 'react-icons/fa'
import ThemeToggle from './ThemeToggle'

export default function DashboardLayout() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [productsMenuOpen, setProductsMenuOpen] = useState(true); 
  const [ordersMenuOpen, setOrdersMenuOpen] = useState(false);
  const [suppliersMenuOpen, setSuppliersMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.includes('product') || location.pathname.includes('products')) {
      setProductsMenuOpen(true);
    }
    if (location.pathname.includes('order') || location.pathname.includes('orders')) {
      setOrdersMenuOpen(true);
    }
    if (location.pathname.includes('supplier') || location.pathname.includes('suppliers')) {
      setSuppliersMenuOpen(true);
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
      } else {
        setSidebarOpen(false);
      }
    };

    // Set initial state based on screen size
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`flex mt-16 relative ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
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
        } md:translate-x-0 fixed md:static top-16 left-0 w-64 ${
          darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
        } h-[calc(100vh-64px)] pt-6 overflow-y-auto transition-all duration-300 ease-in-out z-40 shadow-lg`}
      >
        <div className="px-6 mb-8 flex justify-between items-center">
          <div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Dashboard</h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>Welcome, {user.name}!</p>
          </div>
          <div className="md:hidden">
            <ThemeToggle />
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
          
          {/* Orders with dropdown */}
          <div className="relative">
            <button 
              onClick={() => setOrdersMenuOpen(!ordersMenuOpen)}
              className={`w-full flex justify-between items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                location.pathname.includes('order') || location.pathname.includes('orders')
                  ? `${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'} shadow-md` 
                  : `${darkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-200 text-gray-700 hover:text-gray-900'}`
              }`}
            >
              <div className="flex items-center">
                <FaShoppingCart className="mr-3" />
                <span>Orders</span>
              </div>
              {ordersMenuOpen ? <FaChevronDown className="ml-2" /> : <FaChevronRight className="ml-2" />}
            </button>
            
            {ordersMenuOpen && (
              <div className="ml-4 mt-2 flex flex-col space-y-2 rounded-lg overflow-hidden">
                <Link 
                  to="/orders" 
                  className={`px-4 py-2.5 rounded-lg transition-all duration-200 text-sm flex items-center ${
                    location.pathname === '/orders' 
                      ? `${darkMode ? 'bg-blue-500 text-white' : 'bg-blue-400 text-white'}` 
                      : `${darkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-200 text-gray-700 hover:text-gray-900'}`
                  }`}
                  onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                >
                  <span className={`w-2 h-2 ${darkMode ? 'bg-blue-400' : 'bg-blue-500'} rounded-full mr-2`}></span>
                  Display Orders
                </Link>
                <Link 
                  to="/orders/add" 
                  className={`px-4 py-2.5 rounded-lg transition-all duration-200 text-sm flex items-center ${
                    location.pathname === '/orders/add' 
                      ? `${darkMode ? 'bg-blue-500 text-white' : 'bg-blue-400 text-white'}` 
                      : `${darkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-200 text-gray-700 hover:text-gray-900'}`
                  }`}
                  onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                >
                  <span className={`w-2 h-2 ${darkMode ? 'bg-blue-400' : 'bg-blue-500'} rounded-full mr-2`}></span>
                  Add New Order
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
          
          <Link 
            to="/clients" 
            className={`px-4 py-3 rounded-lg flex items-center transition-all duration-200 ${
              location.pathname === '/clients' 
                ? `${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'} shadow-md` 
                : `${darkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-200 text-gray-700 hover:text-gray-900'}`
            }`}
            onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
          >
            <FaUsers className="mr-3" />
            <span>Clients</span>
          </Link>
        </div>
      </div>
      
      {/* Main Content */}
      <div className={`flex-1 overflow-y-auto p-4 md:p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
        <Outlet />
      </div>
    </div>
  )
}
