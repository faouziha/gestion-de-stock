import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useTheme } from '../../../context/ThemeContext'
import { FaArrowLeft, FaEdit } from 'react-icons/fa'

export default function ViewSupplier() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { darkMode } = useTheme();
    
    const [supplier, setSupplier] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSupplier = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:3000/fournisseur/${id}`);
                setSupplier(response.data);
                setError(null);
            } catch (error) {
                console.error("Error fetching supplier:", error);
                setError("Failed to load supplier data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchSupplier();
    }, [id]);

    return (
        <div className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen transition-colors`}>
            <div className="max-w-3xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
                    <h1 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Supplier Details</h1>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <button
                            onClick={() => navigate('/suppliers')}
                            className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} px-4 py-2 rounded-md transition-colors flex items-center justify-center`}
                        >
                            <FaArrowLeft className="mr-2" />
                            Back to Suppliers
                        </button>
                        <button
                            onClick={() => navigate(`/suppliers/edit/${id}`)}
                            className={`${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center`}
                        >
                            <FaEdit className="mr-2" />
                            Edit
                        </button>
                    </div>
                </div>
                
                {loading && (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                )}
                
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
                
                {!loading && !error && supplier && (
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg overflow-hidden transition-colors`}>
                        <div className={`p-4 sm:p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                Company Information
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
                                <div>
                                    <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Company Name
                                    </h3>
                                    <p className={`mt-1 text-base ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                        {supplier.nom_entreprise || 'N/A'}
                                    </p>
                                </div>
                                
                                <div>
                                    <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Registration Number
                                    </h3>
                                    <p className={`mt-1 text-base ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                        {supplier.num_registre || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                Contact Information
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
                                <div>
                                    <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Email
                                    </h3>
                                    <p className={`mt-1 text-base ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                        {supplier.email || 'N/A'}
                                    </p>
                                </div>
                                
                                <div>
                                    <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Phone Number
                                    </h3>
                                    <p className={`mt-1 text-base ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                        {supplier.tel || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-4 sm:p-6 flex justify-end">
                            <button
                                onClick={() => navigate(`/suppliers/edit/${id}`)}
                                className={`${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white px-4 py-2 rounded-md transition-colors flex items-center`}
                            >
                                <FaEdit className="mr-2" />
                                Edit Supplier
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
