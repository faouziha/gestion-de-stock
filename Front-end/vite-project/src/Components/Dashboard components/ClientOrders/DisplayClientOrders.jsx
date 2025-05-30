import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEdit, FaTrash, FaPlus, FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';

const DisplayClientOrders = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Status color mapping
  const statusColors = {
    'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'Processing': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'Shipped': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    'Delivered': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'Cancelled': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  };

  // Fetch orders when component mounts or sort criteria change
  useEffect(() => {
    fetchOrders();
  }, [user, sortField, sortDirection]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/clientorders', {
        params: { userId: user.id }
      });
      setOrders(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching client orders:', err);
      setError('Failed to load orders. Please try again later.');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      return;
    }

    try {
      await axios.delete(`http://localhost:3000/clientorders/${id}`);
      setOrders(orders.filter(order => order.id !== id));
      setConfirmDelete(null);
    } catch (err) {
      console.error('Error deleting order:', err);
      setError('Failed to delete order. Please try again.');
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort />;
    return sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  // Filter orders based on search term
  const filteredOrders = orders.filter(order => {
    if (!searchTerm) return true;
    
    const searchTermLower = searchTerm.toLowerCase();
    return (
      (order.client_name && order.client_name.toLowerCase().includes(searchTermLower)) ||
      (order.reference && order.reference.toLowerCase().includes(searchTermLower)) ||
      (order.status && order.status.toLowerCase().includes(searchTermLower)) ||
      (order.total_amount && order.total_amount.toString().includes(searchTerm))
    );
  });

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortField === 'date') {
      const dateA = new Date(a.date_commande);
      const dateB = new Date(b.date_commande);
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    } 
    if (sortField === 'client') {
      const clientA = a.client_name || '';
      const clientB = b.client_name || '';
      return sortDirection === 'asc' 
        ? clientA.localeCompare(clientB) 
        : clientB.localeCompare(clientA);
    }
    if (sortField === 'total_amount') {
      const amountA = parseFloat(a.total_amount) || 0;
      const amountB = parseFloat(b.total_amount) || 0;
      return sortDirection === 'asc' ? amountA - amountB : amountB - amountA;
    }
    if (sortField === 'status') {
      return sortDirection === 'asc' 
        ? a.status?.localeCompare(b.status || '') 
        : b.status?.localeCompare(a.status || '');
    }
    return 0;
  });

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = sortedOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(sortedOrders.length / ordersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return (
    <div className={`flex justify-center items-center h-screen ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className={`p-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
        <p>{error}</p>
      </div>
      <button 
        onClick={fetchOrders}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div className={`p-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <h1 className="text-2xl font-bold">Client Orders</h1>
        <Link 
          to="/clientorders/create" 
          className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-500 text-white rounded flex items-center justify-center sm:justify-start hover:bg-blue-600 transition-colors text-sm sm:text-base"
        >
          <FaPlus className="mr-1 sm:mr-2" />
          <span>Create New Order</span>
        </Link>
      </div>

      {/* Search and filter */}
      <div className="mb-4 relative">
        <div className="flex">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search by client name, reference, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-4 py-2 pr-10 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            <FaSearch className="absolute right-3 top-3 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Orders Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {currentOrders.length === 0 ? (
          <div className={`col-span-full p-6 text-center rounded-lg shadow ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-500'}`}>
            <p>No orders found</p>
          </div>
        ) : (
          currentOrders.map((order) => (
            <div key={order.id} className={`rounded-lg shadow overflow-hidden flex flex-col ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
              {/* Card Header */}
              <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-sm sm:text-base truncate">
                    {order.reference || `ORD-${order.id}`}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full ml-2 ${statusColors[order.status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {order.status || 'N/A'}
                  </span>
                </div>
              </div>
              
              {/* Card Body */}
              <div className="px-4 py-4 flex-grow">
                <div className="space-y-3">
                  <div>
                    <span className={`block text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Client</span>
                    <span className="font-medium">{order.client_name || 'N/A'}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <div>
                      <span className={`block text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Date</span>
                      <span>{new Date(order.date_commande).toLocaleDateString()}</span>
                    </div>
                    
                    <div>
                      <span className={`block text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Amount</span>
                      <span className="font-medium">
                        ${(() => {
                          // Calculate subtotal
                          const subtotal = order.orderItems ? order.orderItems.reduce((sum, item) => {
                            const price = parseFloat(item.price) || 0;
                            const quantity = parseInt(item.quantity) || 0;
                            return sum + (price * quantity);
                          }, 0) : parseFloat(order.total_amount) || 0;
                          
                          // Add 10% tax to match the add/edit pages
                          const tax = subtotal * 0.1;
                          const total = subtotal + tax;
                          
                          return total.toFixed(2);
                        })()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Product List */}
                  {order.orderItems && order.orderItems.length > 0 && (
                    <div>
                      <span className={`block text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Products</span>
                      <div className={`text-xs p-2 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <div className="space-y-2">
                          {order.orderItems.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                              <span className="truncate flex-1">{item.product_name}</span>
                              <span className="flex-shrink-0 ml-2">
                                {item.quantity} × ${parseFloat(item.price).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Card Footer - Actions */}
              <div className={`px-4 py-3 mt-auto border-t ${darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => navigate(`/clientorders/view/${order.id}`)}
                    className={`px-2 py-1.5 rounded-md text-sm flex items-center justify-center ${darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}
                    aria-label="View order"
                  >
                    <FaEye className="mr-1" /> View
                  </button>
                  
                  <button 
                    onClick={() => navigate(`/clientorders/edit/${order.id}`)}
                    className={`px-2 py-1.5 rounded-md text-sm flex items-center justify-center ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                    aria-label="Edit order"
                  >
                    <FaEdit className="mr-1" /> Edit
                  </button>
                  
                  <button 
                    onClick={() => handleDelete(order.id)} 
                    className={`px-2 py-1.5 rounded-md text-sm flex items-center justify-center ${darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                    aria-label="Delete order"
                  >
                    <FaTrash className="mr-1" /> Delete
                  </button>
                </div>
                
                {confirmDelete === order.id && (
                  <div className="mt-3 text-xs text-center fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg max-w-sm w-full mx-4">
                      <p className="text-red-500 font-semibold mb-3">Are you sure you want to delete this order?</p>
                      <div className="flex justify-center mt-2 space-x-3">
                        <button 
                          onClick={() => handleDelete(order.id)} 
                          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Yes, Delete
                        </button>
                        <button 
                          onClick={() => setConfirmDelete(null)} 
                          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center mt-6 pb-4">
          <div className={`text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
            Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, sortedOrders.length)} of {sortedOrders.length} orders
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${
                currentPage === 1
                ? `${darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'} cursor-not-allowed`
                : `${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`
              }`}
            >
              Prev
            </button>
            {[...Array(totalPages).keys()].map(number => (
              <button
                key={number + 1}
                onClick={() => paginate(number + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === number + 1
                    ? `${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`
                    : `${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`
                }`}
              >
                {number + 1}
              </button>
            ))}
            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded ${
                currentPage === totalPages
                ? `${darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'} cursor-not-allowed`
                : `${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplayClientOrders;
