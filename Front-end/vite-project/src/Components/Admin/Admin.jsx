import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FaTrash, FaEye, FaSearch, FaUserShield, FaTimes, FaSave } from 'react-icons/fa';

const Admin = () => {

  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/users', {
        params: { userId: user.id }
      });
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again later.');
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:3000/users/${userId}`, {
        params: { userId: user.id }
      });
      setUsers(users.filter(u => u.id !== userId));
      setConfirmDelete(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user. Please try again later.');
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setSelectedRole(user.role || 'user');
    setUpdateSuccess(false);
    setUpdateError(null);
    setShowModal(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || selectedRole === selectedUser.role) return;
    
    try {
      setUpdating(true);
      setUpdateError(null);
      setUpdateSuccess(false);
      
      await axios.put(`http://localhost:3000/users/${selectedUser.id}/role`, {
        role: selectedRole,
        userId: user.id // Admin's user ID for authorization
      });
      
      // Update local state
      const updatedUsers = users.map(u => 
        u.id === selectedUser.id ? { ...u, role: selectedRole } : u
      );
      setUsers(updatedUsers);
      setSelectedUser({ ...selectedUser, role: selectedRole });
      setUpdateSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating user role:', err);
      setUpdateError('Failed to update user role. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`min-h-screen p-4 sm:p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} flex items-center`}>
            <FaUserShield className="mr-2" /> User Management
          </h1>
          
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg ${
                darkMode 
                  ? 'bg-gray-800 text-white border-gray-700 focus:border-blue-500' 
                  : 'bg-white text-gray-800 border-gray-300 focus:border-blue-500'
              } border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
            />
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${darkMode ? 'border-blue-400' : 'border-blue-600'}`}></div>
          </div>
        ) : error ? (
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900' : 'bg-red-100'} text-center`}>
            <p className={darkMode ? 'text-red-200' : 'text-red-700'}>{error}</p>
            <button 
              onClick={fetchUsers}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Desktop view - Table */}
            <div className={`hidden md:block overflow-x-auto rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center">
                        <p className="text-sm text-gray-500">No users found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => (
                      <tr key={user.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-gray-600 font-medium">{user.name?.charAt(0)}{user.last_name?.charAt(0)}</span>
                            </div>
                            <div className="ml-4">
                              <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {user.name} {user.last_name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {user.role || 'User'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            <FaEye className="inline mr-1" /> View
                          </button>
                          <button
                            onClick={() => setConfirmDelete(user)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTrash className="inline mr-1" /> Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile view - Cards */}
            <div className="md:hidden space-y-4">
              {filteredUsers.length === 0 ? (
                <div className={`p-4 rounded-lg text-center ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                  <p className="text-sm text-gray-500">No users found</p>
                </div>
              ) : (
                filteredUsers.map(user => (
                  <div key={user.id} className={`rounded-lg shadow p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center mb-3">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-600 font-medium">{user.name?.charAt(0)}{user.last_name?.charAt(0)}</span>
                      </div>
                      <div className="ml-3">
                        <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {user.name} {user.last_name}
                        </div>
                        <div className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{user.email}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                      <div>
                        <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Role:</span>
                        <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                          {user.role || 'User'}
                        </span>
                      </div>
                      
                      <div>
                        <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Joined:</span>
                        <span className={`ml-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {new Date(user.created_at).toLocaleDateString() || 'Unknown'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="flex-1 py-2 px-3 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center justify-center"
                      >
                        <FaEye className="mr-1" /> View
                      </button>
                      <button
                        onClick={() => setConfirmDelete(user)}
                        className="flex-1 py-2 px-3 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors flex items-center justify-center"
                      >
                        <FaTrash className="mr-1" /> Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* User Details Modal */}
            {showModal && selectedUser && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className={`relative rounded-lg shadow-lg max-w-2xl w-full mx-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 sm:p-6`}>
                  <button
                    onClick={() => setShowModal(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                  
                  <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    User Details
                  </h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Name</p>
                      <p className={`text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedUser.name} {selectedUser.last_name}
                      </p>
                    </div>
                    
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Email</p>
                      <p className={`text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedUser.email}</p>
                    </div>
                    
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Phone</p>
                      <p className={`text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedUser.phone || 'Not provided'}
                      </p>
                    </div>
                    
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Address</p>
                      <p className={`text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedUser.address || 'Not provided'}
                      </p>
                    </div>
                    
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Role</p>
                      <div className="flex items-center space-x-2">
                        <select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${
                            darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                          }`}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          onClick={handleUpdateRole}
                          disabled={updating || selectedRole === selectedUser.role}
                          className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white ${updating ? 'bg-gray-400' : selectedRole === selectedUser.role ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                        >
                          {updating ? 'Saving...' : <FaSave />}
                        </button>
                      </div>
                      {updateSuccess && (
                        <p className="mt-2 text-sm text-green-500">Role updated successfully!</p>
                      )}
                      {updateError && (
                        <p className="mt-2 text-sm text-red-500">{updateError}</p>
                      )}
                    </div>
                    
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Joined</p>
                      <p className={`text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {new Date(selectedUser.created_at).toLocaleDateString() || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => setShowModal(false)}
                      className={`px-4 py-2 rounded-md ${
                        darkMode 
                          ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      }`}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Delete Confirmation Modal */}
            {confirmDelete && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className={`relative rounded-lg shadow-lg max-w-md w-full mx-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 sm:p-6`}>
                  <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Confirm Deletion
                  </h2>
                  
                  <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Are you sure you want to delete the user <span className="font-semibold">{confirmDelete.name} {confirmDelete.last_name}</span>? 
                    This action cannot be undone.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className={`px-4 py-2 rounded-md ${
                        darkMode 
                          ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteUser(confirmDelete.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;