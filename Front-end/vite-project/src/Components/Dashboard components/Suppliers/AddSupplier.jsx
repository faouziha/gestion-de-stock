import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useTheme } from '../../../context/ThemeContext'
import { FaArrowLeft, FaSpinner } from 'react-icons/fa'

export default function AddSupplier() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { darkMode } = useTheme();
    const [formData, setFormData] = useState({
        nom_entreprise: '',
        num_registre: '',
        email: '',
        tel: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const addSupplier = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            // Prepare data with proper type conversion
            const dataToSend = {
                nom_entreprise: formData.nom_entreprise.trim(),
                num_registre: formData.num_registre,
                email: formData.email.trim(),
                tel: formData.tel,
                userId: user.id // Add the user ID to associate the supplier with the current user
            };
            
            // Log the data being sent
            console.log("Sending supplier data:", dataToSend);
            
            // Send the data to the server
            const response = await axios.post('http://localhost:3000/fournisseur', dataToSend);
            
            alert('Supplier added successfully!');
            navigate('/suppliers'); 
        } catch (error) {
            console.error("Error adding supplier:", error);
            
            // More detailed error information
            if (error.response) {
                // The server responded with a status code outside the 2xx range
                console.error("Server response:", error.response.data);
                let errorMessage = 'Failed to add supplier: ';
                
                if (error.response.data.message) {
                    errorMessage += error.response.data.message;
                } else if (error.response.data.detail) {
                    errorMessage += error.response.data.detail;
                } else if (error.response.data.error) {
                    errorMessage += error.response.data.error;
                } else {
                    errorMessage += 'Unknown server error';
                }
                
                setError(errorMessage);
            } else if (error.request) {
                // The request was made but no response was received
                console.error("No response received:", error.request);
                setError('No response from server. Please check your connection and try again.');
            } else {
                // Something happened in setting up the request
                console.error("Request setup error:", error.message);
                setError(`Error setting up request: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen transition-colors`}>
            <div className="max-w-3xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
                    <h1 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Add New Supplier</h1>
                    <button
                        onClick={() => navigate('/suppliers')}
                        className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} px-4 py-2 rounded-md transition-colors flex items-center w-full sm:w-auto justify-center sm:justify-start`}
                    >
                        <FaArrowLeft className="mr-2" />
                        Back to Suppliers
                    </button>
                </div>
                
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm">{error}</p>
                            </div>
                        </div>
                    </div>
                )}
                
                <form onSubmit={addSupplier} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg overflow-hidden transition-colors`}>
                    <div className={`p-4 sm:p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="mb-6">
                            <label htmlFor="nom_entreprise" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                Company Name <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                id="nom_entreprise"
                                name="nom_entreprise"
                                value={formData.nom_entreprise}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-colors`} 
                                placeholder="Enter company name" 
                                required
                            />
                            <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Enter the name of the supplier company</p>
                        </div>
                        
                        <div className="mb-6">
                            <label htmlFor="num_registre" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                Registration Number <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                id="num_registre"
                                name="num_registre"
                                value={formData.num_registre}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-colors`} 
                                placeholder="Enter registration number" 
                                required
                            />
                            <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Company registration or business ID</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label htmlFor="email" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="email" 
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-colors`} 
                                    placeholder="Enter email address" 
                                    required
                                />
                                <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Contact email address</p>
                            </div>
                            
                            <div>
                                <label htmlFor="tel" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="tel" 
                                    id="tel"
                                    name="tel"
                                    value={formData.tel}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-colors`} 
                                    placeholder="Enter phone number" 
                                    required
                                />
                                <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Contact phone number</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/suppliers')}
                            className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} px-4 py-2 rounded-md transition-colors w-full sm:w-auto`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center w-full sm:w-auto`}
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="animate-spin mr-2" />
                                    Adding...
                                </>
                            ) : 'Add Supplier'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
