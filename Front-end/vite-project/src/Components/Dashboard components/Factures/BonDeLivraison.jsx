import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { FaTrash, FaEye, FaFileDownload } from 'react-icons/fa';
import { useTheme } from '../../../context/ThemeContext';

const BonDeLivraison = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [blList, setBlList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");

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

  return (
    <div className={`p-4 md:p-8 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
      <h1 className="text-2xl font-bold mb-6">Bon de Livraison</h1>
      
      {deleteMessage && (
        <div className={`mb-4 p-2 rounded ${deleteMessage.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {deleteMessage}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="p-2 bg-red-100 text-red-700 rounded mb-4">{error}</div>
      ) : blList.length === 0 ? (
        <div className="p-2 bg-yellow-100 text-yellow-700 rounded">No Bon de Livraison found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-600 bg-gray-800' : 'divide-gray-200 bg-white'} rounded shadow`}>
            <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-100'}>
              <tr>
                <th className="px-4 py-2 text-left">BL Number</th>
                <th className="px-4 py-2 text-left">Order ID</th>
                <th className="px-4 py-2 text-left">Client</th>
                <th className="px-4 py-2 text-left">Reference</th>
                <th className="px-4 py-2 text-right">Total</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className={darkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'}>
              {blList.map((bl) => (
                <tr key={bl.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                  <td className="px-4 py-2 font-medium">{bl.bl_number}</td>
                  <td className="px-4 py-2">{bl.order_id}</td>
                  <td className="px-4 py-2">{bl.client_name || 'N/A'}</td>
                  <td className="px-4 py-2">{bl.reference || 'N/A'}</td>
                  <td className="px-4 py-2 text-right font-medium">${parseFloat(bl.total || 0).toFixed(2)}</td>
                  <td className="px-4 py-2">{formatDate(bl.date_created)}</td>
                  <td className="px-4 py-2 text-center space-x-2">
                    <button 
                      className="p-1 text-red-500 hover:text-red-700" 
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
      )}
    </div>
  );
};

export default BonDeLivraison;
