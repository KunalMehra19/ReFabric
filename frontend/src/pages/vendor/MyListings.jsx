import { useState, useEffect } from 'react'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Loader } from '../../components/ui/Loader'
import { useFabric } from '../../context/FabricContext'
import { useAuth } from '../../context/AuthContext'
import { getFabricsByVendor, deleteFabric } from '../../lib/fabricApi'
import { useToast } from '../../components/ui/Toast'
import { motion } from 'framer-motion'
import { Package, DollarSign, Ruler } from 'lucide-react'

export const MyListings = () => {
  const { loading: contextLoading } = useFabric()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [myFabrics, setMyFabrics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadMyFabrics()
    }
  }, [user])

  const loadMyFabrics = async () => {
    if (!user?.id) return
    
    setLoading(true)
    try {
      const fabrics = await getFabricsByVendor(user.id)
      setMyFabrics(fabrics)
    } catch (error) {
      console.error('Error loading fabrics:', error)
      showToast('Failed to load your listings', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (fabricId) => {
    if (!confirm('Are you sure you want to delete this listing?')) return
    
    try {
      await deleteFabric(fabricId)
      setMyFabrics(myFabrics.filter(f => f.id !== fabricId))
      showToast('Listing deleted successfully', 'success')
    } catch (error) {
      console.error('Error deleting fabric:', error)
      showToast('Failed to delete listing', 'error')
    }
  }

  if (loading || contextLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Listings</h1>
        <Button onClick={() => window.location.href = '/vendor/upload'}>
          Upload New Fabric
        </Button>
      </div>

      {myFabrics.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Listings Yet</h3>
            <p className="text-muted-foreground mb-6">
              Start selling by uploading your first fabric listing
            </p>
            <Button onClick={() => window.location.href = '/vendor/upload'}>
              Upload Fabric
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myFabrics.map((fabric, index) => (
            <motion.div
              key={fabric.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img
                      src={fabric.imageUrl || '/placeholder-fabric.jpg'}
                      alt={fabric.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-lg">{fabric.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package className="h-4 w-4" />
                      <span className="capitalize">{fabric.fabricType}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Ruler className="h-4 w-4" />
                      <span>{fabric.quantity} meters</span>
                    </div>
                    <div className="flex items-center gap-2 text-lg font-bold text-primary">
                      <DollarSign className="h-5 w-5" />
                      <span>${fabric.pricePerMeter}/meter</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleDelete(fabric.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

