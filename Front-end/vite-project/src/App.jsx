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
import DisplayOrders from './Components/Dashboard components/Orders/DisplayOrders'
import AddOrders from './Components/Dashboard components/Orders/AddOrders'
import EditOrders from './Components/Dashboard components/Orders/EditOrders'
import ViewOrder from './Components/Dashboard components/Orders/ViewOrder'
import DisplaySuppliers from './Components/Dashboard components/Suppliers/DisplaySuppliers'
import AddSupplier from './Components/Dashboard components/Suppliers/AddSupplier'
import EditSupplier from './Components/Dashboard components/Suppliers/EditSupplier'
import ViewSupplier from './Components/Dashboard components/Suppliers/ViewSupplier'
import DisplayClients from './Components/Dashboard components/Clients/DisplayClients'
import AddClient from './Components/Dashboard components/Clients/AddClient'
import EditClient from './Components/Dashboard components/Clients/EditClient'
import ViewClient from './Components/Dashboard components/Clients/ViewClient'
import Features from './Components/Features'
import Solutions from './Components/Solutions'
import Pricing from './Components/Pricing'
import Profile from './Components/User Profile/Profile'
import Facture from './Components/Dashboard components/Factures/Facture'
import AddFactures from './Components/Dashboard components/Factures/AddFactures'
import ViewFacture from './Components/Dashboard components/Factures/ViewFacture'
import EditFacture from './Components/Dashboard components/Factures/EditFacture'
import Admin from './Components/Admin/Admin'
import DisplaySupplierOrders from './Components/Dashboard components/SupplierOrders/DisplaySupplierOrders'
import AddSupplierOrder from './Components/Dashboard components/SupplierOrders/AddSupplierOrder'
import EditSupplierOrder from './Components/Dashboard components/SupplierOrders/EditSupplierOrder'
import ViewSupplierOrder from './Components/Dashboard components/SupplierOrders/ViewSupplierOrder'


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
                {/* Client Routes */}
                <Route path="/clients" element={<DisplayClients />} />
                <Route path="/clients/add" element={<AddClient />} />
                <Route path="/clients/edit/:id" element={<EditClient />} />
                <Route path="/clients/view/:id" element={<ViewClient />} />
                {/*Factures Routes */}
                <Route path="/factures" element={<Facture />} />
                <Route path="/factures/add" element={<AddFactures />} />
                <Route path="/factures/view/:id" element={<ViewFacture />} />
                <Route path="/factures/edit/:id" element={<EditFacture />} />
                {/* Supplier Orders Routes */}
                <Route path="/supplier-orders" element={<DisplaySupplierOrders />} />
                <Route path="/add-supplier-order" element={<AddSupplierOrder />} />
                <Route path="/edit-supplier-order/:id" element={<EditSupplierOrder />} />
                <Route path="/view-supplier-order/:id" element={<ViewSupplierOrder />} />
                {/* Profile Route */}
                <Route path="/profile" element={<Profile />} />
                {/* Admin Route */}
                <Route path="/admin" element={<Admin />} />
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
