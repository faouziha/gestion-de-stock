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
import { ThemeProvider } from './context/ThemeContext'
import DisplayProduct from './Components/Dashboard components/Product/displayProduct'
import DashboardLayout from './Components/DashboardLayout'
import AddProduct from './Components/Dashboard components/Product/AddProduct'
import EditProduct from './Components/Dashboard components/Product/EditProduct'
import ViewProduct from './Components/Dashboard components/Product/ViewProduct'
import DisplayOrders from './Components/Dashboard components/Product/Orders/DisplayOrders'
import AddOrders from './Components/Dashboard components/Product/Orders/AddOrders'
import EditOrders from './Components/Dashboard components/Product/Orders/EditOrders'
import ViewOrder from './Components/Dashboard components/Product/Orders/ViewOrder'
import DisplaySuppliers from './Components/Dashboard components/Suppliers/DisplaySuppliers'
import AddSupplier from './Components/Dashboard components/Suppliers/AddSupplier'
import EditSupplier from './Components/Dashboard components/Suppliers/EditSupplier'
import ViewSupplier from './Components/Dashboard components/Suppliers/ViewSupplier'
import Features from './Components/Features'
import Solutions from './Components/Solutions'
import Pricing from './Components/Pricing'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/Login" element={<Login />} />
              <Route path="/Signup" element={<SignUp />} />
              <Route path="/features" element={<Features />} />
              <Route path="/solutions" element={<Solutions />} />
              <Route path="/pricing" element={<Pricing />} />
              
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
                <Route path="/products/view/:id" element={<ViewProduct />} />
                {/* Order Routes */}
                <Route path="/orders" element={<DisplayOrders />} />
                <Route path="/orders/add" element={<AddOrders />} />
                <Route path="/orders/edit/:id" element={<EditOrders />} />
                <Route path="/orders/view/:id" element={<ViewOrder />} />
                {/* Supplier Routes */}
                <Route path="/suppliers" element={<DisplaySuppliers />} />
                <Route path="/suppliers/add" element={<AddSupplier />} />
                <Route path="/suppliers/edit/:id" element={<EditSupplier />} />
                <Route path="/suppliers/view/:id" element={<ViewSupplier />} />
                {/* Add more dashboard routes here */}
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </>
  )
}

export default App
