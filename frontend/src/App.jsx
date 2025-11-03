import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { FabricProvider } from './context/FabricContext'
import { ToastProvider } from './components/ui/Toast'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { VendorDashboard } from './pages/vendor/VendorDashboard'
import { UploadFabric } from './pages/vendor/UploadFabric'
import { MyListings } from './pages/vendor/MyListings'
import { Orders } from './pages/vendor/Orders'
import { BuyerDashboard } from './pages/BuyerDashboard'

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    const redirectTo = user?.role === 'vendor' ? '/vendor' : '/buyer'
    return <Navigate to={redirectTo} replace />
  }

  return children
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      <Route
        path="/vendor"
        element={
          <ProtectedRoute requiredRole="vendor">
            <VendorDashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/vendor/upload" replace />} />
        <Route path="upload" element={<UploadFabric />} />
        <Route path="listings" element={<MyListings />} />
        <Route path="orders" element={<Orders />} />
      </Route>
      
      <Route
        path="/buyer"
        element={
          <ProtectedRoute requiredRole="buyer">
            <BuyerDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <FabricProvider>
        <ToastProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                <AppRoutes />
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </ToastProvider>
      </FabricProvider>
    </AuthProvider>
  )
}

export default App

