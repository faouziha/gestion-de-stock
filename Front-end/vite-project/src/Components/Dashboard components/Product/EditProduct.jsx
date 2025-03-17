import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useTheme } from '../../../context/ThemeContext'
import { FaArrowLeft, FaSpinner } from 'react-icons/fa'

export default function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { darkMode } = useTheme();
    
    const [formData, setFormData] = useState({
        nom: '',
        description: '',
        image: '',
        total: '',
        serial_num: '',
        fournisseur_id: '',
        prix: '',
        user_id: user.id
    });
    const [photoPreview, setPhotoPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [suppliers, setSuppliers] = useState([]);
    const [loadingSuppliers, setLoadingSuppliers] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:3000/produit/${id}`);
                const product = response.data;
                
                // Check if the user has permission to edit this product
                if (user.role !== 'admin' && product.user_id !== user.id) {
                    setError("You don't have permission to edit this product");
                    return;
                }
                
                setFormData({
                    nom: product.nom || '',
                    description: product.description || '',
                    image: product.image || '',
                    total: product.total || '',
                    serial_num: product.serial_num || '',
                    fournisseur_id: product.fournisseur_id || '',
                    prix: product.prix || '',
                    user_id: product.user_id || user.id
                });
                
                // Set image preview if available
                if (product.image) {
                    setPhotoPreview(product.image);
                }
                
                setError(null);
            } catch (error) {
                console.error("Error fetching product:", error);
                setError("Failed to load product data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id, user.id, user.role]);

    // Fetch suppliers when component mounts
    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                setLoadingSuppliers(true);
                const response = await axios.get('http://localhost:3000/fournisseur');
                setSuppliers(response.data);
            } catch (error) {
                console.error("Error fetching suppliers:", error);
                setError("Failed to load suppliers. Please try again later.");
            } finally {
                setLoadingSuppliers(false);
            }
        };

        fetchSuppliers();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handlePhotoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            
            // Check if file is an image
            if (!selectedFile.type.startsWith('image/')) {
                setError('Please select an image file (JPEG, PNG, etc.)');
                return;
            }
            
            // Check file size (max 5MB)
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB');
                return;
            }
            
            // Create a preview
            setPhotoPreview(URL.createObjectURL(selectedFile));
            
            // Convert to Base64
            const reader = new FileReader();
            reader.onloadend = () => {
                // The result attribute contains the data as a Base64 encoded string
                setFormData({
                    ...formData,
                    image: reader.result
                });
            };
            reader.readAsDataURL(selectedFile);
            
            setError(null);
        }
    };

    const updateProduct = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        
        try {
            // Log the data being sent (excluding the full image for brevity)
            console.log("Sending product update data:", {
                ...formData,
                image: formData.image ? `${formData.image.substring(0, 30)}...` : null
            });
            
            // Send the data to the server
            await axios.put(`http://localhost:3000/produit/${id}`, formData);
            
            alert('Product updated successfully!');
            navigate('/displayProduct');
        } catch (error) {
            console.error("Error updating product:", error);
            
            // More detailed error information
            if (error.response) {
                // The server responded with a status code outside the 2xx range
                console.error("Server response:", error.response.data);
                setError(`Failed to update product: ${error.response.data.details || error.response.data.error || 'Unknown server error'}`);
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
            setSubmitting(false);
        }
    };

    return (
        <div className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen transition-colors`}>
            <div className="max-w-3xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
                    <h1 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Edit Product</h1>
                    <button
                        onClick={() => navigate('/displayProduct')}
                        className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} px-4 py-2 rounded-md transition-colors flex items-center w-full sm:w-auto justify-center sm:justify-start`}
                    >
                        <FaArrowLeft className="mr-2" />
                        Back to Products
                    </button>
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
                
                {!loading && !error && (
                    <form onSubmit={updateProduct} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg overflow-hidden transition-colors`}>
                        <div className={`p-4 sm:p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <div className="mb-6">
                                <label htmlFor="nom" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                    Product Name <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    id="nom"
                                    name="nom"
                                    value={formData.nom}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-colors`} 
                                    placeholder="Enter product name" 
                                    required
                                />
                                <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Enter the name of your product</p>
                            </div>
                            
                            <div className="mb-6">
                                <label htmlFor="description" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                    Description
                                </label>
                                <textarea 
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-colors`} 
                                    placeholder="Enter product description"
                                    rows="3" 
                                />
                                <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Provide a detailed description of your product</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label htmlFor="prix" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                        Price <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} sm:text-sm`}>$</span>
                                        </div>
                                        <input 
                                            type="number" 
                                            id="prix"
                                            name="prix"
                                            value={formData.prix}
                                            onChange={handleChange}
                                            className={`w-full pl-7 px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`} 
                                            placeholder="0.00" 
                                            step="0.01"
                                            min="0"
                                            required
                                        />
                                    </div>
                                    <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Enter the price of your product</p>
                                </div>
                                
                                <div>
                                    <label htmlFor="total" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                        Quantity <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <input 
                                            type="number" 
                                            id="total"
                                            name="total"
                                            value={formData.total}
                                            onChange={handleChange}
                                            className={`w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`} 
                                            placeholder="Enter quantity" 
                                            min="0"
                                            required
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-400'} sm:text-sm`}>units</span>
                                        </div>
                                    </div>
                                    <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Enter the available quantity</p>
                                </div>
                            </div>
                            
                            <div className="mb-6">
                                <label htmlFor="photo" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                    Product Photo
                                </label>
                                {photoPreview && (
                                    <div className="mb-2">
                                        <img 
                                            src={photoPreview} 
                                            alt="Current product" 
                                            className="h-40 object-cover rounded-md"
                                        />
                                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Current image</p>
                                    </div>
                                )}
                                <input 
                                    type="file" 
                                    id="photo"
                                    name="photo"
                                    onChange={handlePhotoChange}
                                    className={`w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-colors`} 
                                    accept="image/*"
                                />
                                <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Upload a new image to replace the current one (max 5MB)</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label htmlFor="serial_num" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                        Serial Number
                                    </label>
                                    <input 
                                        type="text" 
                                        id="serial_num"
                                        name="serial_num"
                                        value={formData.serial_num}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-colors`} 
                                        placeholder="Enter serial number" 
                                    />
                                    <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Serial number (optional)</p>
                                </div>
                                
                                <div>
                                    <label htmlFor="fournisseur_id" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                        Supplier <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        {loadingSuppliers ? (
                                            <div className={`flex items-center px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-50 border-gray-300 text-gray-500'} rounded-md transition-colors`}>
                                                <FaSpinner className="animate-spin mr-2" />
                                                <span>Loading suppliers...</span>
                                            </div>
                                        ) : (
                                            <select
                                                id="fournisseur_id"
                                                name="fournisseur_id"
                                                value={formData.fournisseur_id}
                                                onChange={handleChange}
                                                className={`w-full px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm appearance-none transition-colors`}
                                                required
                                            >
                                                <option value="">Select a supplier</option>
                                                {suppliers.map(supplier => (
                                                    <option key={supplier.id} value={supplier.id}>
                                                        {supplier.nom_entreprise}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                            <svg className={`fill-current h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Select the supplier for this product</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className={`px-4 sm:px-6 py-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} flex flex-col sm:flex-row sm:justify-end gap-2 transition-colors`}>
                            <button
                                type="button"
                                onClick={() => navigate('/displayProduct')}
                                className={`${darkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'} px-4 py-2 rounded-md transition-colors w-full sm:w-auto`}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto"
                            >
                                {submitting ? (
                                    <span className="flex items-center justify-center">
                                        <FaSpinner className="animate-spin mr-2" />
                                        Updating...
                                    </span>
                                ) : 'Update Product'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
