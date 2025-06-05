import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye, FaSearch, FaUsers, FaMoneyBillWave, FaPlus } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

export default function DisplayClientSoldes() {
  const [clientSoldes, setClientSoldes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const fetchClientSoldes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/clients/soldes/all?userId=${user.id}`);
      setClientSoldes(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching client balances:', error);
      setError('Failed to load client balances. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientSoldes();
  }, [user.id]);

  const filteredClientSoldes = clientSoldes.filter(client => {
    const searchFields = [
      client.nom,
      client.prenom,
      client.client_name,
      client.telephone,
      client.email
    ].filter(Boolean).join(' ').toLowerCase();
    
    return searchFields.includes(searchTerm.toLowerCase());
  });

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format currency
  const formatCurrency = (amount) => {
    return parseFloat(amount).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  };

  return (
    <div className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
          <h1 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Client Balances</h1>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-md border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 placeholder-gray-500'
                }`}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FaSearch />
              </div>
            </div>
          </div>
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
        
        {!loading && filteredClientSoldes.length === 0 && !error && (
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-md p-6 sm:p-8 text-center`}>
            <FaMoneyBillWave className={`h-12 sm:h-16 w-12 sm:w-16 ${darkMode ? 'text-gray-500' : 'text-gray-400'} mx-auto mb-4`} />
            <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>No Client Balances Found</h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-500'} mb-4`}>
              {searchTerm ? 'No clients match your search criteria' : 'You haven\'t added any clients yet.'}
            </p>
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm('')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear Search
              </button>
            ) : (
              <button
                onClick={() => navigate('/clients/add')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaPlus className="mr-2" />
                Add Your First Client
              </button>
            )}
          </div>
        )}
        
        {filteredClientSoldes.length > 0 && (
          <>
            {/* Desktop view - Table */}
            <div className={`hidden md:block w-full overflow-x-auto ${darkMode ? 'bg-gray-700' : 'bg-white'} shadow-md rounded-lg`}>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <tr>
                    <th scope="col" className={`px-4 sm:px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Client
                    </th>
                    <th scope="col" className={`px-4 sm:px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Contact
                    </th>
                    <th scope="col" className={`px-4 sm:px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Balance
                    </th>
                    <th scope="col" className={`hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Last Updated
                    </th>
                    <th scope="col" className={`px-4 sm:px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`${darkMode ? 'bg-gray-700 divide-y divide-gray-600' : 'bg-white divide-y divide-gray-200'}`}>
                  {filteredClientSoldes.map((client) => (
                    <tr key={client.id} className={`${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50'}`}>
                      <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                            <FaUsers className={darkMode ? 'text-gray-300' : 'text-gray-500'} />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium">{client.client_name || `${client.nom || ''} ${client.prenom || ''}`.trim()}</div>
                          </div>
                        </div>
                      </td>
                      <td className={`px-4 sm:px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`} style={{maxWidth: '180px'}}>
                        <div>
                          {client.email && (
                            <div className="flex items-center" title={client.email}>
                              <FaEye className="mr-2 flex-shrink-0" />
                              <div className="truncate overflow-hidden">
                                {client.email}
                              </div>
                            </div>
                          )}
                          {client.telephone && (
                            <div className="flex items-center mt-1" title={client.telephone}>
                              <FaEye className="mr-2 flex-shrink-0" />
                              <div className="truncate overflow-hidden">
                                {client.telephone}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm ${
                        parseFloat(client.total_solde) > 0 
                          ? 'text-green-500 font-semibold' 
                          : parseFloat(client.total_solde) < 0 
                            ? 'text-red-500 font-semibold' 
                            : darkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        {formatCurrency(client.total_solde || 0)}
                      </td>
                      <td className={`hidden sm:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        {formatDate(client.last_updated)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => navigate(`/clients/solde/${client.id}`)}
                            className={`p-2 rounded-full ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-blue-100 hover:bg-blue-200'}`}
                            title="View Balance Details"
                          >
                            <FaEye className={darkMode ? 'text-blue-300' : 'text-blue-600'} />
                          </button>
                          <button
                            onClick={() => navigate(`/clients/solde/${client.id}/add`)}
                            className={`p-2 rounded-full ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-green-100 hover:bg-green-200'}`}
                            title="Add Deposit/Payment"
                          >
                            <FaMoneyBillWave className={darkMode ? 'text-green-300' : 'text-green-600'} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Mobile view - Cards */}
            <div className="md:hidden space-y-4">
              {filteredClientSoldes.map((client) => (
                <div key={client.id} className={`${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-md overflow-hidden flex flex-col`}>
                  <div className={`px-4 py-3 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {client.client_name || `${client.nom || ''} ${client.prenom || ''}`.trim()}
                    </h3>
                  </div>
                  
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase font-medium`}>Contact</p>
                        <p className={`mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'} break-all`} title={client.email || client.telephone}>
                          {client.email || client.telephone || 'No contact info'}
                        </p>
                      </div>
                      
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase font-medium`}>Balance</p>
                        <p className={`mt-1 font-medium ${
                          parseFloat(client.total_solde) > 0 
                            ? 'text-green-500' 
                            : parseFloat(client.total_solde) < 0 
                              ? 'text-red-500' 
                              : darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {formatCurrency(client.total_solde || 0)}
                        </p>
                      </div>
                      
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase font-medium`}>Last Updated</p>
                        <p className={`mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {formatDate(client.last_updated)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-col xs:flex-row gap-2 xs:gap-4 w-full">
                      <button
                        onClick={() => navigate(`/clients/solde/${client.id}`)}
                        className={`flex-1 flex items-center justify-center px-3 py-2 ${
                          darkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-100' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                        } rounded-md text-base min-w-0`}
                      >
                        <FaEye className="mr-2" />
                        Details
                      </button>
                      <button
                        onClick={() => navigate(`/clients/solde/${client.id}/add`)}
                        className={`flex-1 flex items-center justify-center px-3 py-2 ${
                          darkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-100' : 'bg-green-100 hover:bg-green-200 text-green-700'
                        } rounded-md text-base min-w-0`}
                      >
                        <FaMoneyBillWave className="mr-2" />
                        Add Transaction
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
