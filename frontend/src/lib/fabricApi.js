import { supabase } from './supabase'

// Upload image to Supabase Storage and analyze with backend
export const uploadImageToSupabase = async (file, userId) => {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`
    const filePath = `fabric-images/${fileName}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('fabric-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('fabric-images')
      .getPublicUrl(filePath)

    return {
      path: filePath,
      url: publicUrl,
      data: uploadData,
    }
  } catch (error) {
    console.error('Error uploading image to Supabase:', error)
    throw error
  }
}

// Analyze fabric image (still uses Flask backend)
export const analyzeFabricImage = async (file) => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  const formData = new FormData()
  formData.append('image', file)
  
  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to analyze image' }))
    throw new Error(error.error || 'Failed to analyze image')
  }
  
  return response.json()
}

// Add fabric to Supabase
export const addFabric = async (fabricData) => {
  const { data, error } = await supabase
    .from('fabrics')
    .insert([{
      name: fabricData.name,
      quantity: fabricData.quantity,
      price_per_meter: fabricData.pricePerMeter,
      image_url: fabricData.imageUrl,
      fabric_type: fabricData.fabricType,
      pattern: fabricData.pattern,
      colors: fabricData.colors || [],
      vendor_id: fabricData.vendorId,
      vendor_name: fabricData.vendorName,
      created_at: new Date().toISOString(),
    }])
    .select()
    .single()

  if (error) {
    console.error('Error adding fabric:', error)
    throw error
  }

  return data
}

// Get fabrics from Supabase with filters
export const getFabrics = async (filters = {}) => {
  let query = supabase
    .from('fabrics')
    .select('*')
    .order('created_at', { ascending: false })

  // Apply filters
  if (filters.type) {
    query = query.eq('fabric_type', filters.type)
  }
  if (filters.pattern) {
    query = query.eq('pattern', filters.pattern)
  }
  if (filters.minPrice) {
    query = query.gte('price_per_meter', filters.minPrice)
  }
  if (filters.maxPrice) {
    query = query.lte('price_per_meter', filters.maxPrice)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching fabrics:', error)
    throw error
  }

  // Transform data to match frontend format
  return data.map(fabric => ({
    id: fabric.id,
    name: fabric.name,
    quantity: fabric.quantity,
    pricePerMeter: fabric.price_per_meter,
    imageUrl: fabric.image_url,
    fabricType: fabric.fabric_type,
    pattern: fabric.pattern,
    colors: fabric.colors || [],
    vendorId: fabric.vendor_id,
    vendorName: fabric.vendor_name,
    createdAt: fabric.created_at,
  }))
}

// Get fabric by ID
export const getFabricById = async (id) => {
  const { data, error } = await supabase
    .from('fabrics')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching fabric:', error)
    throw error
  }

  // Transform to match frontend format
  return {
    id: data.id,
    name: data.name,
    quantity: data.quantity,
    pricePerMeter: data.price_per_meter,
    imageUrl: data.image_url,
    fabricType: data.fabric_type,
    pattern: data.pattern,
    colors: data.colors || [],
    vendorId: data.vendor_id,
    vendorName: data.vendor_name,
    createdAt: data.created_at,
  }
}

// Update fabric
export const updateFabric = async (id, updates) => {
  const updateData = {}
  
  if (updates.name) updateData.name = updates.name
  if (updates.quantity !== undefined) updateData.quantity = updates.quantity
  if (updates.pricePerMeter !== undefined) updateData.price_per_meter = updates.pricePerMeter
  if (updates.imageUrl) updateData.image_url = updates.imageUrl
  if (updates.fabricType) updateData.fabric_type = updates.fabricType
  if (updates.pattern) updateData.pattern = updates.pattern
  if (updates.colors) updateData.colors = updates.colors

  const { data, error } = await supabase
    .from('fabrics')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating fabric:', error)
    throw error
  }

  return data
}

// Delete fabric
export const deleteFabric = async (id) => {
  const { error } = await supabase
    .from('fabrics')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting fabric:', error)
    throw error
  }

  return true
}

// Get fabrics by vendor
export const getFabricsByVendor = async (vendorId) => {
  const { data, error } = await supabase
    .from('fabrics')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching vendor fabrics:', error)
    throw error
  }

  return data.map(fabric => ({
    id: fabric.id,
    name: fabric.name,
    quantity: fabric.quantity,
    pricePerMeter: fabric.price_per_meter,
    imageUrl: fabric.image_url,
    fabricType: fabric.fabric_type,
    pattern: fabric.pattern,
    colors: fabric.colors || [],
    vendorId: fabric.vendor_id,
    vendorName: fabric.vendor_name,
    createdAt: fabric.created_at,
  }))
}

// Subscribe to fabric changes (real-time)
export const subscribeToFabrics = (callback) => {
  const channel = supabase
    .channel('fabrics-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'fabrics',
      },
      (payload) => {
        callback(payload)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

