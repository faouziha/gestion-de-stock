import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaMoneyBillWave } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';

export default function AddClientTransaction() {
  const { clientId } = useParams();
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: '',
    operation_type: 'deposit',
    reference: '',
    notes: ''
  });

  // Fetch client data
  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/clients/${clientId}?userId=${user.id}`);
        setClient(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching client:', error);
        setError('Failed to load client information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [clientId, user.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate amount
    if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount greater than zero.');
      return;
    }
    
    try {
      setError(null);
      setSubmitting(true);
      
      const payload = {
        ...formData,
        userId: user.id,
        clientId: parseInt(clientId),
        amount: parseFloat(formData.amount)
      };
      
      await axios.post(`http://localhost:3000/clients/${clientId}/solde`, payload);
      
      setSuccess(true);
      
      // Clear form after successful submission
      setFormData({
        amount: '',
        operation_type: 'deposit',
        reference: '',
        notes: ''
      });
      
      // Redirect after short delay
      setTimeout(() => {
        navigate(`/clients/solde/${clientId}`);
      }, 1500);
      
    } catch (error) {
      console.error('Error adding transaction:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError('Failed to add transaction. Please try again later.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    return parseFloat(amount).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  };

  return (
    <div className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} min-h-screen`}>
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(`/clients/solde/${clientId}`)}
          className={`flex items-center mb-6 text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
        >
          <FaArrowLeft className="mr-2" />
          Back to Balance Details
        </button>
        
        <div className="mb-6">
          <h1 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Add Transaction
          </h1>
          {client && (
            <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Client: {client.nom} {client.prenom}
            </p>
          )}
        </div>
        
        {loading && (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {error && (
          <div className={`${darkMode ? 'bg-red-900 border-red-700 text-red-100' : 'bg-red-100 border-red-500 text-red-700'} border-l-4 p-4 mb-6 rounded-md`}>
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className={`h-5 w-5 ${darkMode ? 'text-red-300' : 'text-red-500'}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {success && (
          <div className={`${darkMode ? 'bg-green-900 border-green-700 text-green-100' : 'bg-green-100 border-green-500 text-green-700'} border-l-4 p-4 mb-6 rounded-md`}>
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className={`h-5 w-5 ${darkMode ? 'text-green-300' : 'text-green-500'}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">Transaction added successfully! Redirecting...</p>
              </div>
            </div>
          </div>
        )}
        
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden`}>
          <div className={`px-6 py-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
            <div className="flex items-center">
              <FaMoneyBillWave className={`mr-3 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
              <h2 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Transaction Details</h2>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-4">
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Transaction Type
              </label>
              <select
                name="operation_type"
                value={formData.operation_type}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              >
                <option value="deposit">Deposit (Add to balance)</option>
                <option value="withdrawal">Withdrawal (Remove from balance)</option>
                <option value="payment">Payment for order</option>
                <option value="refund">Refund (Return money)</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Amount ($)
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                step="0.01"
                min="0.01"
                className={`w-full px-3 py-2 border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="0.00"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Reference (Optional)
              </label>
              <input
                type="text"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="e.g., Invoice #123 or Receipt #456"
              />
              <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Order number, receipt number, or other reference
              </p>
            </div>
            
            <div className="mb-6">
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className={`w-full px-3 py-2 border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Additional details about this transaction..."
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || success}
                className={`flex items-center px-4 py-2 ${
                  submitting || success 
                    ? 'bg-gray-500 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    Save Transaction
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
