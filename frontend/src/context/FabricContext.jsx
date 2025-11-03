import { createContext, useContext, useState, useEffect } from 'react'
import { getFabrics, subscribeToFabrics } from '../lib/fabricApi'

const FabricContext = createContext(null)

export const useFabric = () => {
  const context = useContext(FabricContext)
  if (!context) {
    throw new Error('useFabric must be used within FabricProvider')
  }
  return context
}

export const FabricProvider = ({ children }) => {
  const [fabrics, setFabrics] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    type: '',
    colors: [],
    pattern: '',
    minPrice: 0,
    maxPrice: 10000,
  })

  const fetchFabrics = async (newFilters = filters) => {
    setLoading(true)
    try {
      const data = await getFabrics(newFilters)
      setFabrics(data || [])
    } catch (error) {
      console.error('Error fetching fabrics:', error)
      setFabrics([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFabrics()

    // Subscribe to real-time changes
    const unsubscribe = subscribeToFabrics((payload) => {
      if (payload.eventType === 'INSERT') {
        // Transform new fabric to match format
        const newFabric = {
          id: payload.new.id,
          name: payload.new.name,
          quantity: payload.new.quantity,
          pricePerMeter: payload.new.price_per_meter,
          imageUrl: payload.new.image_url,
          fabricType: payload.new.fabric_type,
          pattern: payload.new.pattern,
          colors: payload.new.colors || [],
          vendorId: payload.new.vendor_id,
          vendorName: payload.new.vendor_name,
          createdAt: payload.new.created_at,
        }
        setFabrics((prev) => [newFabric, ...prev])
      } else if (payload.eventType === 'UPDATE') {
        const updatedFabric = {
          id: payload.new.id,
          name: payload.new.name,
          quantity: payload.new.quantity,
          pricePerMeter: payload.new.price_per_meter,
          imageUrl: payload.new.image_url,
          fabricType: payload.new.fabric_type,
          pattern: payload.new.pattern,
          colors: payload.new.colors || [],
          vendorId: payload.new.vendor_id,
          vendorName: payload.new.vendor_name,
          createdAt: payload.new.created_at,
        }
        setFabrics((prev) =>
          prev.map((f) => (f.id === updatedFabric.id ? updatedFabric : f))
        )
      } else if (payload.eventType === 'DELETE') {
        setFabrics((prev) => prev.filter((f) => f.id !== payload.old.id))
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const updateFilters = (newFilters) => {
    setFilters(newFilters)
    fetchFabrics(newFilters)
  }

  const addFabric = (fabric) => {
    // Real-time subscription will handle this
    // But we can optimistically update if needed
    setFabrics((prev) => [fabric, ...prev])
  }

  const value = {
    fabrics,
    loading,
    filters,
    updateFilters,
    fetchFabrics,
    addFabric,
  }

  return <FabricContext.Provider value={value}>{children}</FabricContext.Provider>
}

