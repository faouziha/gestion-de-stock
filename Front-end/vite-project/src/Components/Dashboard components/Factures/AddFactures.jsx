import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useTheme } from '../../../context/ThemeContext'
import { FaArrowLeft, FaCalendarAlt, FaPlus, FaUser, FaTrash, FaFileInvoice } from 'react-icons/fa'

export default function AddFactures() {
  const [formData, setFormData] = useState({
    invoice_number: '',
    customer_name: '',
    client_id: '',
    date: new Date().toISOString().split('T')[0], // Initialize with current date
    due_date: '', // Due date for the invoice
    status: 'Draft', // Default status
    notes: '',
    total_amount: 0
  })
  
  const [invoiceItems, setInvoiceItems] = useState([
    { id: 1, description: '', quantity: 1, unit_price: 0, amount: 0 }
  ])
  
  const [clients, setClients] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { darkMode } = useTheme()

  // Fetch clients and products for dropdown selection
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/clients?userId=${user.id}`)
        setClients(response.data)
      } catch (error) {
        console.error('Error fetching clients:', error)
        setError('Failed to load clients. Please try again later.')
      }
    }

    const fetchProducts = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/produit?userId=${user.id}`)
        setProducts(response.data)
      } catch (error) {
        console.error('Error fetching products:', error)
        setError('Failed to load products. Please try again later.')
      }
    }

    fetchClients()
    fetchProducts()
    
    // Generate a unique invoice number
    generateInvoiceNumber()
  }, [user.id])

  // Generate a unique invoice number
  const generateInvoiceNumber = () => {
    const prefix = 'INV'
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    const invoiceNumber = `${prefix}-${timestamp}-${random}`
    
    setFormData(prevData => ({
      ...prevData,
      invoice_number: invoiceNumber
    }))
  }

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'client_id' && value) {
      // Find the selected client
      const client = clients.find(c => c.id === parseInt(value))
      
      // Update the form data with client details
      setFormData({
        ...formData,
        client_id: value,
        customer_name: client ? `${client.nom} ${client.prenom}` : ''
      })
    } else {
      // Update other form fields normally
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  // Handle invoice item changes
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...invoiceItems]
    updatedItems[index][field] = value
    
    // Recalculate amount if quantity or unit_price changes
    if (field === 'quantity' || field === 'unit_price') {
      const quantity = field === 'quantity' ? parseFloat(value) || 0 : parseFloat(updatedItems[index].quantity) || 0
      const unitPrice = field === 'unit_price' ? parseFloat(value) || 0 : parseFloat(updatedItems[index].unit_price) || 0
      updatedItems[index].amount = quantity * unitPrice
    }
    
    setInvoiceItems(updatedItems)
    
    // Update total amount
    calculateTotalAmount(updatedItems)
  }

  // Calculate total amount from all invoice items
  const calculateTotalAmount = (items) => {
    const total = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
    
    setFormData(prevData => ({
      ...prevData,
      total_amount: total
    }))
  }

  // Add a new invoice item
  const addInvoiceItem = () => {
    const newItem = {
      id: invoiceItems.length + 1,
      description: '',
      quantity: 1,
      unit_price: 0,
      amount: 0
    }
    
    setInvoiceItems([...invoiceItems, newItem])
  }

  // Remove an invoice item
  const removeInvoiceItem = (index) => {
    if (invoiceItems.length === 1) {
      // Don't remove the last item, just clear it
      const clearedItem = { id: 1, description: '', quantity: 1, unit_price: 0, amount: 0 }
      setInvoiceItems([clearedItem])
      calculateTotalAmount([clearedItem])
      return
    }
    
    const updatedItems = invoiceItems.filter((_, i) => i !== index)
    setInvoiceItems(updatedItems)
    calculateTotalAmount(updatedItems)
  }

  // Handle product selection for an invoice item
  const handleProductSelect = (index, productId) => {
    if (!productId) return
    
    const product = products.find(p => p.id === parseInt(productId))
    if (!product) return
    
    const updatedItems = [...invoiceItems]
    updatedItems[index].description = product.nom
    updatedItems[index].unit_price = parseFloat(product.prix) || 0
    updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].unit_price
    
    setInvoiceItems(updatedItems)
    calculateTotalAmount(updatedItems)
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.customer_name) {
      setError('Please select a customer')
      return
    }
    
    if (invoiceItems.some(item => !item.description || item.quantity <= 0)) {
      setError('Please fill in all invoice items with valid quantities')
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      // Prepare data to send to the server
      const dataToSend = {
        ...formData,
        items: invoiceItems,
        user_id: user.id, // Ensure the invoice is associated with the current user
        date: formData.date || new Date().toISOString().split('T')[0]
      }
      
      console.log('Sending invoice data:', dataToSend)
      
      // Send data to the server
      await axios.post('http://localhost:3000/facture', dataToSend)
      
      // Redirect to invoices list on success
      navigate('/factures')
    } catch (error) {
      console.error('Error creating invoice:', error)
      setError('Failed to create invoice. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  return (
    <div className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'} min-h-screen`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
          <h1 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Create New Invoice</h1>
          <button
            onClick={() => navigate('/factures')}
            className={`w-full sm:w-auto ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} px-4 py-2 rounded-md transition-colors flex items-center justify-center sm:justify-start`}
          >
            <FaArrowLeft className="mr-2" />
            Back to Invoices
          </button>
        </div>
        
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
        
        <form onSubmit={handleSubmit} className={`${darkMode ? 'bg-gray-700' : 'bg-white'} shadow-md rounded-lg p-6`}>
          {/* Invoice Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="mb-4">
                <label htmlFor="invoice_number" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Invoice Number
                </label>
                <input
                  type="text"
                  id="invoice_number"
                  name="invoice_number"
                  value={formData.invoice_number}
                  onChange={handleChange}
                  className={`block w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  readOnly
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="date" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Invoice Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="due_date" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Due Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="date"
                    id="due_date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <div className="mb-4">
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
                    value={formData.client_id}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    required
                  >
                    <option value="">Select a customer</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.nom} {client.prenom} - {client.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="status" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Invoice Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`block w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                >
                  <option value="Draft">Draft</option>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="notes" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="2"
                  className={`block w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Additional notes or payment instructions..."
                />
              </div>
            </div>
          </div>
          
          {/* Invoice Items */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Invoice Items</h3>
              <button
                type="button"
                onClick={addInvoiceItem}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm transition-colors flex items-center"
              >
                <FaPlus className="mr-1" /> Add Item
              </button>
            </div>
            
            <div className={`overflow-x-auto ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg p-3`}>
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className={`px-3 py-2 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Item</th>
                    <th className={`px-3 py-2 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Quantity</th>
                    <th className={`px-3 py-2 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Unit Price</th>
                    <th className={`px-3 py-2 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Amount</th>
                    <th className={`px-3 py-2 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Action</th>
                  </tr>
                </thead>
                <tbody className={`${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {invoiceItems.map((item, index) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2">
                        <div className="flex flex-col space-y-1">
                          <select
                            className={`text-sm px-2 py-1 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded focus:outline-none focus:ring-1 focus:ring-blue-500`}
                            value=""
                            onChange={(e) => handleProductSelect(index, e.target.value)}
                          >
                            <option value="">Select a product</option>
                            {products.map(product => (
                              <option key={product.id} value={product.id}>
                                {product.nom} (${parseFloat(product.prix).toFixed(2)})
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            placeholder="Description"
                            className={`text-sm px-2 py-1 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded focus:outline-none focus:ring-1 focus:ring-blue-500`}
                            required
                          />
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className={`text-sm px-2 py-1 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-20 text-center`}
                          required
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                          className={`text-sm px-2 py-1 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-24 text-center`}
                          required
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                          {formatCurrency(item.amount)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeInvoiceItem(index)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          aria-label="Remove item"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="px-3 py-3 text-right font-medium">Total:</td>
                    <td className="px-3 py-3 text-center">
                      <span className={`font-bold text-lg ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                        {formatCurrency(formData.total_amount)}
                      </span>
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <FaFileInvoice className="mr-2" />
                  Create Invoice
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/factures')}
              className={`w-full sm:w-auto ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} px-4 py-2 rounded-md transition-colors flex items-center justify-center`}
            >
              <FaArrowLeft className="mr-2" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
