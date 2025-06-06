import React, { useState, useEffect } from 'react';
import { FaCalendar, FaFileAlt, FaDollarSign, FaBoxes, FaShoppingCart, FaChartLine, FaPrint } from 'react-icons/fa';
import { format } from 'date-fns';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import config from '../../../config';

const ReportView = ({ reportId }) => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);
  const [reportDetails, setReportDetails] = useState([]);
  const [isPrinting, setIsPrinting] = useState(false);
  
  // Force re-render on theme change
  useEffect(() => {
    // This empty useEffect will trigger a re-render when darkMode changes
  }, [darkMode]);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${config.API_URL}/reports/${reportId}?userId=${user.id}`);
        
        if (response.data.success) {
          setReport(response.data.report);
          setReportDetails(response.data.details);
        } else {
          setError(response.data.error || 'Failed to load report data');
        }
      } catch (error) {
        console.error('Error fetching report data:', error);
        setError(error.response?.data?.error || 'An error occurred while fetching the report data');
      } finally {
        setLoading(false);
      }
    };

    if (reportId) {
      fetchReportData();
    }
  }, [reportId, user.id]);

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy');
    } catch (error) {
      return dateString || 'N/A';
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    
    // Create a hidden iframe
    let iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    // Generate the report items HTML
    let reportItemsHtml = '';
    if (reportDetails && reportDetails.length > 0) {
      reportItemsHtml = reportDetails.map((detail) => {
        const revenue = parseFloat(detail.revenue || 0).toFixed(2);
        const averagePrice = parseFloat(detail.average_price || 0).toFixed(2);
        return `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd">${detail.product_name || 'N/A'}</td>
            <td style="padding: 8px; border: 1px solid #ddd">${detail.category_name || 'N/A'}</td>
            <td style="padding: 8px; border: 1px solid #ddd">${detail.brand_name || 'N/A'}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right">${detail.quantity_sold}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right">$${revenue}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right">$${averagePrice}</td>
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
        <title>Report: ${report.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { text-align: center; margin-bottom: 5px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 1px solid #333; padding-bottom: 10px; }
          .info-section { margin-bottom: 20px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; grid-gap: 20px; }
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); grid-gap: 15px; margin-bottom: 20px; }
          .stat-box { border: 1px solid #ddd; border-radius: 4px; padding: 12px; text-align: center; }
          .stat-value { font-size: 18px; font-weight: bold; margin: 8px 0; }
          .stat-title { color: #666; font-size: 12px; }
          .info-box { border: 1px solid #ddd; border-radius: 4px; padding: 15px; }
          h2 { margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { text-align: left; background: #f2f2f2; padding: 8px; border: 1px solid #ddd; }
          td { padding: 8px; border: 1px solid #ddd; }
          .footer { margin-top: 30px; text-align: center; border-top: 1px solid #eee; padding-top: 15px; }
          .total-row { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${report.title}</h1>
          <p>${report.description || ''}</p>
          <p>Period: ${formatDate(report.date_range_start)} - ${formatDate(report.date_range_end)}</p>
        </div>
        
        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-title">Total Revenue</div>
            <div class="stat-value">$${parseFloat(report.total_revenue || 0).toFixed(2)}</div>
          </div>
          <div class="stat-box">
            <div class="stat-title">Products Sold</div>
            <div class="stat-value">${report.total_products_sold || 0}</div>
          </div>
          <div class="stat-box">
            <div class="stat-title">Total Orders</div>
            <div class="stat-value">${report.total_orders || 0}</div>
          </div>
          <div class="stat-box">
            <div class="stat-title">Average Order Value</div>
            <div class="stat-value">$${parseFloat(report.average_order_value || 0).toFixed(2)}</div>
          </div>
        </div>
        
        <div class="info-section">
          <h2>Product Performance</h2>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Brand</th>
                <th style="text-align: right">Quantity Sold</th>
                <th style="text-align: right">Revenue</th>
                <th style="text-align: right">Avg. Price</th>
              </tr>
            </thead>
            <tbody>
              ${reportItemsHtml || '<tr><td colspan="6" style="text-align:center">No product data available for this report period</td></tr>'}
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="3" style="text-align: right; padding: 8px;">Totals:</td>
                <td style="text-align: right; padding: 8px;">${report.total_products_sold || 0}</td>
                <td style="text-align: right; padding: 8px;">$${parseFloat(report.total_revenue || 0).toFixed(2)}</td>
                <td style="text-align: right; padding: 8px;">$${parseFloat(report.average_order_value || 0).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div class="footer">
          <p>Generated on ${new Date().toLocaleDateString()}</p>
          <p>Stock Management System</p>
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
        setIsPrinting(false);
      }, 1000);
    }, 500);
  };

  if (loading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4" role="alert">
        <span className="block sm:inline">Report not found</span>
      </div>
    );
  }

  return (
    <div className={`pt-6 pb-4 mt-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
      {/* Report Header with Print Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div>
          <h2 className={`text-lg sm:text-xl font-bold mb-2 break-words ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {report.title}
          </h2>
          {report.description && (
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm sm:text-base break-words`}>
              {report.description}
            </p>
          )}
          <div className={`flex items-center text-xs sm:text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <FaCalendar className="mr-1" />
            <span className="break-words">{formatDate(report.date_range_start)} - {formatDate(report.date_range_end)}</span>
          </div>
        </div>
        <button
          onClick={handlePrint}
          disabled={isPrinting}
          className="flex items-center justify-center w-full sm:w-auto space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300 text-sm"
        >
          <FaPrint className="mr-1" />
          <span>{isPrinting ? 'Printing...' : 'Print Report'}</span>
        </button>
      </div>

      {/* Report Info Cards - Responsive grid layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
        <div>
          <div className={`border rounded-lg h-full p-4 ${darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-blue-50'}`}>
            <div className="flex items-center mb-2">
              <FaCalendar className="text-blue-500 mr-2" />
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Report Period
              </span>
            </div>
            <p className="text-sm">
              {formatDate(report.date_range_start)}
            </p>
            <p className="text-sm">
              to {formatDate(report.date_range_end)}
            </p>
          </div>
        </div>
        
        <div>
          <div className={`border rounded-lg h-full p-4 ${darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-blue-50'}`}>
            <div className="flex items-center mb-2">
              <FaDollarSign className="text-blue-500 mr-2" />
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Revenue
              </span>
            </div>
            <p className={`text-xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              ${Number(report.total_revenue).toFixed(2)}
            </p>
          </div>
        </div>
        
        <div>
          <div className={`border rounded-lg h-full p-4 ${darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-blue-50'}`}>
            <div className="flex items-center mb-2">
              <FaBoxes className="text-blue-500 mr-2" />
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Products Sold
              </span>
            </div>
            <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {report.total_products_sold}
            </p>
          </div>
        </div>
        
        <div>
          <div className={`border rounded-lg h-full p-4 ${darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-blue-50'}`}>
            <div className="flex items-center mb-2">
              <FaShoppingCart className="text-blue-500 mr-2" />
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Orders
              </span>
            </div>
            <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {report.total_orders}
            </p>
          </div>
        </div>
      </div>
      
      {/* Report Details Section */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center mb-3">
          <FaFileAlt className="text-blue-500 mr-2" />
          <h3 className="text-lg font-medium">
            Product Performance
          </h3>
        </div>
        <hr className={`mb-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} />
        
        {reportDetails.length === 0 ? (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative">
            No product data available for this report period
          </div>
        ) : (
          <div className={`overflow-x-auto border rounded-lg ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <table className={`min-w-full divide-y table-auto ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              <thead className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <tr>
                  <th scope="col" className={`px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Product</th>
                  <th scope="col" className={`hidden sm:table-cell px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Category</th>
                  <th scope="col" className={`hidden md:table-cell px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Brand</th>
                  <th scope="col" className={`px-3 py-2 sm:px-6 sm:py-3 text-right text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Qty</th>
                  <th scope="col" className={`px-3 py-2 sm:px-6 sm:py-3 text-right text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Revenue</th>
                  <th scope="col" className={`hidden sm:table-cell px-3 py-2 sm:px-6 sm:py-3 text-right text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Avg. Price</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'bg-gray-900 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                {reportDetails.map((detail) => (
                  <tr key={detail.id} className={`${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                    <td className={`px-3 py-3 sm:px-6 sm:py-4 text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <div className="truncate max-w-[120px] sm:max-w-full">{detail.product_name || 'N/A'}</div>
                    </td>
                    <td className={`hidden sm:table-cell px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {detail.category_name ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                          {detail.category_name}
                        </span>
                      ) : 'N/A'}
                    </td>
                    <td className={`hidden md:table-cell px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{detail.brand_name || 'N/A'}</td>
                    <td className={`px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-right`}>{detail.quantity_sold}</td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-right">
                      <span className={`font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                        ${Number(detail.revenue).toFixed(2)}
                      </span>
                    </td>
                    <td className={`hidden sm:table-cell px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-right`}>
                      ${Number(detail.average_price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Generated Info */}
      <div className="text-right mt-6">
        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Report generated on {formatDate(report.date_created)}
        </p>
      </div>
    </div>
  );
};

export default ReportView;
