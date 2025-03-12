import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const navigate = useNavigate()

  // Function to handle logout
  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // Update state and redirect
    setIsLoggedIn(false)
    navigate('/Login')
  }

  // Check if user is logged in on component mount and when localStorage changes
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token')
      setIsLoggedIn(!!token)
    }
    
    // Check initial login status
    checkLoginStatus()
    
    // Set up event listener for storage changes (in case user logs in/out in another tab)
    window.addEventListener('storage', checkLoginStatus)
    
    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('storage', checkLoginStatus)
    }
  }, [])

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
              
              {isLoggedIn ? (
                <button 
                  onClick={handleLogout} 
                  className="text-black bg-red-500 border border-black rounded-full px-4 py-2 hover:text-black hover:bg-red-400 font-medium transition-colors"
                >
                  Logout
                </button>
              ) : (
                <Link 
                  to={"/Login"} 
                  className="text-black border border-white rounded-full px-4 py-2 hover:text-black hover:bg-white font-medium transition-colors"
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        </div>
      </div>
    </>
  )
}