import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaPrint, FaFileDownload } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';

// Print-specific styles
const printStyles = `
  @media print {
    @page {
      size: auto;
      margin: 10mm;
    }

    html, body {
      font-size: 12pt;
      color: #000 !important;
      background-color: #fff !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      height: auto !important;
    }
    
    .print-hide {
      display: none !important;
    }
    
    .print-container {
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      box-shadow: none !important;
      background-color: #fff !important;
      color: #000 !important;
    }
    
    table {
      width: 100% !important;
      border-collapse: collapse !important;
      color: #000 !important;
      background-color: #fff !important;
    }
    
    table th, table td {
      border: 1px solid #ddd !important;
      padding: 8px !important;
      color: #000 !important;
    }
    
    table th {
      background-color: #f2f2f2 !important;
      color: #000 !important;
    }

    .print-show {
      display: block !important;
    }
    
    .print-header {
      text-align: center !important;
      margin-bottom: 20px !important;
      color: #000 !important;
    }
    
    .print-footer {
      margin-top: 30px !important;
      text-align: center !important;
      font-size: 10pt !important;
      color: #000 !important;
    }
    
    .signature-area {
      display: flex !important;
      justify-content: space-between !important;
      margin-top: 50px !important;
    }
    
    .signature-line {
      width: 150px !important;
      border-top: 1px solid #000 !important;
      margin-top: 40px !important;
    }

    /* Override any dark mode styles */
    * {
      color-adjust: exact !important;
      -webkit-print-color-adjust: exact !important;
    }

    .bg-gray-800, .bg-gray-900, .bg-gray-700, .bg-gray-750 {
      background-color: white !important;
      color: black !important;
    }

    .text-white, .text-gray-300, .text-gray-400 {
      color: black !important;
    }
  }
`;

