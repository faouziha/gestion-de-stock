import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../../../context/AuthContext'
import { useTheme } from '../../../../context/ThemeContext'
import { FaArrowLeft, FaEdit, FaUser } from 'react-icons/fa'

export default function ViewOrder() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { darkMode } = useTheme()

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`http://localhost:3000/commande/${id}?userId=${user.id}`)
        console.log('Order data from server:', response.data)
        
        // Ensure date_commande is set
        const orderData = response.data;
        if (!orderData.date_commande) {
          orderData.date_commande = new Date().toISOString().split('T')[0];
        }
        
        setOrder(orderData)
        setError(null)
      } catch (error) {
        console.error('Error fetching order:', error)
        if (error.response && error.response.status === 404) {
          setError('Order not found or you do not have permission to view it')
        } else {
          setError('Failed to load order data. Please try again later.')
        }
        setOrder(null)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderData()
  }, [id, user.id])

  // Simplified date formatting function
  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString(); // Default to today's date
    return new Date(dateString).toLocaleDateString();
  }

  return (
    <div className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'} min-h-screen`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
          <h1 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Order Details</h1>
          <button
            onClick={() => navigate('/orders')}
            className={`w-full sm:w-auto ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} px-4 py-2 rounded-md transition-colors flex items-center justify-center sm:justify-start`}
          >
            <FaArrowLeft className="mr-2" />
            Back to Orders
          </button>
        </div>
        
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
        
        {!loading && order && (
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg rounded-lg overflow-hidden`}>
            <div className="p-4 sm:p-6">
              <div className={`flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 pb-4 border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <div className="mb-3 sm:mb-0">
                  <h2 className={`text-lg sm:text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Order #{order.id}</h2>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'} mt-1`}>
                    Created on {formatDate(order.date_commande)}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium self-start sm:self-auto
                  ${order.status === 'Pending' ? `${darkMode ? 'bg-yellow-800 text-yellow-100' : 'bg-yellow-100 text-yellow-800'}` : ''}
                  ${order.status === 'Processing' ? `${darkMode ? 'bg-blue-800 text-blue-100' : 'bg-blue-100 text-blue-800'}` : ''}
                  ${order.status === 'Shipped' ? `${darkMode ? 'bg-indigo-800 text-indigo-100' : 'bg-indigo-100 text-indigo-800'}` : ''}
                  ${order.status === 'Delivered' ? `${darkMode ? 'bg-green-800 text-green-100' : 'bg-green-100 text-green-800'}` : ''}
                  ${order.status === 'Cancelled' ? `${darkMode ? 'bg-red-800 text-red-100' : 'bg-red-100 text-red-800'}` : ''}
                  ${!order.status ? `${darkMode ? 'bg-yellow-800 text-yellow-100' : 'bg-yellow-100 text-yellow-800'}` : ''}
                `}>
                  {order.status || 'Pending'}
                </span>
              </div>
              
              <div className="mb-6">
                <h3 className={`text-base sm:text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'} mb-3`}>Order Information</h3>
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} p-4 rounded-md`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Product</p>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{order.nom_produit}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Quantity</p>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{order.quantite} units</p>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Order Date</p>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{formatDate(order.date_commande)}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Customer</p>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{order.customer_name || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className={`text-base sm:text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'} mb-3`}>Additional Details</h3>
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} p-4 rounded-md`}>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {order.notes || 'No additional notes for this order.'}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={() => navigate(`/orders/edit/${order.id}`)}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center"
                >
                  <FaEdit className="mr-2" />
                  Edit Order
                </button>
                <button
                  onClick={() => navigate('/orders')}
                  className={`w-full sm:w-auto ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} px-4 py-2 rounded-md transition-colors flex items-center justify-center`}
                >
                  <FaArrowLeft className="mr-2" />
                  Back to Orders
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
