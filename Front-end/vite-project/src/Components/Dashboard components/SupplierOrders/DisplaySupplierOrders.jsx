import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { FaEdit, FaEye, FaTrash, FaPlus, FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import Swal from 'sweetalert2';

export default function DisplaySupplierOrders() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [supplierOrders, setSupplierOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchSupplierOrders();
  }, [user.id]);

  const fetchSupplierOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/supplier-order?userId=${user.id}`);
      setSupplierOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching supplier orders:', error);
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:3000/supplier-order/${id}?userId=${user.id}`);
          setSupplierOrders(supplierOrders.filter(order => order.id !== id));
          Swal.fire(
            'Deleted!',
            'The supplier order has been deleted.',
            'success'
          );
        } catch (error) {
          console.error('Error deleting supplier order:', error);
          Swal.fire(
            'Error!',
            'There was an error deleting the supplier order.',
            'error'
          );
        }
      }
    });
  };

  const handleSort = (field) => {
    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="inline ml-1" />;
    return sortDirection === 'asc' ? <FaSortUp className="inline ml-1" /> : <FaSortDown className="inline ml-1" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Filter and sort supplier orders
  const filteredOrders = supplierOrders.filter(order => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      (order.supplier_name || '').toLowerCase().includes(searchTermLower) ||
      (order.product_name || '').toLowerCase().includes(searchTermLower) ||
      (order.status || '').toLowerCase().includes(searchTermLower)
    );
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortField === 'created_at' || sortField === 'order_date' || sortField === 'expected_delivery_date') {
      const dateA = new Date(a[sortField] || 0);
      const dateB = new Date(b[sortField] || 0);
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    }
    
    if (sortField === 'quantity' || sortField === 'unit_price' || sortField === 'total_amount') {
      const numA = parseFloat(a[sortField] || 0);
      const numB = parseFloat(b[sortField] || 0);
      return sortDirection === 'asc' ? numA - numB : numB - numA;
    }
    
    const valueA = (a[sortField] || '').toString().toLowerCase();
    const valueB = (b[sortField] || '').toString().toLowerCase();
    return sortDirection === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Status badge color
  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return darkMode ? 'bg-yellow-700 text-yellow-100' : 'bg-yellow-200 text-yellow-800';
      case 'processing':
        return darkMode ? 'bg-blue-700 text-blue-100' : 'bg-blue-200 text-blue-800';
      case 'shipped':
        return darkMode ? 'bg-purple-700 text-purple-100' : 'bg-purple-200 text-purple-800';
      case 'delivered':
        return darkMode ? 'bg-green-700 text-green-100' : 'bg-green-200 text-green-800';
      case 'cancelled':
        return darkMode ? 'bg-red-700 text-red-100' : 'bg-red-200 text-red-800';
      default:
        return darkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <div className={`p-4 sm:p-6 md:p-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className={`text-2xl font-bold mb-4 sm:mb-0 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Supplier Orders
        </h1>
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 w-full md:w-auto">
          <div className="relative flex-grow sm:flex-grow-0">
            <input
              type="text"
              placeholder="Search orders..."
              className={`pl-10 pr-4 py-2 rounded-lg w-full ${
                darkMode 
                  ? 'bg-gray-800 text-white border-gray-700 focus:border-blue-500' 
                  : 'bg-white text-gray-800 border-gray-300 focus:border-blue-500'
              } border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          <Link
            to="/add-supplier-order"
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            <FaPlus className="mr-2" />
            Add New Order
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${darkMode ? 'border-white' : 'border-blue-500'}`}></div>
        </div>
      ) : (
        <>
          {supplierOrders.length === 0 ? (
            <div className={`text-center py-12 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md`}>
              <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>No supplier orders found</p>
              <Link
                to="/add-supplier-order"
                className="inline-flex items-center justify-center px-4 py-2 mt-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
              >
                <FaPlus className="mr-2" />
                Create Your First Supplier Order
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'} rounded-lg shadow-md text-sm md:text-base`}>
                <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} hidden md:table-header-group`}>
                  <tr>
                    <th 
                      scope="col" 
                      className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider cursor-pointer`}
                      onClick={() => handleSort('supplier_name')}
                    >
                      Supplier {getSortIcon('supplier_name')}
                    </th>
                    <th 
                      scope="col" 
                      className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider cursor-pointer`}
                      onClick={() => handleSort('product_name')}
                    >
                      Product {getSortIcon('product_name')}
                    </th>
                    <th 
                      scope="col" 
                      className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider cursor-pointer`}
                      onClick={() => handleSort('quantity')}
                    >
                      Quantity {getSortIcon('quantity')}
                    </th>
                    <th 
                      scope="col" 
                      className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider cursor-pointer`}
                      onClick={() => handleSort('total_amount')}
                    >
                      Total {getSortIcon('total_amount')}
                    </th>
                    <th 
                      scope="col" 
                      className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider cursor-pointer`}
                      onClick={() => handleSort('order_date')}
                    >
                      Order Date {getSortIcon('order_date')}
                    </th>
                    <th 
                      scope="col" 
                      className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider cursor-pointer`}
                      onClick={() => handleSort('status')}
                    >
                      Status {getSortIcon('status')}
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`${darkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'}`}>
                  {/* Mobile view - card style for small screens */}
                  <tr className="md:hidden"><td colSpan="7" className="p-0">
                    <div className="md:hidden">
                      {currentItems.map((order) => (
                        <div key={`mobile-${order.id}`} className={`p-4 mb-4 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'} shadow-sm`}>
                          <div className="flex flex-col space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-bold">ID:</span>
                              <span>{order.id}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-bold">Supplier:</span>
                              <span>{order.supplier_name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-bold">Product:</span>
                              <span>{order.product_name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-bold">Quantity:</span>
                              <span>{order.quantity}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-bold">Total:</span>
                              <span>${parseFloat(order.total_amount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-bold">Date:</span>
                              <span>{formatDate(order.order_date)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-bold">Status:</span>
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                                {order.status || 'Pending'}
                              </span>
                            </div>
                            <div className="flex justify-center space-x-4 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                              <Link to={`/view-supplier-order/${order.id}`} className="text-blue-500 hover:text-blue-700">
                                <FaEye className="text-lg" />
                              </Link>
                              <Link to={`/edit-supplier-order/${order.id}`} className="text-yellow-500 hover:text-yellow-700">
                                <FaEdit className="text-lg" />
                              </Link>
                              <button
                                onClick={() => handleDelete(order.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <FaTrash className="text-lg" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </td></tr>
                  
                  {/* Desktop view */}
                  {currentItems.map((order) => (
                    <tr key={`desktop-${order.id}`} className={`hidden md:table-row ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">{order.supplier_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{order.product_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{order.quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">${parseFloat(order.total_amount).toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{formatDate(order.order_date)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                          {order.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link to={`/view-supplier-order/${order.id}`} className="text-blue-500 hover:text-blue-700">
                            <FaEye className="text-lg" />
                          </Link>
                          <Link to={`/edit-supplier-order/${order.id}`} className="text-yellow-500 hover:text-yellow-700">
                            <FaEdit className="text-lg" />
                          </Link>
                          <button
                            onClick={() => handleDelete(order.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTrash className="text-lg" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {supplierOrders.length > 0 && (
            <div className="flex flex-wrap justify-center mt-6 px-2">
              <nav className="flex items-center">
                <button
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-l-md ${
                    currentPage === 1
                      ? `${darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-500'} cursor-not-allowed`
                      : `${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`
                  }`}
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => paginate(index + 1)}
                    className={`px-3 py-1 ${
                      currentPage === index + 1
                        ? `${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`
                        : `${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-r-md ${
                    currentPage === totalPages
                      ? `${darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-500'} cursor-not-allowed`
                      : `${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
}