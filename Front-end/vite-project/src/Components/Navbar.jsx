import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { FaUser, FaCaretDown, FaBars, FaTimes } from 'react-icons/fa'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const { darkMode } = useTheme()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRef = useRef(null)
  const mobileMenuRef = useRef(null)

  // Function to handle logout
  const handleLogout = () => {
    // Use the logout function from context
    logout()
    
    // Close dropdown and redirect
    setDropdownOpen(false)
    setMobileMenuOpen(false)
    navigate('/Login')
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && 
          !event.target.classList.contains('mobile-menu-button')) {
        setMobileMenuOpen(false)
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
      <div className={`fixed top-0 left-0 right-0 z-50 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} shadow-sm transition-colors duration-200`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Link to={'/'} className={`text-2xl font-bold ${darkMode ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-600'} transition-colors`}>
              Manage
            </Link>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <ThemeToggle />
              <button 
                className={`ml-3 mobile-menu-button ${darkMode ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-600'} focus:outline-none`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className={`${darkMode ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-600'} font-medium transition-colors`}>Home</Link>
              <Link to="/features" className={`${darkMode ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-600'} font-medium transition-colors`}>Features</Link>
              <Link to="/solutions" className={`${darkMode ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-600'} font-medium transition-colors`}>Solutions</Link>
              <Link to="/pricing" className={`${darkMode ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-600'} font-medium transition-colors`}>Pricing</Link>
              
              <ThemeToggle />
              
              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`flex items-center space-x-1 rounded-full px-4 py-2 font-medium transition-colors ${
                      darkMode 
                        ? 'text-white bg-gray-700 hover:bg-gray-600' 
                        : 'text-black bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    <FaUser />
                    <span className="ml-2">{user?.name || 'User'}</span>
                    <FaCaretDown />
                  </button>
                  
                  {dropdownOpen && (
                    <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg z-10 py-1 ${
                      darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-700'
                    }`}>
                      <Link 
                        to="/dashboard" 
                        className={`block px-4 py-2 text-sm ${
                          darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                        }`}
                        onClick={() => setDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>
                      
                      <Link 
                        to="/profile" 
                        className={`block px-4 py-2 text-sm ${
                          darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                        }`}
                        onClick={() => setDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                      
                      {isAdmin && (
                        <Link 
                          to="/admin" 
                          className={`block px-4 py-2 text-sm ${
                            darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                          }`}
                          onClick={() => setDropdownOpen(false)}
                        >
                          Admin Panel
                        </Link>
                      )}
                      
                      <button 
                        onClick={handleLogout}
                        className={`block w-full text-left px-4 py-2 text-red-500 ${
                          darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                        }`}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link 
                  to={"/Login"} 
                  className={`border rounded-full px-4 py-2 font-medium transition-colors ${
                    darkMode 
                      ? 'border-gray-600 text-white hover:bg-gray-700' 
                      : 'border-gray-300 text-black hover:bg-gray-100'
                  }`}
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div 
            ref={mobileMenuRef}
            className={`md:hidden border-t py-2 ${
              darkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="container mx-auto px-4 space-y-1">
              <Link 
                to="/" 
                className={`block py-2 px-4 rounded-md ${
                  darkMode 
                    ? 'text-white hover:bg-gray-700' 
                    : 'text-black hover:bg-gray-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/features" 
                className={`block py-2 px-4 rounded-md ${
                  darkMode 
                    ? 'text-white hover:bg-gray-700' 
                    : 'text-black hover:bg-gray-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link 
                to="/solutions" 
                className={`block py-2 px-4 rounded-md ${
                  darkMode 
                    ? 'text-white hover:bg-gray-700' 
                    : 'text-black hover:bg-gray-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Solutions
              </Link>
              <Link 
                to="/pricing" 
                className={`block py-2 px-4 rounded-md ${
                  darkMode 
                    ? 'text-white hover:bg-gray-700' 
                    : 'text-black hover:bg-gray-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              
              {isAuthenticated ? (
                <div className={`border-t pt-2 mt-2 ${
                  darkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className={`px-4 py-2 text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Signed in as <span className={`font-medium ${
                      darkMode ? 'text-white' : 'text-black'
                    }`}>{user?.name || 'User'}</span>
                  </div>
                  
                  <Link 
                    to="/dashboard" 
                    className={`block py-2 px-4 rounded-md ${
                      darkMode 
                        ? 'text-white hover:bg-gray-700' 
                        : 'text-black hover:bg-gray-100'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  
                  <Link 
                    to="/profile" 
                    className={`block py-2 px-4 rounded-md ${
                      darkMode 
                        ? 'text-white hover:bg-gray-700' 
                        : 'text-black hover:bg-gray-100'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  
                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      className={`block py-2 px-4 rounded-md ${
                        darkMode 
                          ? 'text-white hover:bg-gray-700' 
                          : 'text-black hover:bg-gray-100'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  
                  <button 
                    onClick={handleLogout}
                    className={`block w-full text-left py-2 px-4 text-red-500 rounded-md ${
                      darkMode 
                        ? 'hover:bg-gray-700' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="pt-2 px-4">
                  <Link 
                    to="/Login" 
                    className={`block w-full text-center py-2 px-4 rounded-md ${
                      darkMode 
                        ? 'bg-gray-700 text-white hover:bg-gray-600' 
                        : 'bg-gray-100 text-black hover:bg-gray-200'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}