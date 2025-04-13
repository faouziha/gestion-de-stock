import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { FaEdit, FaTrash, FaEye, FaPlus, FaSearch, FaUsers, FaEnvelope, FaPhone, FaUser } from 'react-icons/fa'
import { useAuth } from '../../../context/AuthContext'
import { useTheme } from '../../../context/ThemeContext'
import { useNavigate } from 'react-router-dom'

export default function DisplayClients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [clientToDelete, setClientToDelete] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { user } = useAuth()
  const { darkMode } = useTheme()
  const navigate = useNavigate()

  const fetchClients = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`http://localhost:3000/clients?userId=${user.id}`)
      setClients(response.data)
      setError(null)
    } catch (error) {
      console.error('Error fetching clients:', error)
      setError('Failed to load clients. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [user.id])

  const handleDeleteClick = (client) => {
    setClientToDelete(client)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (clientToDelete) {
      try {
        setDeleteLoading(true)
        await axios.delete(`http://localhost:3000/clients/${clientToDelete.id}?userId=${user.id}`)
        fetchClients() // Refresh the list after deletion
        setShowDeleteModal(false)
      } catch (error) {
        console.error('Error deleting client:', error)
        if (error.response && error.response.data && error.response.data.error) {
          alert(error.response.data.error)
        } else {
          alert('Failed to delete client. Please try again later.')
        }
      } finally {
        setDeleteLoading(false)
      }
    }
  }

  const filteredClients = clients.filter(client => {
    const searchFields = [
      client.nom, 
      client.prenom, 
      client.email, 
      client.telephone, 
      client.ville,
      client.pays
    ].filter(Boolean).join(' ').toLowerCase()
    
    return searchFields.includes(searchTerm.toLowerCase())
  })

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
          <h1 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Clients</h1>
          
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
            
            <button
              onClick={() => navigate('/clients/add')}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center"
            >
              <FaPlus className="mr-2" />
              Add New Client
            </button>
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
        
        {!loading && filteredClients.length === 0 && !error && (
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-md p-6 sm:p-8 text-center`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 sm:h-16 w-12 sm:w-16 ${darkMode ? 'text-gray-500' : 'text-gray-400'} mx-auto mb-4`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>No Clients Found</h3>
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
        
        {filteredClients.length > 0 && (
          <>
            {/* Desktop view - Table */}
            <div className={`hidden md:block overflow-x-auto ${darkMode ? 'bg-gray-700' : 'bg-white'} shadow-md rounded-lg`}>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <tr>
                    <th scope="col" className={`px-4 sm:px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Client
                    </th>
                    <th scope="col" className={`px-4 sm:px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Contact
                    </th>
                    <th scope="col" className={`hidden lg:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Location
                    </th>
                    <th scope="col" className={`hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Date Added
                    </th>
                    <th scope="col" className={`px-4 sm:px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`${darkMode ? 'bg-gray-700 divide-y divide-gray-600' : 'bg-white divide-y divide-gray-200'}`}>
                  {filteredClients.map((client) => (
                    <tr key={client.id} className={`${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50'}`}>
                      <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                            <FaUser className={darkMode ? 'text-gray-300' : 'text-gray-500'} />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium">{client.nom} {client.prenom}</div>
                          </div>
                        </div>
                      </td>
                      <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        {client.email && (
                          <div className="flex items-center">
                            <FaEnvelope className="mr-1" />
                            <span className="truncate max-w-[200px]">{client.email}</span>
                          </div>
                        )}
                        {client.telephone && (
                          <div className="flex items-center mt-1">
                            <FaPhone className="mr-1" />
                            <span>{client.telephone}</span>
                          </div>
                        )}
                      </td>
                      <td className={`hidden lg:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        {client.ville && <span>{client.ville}</span>}
                        {client.ville && client.pays && <span>, </span>}
                        {client.pays && <span>{client.pays}</span>}
                        {!client.ville && !client.pays && <span>N/A</span>}
                      </td>
                      <td className={`hidden sm:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        {formatDate(client.date_creation)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                        <div className="flex justify-center space-x-3">
                          <button
                            onClick={() => navigate(`/clients/view/${client.id}`)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors"
                            aria-label="View client"
                          >
                            <FaEye className="inline mr-1" /> View
                          </button>
                          <button
                            onClick={() => navigate(`/clients/edit/${client.id}`)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            aria-label="Edit client"
                          >
                            <FaEdit className="inline mr-1" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(client)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            aria-label="Delete client"
                          >
                            <FaTrash className="inline mr-1" /> Delete
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
              {filteredClients.map((client) => (
                <div key={client.id} className={`${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-md overflow-hidden`}>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                          <FaUser className={darkMode ? 'text-gray-300' : 'text-gray-500'} />
                        </div>
                        <div className="ml-3">
                          <h3 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {client.nom} {client.prenom}
                          </h3>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Added: {formatDate(client.date_creation)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'} mb-3`}>
                      {client.email && (
                        <div className="flex items-center mb-1">
                          <FaEnvelope className="mr-2 flex-shrink-0" />
                          <span className="truncate">{client.email}</span>
                        </div>
                      )}
                      {client.telephone && (
                        <div className="flex items-center mb-1">
                          <FaPhone className="mr-2 flex-shrink-0" />
                          <span>{client.telephone}</span>
                        </div>
                      )}
                      {(client.ville || client.pays) && (
                        <div className="flex items-start mb-1">
                          <FaUsers className="mr-2 mt-0.5 flex-shrink-0" />
                          <span>
                            {client.ville && client.ville}
                            {client.ville && client.pays && ', '}
                            {client.pays && client.pays}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between border-t pt-3 mt-3 border-gray-200 dark:border-gray-600">
                      <button
                        onClick={() => navigate(`/clients/view/${client.id}`)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors flex items-center"
                        aria-label="View client"
                      >
                        <FaEye className="mr-1" /> View
                      </button>
                      <button
                        onClick={() => navigate(`/clients/edit/${client.id}`)}
                        className="text-blue-600 hover:text-blue-900 transition-colors flex items-center"
                        aria-label="Edit client"
                      >
                        <FaEdit className="mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(client)}
                        className="text-red-600 hover:text-red-900 transition-colors flex items-center"
                        aria-label="Delete client"
                      >
                        <FaTrash className="mr-1" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-md w-full rounded-lg shadow-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} p-6`}>
            <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete the client <span className="font-semibold">{clientToDelete?.nom} {clientToDelete?.prenom}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className={`px-4 py-2 rounded-md ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center"
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
