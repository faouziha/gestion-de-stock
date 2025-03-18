import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { FaEdit, FaTrash, FaEye, FaPlus } from 'react-icons/fa'
import { useAuth } from '../../../../context/AuthContext'
import { useTheme } from '../../../../context/ThemeContext'
import { useNavigate } from 'react-router-dom'

export default function DisplayOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()
  const { darkMode } = useTheme()
  const navigate = useNavigate()

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`http://localhost:3000/commande?userId=${user.id}`)
      console.log('Orders data from server:', response.data)
      
      // Make sure date_commande is set for each order
      const formattedOrders = response.data.map(order => ({
        ...order,
        date_commande: order.date_commande || new Date().toISOString().split('T')[0]
      }))
      
      setOrders(formattedOrders)
      setError(null)
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError('Failed to load orders. Please try again later.')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (id) => {
    navigate(`/orders/edit/${id}`)
  }

  const handleView = (id) => {
    navigate(`/orders/view/${id}`)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await axios.delete(`http://localhost:3000/commande/${id}?userId=${user.id}`)
        // Refresh the orders list after deletion
        fetchOrders()
      } catch (error) {
        console.error('Error deleting order:', error)
        alert('Failed to delete order. Please try again.')
      }
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [user.id])

  // Simplified date formatting function
  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString(); // Default to today's date
    return new Date(dateString).toLocaleDateString();
  }

  return (
    <div className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
          <h1 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Orders</h1>
          <button
            onClick={() => navigate('/orders/add')}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center"
          >
            <FaPlus className="mr-2" />
            Add New Order
          </button>
        </div>
        
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        )}
        
        {error && (
          <div className={`${darkMode ? 'bg-red-900 border-red-700 text-red-100' : 'bg-red-100 border-red-500 text-red-700'} border-l-4 p-4 mb-6 rounded-md shadow-sm`}>
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className={`h-5 w-5 ${darkMode ? 'text-red-300' : 'text-red-500'}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {!loading && orders.length === 0 && !error && (
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-md p-6 sm:p-8 text-center`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 sm:h-16 w-12 sm:w-16 ${darkMode ? 'text-gray-500' : 'text-gray-400'} mx-auto mb-4`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>No Orders Found</h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-500'} mb-4`}>You haven't created any orders yet.</p>
            <button
              onClick={() => navigate('/orders/add')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <FaPlus className="mr-2" />
              Create Your First Order
            </button>
          </div>
        )}
        
        {orders.length > 0 && (
          <>
            {/* Desktop view - Table */}
            <div className={`hidden md:block overflow-x-auto ${darkMode ? 'bg-gray-700' : 'bg-white'} shadow-md rounded-lg`}>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <tr>
                    <th scope="col" className={`px-4 sm:px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Order ID
                    </th>
                    <th scope="col" className={`px-4 sm:px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Product
                    </th>
                    <th scope="col" className={`px-4 sm:px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Customer
                    </th>
                    <th scope="col" className={`px-4 sm:px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Quantity
                    </th>
                    <th scope="col" className={`px-4 sm:px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Date
                    </th>
                    <th scope="col" className={`px-4 sm:px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Status
                    </th>
                    <th scope="col" className={`px-4 sm:px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`${darkMode ? 'bg-gray-700 divide-y divide-gray-600' : 'bg-white divide-y divide-gray-200'}`}>
                  {orders.map(order => (
                    <tr key={order.id} className={`${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50'}`}>
                      <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'} text-center`}>
                        #{order.id}
                      </td>
                      <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'} text-center`}>
                        {order.nom_produit}
                      </td>
                      <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'} text-center`}>
                        {order.customer_name || 'N/A'}
                      </td>
                      <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'} text-center`}>
                        {order.quantite} units
                      </td>
                      <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-center ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        {formatDate(order.date_commande) || new Date().toLocaleDateString()}
                      </td>
                      <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-center`}>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${order.status === 'Pending' ? `${darkMode ? 'bg-yellow-800 text-yellow-100' : 'bg-yellow-100 text-yellow-800'}` : ''}
                          ${order.status === 'Processing' ? `${darkMode ? 'bg-blue-800 text-blue-100' : 'bg-blue-100 text-blue-800'}` : ''}
                          ${order.status === 'Shipped' ? `${darkMode ? 'bg-indigo-800 text-indigo-100' : 'bg-indigo-100 text-indigo-800'}` : ''}
                          ${order.status === 'Delivered' ? `${darkMode ? 'bg-green-800 text-green-100' : 'bg-green-100 text-green-800'}` : ''}
                          ${order.status === 'Cancelled' ? `${darkMode ? 'bg-red-800 text-red-100' : 'bg-red-100 text-red-800'}` : ''}
                          ${!order.status ? `${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-gray-100 text-gray-800'}` : ''}
                        `}>
                          {order.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex justify-center space-x-3">
                          <button 
                            onClick={() => handleView(order.id)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors"
                            aria-label="View order"
                          >
                            <FaEye className="inline mr-1" /> View
                          </button>
                          <button 
                            onClick={() => handleEdit(order.id)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            aria-label="Edit order"
                          >
                            <FaEdit className="inline mr-1" /> Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(order.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            aria-label="Delete order"
                          >
                            <FaTrash className="inline mr-1" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile view - Cards */}
            <div className="md:hidden space-y-4">
              {orders.map(order => (
                <div key={order.id} className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border rounded-lg shadow-sm p-4`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Order #{order.id}
                      </h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        {formatDate(order.date_commande)}
                      </p>
                    </div>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${order.status === 'Pending' ? `${darkMode ? 'bg-yellow-800 text-yellow-100' : 'bg-yellow-100 text-yellow-800'}` : ''}
                      ${order.status === 'Processing' ? `${darkMode ? 'bg-blue-800 text-blue-100' : 'bg-blue-100 text-blue-800'}` : ''}
                      ${order.status === 'Shipped' ? `${darkMode ? 'bg-indigo-800 text-indigo-100' : 'bg-indigo-100 text-indigo-800'}` : ''}
                      ${order.status === 'Delivered' ? `${darkMode ? 'bg-green-800 text-green-100' : 'bg-green-100 text-green-800'}` : ''}
                      ${order.status === 'Cancelled' ? `${darkMode ? 'bg-red-800 text-red-100' : 'bg-red-100 text-red-800'}` : ''}
                      ${!order.status ? `${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-gray-100 text-gray-800'}` : ''}
                    `}>
                      {order.status || 'Pending'}
                    </span>
                  </div>
                  <div className="mb-3">
                    <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}><span className="font-medium">Product:</span> {order.nom_produit}</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}><span className="font-medium">Customer:</span> {order.customer_name || 'N/A'}</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}><span className="font-medium">Quantity:</span> {order.quantite} units</div>
                  </div>
                  <div className={`flex justify-between pt-3 border-t ${darkMode ? 'border-gray-600' : 'border-gray-100'}`}>
                    <button 
                      onClick={() => handleView(order.id)}
                      className="text-indigo-600 hover:text-indigo-900 transition-colors flex items-center"
                      aria-label="View order"
                    >
                      <FaEye className="mr-1" /> View
                    </button>
                    <button 
                      onClick={() => handleEdit(order.id)}
                      className="text-blue-600 hover:text-blue-900 transition-colors flex items-center"
                      aria-label="Edit order"
                    >
                      <FaEdit className="mr-1" /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(order.id)}
                      className="text-red-600 hover:text-red-900 transition-colors flex items-center"
                      aria-label="Delete order"
                    >
                      <FaTrash className="mr-1" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
