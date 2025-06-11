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
import BonDeLivraison from './Components/Dashboard components/Factures/BonDeLivraison'
import ViewBonDeLivraison from './Components/Dashboard components/Factures/ViewBonDeLivraison'
import Admin from './Components/Admin/Admin'
import DisplaySupplierOrders from './Components/Dashboard components/SupplierOrders/DisplaySupplierOrders'
import AddSupplierOrder from './Components/Dashboard components/SupplierOrders/AddSupplierOrder'
import EditSupplierOrder from './Components/Dashboard components/SupplierOrders/EditSupplierOrder'
import ViewSupplierOrder from './Components/Dashboard components/SupplierOrders/ViewSupplierOrder'
import DisplayClientOrders from './Components/Dashboard components/ClientOrders/DisplayClientOrders'
import CreateClientOrder from './Components/Dashboard components/ClientOrders/CreateClientOrder'
import ViewClientOrder from './Components/Dashboard components/ClientOrders/ViewClientOrder'
import EditClientOrder from './Components/Dashboard components/ClientOrders/EditClientOrder'
import DisplayCategories from './Components/Dashboard components/Categories/DisplayCategories'
import AddCategory from './Components/Dashboard components/Categories/AddCategory'
import EditCategory from './Components/Dashboard components/Categories/EditCategory'
import ViewCategory from './Components/Dashboard components/Categories/ViewCategory'
import DisplayClientSoldes from './Components/Dashboard components/ClientSolde/DisplayClientSoldes'
import ViewClientSolde from './Components/Dashboard components/ClientSolde/ViewClientSolde'
import AddClientTransaction from './Components/Dashboard components/ClientSolde/AddClientTransaction'
import DisplayBrands from './Components/Dashboard components/Brands/DisplayBrands'
import AddBrand from './Components/Dashboard components/Brands/AddBrand'
import ViewBrand from './Components/Dashboard components/Brands/ViewBrand'
import EditBrand from './Components/Dashboard components/Brands/EditBrand'
import Reports from './Components/Dashboard components/Reports/Reports'


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
                {/* Client Order Routes */}
                <Route path="/clientorders" element={<DisplayClientOrders />} />
                <Route path="/clientorders/create" element={<CreateClientOrder />} />
                <Route path="/clientorders/view/:id" element={<ViewClientOrder />} />
                <Route path="/clientorders/edit/:id" element={<EditClientOrder />} />
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
                <Route path="/bon-de-livraison" element={<BonDeLivraison />} />
                <Route path="/bon-de-livraison/view/:id" element={<ViewBonDeLivraison />} />
                {/* Supplier Orders Routes */}
                <Route path="/supplier-orders" element={<DisplaySupplierOrders />} />
                <Route path="/add-supplier-order" element={<AddSupplierOrder />} />
                <Route path="/edit-supplier-order/:id" element={<EditSupplierOrder />} />
                <Route path="/view-supplier-order/:id" element={<ViewSupplierOrder />} />
                {/* Profile Route */}
                <Route path="/profile" element={<Profile />} />
                {/* Admin Route */}
                <Route path="/admin" element={<Admin />} />
                {/* Category Routes */}
                <Route path="/categories" element={<DisplayCategories />} />
                <Route path="/categories/add" element={<AddCategory />} />
                <Route path="/categories/edit/:id" element={<EditCategory />} />
                <Route path="/categories/view/:id" element={<ViewCategory />} />
                
                {/* Client Solde (Balance) Routes */}
                <Route path="/clients/soldes" element={<DisplayClientSoldes />} />
                <Route path="/clients/solde/:clientId" element={<ViewClientSolde />} />
                <Route path="/clients/solde/:clientId/add" element={<AddClientTransaction />} />
                
                {/* Brands Routes */}
                <Route path="/brands" element={<DisplayBrands />} />
                <Route path="/brands/add" element={<AddBrand />} />
                <Route path="/brands/view/:id" element={<ViewBrand />} />
                <Route path="/brands/edit/:id" element={<EditBrand />} />
                
                {/* Reports Routes */}
                <Route path="/reports" element={<Reports />} />
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
