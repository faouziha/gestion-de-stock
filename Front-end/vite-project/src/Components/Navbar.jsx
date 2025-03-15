import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FaUser, FaCaretDown } from 'react-icons/fa'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Function to handle logout
  const handleLogout = () => {
    // Use the logout function from context
    logout()
    
    // Close dropdown and redirect
    setDropdownOpen(false)
    navigate('/Login')
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Check if user is admin
  const isAdmin = user && user.email === 'fhaourigui1@gmail.com'

  return (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Link to={'/'} className="text-2xl font-bold text-Black hover:text-gray-200 transition-colors ml-4">
              Manage
            </Link>

            <nav className="flex items-center space-x-6 mr-10">
              <Link to="/" className="text-black hover:text-gray-200 font-medium transition-colors">Home</Link>
              <Link to="" className="text-black hover:text-gray-200 font-medium transition-colors">Features</Link>
              <Link to="" className="text-black hover:text-gray-200 font-medium transition-colors">Solutions</Link>
              <Link to="" className="text-black hover:text-gray-200 font-medium transition-colors">Pricing</Link>
              
              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-1 text-black bg-gray-200 rounded-full px-4 py-2 hover:bg-gray-300 font-medium transition-colors"
                  >
                    <FaUser />
                    <span className="ml-2">{user?.name || 'User'}</span>
                    <FaCaretDown />
                  </button>
                  
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1">
                      <Link 
                        to="/dashboard" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>
                      
                      <Link 
                        to="/profile" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                      
                      {isAdmin && (
                        <Link 
                          to="/admin" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Admin Panel
                        </Link>
                      )}
                      
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
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