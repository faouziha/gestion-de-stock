import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function Navbar() {
  

  return (
    <>
    
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to={'/Home'} className="text-2xl font-bold text-Black hover:text-gray-200 transition-colors ml-4">
            Manage
          </Link>

          <nav className="flex items-center space-x-6 mr-10">
            <Link to="/" className="text-black hover:text-gray-200 font-medium transition-colors">Home</Link>
            <Link to="" className="text-black hover:text-gray-200 font-medium transition-colors">Features</Link>
            <Link to="" className="text-black hover:text-gray-200 font-medium transition-colors">Solutions</Link>
            <Link to="" className="text-black hover:text-gray-200 font-medium transition-colors">Pricing</Link>
            <Link to={"/Login"} className="text-black border border-white rounded-full px-4 py-2 hover:text-black hover:bg-white font-medium transition-colors">Login</Link>
          </nav>
        </div>
      </div>
    </div>
    </>
  )
}