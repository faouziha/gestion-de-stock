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
import DisplayOrders from './Components/Dashboard components/Product/Orders/DisplayOrders'
import AddOrders from './Components/Dashboard components/Product/Orders/AddOrders'
import EditOrder from './Components/Dashboard components/Product/Orders/EditOrder'
import ViewOrder from './Components/Dashboard components/Product/Orders/ViewOrder'


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
              {/* Order Routes */}
              <Route path="/orders" element={<DisplayOrders />} />
              <Route path="/orders/add" element={<AddOrders />} />
              <Route path="/orders/edit/:id" element={<EditOrder />} />
              <Route path="/orders/view/:id" element={<ViewOrder />} />
              {/* Add more dashboard routes here */}
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  )
}

export default App
