import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { FaTrash, FaEye, FaFileDownload, FaSearch, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useTheme } from '../../../context/ThemeContext';

const BonDeLivraison = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [blList, setBlList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const [sortField, setSortField] = useState("date_created");
  const [sortDirection, setSortDirection] = useState("desc");

  const fetchBL = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`http://localhost:3000/api/bl/list?userId=${user.id}`);
      if (res.data.success) {
        setBlList(res.data.data);
      } else {
        setError(res.data.error || "Failed to fetch Bon de Livraison");
      }
    } catch (err) {
      console.error('Error fetching Bon de Livraison:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchBL();
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Bon de Livraison?')) {
      return;
    }
    
    try {
      setDeleteMessage("");
      const response = await axios.delete(`http://localhost:3000/api/bl/delete/${id}?userId=${user.id}`);
      if (response.data.success) {
        setDeleteMessage("Bon de Livraison deleted successfully!");
        // Refresh the list
        fetchBL();
      } else {
        setDeleteMessage(response.data.error || "Failed to delete Bon de Livraison.");
      }
    } catch (error) {
      console.error('Error deleting BL:', error);
      setDeleteMessage("Error deleting Bon de Livraison: " + (error.response?.data?.error || error.message));
    }
  };

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

  // Sort and filter the BL list
  const sortedAndFilteredBLs = React.useMemo(() => {
    // First filter by search term
    let filteredList = blList;
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      filteredList = blList.filter(bl => 
        (bl.bl_number && bl.bl_number.toLowerCase().includes(lowerCaseSearch)) ||
        (bl.client_name && bl.client_name.toLowerCase().includes(lowerCaseSearch)) ||
        (bl.reference && bl.reference.toLowerCase().includes(lowerCaseSearch))
      );
    }
    
    // Then sort
    return [...filteredList].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Handle numeric fields
      if (sortField === 'total') {
        aValue = parseFloat(aValue || 0);
        bValue = parseFloat(bValue || 0);
      }
      
      // Handle date fields
      if (sortField === 'date_created') {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      }
      
      // Handle string fields
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
      }
      if (typeof bValue === 'string') {
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [blList, searchTerm, sortField, sortDirection]);

  // Handle sort toggle
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Toggle row expansion for mobile view
  const toggleRowExpansion = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // Render sort indicator
  const renderSortIndicator = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <FaChevronUp className="inline ml-1" /> : <FaChevronDown className="inline ml-1" />;
  };

  return (
    <div className={`p-4 md:p-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen transition-colors`}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Bon de Livraison</h1>
        
        {/* Search and filters */}
        <div className="mb-6">
          <div className={`flex flex-col sm:flex-row gap-4 p-4 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by BL number, client or reference..."
                className={`pl-10 pr-4 py-2 w-full rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {deleteMessage && (
          <div className={`mb-4 p-3 rounded-md ${deleteMessage.includes('successfully') ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
            {deleteMessage}
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-100 text-red-700 rounded-md mb-4 border border-red-200">{error}</div>
        ) : sortedAndFilteredBLs.length === 0 ? (
          <div className="p-4 bg-yellow-100 text-yellow-700 rounded-md border border-yellow-200">
            {searchTerm ? 'No matching Bon de Livraison found.' : 'No Bon de Livraison found.'}
          </div>
        ) : (
          <>
            {/* Desktop view - Table */}
            <div className="hidden md:block overflow-x-auto rounded-lg shadow">
              <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-600 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
                <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                  <tr>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('bl_number')}
                    >
                      <span className="flex items-center">BL Number {renderSortIndicator('bl_number')}</span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Order ID</th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('client_name')}
                    >
                      <span className="flex items-center">Client {renderSortIndicator('client_name')}</span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Reference</th>
                    <th 
                      className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('total')}
                    >
                      <span className="flex items-center justify-end">Total {renderSortIndicator('total')}</span>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('date_created')}
                    >
                      <span className="flex items-center">Date {renderSortIndicator('date_created')}</span>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className={darkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'}>
                  {sortedAndFilteredBLs.map((bl) => (
                    <tr key={bl.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-3 whitespace-nowrap font-medium">{bl.bl_number}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{bl.order_id}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{bl.client_name || 'N/A'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{bl.reference || 'N/A'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-right font-medium">${parseFloat(bl.total || 0).toFixed(2)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{formatDate(bl.date_created)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <button 
                          className="p-1.5 text-red-500 hover:text-red-700 transition-colors" 
                          onClick={() => handleDelete(bl.id)}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Mobile view - Cards */}
            <div className="md:hidden space-y-4">
              {sortedAndFilteredBLs.map((bl) => (
                <div 
                  key={bl.id} 
                  className={`rounded-lg shadow overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                >
                  <div 
                    className={`p-4 flex justify-between items-center cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                    onClick={() => toggleRowExpansion(bl.id)}
                  >
                    <div>
                      <div className="font-medium">{bl.bl_number}</div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{bl.client_name || 'N/A'}</div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-right mr-3">
                        <div className="font-medium">${parseFloat(bl.total || 0).toFixed(2)}</div>
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{formatDate(bl.date_created).split(',')[0]}</div>
                      </div>
                      {expandedRow === bl.id ? <FaChevronUp /> : <FaChevronDown />}
                    </div>
                  </div>
                  
                  {expandedRow === bl.id && (
                    <div className={`px-4 pb-4 pt-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Order ID</div>
                          <div>{bl.order_id}</div>
                        </div>
                        <div>
                          <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Reference</div>
                          <div>{bl.reference || 'N/A'}</div>
                        </div>
                        <div>
                          <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Date</div>
                          <div>{formatDate(bl.date_created)}</div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-end">
                        <button 
                          className="p-2 text-red-500 hover:text-red-700" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(bl.id);
                          }}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
      )}
      </div>
    </div>
  );
};

export default BonDeLivraison;
