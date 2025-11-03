import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from './ui/Button'
import { LogOut, User, Package, ShoppingBag } from 'lucide-react'

export const Navbar = () => {
  const { user, logout, isVendor, isBuyer } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
      // Navigate anyway
      navigate('/')
    }
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">ReFabric</span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to={isVendor ? '/vendor' : '/buyer'}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  {isVendor ? (
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Dashboard
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4" />
                      Marketplace
                    </div>
                  )}
                </Link>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4" />
                  <span className="text-muted-foreground">{user.name}</span>
                  <span className="text-primary">({user.role})</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

