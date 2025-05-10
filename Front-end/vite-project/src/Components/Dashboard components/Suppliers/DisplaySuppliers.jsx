import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { FaEdit, FaTrash, FaEye, FaPlus, FaSearch } from 'react-icons/fa'
import { useAuth } from '../../../context/AuthContext'
import { useTheme } from '../../../context/ThemeContext'

export default function DisplaySuppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth();
    const { darkMode } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:3000/fournisseur?userId=${user.id}`);
                
                // Now the backend will filter suppliers by user ID
                setSuppliers(response.data);
                setError(null);
            } catch (error) {
                console.error("Error fetching suppliers:", error);
                setError("Failed to load suppliers. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        
        fetchSuppliers();
    }, [user.id]);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this supplier?")) {
            try {
                await axios.delete(`http://localhost:3000/fournisseur/${id}?userId=${user.id}`);
                setSuppliers(suppliers.filter(supplier => supplier.id !== id));
                alert("Supplier deleted successfully!");
            } catch (error) {
                console.error("Error deleting supplier:", error);
                alert("Failed to delete supplier. Please try again.");
            }
        }
    };

    return (
        <div className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen transition-colors`}>
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
                    <h1 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Suppliers</h1>
                    
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                placeholder="Search suppliers..."
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
                            to="/suppliers/add" 
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center w-full sm:w-auto justify-center sm:justify-start"
                        >
                            <FaPlus className="mr-2" />
                            <span>Add New Supplier</span>
                        </Link>
                    </div>
                </div>
                
                {loading && (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
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
                
                {/* Filter suppliers based on search term */}
                {(() => {
                    const filteredSuppliers = suppliers.filter(supplier => {
                        const searchFields = [
                            supplier.nom_entreprise,
                            supplier.contact_nom,
                            supplier.email,
                            supplier.telephone,
                            supplier.adresse
                        ].filter(Boolean).join(' ').toLowerCase();
                        
                        return searchFields.includes(searchTerm.toLowerCase());
                    });
                    
                    if (!loading && filteredSuppliers.length === 0 && !error) {
                        return (
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 sm:p-8 text-center transition-colors`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 sm:h-16 sm:w-16 ${darkMode ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-4`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>No Suppliers Found</h3>
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>You haven't added any suppliers yet.</p>
                        <Link
                            to="/suppliers/add"
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            <FaPlus className="mr-2" />
                            Add Your First Supplier
                        </Link>
                    </div>
                    );
                    }
                    return null;
                })()}
                
                {/* Display filtered suppliers */}
                {(() => {
                    const filteredSuppliers = suppliers.filter(supplier => {
                        const searchFields = [
                            supplier.nom_entreprise,
                            supplier.contact_nom,
                            supplier.email,
                            supplier.telephone,
                            supplier.adresse
                        ].filter(Boolean).join(' ').toLowerCase();
                        
                        return searchFields.includes(searchTerm.toLowerCase());
                    });
                    
                    if (filteredSuppliers.length > 0) {
                        return (
                    <div className={`overflow-x-auto ${darkMode ? 'bg-gray-900' : 'bg-white'} shadow-md rounded-lg transition-colors`}>
                        {/* Desktop Table View */}
                        <table className="min-w-full divide-y divide-gray-200 hidden md:table">
                            <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                                <tr>
                                    <th scope="col" className={`px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                        Company Name
                                    </th>
                                    <th scope="col" className={`px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                        Contact Person
                                    </th>
                                    <th scope="col" className={`px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                        Email
                                    </th>
                                    <th scope="col" className={`px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                        Phone
                                    </th>
                                    <th scope="col" className={`px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                        Address
                                    </th>
                                    <th scope="col" className={`px-6 py-3 text-center text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className={`${darkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} transition-colors`}>
                                {filteredSuppliers.map(supplier => (
                                    <tr key={supplier.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'} text-center`}>
                                            {supplier.nom_entreprise}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'} text-center`}>
                                            {supplier.contact_nom}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'} text-center`}>
                                            {supplier.email}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'} text-center`}>
                                            {supplier.telephone}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'} text-center`}>
                                            {supplier.adresse}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                            <div className="flex justify-center space-x-3">
                                                <button 
                                                    onClick={() => navigate(`/suppliers/view/${supplier.id}`)}
                                                    className="text-indigo-600 hover:text-indigo-900 transition-colors"
                                                    aria-label="View supplier"
                                                >
                                                    <FaEye className="inline mr-1" /> View
                                                </button>
                                                <button 
                                                    onClick={() => navigate(`/suppliers/edit/${supplier.id}`)}
                                                    className="text-blue-600 hover:text-blue-900 transition-colors"
                                                    aria-label="Edit supplier"
                                                >
                                                    <FaEdit className="inline mr-1" /> Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(supplier.id)} 
                                                    className="text-red-600 hover:text-red-900 transition-colors"
                                                    aria-label="Delete supplier"
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
                            {suppliers.map(supplier => (
                                <div key={supplier.id} className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg overflow-hidden shadow-sm transition-colors`}>
                                    <div className="px-4 py-3">
                                        <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{supplier.nom_entreprise}</h3>
                                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Contact: {supplier.contact_nom}</p>
                                    </div>
                                    
                                    <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase font-semibold`}>Email</p>
                                                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{supplier.email}</p>
                                            </div>
                                            <div>
                                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase font-semibold`}>Phone</p>
                                                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{supplier.telephone}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase font-semibold`}>Address</p>
                                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{supplier.adresse}</p>
                                    </div>
                                    
                                    <div className="px-4 py-3 flex justify-between">
                                        <button 
                                            onClick={() => navigate(`/suppliers/view/${supplier.id}`)}
                                            className="text-indigo-600 hover:text-indigo-900 transition-colors flex items-center"
                                            aria-label="View supplier"
                                        >
                                            <FaEye className="mr-1" /> View
                                        </button>
                                        <button 
                                            onClick={() => navigate(`/suppliers/edit/${supplier.id}`)}
                                            className="text-blue-600 hover:text-blue-900 transition-colors flex items-center"
                                            aria-label="Edit supplier"
                                        >
                                            <FaEdit className="mr-1" /> Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(supplier.id)} 
                                            className="text-red-600 hover:text-red-900 transition-colors flex items-center"
                                            aria-label="Delete supplier"
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
    );
}
