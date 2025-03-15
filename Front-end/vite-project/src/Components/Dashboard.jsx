import React from 'react'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="p-8 w-full">
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-100 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-blue-800">Products</h2>
          <p className="text-3xl font-bold mt-2">0</p>
          <p className="text-sm text-blue-600 mt-1">Total products in inventory</p>
        </div>
        
        <div className="bg-green-100 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-green-800">Orders</h2>
          <p className="text-3xl font-bold mt-2">0</p>
          <p className="text-sm text-green-600 mt-1">Total orders</p>
        </div>
        
        <div className="bg-yellow-100 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-yellow-800">Suppliers</h2>
          <p className="text-3xl font-bold mt-2">0</p>
          <p className="text-sm text-yellow-600 mt-1">Active suppliers</p>
        </div>
        
        <div className="bg-purple-100 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-purple-800">Clients</h2>
          <p className="text-3xl font-bold mt-2">0</p>
          <p className="text-sm text-purple-600 mt-1">Registered clients</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <p className="text-gray-500">No recent activity to display.</p>
      </div>
    </div>
  )
}
