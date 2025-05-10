import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { FaEdit, FaTrash, FaEye, FaPlus, FaFileInvoice, FaSearch } from 'react-icons/fa'
import { useAuth } from '../../../context/AuthContext'
import { useTheme } from '../../../context/ThemeContext'

export default function Facture() {
    const { user } = useAuth()
    const { darkMode } = useTheme()
    const [factures, setFactures] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const navigate = useNavigate()
    
    useEffect(() => {
        getFactures()
    }, [user.id])
    
    const getFactures = async () => {
        try {
            setLoading(true)
            const response = await axios.get(`http://localhost:3000/facture?userId=${user.id}`)
            setFactures(response.data)
            setError(null)
        } catch (error) {
            console.error('Error fetching factures:', error)
            setError("Failed to load invoices. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this invoice?")) {
            try {
                // Pass the user ID as a query parameter for permission checking
                await axios.delete(`http://localhost:3000/facture/${id}?userId=${user.id}`);
                setFactures(factures.filter(facture => facture.id !== id));
                alert("Invoice deleted successfully!");
            } catch (error) {
                console.error("Error deleting invoice:", error);
                alert("Failed to delete invoice. Please try again.");
            }
        }
    };

    // Format date to a more readable format
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    return (
        <div className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen transition-colors`}>
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
                    <h1 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Invoices</h1>
                    
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                placeholder="Search invoices..."
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
                        
                        <Link 
                            to="/factures/add" 
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center w-full sm:w-auto justify-center sm:justify-start"
                        >
                            <FaPlus className="mr-2" />
                            <span>Create New Invoice</span>
                        </Link>
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
                
                {/* Filter invoices based on search term */}
                {(() => {
                    const filteredFactures = factures.filter(facture => {
                        const searchFields = [
                            facture.customer_name,
                            facture.invoice_number?.toString(),
                            facture.id?.toString(),
                            facture.status,
                            facture.total_amount?.toString()
                        ].filter(Boolean).join(' ').toLowerCase();
                        
                        return searchFields.includes(searchTerm.toLowerCase());
                    });
                    
                    if (!loading && filteredFactures.length === 0 && !error) {
                        return (
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 sm:p-8 text-center transition-colors`}>
                        <FaFileInvoice className={`h-12 w-12 sm:h-16 sm:w-16 ${darkMode ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-4`} />
                        <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>No Invoices Found</h3>
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>You haven't created any invoices yet.</p>
                        <Link
                            to="/factures/add"
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <FaPlus className="mr-2" />
                            Create Your First Invoice
                        </Link>
                    </div>
                    );
                    }
                    return null;
                })()}
                
                {/* Display filtered invoices */}
                {(() => {
                    const filteredFactures = factures.filter(facture => {
                        const searchFields = [
                            facture.customer_name,
                            facture.invoice_number?.toString(),
                            facture.id?.toString(),
                            facture.status,
                            facture.total_amount?.toString()
                        ].filter(Boolean).join(' ').toLowerCase();
                        
                        return searchFields.includes(searchTerm.toLowerCase());
                    });
                    
                    if (filteredFactures.length > 0) {
                        return (
                    <div className={`overflow-x-auto ${darkMode ? 'bg-gray-900' : 'bg-white'} shadow-md rounded-lg transition-colors`}>
                        {/* Desktop Table View */}
                        <table className="min-w-full divide-y divide-gray-200 hidden md:table">
                            <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                                <tr>
                                    <th scope="col" className={`px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                        Invoice #
                                    </th>
                                    <th scope="col" className={`px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                        Customer
                                    </th>
                                    <th scope="col" className={`px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                        Date
                                    </th>
                                    <th scope="col" className={`px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                        Amount
                                    </th>
                                    <th scope="col" className={`px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                        Status
                                    </th>
                                    <th scope="col" className={`px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className={`${darkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} transition-colors`}>
                                {filteredFactures.map(facture => (
                                    <tr key={facture.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                            <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                #{facture.invoice_number || facture.id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                            <span className={`${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                                {facture.customer_name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                            <span className={`${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                                {facture.date ? formatDate(facture.date) : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                            <span className={`font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                                                {facture.total_amount ? formatCurrency(facture.total_amount) : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                facture.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                                facture.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                facture.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {facture.status || 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                            <div className="flex justify-center space-x-3">
                                                <button 
                                                    onClick={() => navigate(`/factures/view/${facture.id}`)}
                                                    className="text-indigo-600 hover:text-indigo-900 transition-colors"
                                                    aria-label="View invoice"
                                                >
                                                    <FaEye className="inline mr-1" /> View
                                                </button>
                                                <button 
                                                    onClick={() => navigate(`/factures/edit/${facture.id}`)}
                                                    className="text-blue-600 hover:text-blue-900 transition-colors"
                                                    aria-label="Edit invoice"
                                                >
                                                    <FaEdit className="inline mr-1" /> Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(facture.id)} 
                                                    className="text-red-600 hover:text-red-900 transition-colors"
                                                    aria-label="Delete invoice"
                                                >
                                                    <FaTrash className="inline mr-1" /> Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {/* Mobile Card View */}
                        <div className="md:hidden grid gap-4">
                            {factures.map(facture => (
                                <div key={facture.id} className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg overflow-hidden shadow-sm transition-colors`}>
                                    <div className="px-4 py-3 flex items-center justify-between">
                                        <div>
                                            <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                #{facture.invoice_number || facture.id}
                                            </h3>
                                            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                                {facture.customer_name}
                                            </p>
                                        </div>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            facture.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                            facture.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                            facture.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {facture.status || 'Draft'}
                                        </span>
                                    </div>
                                    
                                    <div className={`px-4 py-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase font-semibold`}>Date</p>
                                                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {facture.date ? formatDate(facture.date) : 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase font-semibold`}>Amount</p>
                                                <p className={`text-sm font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                                                    {facture.total_amount ? formatCurrency(facture.total_amount) : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="px-4 py-3 flex justify-between border-t border-gray-200">
                                        <button 
                                            onClick={() => navigate(`/factures/view/${facture.id}`)}
                                            className="text-indigo-600 hover:text-indigo-900 transition-colors flex items-center"
                                            aria-label="View invoice"
                                        >
                                            <FaEye className="mr-1" /> View
                                        </button>
                                        <button 
                                            onClick={() => navigate(`/factures/edit/${facture.id}`)}
                                            className="text-blue-600 hover:text-blue-900 transition-colors flex items-center"
                                            aria-label="Edit invoice"
                                        >
                                            <FaEdit className="mr-1" /> Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(facture.id)} 
                                            className="text-red-600 hover:text-red-900 transition-colors flex items-center"
                                            aria-label="Delete invoice"
                                        >
                                            <FaTrash className="mr-1" /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    );
                    }
                    return null;
                })()}            
            </div>
        </div>
    )
}
