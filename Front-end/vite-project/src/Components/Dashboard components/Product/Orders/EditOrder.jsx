import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../../../context/AuthContext'
import { useTheme } from '../../../../context/ThemeContext'
import { FaArrowLeft, FaCalendarAlt, FaEdit, FaUser } from 'react-icons/fa'

export default function EditOrder() {
  const { id } = useParams()
  const [formData, setFormData] = useState({
    produit_id: '',
    nom_produit: '',
    quantite: '',
    date_commande: new Date().toISOString().split('T')[0], // Initialize with current date
    customer_name: '' // Add customer name field
  })
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [originalOrder, setOriginalOrder] = useState(null)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { darkMode } = useTheme()

  // Fetch order data
  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`http://localhost:3000/commande/${id}?userId=${user.id}`)
        const orderData = response.data
        setOriginalOrder(orderData)
        setFormData({
          produit_id: orderData.produit_id,
          nom_produit: orderData.nom_produit,
          quantite: orderData.quantite,
          date_commande: orderData.date_commande ? orderData.date_commande.split('T')[0] : new Date().toISOString().split('T')[0],
          customer_name: orderData.customer_name || '' // Include customer name
        })
      } catch (error) {
        console.error('Error fetching order:', error)
        if (error.response && error.response.status === 404) {
          setError('Order not found or you do not have permission to edit it')
        } else {
          setError('Failed to load order data. Please try again later.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchOrderData()
  }, [id, user.id])

  // Fetch products for dropdown selection
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/produit?userId=${user.id}`)
        setProducts(response.data)
      } catch (error) {
        console.error('Error fetching products:', error)
        setError('Failed to load products. Please try again later.')
      }
    }

    fetchProducts()
  }, [user.id])

  // Set selected product when products are loaded and form data is set
  useEffect(() => {
    if (products.length > 0 && formData.produit_id) {
      const product = products.find(p => p.id === parseInt(formData.produit_id))
      setSelectedProduct(product)
    }
  }, [products, formData.produit_id])

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    
    // If product selection changes, update the product name as well
    if (name === 'produit_id') {
      const product = products.find(product => product.id === parseInt(value))
      setSelectedProduct(product)
      
      // If changing to a different product, reset quantity
      // If changing back to the original product, keep the original quantity
      if (originalOrder && parseInt(value) === parseInt(originalOrder.produit_id)) {
        setFormData({
          ...formData,
          produit_id: value,
          nom_produit: product ? product.nom : '',
          quantite: originalOrder.quantite
        })
      } else {
        setFormData({
          ...formData,
          produit_id: value,
          nom_produit: product ? product.nom : '',
          quantite: ''
        })
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.produit_id || !formData.quantite) {
      setError('Please fill in all required fields')
      return
    }
    
    if (isNaN(formData.quantite) || parseInt(formData.quantite) <= 0) {
      setError('Quantity must be a positive number')
      return
    }

    // Check if quantity exceeds available stock
    if (selectedProduct && parseInt(formData.quantite) > selectedProduct.total) {
      setError(`Quantity exceeds available stock (${selectedProduct.total} available)`)
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      // Prepare data to send to the server
      const dataToSend = {
        ...formData,
        quantite: parseInt(formData.quantite),
        userId: user.id
      }
      
      // Format date if it exists
      if (formData.date_commande) {
        try {
          const date = new Date(formData.date_commande)
          if (!isNaN(date.getTime())) {
            dataToSend.date_commande = date.toISOString().split('T')[0]
          }
        } catch (error) {
          console.error('Error formatting date:', error)
        }
      }
      
      await axios.put(`http://localhost:3000/commande/${id}`, dataToSend)
      
      // Navigate back to orders list after successful update
      navigate('/orders')
    } catch (error) {
      console.error('Error updating order:', error)
      if (error.response && error.response.status === 403) {
        setError('You do not have permission to update this order')
      } else {
        setError('Failed to update order. Please try again later.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'} min-h-screen`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
          <h1 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Edit Order</h1>
          <button
            onClick={() => navigate('/orders')}
            className={`w-full sm:w-auto ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} px-4 py-2 rounded-md transition-colors flex items-center justify-center sm:justify-start`}
          >
            <FaArrowLeft className="mr-2" />
            Back to Orders
          </button>
        </div>
        
        {loading && !error && (
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
        
        {!loading && (
          <form onSubmit={handleSubmit} className={`${darkMode ? 'bg-gray-700' : 'bg-white'} shadow-md rounded-lg p-6`}>
            <div className="mb-6">
              <label htmlFor="produit_id" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Product <span className="text-red-500">*</span>
              </label>
              <select
                id="produit_id"
                name="produit_id"
                value={formData.produit_id}
                onChange={handleChange}
                className={`block w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                required
              >
                <option value="">Select a product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.nom} ({product.total} in stock)
                  </option>
                ))}
              </select>
              {selectedProduct && (
                <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Available stock: {selectedProduct.total} units
                </p>
              )}
            </div>
            
            <div className="mb-6">
              <label htmlFor="quantite" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="quantite"
                name="quantite"
                value={formData.quantite}
                onChange={handleChange}
                min="1"
                className={`block w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="date_commande" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Order Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendarAlt className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <input
                  type="date"
                  id="date_commande"
                  name="date_commande"
                  value={formData.date_commande}
                  onChange={handleChange}
                  className={`block w-full pl-10 px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="customer_name" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Customer Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <input
                  type="text"
                  id="customer_name"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  placeholder="Enter customer name"
                  className={`block w-full pl-10 px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaEdit className="mr-2" />
                    Save Changes
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/orders')}
                className={`w-full sm:w-auto ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} px-4 py-2 rounded-md transition-colors flex items-center justify-center`}
              >
                <FaArrowLeft className="mr-2" />
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