const ViewBonDeLivraison = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  
  const [bonDeLivraison, setBonDeLivraison] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBonDeLivraison = async () => {
      setLoading(true);
      setError("");
      try {
        // First, get the BL record
        const blResponse = await axios.get(`http://localhost:3000/api/bl/${id}?userId=${user.id}`);
        
        if (blResponse.data.success) {
          setBonDeLivraison(blResponse.data.data);
          
          // Then fetch the BL items directly from our new endpoint
          try {
            const blItemsResponse = await axios.get(
              `http://localhost:3000/api/bl/${id}/items?userId=${user.id}`
            );
            
            if (blItemsResponse.data.success) {
              setOrderDetails(blItemsResponse.data.data || []);
            } else {
              // If the new endpoint fails, fall back to the old method
              if (blResponse.data.data.order_id) {
                const orderDetailsResponse = await axios.get(
                  `http://localhost:3000/order-details/${blResponse.data.data.order_id}?userId=${user.id}`
                );
                setOrderDetails(orderDetailsResponse.data || []);
              }
            }
          } catch (itemsErr) {
            console.error('Error fetching BL items:', itemsErr);
            // Fall back to the old method
            if (blResponse.data.data.order_id) {
              try {
                const orderDetailsResponse = await axios.get(
                  `http://localhost:3000/order-details/${blResponse.data.data.order_id}?userId=${user.id}`
                );
                setOrderDetails(orderDetailsResponse.data || []);
              } catch (orderErr) {
                console.error('Error fetching order details:', orderErr);
              }
            }
          }
        } else {
          setError(blResponse.data.error || "Failed to fetch Bon de Livraison");
        }
      } catch (err) {
        console.error('Error fetching Bon de Livraison:', err);
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id && id) {
      fetchBonDeLivraison();
    }
  }, [id, user]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Error';
    }
  };

  const handlePrint = () => {
    // Create a hidden iframe
    let iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    // Get reference to the iframe document
    const iframeDoc = iframe.contentWindow || iframe.contentDocument;
    const doc = iframeDoc.document || iframeDoc;
    
    // Generate the print document
    doc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bon de Livraison #${bonDeLivraison?.bl_number || ''}</title>
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
          .signature-area { display: flex; justify-content: space-between; margin-top: 50px; }
          .signature-line { width: 150px; border-top: 1px solid #000; margin-top: 40px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>BON DE LIVRAISON #${bonDeLivraison?.bl_number || ''}</h1>
          <p>Reference: ${bonDeLivraison?.reference || 'N/A'}</p>
          <p>Date: ${formatDate(bonDeLivraison?.date_created)}</p>
        </div>
        
        <div class="info-grid">
          <div class="info-box">
            <h2>Delivery Details</h2>
            <p><strong>BL Number:</strong> ${bonDeLivraison?.bl_number || 'N/A'}</p>
            <p><strong>Date Created:</strong> ${formatDate(bonDeLivraison?.date_created)}</p>
            <p><strong>Reference:</strong> ${bonDeLivraison?.reference || 'N/A'}</p>
            <p><strong>Order ID:</strong> ${bonDeLivraison?.order_id || 'N/A'}</p>
          </div>
          
          <div class="info-box">
            <h2>Client Information</h2>
            <p><strong>Client:</strong> ${bonDeLivraison?.client_name || 'N/A'}</p>
          </div>
        </div>
        
        <div class="info-section">
          <h2>Order Details</h2>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align: right">Ordered Qty</th>
                <th style="text-align: right">Delivered Qty</th>
                <th style="text-align: right">Remaining Qty</th>
                <th style="text-align: right">Unit Price</th>
                <th style="text-align: right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderDetails.map(item => `
                <tr>
                  <td>${item.product_name || 'Unknown Product'}</td>
                  <td style="text-align: right">${item.quantity || 0}</td>
                  <td style="text-align: right">${item.delivered_quantity || 0}</td>
                  <td style="text-align: right">${Math.max(0, (item.quantity || 0) - (item.delivered_quantity || 0))}</td>
                  <td style="text-align: right">$${parseFloat(item.price || item.unit_price || 0).toFixed(2)}</td>
                  <td style="text-align: right">$${parseFloat(item.total || (item.price * item.quantity) || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr style="font-weight: bold;">
                <td colspan="5" style="text-align: right; padding: 8px; border-top: 1px solid #ddd;">Total:</td>
                <td style="text-align: right; padding: 8px; border-top: 1px solid #ddd;">$${parseFloat(bonDeLivraison?.total || 0).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        ${bonDeLivraison?.notes ? `
          <div class="info-section">
            <h2>Notes</h2>
            <p>${bonDeLivraison.notes}</p>
          </div>
        ` : ''}
        
        <div class="signature-area">
          <div>
            <p><strong>Client Signature</strong></p>
            <div class="signature-line"></div>
          </div>
          <div>
            <p><strong>Company Signature</strong></p>
            <div class="signature-line"></div>
          </div>
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

  if (loading) {
    return (
      <div className={`p-4 md:p-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen transition-colors`}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !bonDeLivraison) {
    return (
      <div className={`p-4 md:p-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen transition-colors`}>
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">{error || "Bon de Livraison not found"}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/bon-de-livraison')} 
            className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} px-4 py-2 rounded-md transition-colors flex items-center`}
          >
            <FaArrowLeft className="mr-2" />
            Back to Bon de Livraison List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 md:p-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen transition-colors`}>
      {/* Inject print styles */}
      <style>{printStyles}</style>
      <div className="max-w-4xl mx-auto print-container">
        {/* Header with actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0 print-hide">
          <h1 className="text-2xl font-bold">Bon de Livraison Details</h1>
          
          <div className="flex space-x-3 w-full sm:w-auto">
            <button
              onClick={() => navigate('/bon-de-livraison')} 
              className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} px-4 py-2 rounded-md transition-colors flex items-center w-1/2 sm:w-auto justify-center`}
            >
              <FaArrowLeft className="mr-2" />
              Back
            </button>
            
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center w-1/2 sm:w-auto justify-center"
            >
              <FaPrint className="mr-2" />
              Print
            </button>
          </div>
        </div>
        
        {/* Print-only header */}
        <div className="hidden print:block print-header mb-6">
          <h1 className="text-2xl font-bold text-center">Bon de Livraison #{bonDeLivraison.bl_number}</h1>
          <p className="text-center mt-2">{formatDate(bonDeLivraison.date_created)}</p>
        </div>
        
        {/* Main content */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden print:shadow-none`}>
          {/* Document header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2">Bon de Livraison #{bonDeLivraison.bl_number}</h2>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span className="font-medium">Date Created:</span> {formatDate(bonDeLivraison.date_created)}
                </p>
                {bonDeLivraison.reference && (
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                    <span className="font-medium">Reference:</span> {bonDeLivraison.reference}
                  </p>
                )}
              </div>
              
              <div className="mt-4 md:mt-0 text-right">
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span className="font-medium">Order ID:</span> {bonDeLivraison.order_id}
                </p>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                  <span className="font-medium">Client:</span> {bonDeLivraison.client_name || 'N/A'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Order details */}
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Order Details</h3>
            
            {orderDetails.length === 0 ? (
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded-md text-center`}>
                <p>No order details available</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        Ordered Qty
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        Delivered Qty
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        Remaining Qty
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {orderDetails.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? (darkMode ? 'bg-gray-800' : 'bg-white') : (darkMode ? 'bg-gray-750' : 'bg-gray-50')}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-medium">{item.product_name || 'Unknown Product'}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          {item.quantity || 0}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          {item.delivered_quantity || 0}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          {Math.max(0, (item.quantity || 0) - (item.delivered_quantity || 0))}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          ${parseFloat(item.price || item.unit_price || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right font-medium">
                          ${parseFloat(item.total || (item.price * item.quantity) || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="5" className="px-4 py-3 text-right font-medium">Total:</td>
                      <td className="px-4 py-3 text-right font-bold">
                        ${parseFloat(bonDeLivraison.total || 0).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
            
            {/* Notes section */}
            {bonDeLivraison.notes && (
              <div className="mt-6">
                <h4 className="font-medium mb-2">Notes:</h4>
                <div className={`p-4 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p>{bonDeLivraison.notes}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Print-only footer */}
          <div className="hidden print:block p-6 border-t border-gray-200 print-footer">
            <div className="text-center text-sm text-gray-500">
              <p>This document was generated on {new Date().toLocaleDateString()}</p>
              <p className="mt-2">Bon de Livraison #{bonDeLivraison.bl_number}</p>
              <div className="signature-area">
                <div>
                  <p className="font-bold">Client Signature</p>
                  <div className="signature-line"></div>
                </div>
                <div>
                  <p className="font-bold">Company Signature</p>
                  <div className="signature-line"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewBonDeLivraison;
