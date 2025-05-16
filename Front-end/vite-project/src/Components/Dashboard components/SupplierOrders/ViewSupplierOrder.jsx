import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { FaEdit, FaArrowLeft, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';

export default function ViewSupplierOrder() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/supplier-order/${id}?userId=${user.id}`);
        setOrder(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching order:', error);
        setLoading(false);
        
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load order data. Please try again.'
        }).then(() => {
          navigate('/supplier-orders');
        });
      }
    };
    
    fetchOrder();
  }, [id, user.id, navigate]);

  const handleDelete = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:3000/supplier-order/${id}?userId=${user.id}`);
          
          Swal.fire(
            'Deleted!',
            'The supplier order has been deleted.',
            'success'
          ).then(() => {
            navigate('/supplier-orders');
          });
        } catch (error) {
          console.error('Error deleting order:', error);
          
          Swal.fire(
            'Error!',
            'There was a problem deleting the order.',
            'error'
          );
        }
      }
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending':
        return darkMode ? 'bg-yellow-700 text-yellow-100' : 'bg-yellow-100 text-yellow-800';
      case 'Processing':
        return darkMode ? 'bg-blue-700 text-blue-100' : 'bg-blue-100 text-blue-800';
      case 'Shipped':
        return darkMode ? 'bg-purple-700 text-purple-100' : 'bg-purple-100 text-purple-800';
      case 'Delivered':
        return darkMode ? 'bg-green-700 text-green-100' : 'bg-green-100 text-green-800';
      case 'Cancelled':
        return darkMode ? 'bg-red-700 text-red-100' : 'bg-red-100 text-red-800';
      default:
        return darkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className={`p-4 sm:p-6 md:p-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen flex justify-center items-center`}>
        <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${darkMode ? 'border-white' : 'border-blue-500'}`}></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={`p-4 sm:p-6 md:p-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen flex flex-col items-center justify-center`}>
        <p className="text-xl mb-4">Order not found or you don't have permission to view it.</p>
        <button
          onClick={() => navigate('/supplier-orders')}
          className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors duration-300 flex items-center`}
        >
          <FaArrowLeft className="mr-2" />
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-6 md:p-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen`}>
      {/* Header with back button and actions */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center w-full sm:w-auto">
          <button
            onClick={() => navigate('/supplier-orders')}
            className={`mr-4 p-2 rounded-full ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} transition-colors duration-300`}
          >
            <FaArrowLeft className={darkMode ? 'text-white' : 'text-gray-700'} />
          </button>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Supplier Order Details
          </h1>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-end mt-3 sm:mt-0">
          <button
            onClick={() => navigate(`/edit-supplier-order/${order.id}`)}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center flex-1 sm:flex-initial"
          >
            <FaEdit className="mr-2" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors duration-300 flex items-center justify-center flex-1 sm:flex-initial"
          >
            <FaTrash className="mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Order details card */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden`}>
        {/* Order header */}
        <div className={`p-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Order #{order.id}
              </h2>
              <p className={`mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Created on {formatDate(order.order_date)}
              </p>
            </div>
            <div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(order.status)}`}>
                {order.status}
              </span>
            </div>
          </div>
        </div>

        {/* Order details */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Supplier Information */}
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Supplier Information
              </h3>
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                  <span className="font-medium">Supplier ID:</span> {order.fournisseur_id}
                </p>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                  <span className="font-medium">Supplier Name:</span> {order.supplier_name}
                </p>
              </div>
            </div>

            {/* Product Information */}
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Product Information
              </h3>
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                  <span className="font-medium">Product ID:</span> {order.produit_id}
                </p>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                  <span className="font-medium">Product Name:</span> {order.product_name}
                </p>
              </div>
            </div>

            {/* Order Details */}
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Order Details
              </h3>
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                  <span className="font-medium">Quantity:</span> {order.quantity}
                </p>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                  <span className="font-medium">Unit Price:</span> ${parseFloat(order.unit_price).toFixed(2)}
                </p>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                  <span className="font-medium">Total Amount:</span> ${parseFloat(order.total_amount).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Delivery Information */}
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Delivery Information
              </h3>
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                  <span className="font-medium">Expected Delivery:</span> {formatDate(order.expected_delivery_date)}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="mt-6">
              <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Notes
              </h3>
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {order.notes}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}