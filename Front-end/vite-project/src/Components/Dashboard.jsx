import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import axios from 'axios'
import { FaBox, FaShoppingCart, FaTruck, FaUsers, FaExclamationTriangle } from 'react-icons/fa'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    suppliers: 0,
    clients: 0
  });
  const [loading, setLoading] = useState(true);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch product count - filter by user ID
        const productsResponse = await axios.get(`http://localhost:3000/produit?userId=${user.id}`);
        const products = productsResponse.data;
        
        // Fetch orders count - filter by user ID
        const ordersResponse = await axios.get(`http://localhost:3000/commande?userId=${user.id}`);
        const orders = ordersResponse.data;
        
        // Fetch suppliers count - filter by user ID
        const suppliersResponse = await axios.get(`http://localhost:3000/fournisseur?userId=${user.id}`);
        const suppliers = suppliersResponse.data;
        
        // Find products with low stock (less than 5 units)
        const lowStock = products.filter(product => parseInt(product.total) < 5);
        setLowStockProducts(lowStock);
        
        setStats({
          products: products.length,
          orders: orders.length,
          suppliers: suppliers.length,
          clients: 0 // You can add client count when available
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [user.id]); // Add user.id as a dependency to refetch when user changes

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
    <div className={`p-4 sm:p-6 md:p-8 w-full ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} transition-colors min-h-screen`}>
      <h1 className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Products Card */}
        <div className={`${darkMode ? 'bg-blue-900' : 'bg-blue-100'} p-4 sm:p-6 rounded-lg shadow-md transition-colors`}>
          <div className={`${darkMode ? 'bg-blue-800' : 'bg-blue-200'} p-3 rounded-full mr-4 w-12 h-12 flex items-center justify-center mb-3`}>
            <FaBox className={`${darkMode ? 'text-blue-200' : 'text-blue-800'} text-xl`} />
          </div>
          <div>
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>Products</h2>
            <p className={`text-2xl sm:text-3xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-blue-900'}`}>
              {loading ? '...' : stats.products}
            </p>
            <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-600'} mt-1`}>Total products in inventory</p>
            <Link 
              to="/displayProduct" 
              className={`inline-block mt-3 text-sm font-medium ${darkMode ? 'text-blue-300 hover:text-blue-200' : 'text-blue-700 hover:text-blue-800'}`}
            >
              View all products →
            </Link>
          </div>
        </div>
        
        {/* Orders Card */}
        <div className={`${darkMode ? 'bg-green-900' : 'bg-green-100'} p-4 sm:p-6 rounded-lg shadow-md transition-colors`}>
          <div className={`${darkMode ? 'bg-green-800' : 'bg-green-200'} p-3 rounded-full mr-4 w-12 h-12 flex items-center justify-center mb-3`}>
            <FaShoppingCart className={`${darkMode ? 'text-green-200' : 'text-green-800'} text-xl`} />
          </div>
          <div>
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-green-200' : 'text-green-800'}`}>Orders</h2>
            <p className={`text-2xl sm:text-3xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-green-900'}`}>
              {loading ? '...' : stats.orders}
            </p>
            <p className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-600'} mt-1`}>Total orders</p>
            <Link 
              to="/orders" 
              className={`inline-block mt-3 text-sm font-medium ${darkMode ? 'text-green-300 hover:text-green-200' : 'text-green-700 hover:text-green-800'}`}
            >
              View all orders →
            </Link>
          </div>
        </div>
        
        {/* Suppliers Card */}
        <div className={`${darkMode ? 'bg-yellow-900' : 'bg-yellow-100'} p-4 sm:p-6 rounded-lg shadow-md transition-colors`}>
          <div className={`${darkMode ? 'bg-yellow-800' : 'bg-yellow-200'} p-3 rounded-full mr-4 w-12 h-12 flex items-center justify-center mb-3`}>
            <FaTruck className={`${darkMode ? 'text-yellow-200' : 'text-yellow-800'} text-xl`} />
          </div>
          <div>
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>Suppliers</h2>
            <p className={`text-2xl sm:text-3xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-yellow-900'}`}>
              {loading ? '...' : stats.suppliers}
            </p>
            <p className={`text-sm ${darkMode ? 'text-yellow-300' : 'text-yellow-600'} mt-1`}>Active suppliers</p>
          </div>
        </div>
        
        {/* Clients Card */}
        <div className={`${darkMode ? 'bg-purple-900' : 'bg-purple-100'} p-4 sm:p-6 rounded-lg shadow-md transition-colors`}>
          <div className={`${darkMode ? 'bg-purple-800' : 'bg-purple-200'} p-3 rounded-full mr-4 w-12 h-12 flex items-center justify-center mb-3`}>
            <FaUsers className={`${darkMode ? 'text-purple-200' : 'text-purple-800'} text-xl`} />
          </div>
          <div>
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-purple-200' : 'text-purple-800'}`}>Clients</h2>
            <p className={`text-2xl sm:text-3xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-purple-900'}`}>
              {loading ? '...' : stats.clients}
            </p>
            <p className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-600'} mt-1`}>Registered clients</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Card */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 sm:p-6 rounded-lg shadow-md transition-colors`}>
          <h2 className={`text-lg sm:text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Recent Activity</h2>
          {loading ? (
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className={`h-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-3/4`}></div>
                <div className="space-y-2">
                  <div className={`h-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded`}></div>
                  <div className={`h-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-5/6`}></div>
                </div>
              </div>
            </div>
          ) : (
            stats.orders > 0 ? (
              <ul className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                <li className="py-3">
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>New order #{stats.orders} received</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>Today</p>
                </li>
                {lowStockProducts.length > 0 && (
                  <li className="py-3">
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-800'} flex items-center`}>
                      <FaExclamationTriangle className="text-amber-500 mr-2" />
                      {lowStockProducts.length} products low in stock
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>Requires attention</p>
                  </li>
                )}
                <li className="py-3">
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                    Welcome to your inventory management system
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                    Manage your products, orders, and suppliers
                  </p>
                </li>
              </ul>
            ) : (
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No recent activity to display.</p>
            )
          )}
        </div>
        
        {/* Low Stock Products Card */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 sm:p-6 rounded-lg shadow-md transition-colors`}>
          <h2 className={`text-lg sm:text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Low Stock Products
          </h2>
          {loading ? (
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className={`h-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-3/4`}></div>
                <div className="space-y-2">
                  <div className={`h-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded`}></div>
                  <div className={`h-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-5/6`}></div>
                </div>
              </div>
            </div>
          ) : (
            lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {lowStockProducts.slice(0, 3).map(product => (
                  <div key={product.id}>
                    <div className="flex justify-between items-center mb-1">
                      <Link 
                        to={`/products/view/${product.id}`}
                        className={`text-sm font-medium ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                      >
                        {product.nom}
                      </Link>
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {product.total} units left
                      </span>
                    </div>
                    <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2.5`}>
                      <div 
                        className={`${
                          parseInt(product.total) === 0 
                            ? 'bg-red-600' 
                            : parseInt(product.total) < 3 
                              ? 'bg-amber-500' 
                              : 'bg-yellow-500'
                        } h-2.5 rounded-full`} 
                        style={{ width: `${Math.min(parseInt(product.total) * 20, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
                
                {lowStockProducts.length > 3 && (
                  <Link 
                    to="/displayProduct" 
                    className={`inline-block mt-2 text-sm font-medium ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                  >
                    View all {lowStockProducts.length} low stock products →
                  </Link>
                )}
              </div>
            ) : (
              <div className={`flex flex-col items-center justify-center py-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <FaBox className="text-3xl mb-2 opacity-50" />
                <p>All products are well stocked.</p>
              </div>
            )
          )}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className={`mt-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 sm:p-6 rounded-lg shadow-md transition-colors`}>
        <h2 className={`text-lg sm:text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            to="/products/add" 
            className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-50 hover:bg-blue-100'} p-4 rounded-lg flex flex-col items-center justify-center transition-colors`}
          >
            <FaBox className={`text-2xl mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Add Product</span>
          </Link>
          
          <Link 
            to="/orders/add" 
            className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-green-50 hover:bg-green-100'} p-4 rounded-lg flex flex-col items-center justify-center transition-colors`}
          >
            <FaShoppingCart className={`text-2xl mb-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
            <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Create Order</span>
          </Link>
          
          <Link 
            to="/displayProduct" 
            className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-yellow-50 hover:bg-yellow-100'} p-4 rounded-lg flex flex-col items-center justify-center transition-colors`}
          >
            <FaBox className={`text-2xl mb-2 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
            <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>View Inventory</span>
          </Link>
          
          <Link 
            to="/orders" 
            className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-purple-50 hover:bg-purple-100'} p-4 rounded-lg flex flex-col items-center justify-center transition-colors`}
          >
            <FaShoppingCart className={`text-2xl mb-2 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>View Orders</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
