import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { FaPlus, FaTrash, FaSave, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';

const EditClientOrder = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState({});
  const [originalStockLevels, setOriginalStockLevels] = useState({});

  // Order form state
  const [orderData, setOrderData] = useState({
    client_id: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Pending',
    payment_method: 'Cash',
    reference: '',
    notes: '',
    userId: user.id,
    is_parent: false
  });

  // Order items state - array of product items
  const [orderItems, setOrderItems] = useState([]);

  // Totals
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // Status options
  const statusOptions = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  
  // Payment method options
  const paymentMethods = ['Cash', 'Credit Card', 'Bank Transfer', 'Check', 'PayPal'];

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
        
        // Fetch the order to edit
        const orderResponse = await axios.get(`http://localhost:3000/clientorders/${id}`, {
          params: { userId: user.id }
        });
        
        const orderData = orderResponse.data;
        
        // Track original stock levels for products in the order
        const stockLevels = {};
        if (orderData.orderItems && orderData.orderItems.length > 0) {
          orderData.orderItems.forEach(item => {
            if (item.product_id) {
              stockLevels[item.product_id] = item.quantity || 0;
            }
          });
        }
        setOriginalStockLevels(stockLevels);
        
        // Format order data for the form
        setOrderData({
          client_id: orderData.client_name || '',  // Using client_name which comes from the backend
          date: new Date(orderData.date).toISOString().split('T')[0],
          status: orderData.status || 'Pending',
          payment_method: orderData.payment_method || 'Cash',
          reference: orderData.reference || '',
          notes: orderData.notes || '',
          userId: user.id,
          is_parent: orderData.is_parent || false
        });
        
        // Format order items
        let formattedItems = [];
        if (orderData.orderItems && orderData.orderItems.length > 0) {
          formattedItems = orderData.orderItems.map(item => ({
            id: item.id, // Keep track of existing item IDs
            product_id: item.product_id ? String(item.product_id) : '',
            quantity: item.quantity || 1,
            price: parseFloat(item.price) || 0,
            total: parseFloat(item.total_amount) || 0
          }));
        }
        
        // If no items are found, create a default empty one
        if (formattedItems.length === 0) {
          formattedItems = [{ product_id: '', quantity: 1, price: 0, total: 0 }];
        }
        
        setOrderItems(formattedItems);
        setClients(clientsResponse.data);
        setProducts(productsResponse.data);
        
        // Calculate totals
        calculateTotals(formattedItems);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load order data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user.id]);
  
  // Calculate available stock for a product (considering existing orders)
  const getAvailableStock = (productId) => {
    if (!productId) return 0;
    const parsedId = parseInt(productId);
    if (isNaN(parsedId)) return 0;
    
    const product = products.find(p => p.id === parsedId);
    if (!product || !product.total) return 0;
    
    const currentStock = parseInt(product.total);
    if (isNaN(currentStock)) return 0;
    
    // Add back the original quantity of this product in the order
    // This prevents the available stock from being reduced by the existing order
    const originalQuantity = originalStockLevels[parsedId] || 0;
    
    return currentStock + originalQuantity;
  };
  
  // Calculate totals
  const calculateTotals = (items) => {
    const subtotal = items.reduce((sum, item) => {
      return sum + (parseFloat(item.price) * parseInt(item.quantity) || 0);
    }, 0);
    
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    
    setSubtotal(subtotal);
    setTax(tax);
    setTotalAmount(total);
  };

  // Handle order form field changes
  const handleOrderChange = (e) => {
    const { name, value } = e.target;
    setOrderData({
      ...orderData,
      [name]: value
    });
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
    setOrderItems([
      ...orderItems,
      { product_id: '', quantity: 1, price: 0, total: 0 }
    ]);
  };

  // Remove order item
  const removeOrderItem = (index) => {
    if (orderItems.length === 1) return;
    
    const newOrderItems = orderItems.filter((_, i) => i !== index);
    setOrderItems(newOrderItems);
    
    // Recalculate totals
    calculateTotals(newOrderItems);
    
    // Clear any error for the removed item
    if (formError[`quantity_${index}`]) {
      const newFormError = {...formError};
      delete newFormError[`quantity_${index}`];
      setFormError(newFormError);
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    
    // Validate order fields
    if (!orderData.client_id) {
      newErrors.client_id = 'Please select a client';
    }
    
    if (!orderData.date) {
      newErrors.date = 'Please select a date';
    }
    
    if (!orderData.payment_method) {
      newErrors.payment_method = 'Please select a payment method';
    }
    
    // Validate order items
    let hasValidItems = false;
    orderItems.forEach((item, index) => {
      if (item.product_id && item.quantity > 0) {
        hasValidItems = true;
      } else if (item.product_id && item.quantity <= 0) {
        newErrors[`quantity_${index}`] = 'Quantity must be greater than 0';
      } else if (!item.product_id && item.quantity > 0) {
        newErrors[`product_id_${index}`] = 'Please select a product';
      }
    });
    
    if (!hasValidItems) {
      newErrors.orderItems = 'Please add at least one product to the order';
    }
    
    setFormError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission - simplified for direct order updates
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Format the payload for update - simplified to match our backend
      const payload = {
        customer_name: orderData.client_id,
        date: orderData.date,
        status: orderData.status,
        userId: orderData.userId,
        // Important: Include these fields to ensure they're saved properly
        payment_method: orderData.payment_method,
        reference: orderData.reference,
        notes: orderData.notes,
        // Only send the first item from orderItems as our DB schema doesn't support multiple products per order
        orderItems: orderItems.filter(item => item.product_id && item.quantity > 0).map(item => ({
          product_id: parseInt(item.product_id),
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price),
          total: parseFloat(item.price) * parseInt(item.quantity)
        }))
      };
      
      console.log('Sending update payload:', payload);
      
      // Send update request
      await axios.put(`http://localhost:3000/clientorders/${id}`, payload);
      
      // Navigate back to orders list
      navigate('/clientorders');
    } catch (err) {
      console.error('Error updating order:', err);
      setError('Failed to update order. Please try again later.');
      setSubmitting(false);
    }
  };

  // Format product options to include price and stock
  const formatProductOption = (product) => {
    const available = getAvailableStock(product.id);
    const price = parseFloat(product.prix).toFixed(2);
    return `${product.nom} - $${price} (${available} in stock)`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/clientorders')}
            className="mr-4 text-blue-500 hover:text-blue-700 transition-colors"
          >
            <FaArrowLeft className="inline mr-1" /> Back to Orders
          </button>
          <h1 className="text-2xl font-bold">Edit Client Order</h1>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 rounded bg-red-100 border border-red-300 text-red-800">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className={`p-6 rounded-lg mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} shadow-sm`}>
          <h2 className="text-lg font-medium mb-4">Order Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
          
          <h2 className="text-lg font-medium mb-4">Order Items</h2>
          
          {formError.orderItems && (
            <p className="mb-4 text-sm text-red-500">{formError.orderItems}</p>
          )}
          
          <div className="space-y-4 mb-4">
            {orderItems.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-lg border dark:border-gray-600">
                {/* Product Selection */}
                <div className="md:col-span-5">
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
                    } ${formError[`product_id_${index}`] ? 'border-red-500' : ''}`}
                    disabled={submitting}
                  >
                    <option value="">Select Product</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {formatProductOption(product)}
                      </option>
                    ))}
                  </select>
                  {formError[`product_id_${index}`] && (
                    <p className="mt-1 text-sm text-red-500">{formError[`product_id_${index}`]}</p>
                  )}
                </div>
                
                {/* Quantity */}
                <div className="md:col-span-2">
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
                <div className="md:col-span-2">
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
                <div className="md:col-span-2">
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

                {/* Remove Button */}
                <div className="md:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeOrderItem(index)}
                    disabled={submitting || orderItems.length === 1}
                    className={`px-2 py-2 text-white rounded h-10 w-10 flex items-center justify-center ${
                      submitting || orderItems.length === 1
                        ? 'bg-gray-500 cursor-not-allowed'
                        : 'bg-red-500 hover:bg-red-600'
                    } transition-colors`}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Add Product Button */}
          <button
            type="button"
            onClick={addOrderItem}
            disabled={submitting}
            className={`px-4 py-2 rounded-lg flex items-center ${
              submitting
                ? 'bg-gray-500 text-white cursor-not-allowed'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800'
            } transition-colors`}
          >
            <FaPlus className="mr-2" /> Add Product
          </button>
        </div>

        {/* Order Summary */}
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h2 className="text-lg font-medium mb-4">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Subtotal:</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Tax (10%):</span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-lg font-bold">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={() => navigate('/clientorders')}
            disabled={submitting}
            className={`px-4 py-2 rounded-lg flex items-center ${
              submitting
                ? 'bg-gray-500 text-white cursor-not-allowed'
                : 'bg-gray-300 text-gray-800 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            } transition-colors`}
          >
            <FaTimes className="mr-2" /> Cancel
          </button>
          
          <button
            type="submit"
            disabled={submitting}
            className={`px-4 py-2 rounded-lg flex items-center ${
              submitting
                ? 'bg-blue-500 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
            } transition-colors`}
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : (
              <>
                <FaSave className="mr-2" /> Update Order
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditClientOrder;
