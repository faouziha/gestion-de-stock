import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useTheme } from '../../../context/ThemeContext'
import { FaArrowLeft, FaEdit, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaFileAlt } from 'react-icons/fa'

export default function ViewClient() {
  const { id } = useParams()
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { darkMode } = useTheme()

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`http://localhost:3000/clients/${id}?userId=${user.id}`)
        setClient(response.data)
        setError(null)
      } catch (error) {
        console.error('Error fetching client data:', error)
        if (error.response && error.response.data && error.response.data.error) {
          setError(error.response.data.error)
        } else {
          setError('Failed to load client data. Please try again later.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchClientData()
  }, [id, user.id])

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'} min-h-screen`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
          <h1 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Client Details</h1>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => navigate('/clients')}
              className={`w-full sm:w-auto ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} px-4 py-2 rounded-md transition-colors flex items-center justify-center flex-1 sm:flex-none`}
            >
              <FaArrowLeft className="mr-2" />
              Back to Clients
            </button>
            <button
              onClick={() => navigate(`/clients/edit/${id}`)}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center flex-1 sm:flex-none"
            >
              <FaEdit className="mr-2" />
              Edit Client
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
        
        {!loading && !error && client && (
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg rounded-lg overflow-hidden`}>
            <div className="p-4 sm:p-6">
              <div className={`flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 pb-4 border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <div className="mb-3 sm:mb-0">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                      <FaUser className={darkMode ? 'text-gray-300' : 'text-gray-500'} />
                    </div>
                    <div className="ml-3">
                      <h2 className={`text-lg sm:text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {client.nom} {client.prenom}
                      </h2>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'} mt-1`}>
                        Client since {formatDate(client.date_creation)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className={`text-base sm:text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'} mb-3`}>Contact Information</h3>
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} p-4 rounded-md`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {client.email && (
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1 flex items-center`}>
                          <FaEnvelope className="mr-1" /> Email
                        </p>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'} break-all`}>{client.email}</p>
                      </div>
                    )}
                    
                    {client.telephone && (
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1 flex items-center`}>
                          <FaPhone className="mr-1" /> Phone
                        </p>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{client.telephone}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className={`text-base sm:text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'} mb-3`}>
                  <FaMapMarkerAlt className="inline mr-2" /> Address Information
                </h3>
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} p-4 rounded-md`}>
                  <div className="grid grid-cols-1 gap-4">
                    {client.adresse && (
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Address</p>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'} break-words`}>{client.adresse}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {client.ville && (
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>City</p>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{client.ville}</p>
                        </div>
                      )}
                      
                      {client.code_postal && (
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Postal Code</p>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{client.code_postal}</p>
                        </div>
                      )}
                      
                      {client.pays && (
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Country</p>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{client.pays}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {client.notes && (
                <div className="mb-6">
                  <h3 className={`text-base sm:text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'} mb-3`}>
                    <FaFileAlt className="inline mr-2" /> Notes
                  </h3>
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} p-4 rounded-md`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} whitespace-pre-line break-words`}>
                      {client.notes}
                    </p>
                  </div>
                </div>
              )}
              
              
            </div>
          </div>
        )}
        
        {!loading && !client && !error && (
          <div className={`${darkMode ? 'bg-yellow-900 border-yellow-700 text-yellow-100' : 'bg-yellow-100 border-yellow-500 text-yellow-700'} border-l-4 p-4 rounded-md shadow-sm`}>
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className={`h-5 w-5 ${darkMode ? 'text-yellow-300' : 'text-yellow-500'}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">Client not found.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
