import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useTheme } from '../../../context/ThemeContext'
import { FaArrowLeft, FaEdit, FaFileInvoice, FaCalendarAlt, FaUser, FaPrint } from 'react-icons/fa'

export default function ViewFacture() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { darkMode } = useTheme();
    
    const [facture, setFacture] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPrinting, setIsPrinting] = useState(false);
    
    // Create a clean printable version using a hidden iframe and open print dialog directly
    const handlePrint = () => {
        // Create a hidden iframe
        let iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        
        // Format the invoice data for printing
        const invoiceDate = formatDate(facture.date);
        const dueDate = facture.due_date ? formatDate(facture.due_date) : 'N/A';
        
        // Generate the invoice items HTML
        let invoiceItemsHtml = '';
        if (facture.items && facture.items.length > 0) {
            invoiceItemsHtml = facture.items.map((item, index) => {
                const unitPrice = parseFloat(item.unit_price || 0).toFixed(2);
                const quantity = item.quantity || 0;
                const amount = parseFloat(item.amount || 0).toFixed(2);
                return `
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd">${item.description}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: center">${quantity}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: right">$${unitPrice}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: right">$${amount}</td>
                    </tr>
                `;
            }).join('');
        }
        
        // Get reference to the iframe document
        const iframeDoc = iframe.contentWindow || iframe.contentDocument;
        const doc = iframeDoc.document || iframeDoc;
        
        // Generate the print document
        doc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice #${facture.invoice_number}</title>
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
                    .status-paid { background: #D1FAE5; color: #065F46; }
                    .status-pending { background: #FEF3C7; color: #92400E; }
                    .status-overdue { background: #FEE2E2; color: #B91C1C; }
                    .total-section { text-align: right; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>INVOICE #${facture.invoice_number}</h1>
                    <p>Date: ${invoiceDate}</p>
                </div>
                
                <div class="info-grid">
                    <div class="info-box">
                        <h2>Invoice Details</h2>
                        <p><strong>Invoice Number:</strong> ${facture.invoice_number}</p>
                        <p><strong>Date:</strong> ${invoiceDate}</p>
                        <p><strong>Due Date:</strong> ${dueDate}</p>
                        <p>
                            <strong>Status:</strong> 
                            <span class="badge status-${facture.status ? facture.status.toLowerCase() : 'pending'}">
                                ${facture.status || 'Draft'}
                            </span>
                        </p>
                        ${facture.notes ? `<p><strong>Notes:</strong> ${facture.notes}</p>` : ''}
                    </div>
                    
                    <div class="info-box">
                        <h2>Customer Information</h2>
                        <p><strong>Customer:</strong> ${facture.customer_name || 'N/A'}</p>
                        ${facture.client_email ? `<p><strong>Email:</strong> ${facture.client_email}</p>` : ''}
                        ${facture.client_address ? `<p><strong>Address:</strong> ${facture.client_address}</p>` : ''}
                    </div>
                </div>
                
                <div class="info-section">
                    <h2>Invoice Items</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th style="text-align: center">Quantity</th>
                                <th style="text-align: right">Unit Price</th>
                                <th style="text-align: right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${invoiceItemsHtml}
                        </tbody>
                        <tfoot>
                            <tr class="total-row">
                                <td colspan="3" style="text-align: right">Total:</td>
                                <td style="text-align: right">$${parseFloat(facture.total_amount || 0).toFixed(2)}</td>
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

    useEffect(() => {
        const fetchFacture = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:3000/facture/${id}?userId=${user.id}`);
                setFacture(response.data);
                setError(null);
            } catch (error) {
                console.error("Error fetching invoice:", error);
                setError("Failed to load invoice data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchFacture();
    }, [id, user.id]);

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    // Get status badge color
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Paid':
                return 'bg-green-100 text-green-800';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'Overdue':
                return 'bg-red-100 text-red-800';
            case 'Cancelled':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-blue-100 text-blue-800'; // Draft or any other status
        }
    };

    return (
        <div className={`p-3 sm:p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen transition-colors`}>
            <div className="w-full max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 sm:gap-0">
                    <h1 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Invoice Details</h1>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <button
                            onClick={() => navigate('/factures')}
                            className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} px-3 sm:px-4 py-2 rounded-md transition-colors flex items-center justify-center`}
                        >
                            <FaArrowLeft className="mr-1 sm:mr-2" />
                            <span className="text-sm sm:text-base">Back</span>
                        </button>
                        {(user.role === 'admin' || (facture && facture.user_id === user.id)) && (
                            <button
                                onClick={() => navigate(`/factures/edit/${id}`)}
                                className={`bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-md transition-colors flex items-center justify-center`}
                            >
                                <FaEdit className="mr-1 sm:mr-2" />
                                <span className="text-sm sm:text-base">Edit</span>
                            </button>
                        )}
                        <button
                            onClick={handlePrint}
                            className={`bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-md transition-colors flex items-center justify-center print-hide`}
                        >
                            <FaPrint className="mr-1 sm:mr-2" />
                            <span className="text-sm sm:text-base">Print</span>
                        </button>
                    </div>
                </div>
                
                {loading && (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                )}
                
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
                
                {!loading && !error && facture && (
                    <div id="printable-invoice" className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg overflow-hidden transition-colors`}>
                        {/* Invoice Header */}
                        <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                                <div>
                                    <h2 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                        Invoice #{facture.invoice_number}
                                    </h2>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 mt-2 rounded-full text-xs font-medium ${getStatusBadgeClass(facture.status)}`}>
                                        {facture.status || 'Draft'}
                                    </span>
                                </div>
                                <div className={`w-full sm:w-auto sm:text-right mt-4 sm:mt-0 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    <div className="flex items-start sm:items-center sm:justify-end mb-1">
                                        <FaCalendarAlt className="mr-2 mt-1 sm:mt-0" />
                                        <span className="text-sm sm:text-base">Date: {formatDate(facture.date)}</span>
                                    </div>
                                    {facture.due_date && (
                                        <div className="flex items-start sm:items-center sm:justify-end">
                                            <FaCalendarAlt className="mr-2 mt-1 sm:mt-0" />
                                            <span className="text-sm sm:text-base">Due Date: {formatDate(facture.due_date)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                    <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                        <FaUser className="inline mr-2" />
                                        Customer Information
                                    </h3>
                                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                        {facture.customer_name}
                                    </p>
                                    {facture.client_email && (
                                        <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                            Email: {facture.client_email}
                                        </p>
                                    )}
                                    {facture.client_address && (
                                        <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                            Address: {facture.client_address}
                                        </p>
                                    )}
                                </div>
                                
                                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                    <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                        <FaFileInvoice className="inline mr-2" />
                                        Invoice Summary
                                    </h3>
                                    <div className="flex justify-between mb-1">
                                        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Total Amount:</span>
                                        <span className={`font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                                            {formatCurrency(facture.total_amount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Items:</span>
                                        <span className={darkMode ? 'text-white' : 'text-gray-800'}>
                                            {facture.items?.length || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {facture.notes && (
                                <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                    <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Notes</h3>
                                    <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                        {facture.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                        
                        {/* Invoice Items */}
                        <div className="p-6">
                            <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Invoice Items</h3>
                            
                            <div className="overflow-x-auto ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-2 sm:p-3">
                                <table className="min-w-full divide-y divide-gray-200 table-fixed sm:table-auto">
                                    <thead>
                                        <tr>
                                            <th className={`px-2 sm:px-3 py-2 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider w-1/3`}>Description</th>
                                            <th className={`px-2 sm:px-3 py-2 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider w-1/6`}>Qty</th>
                                            <th className={`px-2 sm:px-3 py-2 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider w-1/4`}>Unit Price</th>
                                            <th className={`px-2 sm:px-3 py-2 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider w-1/4`}>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className={`${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                                        {facture.items && facture.items.map((item, index) => (
                                            <tr key={index} className={index % 2 === 0 ? (darkMode ? 'bg-gray-800' : 'bg-white') : ''}>
                                                <td className="px-2 sm:px-3 py-1 sm:py-2">
                                                    <div className={`text-xs sm:text-sm ${darkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                                                        {item.description}
                                                    </div>
                                                </td>
                                                <td className="px-2 sm:px-3 py-1 sm:py-2 text-center">
                                                    <div className={`text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                                        {item.quantity}
                                                    </div>
                                                </td>
                                                <td className="px-2 sm:px-3 py-1 sm:py-2 text-center">
                                                    <div className={`text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                                        {formatCurrency(item.unit_price)}
                                                    </div>
                                                </td>
                                                <td className="px-2 sm:px-3 py-1 sm:py-2 text-center">
                                                    <div className={`text-xs sm:text-sm font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                                                        {formatCurrency(item.amount)}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className={`border-t ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                                            <td colSpan="4" className="px-2 sm:px-3 py-3 sm:py-4 text-center">
                                                <div className="flex justify-center items-center">
                                                    <span className="text-xs lg:text-base font-medium mr-2">Total:</span>
                                                    <span className={`font-bold text-lg sm:text-lg ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                                                        {formatCurrency(facture.total_amount)}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* Print-specific styling */}
            <style>{`
                @media print {
                    button, .no-print, .print-hide {
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
    )
}
