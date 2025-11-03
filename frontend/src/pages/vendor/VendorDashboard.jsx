import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { Upload, Package, ShoppingCart, LayoutDashboard } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { motion } from 'framer-motion'

export const VendorDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard')

  const menuItems = [
    { id: 'upload', label: 'Upload Fabric', icon: Upload, path: '/vendor/upload' },
    { id: 'listings', label: 'My Listings', icon: Package, path: '/vendor/listings' },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, path: '/vendor/orders' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-card min-h-screen p-4">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-primary">Vendor Dashboard</h2>
          </div>
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.id} to={item.path}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant={activeTab === item.id ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setActiveTab(item.id)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  </motion.div>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

