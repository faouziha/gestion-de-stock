import { useState } from 'react'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './Components/Home'
import Navbar from './Components/Navbar'
import Login from './Components/Login'
import SignUp from './Components/SignUp'
import Dashboard from './Components/Dashboard'
import ProtectedRoute from './Components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import DisplayProduct from './Components/Dashboard components/Product/displayProduct'
import DashboardLayout from './Components/DashboardLayout'
import AddProduct from './Components/Dashboard components/Product/AddProduct'
import EditProduct from './Components/Dashboard components/Product/EditProduct'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/Signup" element={<SignUp />} />
            
            {/* Dashboard Routes with Layout */}
            <Route element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/displayProduct" element={<DisplayProduct />} />
              <Route path="/products/add" element={<AddProduct />} />
              <Route path="/products/edit/:id" element={<EditProduct />} />
              {/* Add more dashboard routes here */}
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  )
}

export default App
