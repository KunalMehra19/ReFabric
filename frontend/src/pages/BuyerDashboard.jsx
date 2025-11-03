import { useState } from 'react'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Label } from '../components/ui/Label'
import { Modal } from '../components/ui/Modal'
import { Loader } from '../components/ui/Loader'
import { useFabric } from '../context/FabricContext'
import { useToast } from '../components/ui/Toast'
import { motion } from 'framer-motion'
import { Search, Filter, Package, DollarSign, Palette, ShoppingCart, Eye } from 'lucide-react'

export const BuyerDashboard = () => {
  const { fabrics, loading, filters, updateFilters } = useFabric()
  const { showToast } = useToast()
  const [selectedFabric, setSelectedFabric] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const fabricTypes = ['All', 'Cotton', 'Silk', 'Polyester', 'Linen', 'Wool', 'Denim']
  const patterns = ['All', 'Solid', 'Floral', 'Striped', 'Checkered', 'Polka', 'Geometric']
  const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#000000', '#FFFFFF', '#808080']

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters }
    
    if (key === 'colors') {
      if (newFilters.colors.includes(value)) {
        newFilters.colors = newFilters.colors.filter(c => c !== value)
      } else {
        newFilters.colors = [...newFilters.colors, value]
      }
    } else {
      newFilters[key] = value === 'All' ? '' : value
    }
    
    updateFilters(newFilters)
  }

  const handleViewDetails = (fabric) => {
    setSelectedFabric(fabric)
    setIsModalOpen(true)
  }

  const handleAddToCart = (fabric) => {
    showToast(`${fabric.name} added to cart!`, 'success')
    // In production, add to cart context/state
  }

  const handleBuyNow = (fabric) => {
    showToast(`Purchasing ${fabric.name}...`, 'info')
    // In production, handle purchase flow
  }

  const filteredFabrics = fabrics.filter((fabric) => {
    if (filters.type && fabric.fabricType?.toLowerCase() !== filters.type.toLowerCase()) {
      return false
    }
    if (filters.pattern && fabric.pattern?.toLowerCase() !== filters.pattern.toLowerCase()) {
      return false
    }
    if (filters.minPrice && fabric.pricePerMeter < filters.minPrice) {
      return false
    }
    if (filters.maxPrice && fabric.pricePerMeter > filters.maxPrice) {
      return false
    }
    return true
  })

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Marketplace</h1>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search fabrics..."
                className="pl-10"
                onChange={(e) => {
                  // Add search functionality
                }}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Fabric Type</Label>
                      <Select
                        value={filters.type || 'All'}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        className="mt-1"
                      >
                        {fabricTypes.map((type) => (
                          <option key={type} value={type === 'All' ? '' : type}>
                            {type}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div>
                      <Label>Pattern</Label>
                      <Select
                        value={filters.pattern || 'All'}
                        onChange={(e) => handleFilterChange('pattern', e.target.value)}
                        className="mt-1"
                      >
                        {patterns.map((pattern) => (
                          <option key={pattern} value={pattern === 'All' ? '' : pattern}>
                            {pattern}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div>
                      <Label>Price Range</Label>
                      <div className="mt-1 space-y-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={filters.minPrice}
                          onChange={(e) => handleFilterChange('minPrice', parseFloat(e.target.value) || 0)}
                        />
                        <Input
                          type="number"
                          placeholder="Max"
                          value={filters.maxPrice}
                          onChange={(e) => handleFilterChange('maxPrice', parseFloat(e.target.value) || 10000)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Colors</Label>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => handleFilterChange('colors', color)}
                            className={`w-8 h-8 rounded-full border-2 ${
                              filters.colors.includes(color) ? 'border-primary scale-110' : 'border-gray-300'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Fabric Grid */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader />
          </div>
        ) : filteredFabrics.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Fabrics Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or check back later
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFabrics.map((fabric, index) => (
              <motion.div
                key={fabric.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow flex flex-col">
                  <CardContent className="p-0 flex flex-col h-full">
                    <div className="aspect-video w-full overflow-hidden rounded-t-lg relative group">
                      <img
                        src={fabric.imageUrl || '/placeholder-fabric.jpg'}
                        alt={fabric.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-semibold text-lg mb-2">{fabric.name}</h3>
                      <div className="space-y-1 mb-4 flex-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Package className="h-4 w-4" />
                          <span className="capitalize">{fabric.fabricType || 'Unknown'}</span>
                        </div>
                        {fabric.pattern && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Palette className="h-4 w-4" />
                            <span className="capitalize">{fabric.pattern}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-lg font-bold text-primary">
                          <DollarSign className="h-5 w-5" />
                          <span>${fabric.pricePerMeter || 0}/meter</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleViewDetails(fabric)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleBuyNow(fabric)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Buy
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

      {/* Fabric Details Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedFabric && (
          <div className="p-6">
            <div className="mb-4">
              <img
                src={selectedFabric.imageUrl || '/placeholder-fabric.jpg'}
                alt={selectedFabric.name}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              <h2 className="text-2xl font-bold mb-2">{selectedFabric.name}</h2>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <Label>Fabric Type</Label>
                <p className="text-lg capitalize">{selectedFabric.fabricType || 'Unknown'}</p>
              </div>
              <div>
                <Label>Pattern</Label>
                <p className="text-lg capitalize">{selectedFabric.pattern || 'Unknown'}</p>
              </div>
              <div>
                <Label>Available Quantity</Label>
                <p className="text-lg">{selectedFabric.quantity} meters</p>
              </div>
              <div>
                <Label>Price</Label>
                <p className="text-lg font-bold text-primary">${selectedFabric.pricePerMeter} per meter</p>
              </div>
              <div>
                <Label>Vendor</Label>
                <p className="text-lg">{selectedFabric.vendorName || 'Unknown Vendor'}</p>
              </div>
              {selectedFabric.colors && selectedFabric.colors.length > 0 && (
                <div>
                  <Label>Colors</Label>
                  <div className="flex gap-2 mt-2">
                    {selectedFabric.colors.map((color, index) => (
                      <div
                        key={index}
                        className="w-12 h-12 rounded-md border-2 border-gray-200"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  handleAddToCart(selectedFabric)
                  setIsModalOpen(false)
                }}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  handleBuyNow(selectedFabric)
                  setIsModalOpen(false)
                }}
              >
                Buy Now
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

