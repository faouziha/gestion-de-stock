import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';

const CreateClientOrder = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState({});

  // Order form state
  const [orderData, setOrderData] = useState({
    client_id: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Pending',
    payment_method: 'Cash',
    reference: `ORD-${Date.now()}`,
    notes: '',
    userId: user.id
  });

  // Order items state - array of product items
  const [orderItems, setOrderItems] = useState([
    { product_id: '', quantity: 1, price: 0, total: 0 }
  ]);

  // Totals
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // Status options
  const statusOptions = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  
  // Payment method options
  const paymentMethods = ['Balance', 'Cash', 'Credit Card', 'Bank Transfer', 'Check', 'PayPal'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch clients
        const clientsResponse = await axios.get('http://localhost:3000/clients', {
          params: { userId: user.id }
        });
        
        // Fetch products with stock information
        const productsResponse = await axios.get('http://localhost:3000/produit', {
          params: { userId: user.id }
        });
        
        setClients(clientsResponse.data);
        setProducts(productsResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id]);

  // Calculate available stock for a product (considering existing orders)
  const getAvailableStock = (productId) => {
    if (!productId) return 0;
    const parsedId = parseInt(productId);
    if (isNaN(parsedId)) return 0;
    
    const product = products.find(p => p.id === parsedId);
    if (!product || !product.total) return 0;
    
    const stock = parseInt(product.total);
    return isNaN(stock) ? 0 : stock;
  };

  // State to hold selected client details
  const [selectedClientData, setSelectedClientData] = useState(null);

  // Handle order form field changes
  const handleOrderChange = async (e) => {
    const { name, value } = e.target;
    
    // Debug payment method changes
    if (name === 'payment_method') {
      console.log('Setting payment method to:', value);
    }
    
    // Update the form data
    setOrderData({
      ...orderData,
      [name]: value
    });
    
    // If the client_id field changed, fetch client details
    if (name === 'client_id' && value) {
      try {
        console.log('Fetching details for client ID:', value);
        
        // Fetch client data from API
        const response = await axios.get(`http://localhost:3000/clients/${value}`, {
          params: { userId: user.id }
        });
        
        if (response.data) {
          console.log('Client data retrieved:', response.data);
          setSelectedClientData(response.data);
        }
      } catch (err) {
        console.error('Error fetching client details:', err);
        setSelectedClientData(null);
      }
    } else if (name === 'client_id' && !value) {
      // Clear client data when no client is selected
      setSelectedClientData(null);
    }
  };

  // Handle order item changes
  const handleOrderItemChange = (index, e) => {
    const { name, value } = e.target;
    const newOrderItems = [...orderItems];
    
    if (name === 'product_id') {
      const selectedProduct = products.find(product => product.id === parseInt(value));
      if (selectedProduct) {
        newOrderItems[index] = {
          ...newOrderItems[index],
          product_id: value,
          price: selectedProduct.prix, // Set price from selected product
          total: selectedProduct.prix * newOrderItems[index].quantity
        };
      }
    } else if (name === 'quantity') {
      const quantity = parseInt(value) || 0;
      const productId = newOrderItems[index].product_id;
      
      if (productId) {
        const availableStock = getAvailableStock(productId);
        const isValidQuantity = quantity > 0 && quantity <= availableStock;
        
        if (isValidQuantity) {
          const price = parseFloat(newOrderItems[index].price);
          newOrderItems[index] = {
            ...newOrderItems[index],
            quantity,
            total: price * quantity
          };
        } else {
          setFormError({
            ...formError,
            [`quantity_${index}`]: `Quantity must be between 1 and ${availableStock}`
          });
          return;
        }
      } else {
        newOrderItems[index] = {
          ...newOrderItems[index],
          quantity
        };
      }
    }
    
    setOrderItems(newOrderItems);
    
    // Clear error for this field if it was previously set
    if (formError[`quantity_${index}`]) {
      const newFormError = {...formError};
      delete newFormError[`quantity_${index}`];
      setFormError(newFormError);
    }
    
    // Recalculate totals
    calculateTotals(newOrderItems);
  };

  // Add new order item
  const addOrderItem = () => {
    setOrderItems([...orderItems, { product_id: '', quantity: 1, price: 0, total: 0 }]);
  };

  // Remove order item
  const removeOrderItem = (index) => {
    if (orderItems.length > 1) {
      const newOrderItems = orderItems.filter((_, i) => i !== index);
      setOrderItems(newOrderItems);
      calculateTotals(newOrderItems);
    }
  };

  // Calculate totals
  const calculateTotals = (items) => {
    const newSubtotal = items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
    const newTax = newSubtotal * 0.1; // 10% tax as an example
    const newTotal = newSubtotal + newTax;
    
    setSubtotal(newSubtotal);
    setTax(newTax);
    setTotalAmount(newTotal);
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!orderData.client_id) errors.client_id = 'Please select a client';
    if (!orderData.date) errors.date = 'Please enter a date';
    if (!orderData.payment_method) errors.payment_method = 'Please select a payment method';
    
    // Validate each order item
    orderItems.forEach((item, index) => {
      if (!item.product_id) {
        errors[`product_${index}`] = 'Please select a product';
      }
      
      if (item.product_id) {
        const quantity = parseInt(item.quantity);
        const availableStock = getAvailableStock(item.product_id);
        
        if (!quantity || quantity <= 0) {
          errors[`quantity_${index}`] = 'Quantity must be greater than 0';
        } else if (quantity > availableStock) {
          errors[`quantity_${index}`] = `Only ${availableStock} units available`;
        }
      }
    });
    
    setFormError(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = {};
    
    if (!orderData.client_id) errors.client_id = 'Client is required';
    if (!orderData.date) errors.date = 'Order date is required';
    
    // Validate order items
    const validItems = orderItems.filter(item => item.product_id && item.quantity > 0);
    if (validItems.length === 0) {
      setError('At least one valid product item is required');
      return;
    }
    
    if (Object.keys(errors).length > 0) {
      setFormError(errors);
      return;
    }
    
    // Prepare order payload
    const orderPayload = {
      client_id: parseInt(orderData.client_id),
      date: orderData.date,
      status: orderData.status || 'Pending',
      payment_method: orderData.payment_method || 'Cash',
      reference: orderData.reference || `ORD-${Date.now()}`,
      notes: orderData.notes || '',
      total_amount: parseFloat(totalAmount).toFixed(2),
      userId: orderData.userId,
      orderItems: orderItems.filter(item => item.product_id).map(item => ({

        product_id: parseInt(item.product_id),
        quantity: parseInt(item.quantity) || 1,
        price: parseFloat(item.price) || 0,
        total: parseFloat(item.total) || 0
      }))
    };
    
    console.log('Sending order data:', orderPayload);
    console.log('Payment method being sent to backend:', orderPayload.payment_method);
    
    try {
      setSubmitting(true);
      
      // Create order
      const response = await axios.post('http://localhost:3000/clientorders', orderPayload);
      
      if (response.data) {
        // Format currency for display
        const formatUSD = (amount) => {
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
          }).format(amount);
        };
        
        // Show success message with balance information if balance was updated
        if (response.data.balance_updated) {
          const message = `Order created successfully. Client balance updated to ${formatUSD(response.data.new_balance)}.`;
          alert(message);
        } else {
          alert('Order created successfully.');
        }
        navigate('/clientorders');
      }
    } catch (err) {
      console.error('Error creating order:', err);
      
      // Handle insufficient balance error specifically
      if (err.response?.status === 400 && err.response?.data?.message === 'Insufficient balance') {
        const { current_balance, required_amount } = err.response.data;
        const shortfall = required_amount - current_balance;
        
        const formatUSD = (amount) => {
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
          }).format(amount);
        };
        
        setError(
          `Insufficient client balance. Current balance: ${formatUSD(current_balance)}. ` +
          `Required amount: ${formatUSD(required_amount)}. ` +
          `Shortfall: ${formatUSD(shortfall)}. ` +
          `Please add funds to the client's account before placing this order.`
        );
      } else {
        setError('Failed to create order. ' + (err.response?.data?.message || 'Please try again.'));
      }
      setSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/clientorders');
  };

  if (loading) return (
    <div className={`flex justify-center items-center h-screen ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className={`p-4 md:p-6 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
        <h1 className="text-2xl font-bold">Create New Order</h1>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      <form id="order-form" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
          {/* Client Selection */}
          <div>
            <label className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Client*
            </label>
            <select
              name="client_id"
              value={orderData.client_id}
              onChange={handleOrderChange}
              className={`w-full px-3 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } ${formError.client_id ? 'border-red-500' : ''}`}
              disabled={submitting}
            >
              <option value="">Select Client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.nom} ({client.email || client.telephone || ''})
                </option>
              ))}
            </select>
            {formError.client_id && (
              <p className="mt-1 text-sm text-red-500">{formError.client_id}</p>
            )}
            
            {/* Display selected client information */}
            {selectedClientData && (
              <div className={`mt-3 p-3 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h4 className="text-sm font-medium mb-2">Client Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <p>
                    <span className="font-medium">Name:</span> {`${selectedClientData.prenom || ''} ${selectedClientData.nom || ''}`}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {selectedClientData.email || 'N/A'}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span> {selectedClientData.telephone || 'N/A'}
                  </p>
                  <p>
                    <span className="font-medium">Customer ID:</span> {selectedClientData.id}
                  </p>
                  {selectedClientData.adresse && (
                    <p className="col-span-2">
                      <span className="font-medium">Address:</span> {selectedClientData.adresse}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Order Date */}
          <div>
            <label className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Date*
            </label>
            <input
              type="date"
              name="date"
              value={orderData.date}
              onChange={handleOrderChange}
              className={`w-full px-3 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } ${formError.date ? 'border-red-500' : ''}`}
              disabled={submitting}
            />
            {formError.date && (
              <p className="mt-1 text-sm text-red-500">{formError.date}</p>
            )}
          </div>

          {/* Order Reference */}
          <div>
            <label className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Reference
            </label>
            <input
              type="text"
              name="reference"
              value={orderData.reference}
              onChange={handleOrderChange}
              className={`w-full px-3 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              disabled={submitting}
            />
          </div>

          {/* Order Status */}
          <div>
            <label className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Status
            </label>
            <select
              name="status"
              value={orderData.status}
              onChange={handleOrderChange}
              className={`w-full px-3 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              disabled={submitting}
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          
          {/* Payment Method */}
          <div>
            <label className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Payment Method*
            </label>
            <select
              name="payment_method"
              value={orderData.payment_method}
              onChange={handleOrderChange}
              className={`w-full px-3 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } ${formError.payment_method ? 'border-red-500' : ''}`}
              disabled={submitting}
            >
              <option value="">Select Payment Method</option>
              {paymentMethods.map(method => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
            {formError.payment_method && (
              <p className="mt-1 text-sm text-red-500">{formError.payment_method}</p>
            )}
          </div>
          
          {/* Notes */}
          <div className="md:col-span-2">
            <label className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Notes
            </label>
            <textarea
              name="notes"
              value={orderData.notes}
              onChange={handleOrderChange}
              rows="3"
              className={`w-full px-3 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              disabled={submitting}
            ></textarea>
          </div>
        </div>

        {/* Order Items Section */}
        <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Order Items</h2>
            <div className="flex justify-center sm:justify-end">
            <button
              type="button"
              onClick={addOrderItem}
              disabled={submitting}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-500 text-white rounded flex items-center hover:bg-green-600 transition-colors text-sm sm:text-base w-full sm:w-auto justify-center"
            >
              <FaPlus className="mr-1 sm:mr-2" />
              Add Product
            </button>
            </div>
          </div>

          {/* Dynamic Order Items */}
          <div className="space-y-4 sm:space-y-6 mb-4">
            {orderItems.map((item, index) => (
              <div key={index} className={`relative p-3 sm:p-4 border rounded-lg ${darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'}`}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {/* Product Selection */}
                  <div>
                    <label className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Product*
                    </label>
                    <select
                      name="product_id"
                      value={item.product_id}
                      onChange={(e) => handleOrderItemChange(index, e)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } ${formError[`product_${index}`] ? 'border-red-500' : ''}`}
                      disabled={submitting}
                    >
                      <option value="">Select Product</option>
                      {products.map(product => {
                        const availableStock = getAvailableStock(product.id);
                        const price = parseFloat(product.prix).toFixed(2);
                        return (
                          <option 
                            key={product.id} 
                            value={product.id}
                            disabled={availableStock === 0}
                          >
                            {product.nom} - ${price} ({availableStock} in stock)
                          </option>
                        );
                      })}
                    </select>
                    {formError[`product_${index}`] && (
                      <p className="mt-1 text-sm text-red-500">{formError[`product_${index}`]}</p>
                    )}
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Quantity*
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      max={item.product_id ? String(getAvailableStock(item.product_id)) : "9999"}
                      value={item.quantity}
                      onChange={(e) => handleOrderItemChange(index, e)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } ${formError[`quantity_${index}`] ? 'border-red-500' : ''}`}
                      disabled={submitting || !item.product_id}
                    />
                    {formError[`quantity_${index}`] && (
                      <p className="mt-1 text-sm text-red-500">{formError[`quantity_${index}`]}</p>
                    )}
                  </div>

                  {/* Price */}
                  <div>
                    <label className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Price
                    </label>
                    <div className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-gray-100 border-gray-300 text-gray-900'
                    }`}>
                      ${parseFloat(item.price).toFixed(2)}
                    </div>
                  </div>

                  {/* Total */}
                  <div>
                    <label className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Total
                    </label>
                    <div className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-gray-100 border-gray-300 text-gray-900'
                    }`}>
                      ${parseFloat(item.total).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Remove Button */}
                <div className="absolute top-1 sm:top-2 right-1 sm:right-2 text-red-500 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed">
                  <button
                    type="button"
                    onClick={() => removeOrderItem(index)}
                    disabled={orderItems.length === 1 || submitting}
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className={`rounded-lg p-4 sm:p-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} shadow-md mb-6`}>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Subtotal:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Tax (10%):</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-300 dark:border-gray-600 mt-2 pt-2 flex justify-between">
                <span className="font-bold">Total:</span>
                <span className="font-bold">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons - Bottom of Page */}
        <div className="flex flex-col sm:flex-row justify-end items-center gap-3 mt-8 mb-4">
          <button
            type="submit"
            form="order-form"
            disabled={submitting}
            className={`px-4 py-2 rounded-lg flex items-center justify-center ${
              submitting 
                ? 'bg-gray-500 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white transition-colors text-base w-full sm:w-auto order-2 sm:order-1`}
          >
            <FaSave className="mr-2" />
            {submitting ? 'Creating...' : 'Save Order'}
          </button>
          <button
            onClick={handleCancel}
            disabled={submitting}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg flex items-center justify-center hover:bg-gray-600 transition-colors text-base w-full sm:w-auto order-1 sm:order-2"
          >
            <FaTimes className="mr-2" />
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateClientOrder;
