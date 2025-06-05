import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaMoneyBillWave, FaTrash, FaPlus, FaDownload } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';

export default function ViewClientSolde() {
  const [clientSolde, setClientSolde] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const { clientId } = useParams();
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const fetchClientSolde = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/clients/${clientId}/solde?userId=${user.id}`);
      setClientSolde(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching client balance:', error);
      setError('Failed to load client balance details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientSolde();
  }, [clientId, user.id]);

  const handleDeleteClick = (transaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (transactionToDelete) {
      try {
        setDeleteLoading(true);
        await axios.delete(`http://localhost:3000/clients/solde/transactions/${transactionToDelete.id}?userId=${user.id}`);
        fetchClientSolde(); // Refresh the data after deletion
        setShowDeleteModal(false);
      } catch (error) {
        console.error('Error deleting transaction:', error);
        if (error.response && error.response.data && error.response.data.error) {
          alert(error.response.data.error);
        } else {
          alert('Failed to delete transaction. Please try again later.');
        }
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Format currency
  const formatCurrency = (amount) => {
    return parseFloat(amount).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  };

  // Get transaction type color and icon
  const getTransactionTypeInfo = (type) => {
    switch (type) {
      case 'deposit':
        return { 
          color: darkMode ? 'text-green-400' : 'text-green-600',
          bgColor: darkMode ? 'bg-green-900' : 'bg-green-100',
          label: 'Deposit'
        };
      case 'withdrawal':
        return { 
          color: darkMode ? 'text-red-400' : 'text-red-600',
          bgColor: darkMode ? 'bg-red-900' : 'bg-red-100',
          label: 'Withdrawal'
        };
      case 'payment':
        return { 
          color: darkMode ? 'text-red-400' : 'text-red-600',
          bgColor: darkMode ? 'bg-red-900' : 'bg-red-100',
          label: 'Payment'
        };
      case 'refund':
        return { 
          color: darkMode ? 'text-green-400' : 'text-green-600',
          bgColor: darkMode ? 'bg-green-900' : 'bg-green-100',
          label: 'Refund'
        };
      default:
        return { 
          color: darkMode ? 'text-blue-400' : 'text-blue-600',
          bgColor: darkMode ? 'bg-blue-900' : 'bg-blue-100',
          label: 'Transaction'
        };
    }
  };

  return (
    <div className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} min-h-screen`}>
      <div className="max-w-5xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate('/clients/soldes')}
          className={`flex items-center mb-6 text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
        >
          <FaArrowLeft className="mr-2" />
          Back to Client Balances
        </button>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Client Balance Details
          </h1>
          
          <button
            onClick={() => navigate(`/clients/solde/${clientId}/add`)}
            className="mt-3 sm:mt-0 flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            <FaPlus className="mr-2" />
            Add Transaction
          </button>
        </div>
        
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {error && (
          <div className={`${darkMode ? 'bg-red-900 border-red-700 text-red-100' : 'bg-red-100 border-red-500 text-red-700'} border-l-4 p-4 mb-6 rounded-md shadow-sm`}>
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
        
        {!loading && !error && clientSolde && (
          <>
            {/* Client info and balance card */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 mb-6`}>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <div>
                  <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {clientSolde.client_name}
                  </h2>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Client ID: {clientSolde.client_id}
                  </p>
                </div>
                
                <div className={`mt-4 md:mt-0 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 text-center`}>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Current Balance</p>
                  <p className={`text-2xl font-bold ${
                    parseFloat(clientSolde.total_solde) > 0 
                      ? 'text-green-500' 
                      : parseFloat(clientSolde.total_solde) < 0 
                        ? 'text-red-500' 
                        : darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formatCurrency(clientSolde.total_solde)}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                    Last updated: {formatDate(clientSolde.last_updated)}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Transaction history */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden`}>
              <div className={`px-6 py-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Transaction History</h3>
              </div>
              
              {clientSolde.history && clientSolde.history.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                      <tr>
                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                          Date
                        </th>
                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                          Type
                        </th>
                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                          Amount
                        </th>
                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                          Reference
                        </th>
                        <th scope="col" className={`px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`${darkMode ? 'divide-y divide-gray-600' : 'divide-y divide-gray-200'}`}>
                      {clientSolde.history.map((transaction) => {
                        const typeInfo = getTransactionTypeInfo(transaction.operation_type);
                        
                        return (
                          <tr key={transaction.id} className={darkMode ? 'bg-gray-800' : 'bg-white'}>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              {formatDate(transaction.transaction_date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.bgColor} ${typeInfo.color}`}>
                                {typeInfo.label}
                              </span>
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                              ['deposit', 'refund'].includes(transaction.operation_type)
                                ? 'text-green-500'
                                : 'text-red-500'
                            }`}>
                              {['deposit', 'refund'].includes(transaction.operation_type) ? '+' : '-'}
                              {formatCurrency(transaction.amount)}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              {transaction.reference || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                              <button
                                onClick={() => handleDeleteClick(transaction)}
                                className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-100 hover:bg-red-200'}`}
                                title="Delete Transaction"
                              >
                                <FaTrash className={darkMode ? 'text-red-400' : 'text-red-600'} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <FaMoneyBillWave className={`h-12 w-12 ${darkMode ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-3`} />
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No transaction history found.</p>
                  <button
                    onClick={() => navigate(`/clients/solde/${clientId}/add`)}
                    className="mt-3 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                  >
                    <FaPlus className="mr-2" />
                    Add First Transaction
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full`}>
            <div className="p-6">
              <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                Confirm Deletion
              </h3>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                Are you sure you want to delete this transaction? This will update the client's balance and cannot be undone.
              </p>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className={`px-4 py-2 rounded-md ${
                    darkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center"
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                      Processing...
                    </>
                  ) : (
                    <>Delete</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
