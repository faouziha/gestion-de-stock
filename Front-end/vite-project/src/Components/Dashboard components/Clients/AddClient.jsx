import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useTheme } from '../../../context/ThemeContext'
import { FaArrowLeft, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCity, FaGlobe } from 'react-icons/fa'

export default function AddClient() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    ville: '',
    code_postal: '',
    pays: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { darkMode } = useTheme()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.nom.trim()) {
      setError('Client name is required')
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      const clientData = {
        ...formData,
        userId: user.id
      }
      
      await axios.post('http://localhost:3000/clients', clientData)
      navigate('/clients')
    } catch (error) {
      console.error('Error adding client:', error)
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error)
      } else {
        setError('Failed to add client. Please try again later.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`p-4 md:p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      <div className="mb-4 md:mb-6 flex flex-col md:flex-row md:items-center">
        <button
          onClick={() => navigate('/clients')}
          className="mb-2 md:mb-0 mr-0 md:mr-4 text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-xl md:text-2xl font-bold">Add New Client</h1>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Personal Information */}
          <div className={`p-4 md:p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center">
              <FaUser className="mr-2" /> Personal Information
            </h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="nom">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${
                  darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'
                }`}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="prenom">
                First Name
              </label>
              <input
                type="text"
                id="prenom"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${
                  darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'
                }`}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="email">
                <div className="flex items-center">
                  <FaEnvelope className="mr-1" /> Email
                </div>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${
                  darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'
                }`}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="telephone">
                <div className="flex items-center">
                  <FaPhone className="mr-1" /> Phone Number
                </div>
              </label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${
                  darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'
                }`}
              />
            </div>
          </div>

          {/* Address Information */}
          <div className={`p-4 md:p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center">
              <FaMapMarkerAlt className="mr-2" /> Address Information
            </h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="adresse">
                Address
              </label>
              <textarea
                id="adresse"
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
                rows="2"
                className={`w-full p-2 border rounded-md ${
                  darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'
                }`}
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" htmlFor="ville">
                  <div className="flex items-center">
                    <FaCity className="mr-1" /> City
                  </div>
                </label>
                <input
                  type="text"
                  id="ville"
                  name="ville"
                  value={formData.ville}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${
                    darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" htmlFor="code_postal">
                  Postal Code
                </label>
                <input
                  type="text"
                  id="code_postal"
                  name="code_postal"
                  value={formData.code_postal}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${
                    darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="pays">
                <div className="flex items-center">
                  <FaGlobe className="mr-1" /> Country
                </div>
              </label>
              <input
                type="text"
                id="pays"
                name="pays"
                value={formData.pays}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${
                  darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className={`mt-4 md:mt-6 p-4 md:p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h2 className="text-lg md:text-xl font-semibold mb-4">Additional Notes</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="notes">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              className={`w-full p-2 border rounded-md ${
                darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'
              }`}
              placeholder="Add any additional information about this client..."
            ></textarea>
          </div>
        </div>

        {/* Form Actions */}
        <div className="mt-4 md:mt-6 flex flex-col md:flex-row md:justify-end space-y-2 md:space-y-0 md:space-x-4">
          <button
            type="button"
            onClick={() => navigate('/clients')}
            className={`px-4 py-2 rounded-md w-full md:w-auto ${
              darkMode
                ? 'bg-gray-600 hover:bg-gray-700 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md w-full md:w-auto"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></div>
                Adding...
              </div>
            ) : (
              'Add Client'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
