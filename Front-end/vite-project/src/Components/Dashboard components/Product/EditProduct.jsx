import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
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
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch the product data when the component mounts
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setFetchLoading(true);
                const response = await axios.get(`http://localhost:3000/produit/${id}`);
                
                // Check if the product belongs to the current user
                if (response.data.user_id !== user.id) {
                    setError("You don't have permission to edit this product");
                    return;
                }
                
                // Set the form data with the product details
                setFormData({
                    nom: response.data.nom || '',
                    description: response.data.description || '',
                    image: response.data.image || '',
                    total: response.data.total || '',
                    serial_num: response.data.serial_num || '',
                    fournisseur_id: response.data.fournisseur_id || '',
                    prix: response.data.prix || '',
                    user_id: response.data.user_id
                });
                setError(null);
            } catch (error) {
                console.error("Error fetching product:", error);
                setError("Failed to load product details. Please try again.");
            } finally {
                setFetchLoading(false);
            }
        };

        fetchProduct();
    }, [id, user.id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const updateProduct = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            // Ensure the user_id is set to the current user's ID
            const productData = {
                ...formData,
                user_id: user.id
            };
            
            await axios.put(`http://localhost:3000/produit/${id}`, productData);
            alert('Product updated successfully!');
            navigate('/displayProduct');
        } catch (error) {
            console.error("Error updating product:", error);
            setError('Failed to update product. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <div className="p-8 w-full flex justify-center items-center">
                <p>Loading product details...</p>
            </div>
        );
    }

    return (
        <div className="p-8 w-full">
            <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}
            
            <form onSubmit={updateProduct} className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nom">
                            Product Name
                        </label>
                        <input 
                            type="text" 
                            id="nom"
                            name="nom"
                            value={formData.nom}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                            placeholder="Product Name" 
                            required
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="prix">
                            Price
                        </label>
                        <input 
                            type="number" 
                            id="prix"
                            name="prix"
                            value={formData.prix}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                            placeholder="Product Price" 
                            required
                        />
                    </div>
                    
                    <div className="mb-4 md:col-span-2">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                            Description
                        </label>
                        <textarea 
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                            placeholder="Product Description"
                            rows="3" 
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image">
                            Image URL
                        </label>
                        <input 
                            type="text" 
                            id="image"
                            name="image"
                            value={formData.image}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                            placeholder="Product Image URL" 
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="total">
                            Quantity
                        </label>
                        <input 
                            type="number" 
                            id="total"
                            name="total"
                            value={formData.total}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                            placeholder="Total Quantity" 
                            required
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="serial_num">
                            Serial Number
                        </label>
                        <input 
                            type="text" 
                            id="serial_num"
                            name="serial_num"
                            value={formData.serial_num}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                            placeholder="Product Serial Number" 
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fournisseur_id">
                            Supplier ID
                        </label>
                        <input 
                            type="number" 
                            id="fournisseur_id"
                            name="fournisseur_id"
                            value={formData.fournisseur_id}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                            placeholder="Supplier ID" 
                            required
                        />
                    </div>
                </div>
                
                <div className="flex items-center justify-end mt-6">
                    <button 
                        type="button" 
                        onClick={() => navigate('/displayProduct')}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        disabled={loading}
                    >
                        {loading ? 'Updating...' : 'Update Product'}
                    </button>
                </div>
            </form>
        </div>
    )
}
