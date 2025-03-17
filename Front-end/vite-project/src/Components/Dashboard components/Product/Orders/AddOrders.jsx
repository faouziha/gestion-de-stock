import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../../context/AuthContext'

export default function AddOrders() {
  const [formData, setFormData] = useState({
    produit_id: '',
    nom_produit: '',
    quantite: '',
    date_commande: new Date().toISOString().split('T')[0] // Initialize with current date
  })
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const navigate = useNavigate()
  const { user } = useAuth()

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

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    
    // If product selection changes, update the product name as well
    if (name === 'produit_id') {
      const product = products.find(product => product.id === parseInt(value))
      setSelectedProduct(product)
      setFormData({
        ...formData,
        produit_id: value,
        nom_produit: product ? product.nom : '',
        // Reset quantity when product changes
        quantite: ''
      })
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
      
      // If no date was set or formatting failed, use today's date
      if (!dataToSend.date_commande) {
        dataToSend.date_commande = new Date().toISOString().split('T')[0]
      }
      
      console.log('Sending order data to server:', dataToSend)
      
      // Send data to the server
      await axios.post('http://localhost:3000/commande', dataToSend)
      
      // Redirect to orders list on success
      navigate('/orders')
    } catch (error) {
      console.error('Error creating order:', error)
      setError('Failed to create order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Get maximum available quantity for the selected product
  const getMaxQuantity = () => {
    return selectedProduct ? selectedProduct.total : 1
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Create New Order</h1>
          <button
            onClick={() => navigate('/orders')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Orders
          </button>
        </div>
        
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
        
        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="mb-6">
              <label htmlFor="produit_id" className="block text-sm font-medium text-gray-700 mb-2">
                Product <span className="text-red-500">*</span>
              </label>
              <select
                id="produit_id"
                name="produit_id"
                value={formData.produit_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm"
                required
              >
                <option value="">Select a product</option>
                {products.map(product => (
                  <option 
                    key={product.id} 
                    value={product.id}
                    disabled={product.total <= 0}
                  >
                    {product.nom} (Available: {product.total})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Choose a product from your inventory</p>
            </div>
            
            <div className="mb-6">
              <label htmlFor="quantite" className="block text-sm font-medium text-gray-700 mb-2">
                Quantity <span className="text-red-500">*</span>
                {selectedProduct && (
                  <span className="text-sm text-gray-500 ml-2">
                    (Max: {selectedProduct.total})
                  </span>
                )}
              </label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type="number"
                  id="quantite"
                  name="quantite"
                  value={formData.quantite}
                  onChange={handleChange}
                  min="1"
                  max={getMaxQuantity()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                  disabled={!selectedProduct || selectedProduct.total <= 0}
                />
                {selectedProduct && selectedProduct.total > 0 && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-400 sm:text-sm">units</span>
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">Enter the quantity you want to order</p>
            </div>
            
            <div className="mb-6">
              <label htmlFor="date_commande" className="block text-sm font-medium text-gray-700 mb-2">
                Order Date <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="date"
                  id="date_commande"
                  name="date_commande"
                  value={formData.date_commande}
                  onChange={handleChange}
                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Select the date for this order</p>
            </div>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 text-right">
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md mr-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedProduct || selectedProduct.total <= 0}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : 'Create Order'}
            </button>
          </div>
        </form>
        
        {!selectedProduct && products.length > 0 && (
          <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Please select a product to continue with your order.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {selectedProduct && selectedProduct.total <= 0 && (
          <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  The selected product is out of stock. Please select a different product or restock this item.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}