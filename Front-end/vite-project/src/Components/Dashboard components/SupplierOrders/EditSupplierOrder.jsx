import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { FaSave, FaTimes } from 'react-icons/fa';
import Swal from 'sweetalert2';

export default function EditSupplierOrder() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [formData, setFormData] = useState({
    fournisseur_id: '',
    supplier_name: '',
    produit_id: '',
    product_name: '',
    quantity: '',
    unit_price: '',
    total_amount: '',
    expected_delivery_date: '',
    status: '',
    notes: '',
    userId: user.id
  });
  
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch the supplier order
        const orderResponse = await axios.get(`http://localhost:3000/supplier-order/${id}?userId=${user.id}`);
        
        // Format date for form input
        const orderData = orderResponse.data;
        if (orderData.expected_delivery_date) {
          orderData.expected_delivery_date = new Date(orderData.expected_delivery_date).toISOString().split('T')[0];
        }
        
        setFormData(orderData);
        
        // Fetch suppliers
        const suppliersResponse = await axios.get(`http://localhost:3000/fournisseur?userId=${user.id}`);
        setSuppliers(suppliersResponse.data);
        
        // Fetch products
        const productsResponse = await axios.get(`http://localhost:3000/produit?userId=${user.id}`);
        setProducts(productsResponse.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
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
    
    fetchData();
  }, [id, user.id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Auto-fill supplier name when supplier id is selected
      if (name === 'fournisseur_id') {
        const selectedSupplier = suppliers.find(s => s.id === parseInt(value));
        if (selectedSupplier) {
          newData.supplier_name = selectedSupplier.nom_entreprise;
        }
      }
      
      // Auto-fill product name when product id is selected
      if (name === 'produit_id') {
        const selectedProduct = products.find(p => p.id === parseInt(value));
        if (selectedProduct) {
          newData.product_name = selectedProduct.nom;
        }
      }
      
      // Calculate total amount when quantity or unit price changes
      if (name === 'quantity' || name === 'unit_price') {
        const quantity = name === 'quantity' ? parseFloat(value) || 0 : parseFloat(prev.quantity) || 0;
        const unitPrice = name === 'unit_price' ? parseFloat(value) || 0 : parseFloat(prev.unit_price) || 0;
        newData.total_amount = (quantity * unitPrice).toFixed(2);
      }
      
      return newData;
    });
    
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fournisseur_id) newErrors.fournisseur_id = 'Supplier is required';
    if (!formData.produit_id) newErrors.produit_id = 'Product is required';
    if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = 'Valid quantity is required';
    if (!formData.unit_price || formData.unit_price <= 0) newErrors.unit_price = 'Valid unit price is required';
    if (!formData.status) newErrors.status = 'Status is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      
      // First check if the supplier_order table exists by making a GET request
      try {
        await axios.get(`http://localhost:3000/supplier-order?userId=${user.id}`);
      } catch (checkError) {
        // If we get an error here, the table might not exist
        throw new Error('The supplier order system may not be properly set up. Please run the supplier_order_setup.sql script.');
      }
      
      // Now attempt the update
      const response = await axios.put(`http://localhost:3000/supplier-order/${id}`, {
        ...formData,
        // Ensure userId is included in both the query params and the request body
        userId: user.id
      });
      
      setSubmitting(false);
      
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Supplier order updated successfully!'
      }).then(() => {
        navigate('/supplier-orders');
      });
    } catch (error) {
      console.error('Error updating supplier order:', error);
      setSubmitting(false);
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || error.response?.data?.error || 'Failed to update supplier order. Please try again.'
      });
    }
  };

  if (loading) {
    return (
      <div className={`p-4 sm:p-6 md:p-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen flex justify-center items-center`}>
        <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${darkMode ? 'border-white' : 'border-blue-500'}`}></div>
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-6 md:p-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen`}>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Edit Supplier Order
        </h1>
        <button
          onClick={() => navigate('/supplier-orders')}
          className={`px-4 py-2 rounded-lg ${
            darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          } transition-colors duration-300 flex items-center`}
        >
          <FaTimes className="mr-2" />
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 sm:p-6 rounded-lg shadow-md`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Supplier Selection */}
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Supplier *
            </label>
            <select
              name="fournisseur_id"
              value={formData.fournisseur_id}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg ${
                darkMode 
                  ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500' 
                  : 'bg-white text-gray-800 border-gray-300 focus:border-blue-500'
              } border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.fournisseur_id ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
              }`}
              disabled={submitting}
            >
              <option value="">Select Supplier</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.nom_entreprise}
                </option>
              ))}
            </select>
            {errors.fournisseur_id && (
              <p className="mt-1 text-sm text-red-500">{errors.fournisseur_id}</p>
            )}
          </div>

          {/* Product Selection */}
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Product *
            </label>
            <select
              name="produit_id"
              value={formData.produit_id}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg ${
                darkMode 
                  ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500' 
                  : 'bg-white text-gray-800 border-gray-300 focus:border-blue-500'
              } border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.produit_id ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
              }`}
              disabled={submitting}
            >
              <option value="">Select Product</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.nom} (Stock: {product.total})
                </option>
              ))}
            </select>
            {errors.produit_id && (
              <p className="mt-1 text-sm text-red-500">{errors.produit_id}</p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Quantity *
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              className={`w-full px-4 py-2 rounded-lg ${
                darkMode 
                  ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500' 
                  : 'bg-white text-gray-800 border-gray-300 focus:border-blue-500'
              } border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.quantity ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
              }`}
              disabled={submitting}
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-500">{errors.quantity}</p>
            )}
          </div>

          {/* Unit Price */}
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Unit Price ($) *
            </label>
            <input
              type="number"
              name="unit_price"
              value={formData.unit_price}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              className={`w-full px-4 py-2 rounded-lg ${
                darkMode 
                  ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500' 
                  : 'bg-white text-gray-800 border-gray-300 focus:border-blue-500'
              } border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.unit_price ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
              }`}
              disabled={submitting}
            />
            {errors.unit_price && (
              <p className="mt-1 text-sm text-red-500">{errors.unit_price}</p>
            )}
          </div>

          {/* Total Amount (Calculated) */}
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Total Amount ($)
            </label>
            <input
              type="text"
              name="total_amount"
              value={formData.total_amount}
              readOnly
              className={`w-full px-4 py-2 rounded-lg ${
                darkMode 
                  ? 'bg-gray-700 text-white border-gray-600' 
                  : 'bg-gray-100 text-gray-800 border-gray-300'
              } border focus:outline-none transition-colors`}
              disabled
            />
          </div>

          {/* Expected Delivery Date */}
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Expected Delivery Date
            </label>
            <input
              type="date"
              name="expected_delivery_date"
              value={formData.expected_delivery_date || ''}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg ${
                darkMode 
                  ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500' 
                  : 'bg-white text-gray-800 border-gray-300 focus:border-blue-500'
              } border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
              disabled={submitting}
            />
          </div>

          {/* Status */}
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg ${
                darkMode 
                  ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500' 
                  : 'bg-white text-gray-800 border-gray-300 focus:border-blue-500'
              } border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.status ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
              }`}
              disabled={submitting}
            >
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-500">{errors.status}</p>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="mt-6">
          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            rows="4"
            className={`w-full px-4 py-2 rounded-lg ${
              darkMode 
                ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500' 
                : 'bg-white text-gray-800 border-gray-300 focus:border-blue-500'
            } border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
            disabled={submitting}
          ></textarea>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-center sm:justify-end">
          <button
            type="submit"
            className={`w-full sm:w-auto px-4 sm:px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center ${
              submitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={submitting}
          >
            <FaSave className="mr-2" />
            {submitting ? 'Updating...' : 'Update Order'}
          </button>
        </div>
      </form>
    </div>
  );
}