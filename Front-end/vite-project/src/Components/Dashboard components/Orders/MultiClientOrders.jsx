import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useTheme } from '../../../context/ThemeContext'
import { FaArrowLeft, FaCalendarAlt, FaPlus, FaUser, FaTrash, FaShoppingCart, FaExclamationTriangle } from 'react-icons/fa'

export default function MultiClientOrders() {
  // Order header information
  const [orderData, setOrderData] = useState({
    date_commande: new Date().toISOString().split('T')[0],
    client_id: '',
    customer_name: '',
    status: 'Pending',
    notes: '',
    total_amount: 0,
    is_parent: true
  })

  // Order items (multiple products)
  const [orderItems, setOrderItems] = useState([{
    id: 1,
    produit_id: '',
    nom_produit: '',
    quantite: '',
    unit_price: 0,
    total_amount: 0
  }])
  
  // Data for dropdowns and validation
  const [products, setProducts] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [availableStock, setAvailableStock] = useState({})
  
  const navigate = useNavigate()
  const { user } = useAuth()
  const { darkMode } = useTheme()

  // Fetch products and clients on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch products
        const productsResponse = await axios.get(`http://localhost:3000/produit?userId=${user.id}`)
        setProducts(productsResponse.data)
        
        // Fetch clients
        const clientsResponse = await axios.get(`http://localhost:3000/clients?userId=${user.id}`)
        setClients(clientsResponse.data)
        
        // Initialize available stock tracking
        const stockMap = {}
        productsResponse.data.forEach(product => {
          stockMap[product.id] = {
            totalStock: parseInt(product.total),
            available: parseInt(product.total),
            orderedQuantity: 0
          }
        })
        
        // Get all orders to calculate what's already ordered
        const ordersResponse = await axios.get(`http://localhost:3000/commande?userId=${user.id}`)
        const orders = ordersResponse.data
        
        // Calculate ordered quantities for each product
        orders.forEach(order => {
          if (order.produit_id && stockMap[order.produit_id]) {
            stockMap[order.produit_id].orderedQuantity += parseInt(order.quantite || 0)
            stockMap[order.produit_id].available = Math.max(
              0, 
              stockMap[order.produit_id].totalStock - stockMap[order.produit_id].orderedQuantity
            )
          }
        })
        
        setAvailableStock(stockMap)
        setError(null)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [user.id])

  // Handle order data changes (customer, date, status, notes)
  const handleOrderDataChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'client_id' && value) {
      // Find the selected client
      const client = clients.find(c => c.id === parseInt(value))
      
      // Update the form data with client details
      setOrderData({
        ...orderData,
        client_id: value,
        customer_name: client ? `${client.nom} ${client.prenom || ''}`.trim() : ''
      })
    } else {
      // Update other form fields normally
      setOrderData({
        ...orderData,
        [name]: value
      })
    }
  }

  // Handle changes to order items (products, quantities, prices)
  const handleOrderItemChange = (id, field, value) => {
    setOrderItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          
          // If changing product, update product name and unit price
          if (field === 'produit_id' && value) {
            const product = products.find(p => p.id === parseInt(value))
            if (product) {
              updatedItem.nom_produit = product.nom
              updatedItem.unit_price = product.prix
              // Calculate total for this item
              if (updatedItem.quantite) {
                updatedItem.total_amount = parseInt(updatedItem.quantite) * parseFloat(product.prix)
              }
            }
          }
          
          // If changing quantity, recalculate total
          if (field === 'quantite' && value && updatedItem.unit_price) {
            updatedItem.total_amount = parseInt(value) * parseFloat(updatedItem.unit_price)
          }
          
          // If changing unit price, recalculate total
          if (field === 'unit_price' && value && updatedItem.quantite) {
            updatedItem.total_amount = parseInt(updatedItem.quantite) * parseFloat(value)
          }
          
          return updatedItem
        }
        return item
      })
    })
  }

  // Add a new product row
  const addProductRow = () => {
    const newItem = {
      id: orderItems.length + 1,
      produit_id: '',
      nom_produit: '',
      quantite: '',
      unit_price: 0,
      total_amount: 0
    }
    setOrderItems([...orderItems, newItem])
  }

  // Remove a product row
  const removeProductRow = (id) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter(item => item.id !== id))
    }
  }
  
  // Calculate order totals
  const calculateOrderTotals = () => {
    const subtotal = orderItems.reduce((sum, item) => {
      return sum + (item.total_amount || 0)
    }, 0)
    
    return {
      subtotal,
      tax: 0, // Add tax calculation if needed
      total: subtotal
    }
  }
  
  // Check if a product has enough stock
  const hasEnoughStock = (productId, requestedQuantity) => {
    if (!productId || !requestedQuantity) return true
    
    const stock = availableStock[productId]
    if (!stock) return false
    
    return parseInt(requestedQuantity) <= stock.available
  }
  
  // Validate the form before submission
  const validateForm = () => {
    // Check if customer is selected
    if (!orderData.client_id) {
      setError('Please select a customer')
      return false
    }
    
    // Check if at least one product is selected
    const hasProducts = orderItems.some(item => item.produit_id && item.quantite > 0)
    if (!hasProducts) {
      setError('Please add at least one product with quantity')
      return false
    }
    
    // Check for duplicate products
    const productIds = orderItems.map(item => item.produit_id).filter(id => id)
    if (new Set(productIds).size !== productIds.length) {
      setError('Duplicate products are not allowed')
      return false
    }
    
    // Check stock availability for each product
    for (const item of orderItems) {
      if (item.produit_id && item.quantite) {
        if (!hasEnoughStock(item.produit_id, item.quantite)) {
          const product = products.find(p => p.id === parseInt(item.produit_id))
          const stock = availableStock[item.produit_id]
          setError(`Insufficient stock for ${product?.nom || 'product'}. Only ${stock?.available || 0} units available.`)
          return false
        }
      }
    }
    
    return true
  }
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      const totals = calculateOrderTotals()
      console.log('Order totals:', totals)
      console.log('orderData:', orderData)
      console.log('user:', user)
      
      // Create a parent order
      const parentOrder = {
        ...orderData,
        total_amount: totals.total,
        userId: user.id,
        is_parent: true
      }
      
      console.log('Full parent order payload:', parentOrder)
      
      const parentResponse = await axios.post('http://localhost:3000/multi-client-order', parentOrder)
      const parentId = parentResponse.data.commande.id
      
      console.log('Created parent order with ID:', parentId)
      
      // Create child orders for each product
      const filteredItems = orderItems.filter(item => item.produit_id && item.quantite > 0)
      console.log(`Creating ${filteredItems.length} child orders for parent ID ${parentId}...`)
      
      // Process child orders one by one instead of in parallel
      // This helps ensure they're all created properly
      for (const item of filteredItems) {
        try {
          // Ensure all values are properly formatted
          const productId = parseInt(item.produit_id);
          const productName = item.nom_produit?.trim() || 'Unknown Product';
          const quantity = parseInt(item.quantite) || 1;
          const unitPrice = parseFloat(item.unit_price) || 0;
          const totalAmount = parseFloat(item.total_amount) || (unitPrice * quantity);
          
          // Debug log all values to be sent
          console.log(`Product ${productName} (${productId}) details:`, { 
            quantity, 
            unitPrice, 
            totalAmount,
            parentId
          });
          
          const childOrderPayload = {
            produit_id: productId,
            nom_produit: productName,
            quantite: quantity,
            date_commande: orderData.date_commande,
            customer_name: orderData.customer_name,
            userId: user.id,
            status: orderData.status,
            parent_order_id: parentId,
            is_parent: false,
            unit_price: unitPrice,
            total_amount: totalAmount
          }
          
          console.log(`Creating child order for product ${item.nom_produit} (ID: ${item.produit_id})`);
          const childResponse = await axios.post('http://localhost:3000/multi-client-order', childOrderPayload);
          console.log(`Child order created successfully:`, childResponse.data);
        } catch (childError) {
          console.error(`Error creating child order for product ${item.produit_id}:`, childError);
          // Continue with other products even if one fails
        }
      }
      
      // Verify the child orders were created
      try {
        const verifyResponse = await axios.get(`http://localhost:3000/commande/${parentId}?userId=${user.id}`)
        const childOrdersCount = verifyResponse.data.childOrders?.length || 0
        console.log(`Verification - Parent order ${parentId} has ${childOrdersCount} child orders`)
      } catch (verifyError) {
        console.error('Error verifying child orders:', verifyError)
      }
      
      navigate('/orders')
    } catch (err) {
      console.error('Error creating multi-product order:', err)
      setError('Failed to create order. Please try again. Error: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'} min-h-screen`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
          <h1 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            <FaShoppingCart className="inline-block mr-2" />
            Create Multi-Product Order
          </h1>
          <button
            onClick={() => navigate('/orders')}
            className={`w-full sm:w-auto ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} px-4 py-2 rounded-md transition-colors flex items-center justify-center sm:justify-start`}
          >
            <FaArrowLeft className="mr-2" />
            Back to Orders
          </button>
        </div>
        
        {error && (
          <div className={`${darkMode ? 'bg-red-900 border-red-700 text-red-100' : 'bg-red-100 border-red-500 text-red-700'} border-l-4 p-4 mb-6 rounded-md shadow-sm`}>
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className={`h-5 w-5 ${darkMode ? 'text-red-300' : 'text-red-500'}`} />
              </div>
              <div className="ml-3">
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center h-64 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md rounded-lg overflow-hidden`}>
          {/* Order Header Information */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Order Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Selection */}
              <div>
                <label htmlFor="client_id" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Customer <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  <select
                    id="client_id"
                    name="client_id"
                    value={orderData.client_id}
                    onChange={handleOrderDataChange}
                    className={`block w-full pl-10 pr-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    required
                  >
                    <option value="">Select a customer</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.nom} {client.prenom || ''} - {client.email || ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Order Date */}
              <div>
                <label htmlFor="date_commande" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Order Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="date"
                    id="date_commande"
                    name="date_commande"
                    value={orderData.date_commande}
                    onChange={handleOrderDataChange}
                    className={`block w-full pl-10 pr-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    required
                  />
                </div>
              </div>
              
              {/* Order Status */}
              <div>
                <label htmlFor="status" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Order Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={orderData.status}
                  onChange={handleOrderDataChange}
                  className={`block w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              
              {/* Notes */}
              <div>
                <label htmlFor="notes" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Order Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={orderData.notes}
                  onChange={handleOrderDataChange}
                  rows="1"
                  className={`block w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Add notes about this order"
                ></textarea>
              </div>
            </div>
          </div>
          
          {/* Product Items Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Order Items</h2>
              <button
                type="button"
                onClick={addProductRow}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center text-sm"
              >
                <FaPlus className="mr-2" />
                Add Product
              </button>
            </div>
            
            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y divide-gray-200 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`${darkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'}`}>
                  {orderItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <select
                          value={item.produit_id || ''}
                          onChange={(e) => handleOrderItemChange(item.id, 'produit_id', e.target.value)}
                          className={`block w-full px-3 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        >
                          <option value="">Select a product</option>
                          {products.map(product => (
                            <option key={product.id} value={product.id} disabled={product.total <= 0}>
                              {product.nom} ({availableStock[product.id]?.available || 0} in stock)
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="1"
                          max={item.produit_id ? (availableStock[item.produit_id]?.available || 0) : 1}
                          value={item.quantite || ''}
                          onChange={(e) => handleOrderItemChange(item.id, 'quantite', e.target.value)}
                          className={`block w-full px-3 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                          placeholder="Quantity"
                          disabled={!item.produit_id}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price || ''}
                          onChange={(e) => handleOrderItemChange(item.id, 'unit_price', e.target.value)}
                          className={`block w-full px-3 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                          placeholder="Unit Price"
                          disabled={!item.produit_id}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className={`px-3 py-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-md`}>
                          ${(item.total_amount || 0).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeProductRow(item.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          disabled={orderItems.length === 1}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-end">
              <div className="w-full md:w-1/3">
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Subtotal:</span>
                  <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>${calculateOrderTotals().subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tax (0%):</span>
                  <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>${calculateOrderTotals().tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 font-bold">
                  <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>Total:</span>
                  <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>${calculateOrderTotals().total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="p-6 flex flex-col sm:flex-row gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className={`w-full sm:w-auto ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} px-4 py-2 rounded-md transition-colors flex items-center justify-center`}
            >
              <FaArrowLeft className="mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center"
            >
              <FaPlus className="mr-2" />
              Create Order
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  )
}
