import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { FaChevronDown, FaChevronRight } from 'react-icons/fa'

export default function DashboardLayout() {
  const { user } = useAuth();
  const [productsMenuOpen, setProductsMenuOpen] = useState(true); 
  const location = useLocation();

  React.useEffect(() => {
    if (location.pathname.includes('product') || location.pathname.includes('products')) {
      setProductsMenuOpen(true);
    }
  }, [location.pathname]);

  return (
    <div className="flex mt-16 h-[calc(100vh-64px)]">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-gray-800 text-white h-full pt-6 overflow-y-auto">
        <div className="px-4 mb-6">
          <h2 className="text-xl font-bold">Dashboard</h2>
          <p className="text-sm text-gray-400">Welcome, {user.name}!</p>
        </div>
        <div className="flex flex-col space-y-2 px-2">
          {/* Dashboard Home */}
          <Link to="/dashboard" className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors">
            Dashboard Home
          </Link>
          
          {/* Products with dropdown */}
          <div className="relative">
            <button 
              onClick={() => setProductsMenuOpen(!productsMenuOpen)}
              className="w-full flex justify-between items-center px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              <span>Products</span>
              {productsMenuOpen ? <FaChevronDown className="ml-2" /> : <FaChevronRight className="ml-2" />}
            </button>
            
            {productsMenuOpen && (
              <div className="ml-4 mt-1 flex flex-col space-y-1">
                <Link 
                  to="/displayProduct" 
                  className={`px-4 py-2 ${location.pathname === '/displayProduct' ? 'bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} rounded-md transition-colors text-sm`}
                >
                  Display Products
                </Link>
                <Link 
                  to="/products/add" 
                  className={`px-4 py-2 ${location.pathname === '/products/add' ? 'bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} rounded-md transition-colors text-sm`}
                >
                  Add New Product
                </Link>
              </div>
            )}
          </div>
          
          <Link to="/orders" className="px-4 py-3 bg-green-600 hover:bg-green-700 rounded-md transition-colors">Orders</Link>
          <Link to="/suppliers" className="px-4 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-md transition-colors">Fournisseurs</Link>
          <Link to="/clients" className="px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-md transition-colors">Clients</Link>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  )
}
