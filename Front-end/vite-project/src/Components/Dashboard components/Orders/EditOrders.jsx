import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import { FaCalendarAlt, FaUser, FaArrowLeft } from 'react-icons/fa'
import { useAuth } from '../../../context/AuthContext'
import { useTheme } from '../../../context/ThemeContext'

export default function EditOrders() {
  const { id } = useParams()
  const [formData, setFormData] = useState({
    produit_id: '',
    nom_produit: '',
    quantite: '',
    date_commande: '',
    customer_name: '',
    client_id: '', // Add client ID field
    status: 'Pending'
  })
  const [products, setProducts] = useState([])
  const [clients, setClients] = useState([]) // Add state for clients
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [originalOrder, setOriginalOrder] = useState(null)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { darkMode } = useTheme()

  // State for available stock
  const [availableStock, setAvailableStock] = useState(null);

  // Fetch order data
  useEffect(() => {
    const fetchOrderData = async () => {
      setFetchLoading(true)
      try {
        // Get the order data
        const response = await axios.get(`http://localhost:3000/commande/${id}`)
        const orderData = response.data
        
        console.log('Original order data:', orderData);
        
        // Save the original order data for comparison
        setOriginalOrder(orderData)
        
        // Set the form data
        setFormData({
          produit_id: orderData.produit_id,
          nom_produit: orderData.nom_produit,
          quantite: orderData.quantite.toString(),
          date_commande: orderData.date_commande,
          customer_name: orderData.customer_name || '',
          client_id: orderData.client_id || '', // Add client ID
          status: orderData.status || 'Pending'
        })
        
        setError(null)
      } catch (error) {
        console.error('Error fetching order:', error)
        if (error.response && error.response.status === 404) {
          setError('Order not found or you do not have permission to edit it')
        } else {
          setError('Failed to load order data. Please try again later.')
        }
      } finally {
        setFetchLoading(false)
      }
    }

    fetchOrderData()
  }, [id])

  // Fetch products and clients
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const productsResponse = await axios.get(`http://localhost:3000/produit?userId=${user.id}`)
        const productsData = productsResponse.data;
        setProducts(productsData)
        
        // If we have form data with a product ID, set the selected product
        if (formData.produit_id) {
          const product = productsData.find(p => p.id === parseInt(formData.produit_id))
          setSelectedProduct(product)
          
          // Check available stock for the selected product
          if (product) {
            checkAvailableStock(formData.produit_id);
          }
        }
        
        // Fetch clients
        const clientsResponse = await axios.get(`http://localhost:3000/clients?userId=${user.id}`)
        setClients(clientsResponse.data)
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load necessary data. Please try again.')
      } finally {
        setFetchLoading(false)
      }
    }
    
    fetchData()
  }, [user.id, formData.produit_id])

  // Function to check available stock for a product
  const checkAvailableStock = async (productId) => {
    if (!productId || !originalOrder) return;
    
    try {
      // Get the product details
      const product = products.find(p => p.id === parseInt(productId));
      if (!product) return;
      
      // Get all orders for this product to calculate what's already ordered
      const ordersResponse = await axios.get(`http://localhost:3000/commande?userId=${user.id}`);
      const orders = ordersResponse.data;
      
      // Calculate total ordered quantity for this product, excluding the current order
      const orderedQuantity = orders
        .filter(order => order.produit_id === parseInt(productId) && order.id !== parseInt(id))
        .reduce((total, order) => total + parseInt(order.quantite), 0);
      
      // Calculate available stock
      const totalStock = parseInt(product.total);
      const available = Math.max(0, totalStock - orderedQuantity);
      
      setAvailableStock({
        totalStock,
        orderedQuantity,
        available,
        // If we're editing the same product, add the original quantity to available
        availableForEdit: originalOrder && originalOrder.produit_id === parseInt(productId) 
          ? available + parseInt(originalOrder.quantite)
          : available
      });
      
      return available;
    } catch (error) {
      console.error('Error checking available stock:', error);
      return null;
    }
  };

  // Handle product selection change
  const handleProductChange = (e) => {
    const productId = e.target.value
    setFormData({
      ...formData,
      produit_id: productId,
      nom_produit: productId ? products.find(p => p.id === parseInt(productId))?.nom || '' : ''
    })
    
    // Check available stock for the selected product
    if (productId) {
      checkAvailableStock(productId)
    }
  }

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'produit_id') {
      // Find the selected product
      const product = products.find(p => p.id === parseInt(value))
      setSelectedProduct(product)
      
      // Update form data with product details
      setFormData(prev => ({
        ...prev,
        produit_id: value,
        nom_produit: product ? product.nom : ''
      }))
      
      // Check available stock for this product
      checkAvailableStock(value)
    } else if (name === 'client_id' && value) {
      // Find the selected client
      const client = clients.find(c => c.id === parseInt(value))
      
      // Update form data with client details
      setFormData(prev => ({
        ...prev,
        client_id: value,
        customer_name: client ? `${client.nom} ${client.prenom}` : ''
      }))
    } else {
      // Update other form fields normally
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
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
    // For the same product, we need to check against availableForEdit
    // For a different product, we check against available
    const maxAvailable = originalOrder && originalOrder.produit_id === parseInt(formData.produit_id)
      ? (availableStock ? availableStock.availableForEdit : 0)
      : (availableStock ? availableStock.available : 0);
      
    if (availableStock && parseInt(formData.quantite) > maxAvailable) {
      setError(`Quantity exceeds available stock (${maxAvailable} available)`)
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      // Prepare data to send to the server
      const dataToSend = {
        ...formData,
        quantite: parseInt(formData.quantite),
        userId: user.id // Ensure the order is associated with the current user
      }
      
      // Send the update request
      await axios.put(`http://localhost:3000/commande/${id}`, dataToSend)
      
      // Navigate back to orders list on success
      navigate('/orders')
    } catch (error) {
      console.error('Error updating order:', error)
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.message || error.response.data.error)
      } else {
        setError('Failed to update order. Please try again later.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Add a function to handle status-only updates
  const handleStatusUpdate = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Only send the status and userId for a status-only update
      const dataToSend = {
        status: formData.status,
        userId: String(user.id), // Ensure userId is sent as a string
        // We need to include these fields to satisfy the backend validation
        produit_id: originalOrder.produit_id,
        nom_produit: originalOrder.nom_produit,
        quantite: originalOrder.quantite
      }
      
      console.log('Sending status update with data:', dataToSend);
      
      // Send the update request
      await axios.put(`http://localhost:3000/commande/${id}`, dataToSend)
      
      // Navigate back to orders list on success
      navigate('/orders')
    } catch (error) {
      console.error('Error updating order status:', error)
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.message || error.response.data.error)
      } else {
        setError('Failed to update order status. Please try again later.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} min-h-screen`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Edit Order</h1>
          <button
            onClick={() => navigate('/orders')}
            className={`flex items-center px-3 py-1 rounded-md ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Back to Orders
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-100 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {fetchLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Selection */}
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1">Product</label>
                <select
                  value={formData.produit_id}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-md border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
                  required
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.nom}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1">
                  Quantity
                  {availableStock && (
                    <span className={`ml-2 text-xs ${availableStock.available > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      (Available: {availableStock.available})
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  name="quantite"
                  value={formData.quantite}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-md border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
                  required
                  min="1"
                />
              </div>

              {/* Customer */}
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1">Customer</label>
                <select
                  name="client_id"
                  value={formData.client_id}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-md border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
                >
                  <option value="">Select a customer</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.nom} {client.prenom} - {client.email}
                    </option>
                  ))}
                </select>
                <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Select an existing customer from your client list
                </p>
              </div>

              {/* Order Date */}
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1">Order Date</label>
                <input
                  type="date"
                  name="date_commande"
                  value={formData.date_commande}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-md border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
                />
              </div>

              {/* Order Status */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium mb-1">Order Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-md border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Status Badge Preview */}
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Status Preview:</p>
              <div className="flex items-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium
                  ${formData.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                  ${formData.status === 'Processing' ? 'bg-blue-100 text-blue-800' : ''}
                  ${formData.status === 'Shipped' ? 'bg-indigo-100 text-indigo-800' : ''}
                  ${formData.status === 'Delivered' ? 'bg-green-100 text-green-800' : ''}
                  ${formData.status === 'Cancelled' ? 'bg-red-100 text-red-800' : ''}
                `}>
                  {formData.status}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => navigate('/orders')}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${darkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStatusUpdate}
                disabled={loading}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${darkMode ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-indigo-500 hover:bg-indigo-600 text-white'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? 'Updating...' : 'Update Status Only'}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update All Fields'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
