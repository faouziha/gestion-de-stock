import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { FaEdit, FaTrash } from 'react-icons/fa'
import { useAuth } from '../../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function DisplayProduct() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth();
  const navigate = useNavigate();

  const getProduct = async () => {
    try {
      setLoading(true)
      // Pass the user ID as a query parameter to fetch only this user's products
      const response = await axios.get(`http://localhost:3000/produit?userId=${user.id}`)
      setProducts(response.data)
      setError(null)
    } catch (error) {
      console.log(error)
      setError('Failed to load products. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (id) => {
    navigate(`/products/edit/${id}`);
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        // Pass the user ID as a query parameter for permission checking
        await axios.delete(`http://localhost:3000/produit/${id}?userId=${user.id}`)
        // Refresh the product list after deletion
        getProduct()
      } catch (error) {
        console.error('Error deleting product:', error)
        alert('Failed to delete product. Please try again.')
      }
    }
  }

  useEffect(() => {
    getProduct()
  }, [user.id]) // Re-fetch when user ID changes

  return (
    <div className="p-8 w-full">
      <h1 className="text-2xl font-bold mb-6">Products</h1>
      
      {loading && <p>Loading products...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product.id} className="border rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold">{product.nom}</h2>
            <p className="text-black mt-2">{product.description}</p>
            <p className="text-blue-600 font-bold mt-2">${product.prix}</p>
            
            {/* Action buttons */}
            <div className="flex justify-end mt-4 space-x-2">
              <button 
                onClick={() => handleEdit(product.id)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md flex items-center"
              >
                <FaEdit className="mr-1" /> Edit
              </button>
              <button 
                onClick={() => handleDelete(product.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md flex items-center"
              >
                <FaTrash className="mr-1" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {!loading && products.length === 0 && !error && (
        <p>No products found. Click on "Add New Product" to create your first product.</p>
      )}
    </div>
  )
}
