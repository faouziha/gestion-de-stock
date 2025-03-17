import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'

export default function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
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
                setError("Failed to load product details. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        
        fetchProduct();
    }, [id, user.id, user.role]);

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
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Edit Product</h1>
                    <button
                        onClick={() => navigate('/displayProduct')}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition-colors flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Back to Products
                    </button>
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
                
                {!loading && !error && (
                    <form onSubmit={updateProduct} className="bg-white shadow-lg rounded-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="mb-6">
                                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                                    Product Name <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    id="nom"
                                    name="nom"
                                    value={formData.nom}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm" 
                                    placeholder="Enter product name" 
                                    required
                                />
                                <p className="mt-1 text-xs text-gray-500">Enter the name of your product</p>
                            </div>
                            
                            <div className="mb-6">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea 
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm" 
                                    placeholder="Enter product description"
                                    rows="3" 
                                />
                                <p className="mt-1 text-xs text-gray-500">Provide a detailed description of your product</p>
                            </div>
                            
                            <div className="mb-6">
                                <label htmlFor="prix" className="block text-sm font-medium text-gray-700 mb-2">
                                    Price <span className="text-red-500">*</span>
                                </label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">$</span>
                                    </div>
                                    <input 
                                        type="number" 
                                        id="prix"
                                        name="prix"
                                        value={formData.prix}
                                        onChange={handleChange}
                                        className="w-full pl-7 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                                        placeholder="0.00" 
                                        step="0.01"
                                        min="0"
                                        required
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">Enter the price of your product</p>
                            </div>
                            
                            <div className="mb-6">
                                <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-2">
                                    Product Photo
                                </label>
                                {photoPreview && (
                                    <div className="mb-2">
                                        <img 
                                            src={photoPreview} 
                                            alt="Current product" 
                                            className="h-40 object-cover rounded-md"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Current image</p>
                                    </div>
                                )}
                                <input 
                                    type="file" 
                                    id="photo"
                                    name="photo"
                                    onChange={handlePhotoChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm" 
                                    accept="image/*"
                                />
                                <p className="mt-1 text-xs text-gray-500">Upload a new image to replace the current one (max 5MB)</p>
                            </div>
                            
                            <div className="mb-6">
                                <label htmlFor="total" className="block text-sm font-medium text-gray-700 mb-2">
                                    Quantity <span className="text-red-500">*</span>
                                </label>
                                <div className="relative rounded-md shadow-sm">
                                    <input 
                                        type="number" 
                                        id="total"
                                        name="total"
                                        value={formData.total}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                                        placeholder="Enter quantity" 
                                        min="0"
                                        required
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <span className="text-gray-400 sm:text-sm">units</span>
                                    </div>
                                </div>
                                <p className="mt-1 text-xs text-gray-500">Enter the available quantity of your product</p>
                            </div>
                            
                            <div className="mb-6">
                                <label htmlFor="serial_num" className="block text-sm font-medium text-gray-700 mb-2">
                                    Serial Number
                                </label>
                                <input 
                                    type="text" 
                                    id="serial_num"
                                    name="serial_num"
                                    value={formData.serial_num}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm" 
                                    placeholder="Enter serial number" 
                                />
                                <p className="mt-1 text-xs text-gray-500">Enter the serial number of your product (optional)</p>
                            </div>
                            
                            <div className="mb-6">
                                <label htmlFor="fournisseur_id" className="block text-sm font-medium text-gray-700 mb-2">
                                    Supplier ID <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="number" 
                                    id="fournisseur_id"
                                    name="fournisseur_id"
                                    value={formData.fournisseur_id}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm" 
                                    placeholder="Enter supplier ID" 
                                    min="1"
                                    required
                                />
                                <p className="mt-1 text-xs text-gray-500">Enter the ID of the supplier for this product</p>
                            </div>
                        </div>
                        
                        <div className="px-6 py-4 bg-gray-50 text-right">
                            <button
                                type="button"
                                onClick={() => navigate('/displayProduct')}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md mr-2 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
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
