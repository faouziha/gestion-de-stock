import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPrint, FaEdit } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import './print-styles.css';

const ViewClientOrder = () => {
  // State variables
  const [order, setOrder] = useState(null);
  const [clientInfo, setClientInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);
  
  // Hooks
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { darkMode } = useTheme();
  
  // Create a clean printable version using a hidden iframe and open print dialog directly
  const handlePrint = () => {
    // Create a hidden iframe
    let iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    // Format the order data for printing
    const orderDate = formatDate(order.date);
    const clientName = clientInfo ? 
      `${clientInfo.prenom || ''} ${clientInfo.nom || ''}`.trim() : 
      'N/A';
    
    // Generate the order items HTML
    let orderItemsHtml = '';
    if (order.orderItems && order.orderItems.length > 0) {
      orderItemsHtml = order.orderItems.map((item, index) => {
        const price = parseFloat(item.price || item.unit_price || item.product_price || 0).toFixed(2);
        const quantity = item.quantity || item.quantite || 0;
        const total = (price * quantity).toFixed(2);
        return `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd">${item.product_name || `Product ${item.product_id}`}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right">$${price}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right">${quantity}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right">$${total}</td>
          </tr>
        `;
      }).join('');
    }
    
    // Calculate order total
    const orderTotal = calculateOrderTotal(order.orderItems);
    
    // Get reference to the iframe document
    const iframeDoc = iframe.contentWindow || iframe.contentDocument;
    const doc = iframeDoc.document || iframeDoc;
    
    // Generate the print document
    doc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order #${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { text-align: center; margin-bottom: 5px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 1px solid #333; padding-bottom: 10px; }
          .info-section { margin-bottom: 20px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; grid-gap: 20px; }
          .info-box { border: 1px solid #ddd; border-radius: 4px; padding: 15px; }
          h2 { margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { text-align: left; background: #f2f2f2; padding: 8px; border: 1px solid #ddd; }
          td { padding: 8px; border: 1px solid #ddd; }
          .footer { margin-top: 30px; text-align: center; border-top: 1px solid #eee; padding-top: 15px; }
          .total-row { font-weight: bold; }
          .badge { padding: 4px 8px; border-radius: 12px; font-size: 12px; }
          .status-pending { background: #FEF3C7; color: #92400E; }
          .status-delivered { background: #D1FAE5; color: #065F46; }
          .status-processing { background: #DBEAFE; color: #1E40AF; }
          .total-section { text-align: right; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ORDER #${order.id}</h1>
          <p>Reference: ${order.reference || `ORD-${order.id}`}</p>
          <p>Date: ${orderDate}</p>
        </div>
        
        <div class="info-grid">
          <div class="info-box">
            <h2>Order Details</h2>
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Date:</strong> ${orderDate}</p>
            <p><strong>Reference:</strong> ${order.reference || 'N/A'}</p>
            <p>
              <strong>Status:</strong> 
              <span class="badge status-${order.status ? order.status.toLowerCase() : 'pending'}">
                ${order.status || 'Pending'}
              </span>
            </p>
            <p><strong>Payment Method:</strong> ${order.payment_method || 'N/A'}</p>
            ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ''}
          </div>
          
          <div class="info-box">
            <h2>Client Information</h2>
            <p><strong>Name:</strong> ${clientName}</p>
            <p><strong>Email:</strong> ${clientInfo ? clientInfo.email || 'N/A' : 'N/A'}</p>
            <p><strong>Phone:</strong> ${clientInfo ? clientInfo.telephone || 'N/A' : 'N/A'}</p>
            <p><strong>Customer ID:</strong> ${clientInfo ? clientInfo.id || 'N/A' : (order.customer_name || 'N/A')}</p>
            ${clientInfo && clientInfo.adresse ? `<p><strong>Address:</strong> ${clientInfo.adresse}</p>` : ''}
          </div>
        </div>
        
        <div class="info-section">
          <h2>Order Items</h2>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align: right">Price</th>
                <th style="text-align: right">Quantity</th>
                <th style="text-align: right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderItemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="text-align: right; padding: 8px;">Subtotal:</td>
                <td style="text-align: right; padding: 8px;">$${calculateSubtotal(order.orderItems).toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="3" style="text-align: right; padding: 8px;">Tax (10%):</td>
                <td style="text-align: right; padding: 8px;">$${calculateTax(calculateSubtotal(order.orderItems)).toFixed(2)}</td>
              </tr>
              <tr style="font-weight: bold;">
                <td colspan="3" style="text-align: right; padding: 8px; border-top: 1px solid #ddd;">Total:</td>
                <td style="text-align: right; padding: 8px; border-top: 1px solid #ddd;">$${orderTotal}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
      </html>
    `);
    
    doc.close();
    
    // Print after document has loaded completely
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      
      // Remove the iframe after printing
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);
  };
  
  // Fetch order data and client info
  useEffect(() => {
    const fetchOrderAndClientInfo = async () => {
      try {
        setLoading(true);
        
        // Step 1: Fetch order details
        const orderResponse = await axios.get(`http://localhost:3000/clientorders/${id}`, {
          params: { userId: user.id }
        });
        
        const orderData = orderResponse.data;
        
        // Log the payment method for debugging
        console.log('Payment method received from API:', orderData.payment_method);
        
        setOrder(orderData);
        console.log('Order data fetched:', orderData);
        
        // Step 2: Try to find the client information
        let clientFound = false;
        
        // First check if we have a numeric client ID in customer_name
        const clientId = orderData.customer_name;
        if (clientId && !isNaN(parseInt(clientId))) {
          try {
            console.log('Fetching client info with ID:', clientId);
            const clientResponse = await axios.get(`http://localhost:3000/clients/${clientId}`, {
              params: { userId: user.id }
            });
            
            const clientData = clientResponse.data;
            setClientInfo(clientData);
            console.log('Client data fetched by ID:', clientData);
            clientFound = true;
          } catch (err) {
            console.error('Error fetching client by ID:', err);
          }
        } 
        
        // If we didn't find by ID, but we have a name, search by name
        if (!clientFound && orderData.client_name) {
          try {
            console.log('Searching client by name:', orderData.client_name);
            // Get all clients
            const clientsResponse = await axios.get(`http://localhost:3000/clients`, {
              params: { userId: user.id }
            });
            
            // Filter clients by name (case insensitive)
            const clientName = orderData.client_name.toLowerCase();
            const matchedClient = clientsResponse.data.find(client => {
              const fullName = `${client.prenom || ''} ${client.nom || ''}`.trim().toLowerCase();
              return fullName === clientName || fullName.includes(clientName) || clientName.includes(fullName);
            });
            
            if (matchedClient) {
              console.log('Client found by name match:', matchedClient);
              setClientInfo(matchedClient);
              clientFound = true;
            } else {
              console.log('No client found with matching name');
            }
          } catch (err) {
            console.error('Error searching for client by name:', err);
          }
        }
        
        // If we still haven't found the client, create a minimal info object from order data
        if (!clientFound && orderData.client_name) {
          console.log('Creating minimal client info from order data');
          const clientName = orderData.client_name;
          
          setClientInfo({
            id: orderData.customer_name || orderData.client_id,
            nom: clientName.split(' ').length > 1 ? clientName.split(' ').slice(1).join(' ') : '',
            prenom: clientName.split(' ')[0] || '',
            email: orderData.client_email || null,
            telephone: orderData.client_phone || null,
            adresse: orderData.client_address || null
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details.');
        setLoading(false);
      }
    };
    
    fetchOrderAndClientInfo();
  }, [id, user.id]);
  
  // Utility functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const getStatusBadgeColor = (status) => {
    const statusColors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Processing': 'bg-blue-100 text-blue-800',
      'Shipped': 'bg-purple-100 text-purple-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };
  
  const calculateItemTotal = (item) => {
    const price = parseFloat(item.price || item.unit_price || item.product_price || 0);
    const quantity = parseInt(item.quantity || item.quantite || 0);
    return (price * quantity).toFixed(2);
  };
  
  const calculateSubtotal = (items) => {
    if (!items || !items.length) return 0;
    return items.reduce((sum, item) => {
      return sum + parseFloat(calculateItemTotal(item));
    }, 0);
  };
  
  const calculateTax = (subtotal) => {
    return subtotal * 0.1; // 10% tax
  };
  
  const calculateOrderTotal = (items) => {
    if (!items || !items.length) return '0.00';
    const subtotal = calculateSubtotal(items);
    const tax = calculateTax(subtotal);
    const total = subtotal + tax;
    return total.toFixed(2);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg">
        {error}
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="p-4 bg-yellow-100 text-yellow-700 rounded-lg">
        Order not found.
      </div>
    );
  }
  
  return (
    <div id="print-content" className={`print-container p-4 md:p-6 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} overflow-hidden`}>
      {/* Header - Not visible when printing */}
      <div className="no-print flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
        <div className="flex flex-col xs:flex-row xs:items-center mb-2 sm:mb-0 w-full sm:w-auto">
          <button 
            onClick={() => navigate('/clientorders')}
            className="mb-2 xs:mb-0 mr-0 xs:mr-4 text-blue-500 hover:text-blue-700 flex items-center"
          >
            <FaArrowLeft className="mr-1" /> <span>Back to Orders</span>
          </button>
          <h1 className="text-xl font-bold">Order #{order.id}</h1>
        </div>
        <div className="flex w-full sm:w-auto space-x-2">
          <button 
            onClick={handlePrint}
            className="flex-1 sm:flex-grow-0 px-3 sm:px-4 py-2 bg-blue-500 text-white rounded flex items-center justify-center hover:bg-blue-600 text-sm sm:text-base transition-colors"
          >
            <FaPrint className="mr-1 sm:mr-2" /> <span>Print</span>
          </button>
          <button 
            onClick={() => navigate(`/clientorders/edit/${id}`)}
            className="flex-1 sm:flex-grow-0 px-3 sm:px-4 py-2 bg-blue-500 text-white rounded flex items-center justify-center hover:bg-blue-700 text-sm sm:text-base transition-colors"
          >
            <FaEdit className="mr-1 sm:mr-2" /> <span>Edit</span>
          </button>
        </div>
      </div>
      
      {/* Print Header - Only visible when printing */}
      <div className="print-header" style={{ display: isPrinting ? 'block' : 'none', pageBreakAfter: 'avoid' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }}>ORDER #{order.id}</h1>
        <p style={{ textAlign: 'center' }}>Reference: {order.reference || `ORD-${order.id}`}</p>
        <p style={{ textAlign: 'center' }}>Date: {formatDate(order.date)}</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Order Details */}
        <div className={`p-3 sm:p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} shadow`}>
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 pb-2 border-b border-gray-300">Order Details</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Order ID:</span> {order.id}</p>
            <p><span className="font-medium">Date:</span> {formatDate(order.date)}</p>
            <p><span className="font-medium">Reference:</span> {order.reference || 'N/A'}</p>
            <p>
              <span className="font-medium">Status:</span> 
              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getStatusBadgeColor(order.status)}`}>
                {order.status || 'N/A'}
              </span>
            </p>
            <p>
              <span className="font-medium">Payment Method:</span> {order.payment_method || 'N/A'}
              {/* Debug information - will only show in development */}
              {process.env.NODE_ENV === 'development' && <span className="text-xs text-gray-500 ml-2">(Raw value: {JSON.stringify(order.payment_method)})</span>}
            </p>
            {order.notes && (
              <div className="mt-4">
                <p className="font-medium">Notes:</p>
                <p className="mt-1 p-2 bg-gray-100 dark:bg-gray-600 rounded">{order.notes}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Client Information */}
        <div className={`p-3 sm:p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} shadow`}>
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 pb-2 border-b border-gray-300">Client Information</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Name:</span> {
                clientInfo ? 
                  `${clientInfo.prenom || ''} ${clientInfo.nom || ''}`.trim() || 'N/A' : 
                  'N/A'
              }
            </p>
            <p>
              <span className="font-medium">Email:</span> {
                clientInfo ? clientInfo.email || 'N/A' : 'N/A'
              }
            </p>
            <p>
              <span className="font-medium">Phone:</span> {
                clientInfo ? clientInfo.telephone || 'N/A' : 'N/A'
              }
            </p>
            <p>
              <span className="font-medium">Customer ID:</span> {
                clientInfo ? clientInfo.id || 'N/A' : (order.customer_name || 'N/A')
              }
            </p>
            {clientInfo && clientInfo.adresse && (
              <div className="mt-4">
                <p className="font-medium">Address:</p>
                <p className="mt-1 p-2 bg-gray-100 dark:bg-gray-600 rounded">{clientInfo.adresse}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Order Items */}
      <div className={`mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} shadow`}>
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Order Items</h2>
        <div className="overflow-x-auto -mx-3 sm:-mx-4 px-3 sm:px-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-100'}>
              <tr>
                <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium">Product</th>
                <th className="px-2 sm:px-4 py-2 text-right text-xs sm:text-sm font-medium">Price</th>
                <th className="px-2 sm:px-4 py-2 text-right text-xs sm:text-sm font-medium">Qty</th>
                <th className="px-2 sm:px-4 py-2 text-right text-xs sm:text-sm font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {order.orderItems && order.orderItems.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? (darkMode ? 'bg-gray-600' : 'bg-white') : (darkMode ? 'bg-gray-700' : 'bg-gray-50')}>
                  <td className="px-2 sm:px-4 py-2 sm:py-3">
                    <div className="font-medium text-xs sm:text-sm truncate max-w-[120px] sm:max-w-full">{item.product_name || `Product ${item.product_id}`}</div>
                    <div className="text-xs text-gray-500 hidden sm:block">{item.product_id && `ID: ${item.product_id}`}</div>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm">
                    ${parseFloat(item.price || item.unit_price || item.product_price || 0).toFixed(2)}
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm">{item.quantity || item.quantite || 0}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-right font-medium text-xs sm:text-sm">${calculateItemTotal(item)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className={`border-t ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                <td colSpan="3" className="px-2 sm:px-4 py-2 text-right font-medium text-xs sm:text-sm">Subtotal:</td>
                <td className="px-2 sm:px-4 py-2 text-right font-medium text-xs sm:text-sm">
                  ${calculateSubtotal(order.orderItems).toFixed(2)}
                </td>
              </tr>
              <tr>
                <td colSpan="3" className="px-2 sm:px-4 py-2 text-right font-medium text-xs sm:text-sm">Tax (10%):</td>
                <td className="px-2 sm:px-4 py-2 text-right font-medium text-xs sm:text-sm">
                  ${calculateTax(calculateSubtotal(order.orderItems)).toFixed(2)}
                </td>
              </tr>
              <tr className={`border-t-2 ${darkMode ? 'border-gray-600' : 'border-gray-300'} font-bold`}>
                <td colSpan="3" className="px-2 sm:px-4 py-2 sm:py-3 text-right font-bold text-xs sm:text-sm">Total:</td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 text-right font-bold text-xs sm:text-sm">
                  ${calculateOrderTotal(order.orderItems)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      
      {/* Print-specific styling */}
      <style>{`
        @media print {
          button, .no-print {
            display: none !important;
          }
          
          body {
            background: white;
            color: black;
          }
          
          .shadow {
            box-shadow: none !important;
            border: 1px solid #eaeaea;
          }
        }
      `}</style>
    </div>
  );
};

export default ViewClientOrder;