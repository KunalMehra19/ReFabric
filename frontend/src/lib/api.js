import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const uploadImage = async (file) => {
  const formData = new FormData()
  formData.append('image', file) // Backend expects 'image' field name
  
  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
    // Don't set Content-Type header, let browser set it with boundary
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to upload image' }))
    throw new Error(error.error || 'Failed to upload image')
  }
  
  return response.json()
}

export const addFabric = async (fabricData) => {
  const response = await api.post('/add_fabric', fabricData)
  return response.data
}

export const getFabrics = async (filters = {}) => {
  const response = await api.get('/fabrics', { params: filters })
  return response.data
}

export const getFabricById = async (id) => {
  const response = await api.get(`/fabrics/${id}`)
  return response.data
}

export const login = async (email, password) => {
  const response = await api.post('/login', { email, password })
  return response.data
}

export const signup = async (userData) => {
  const response = await api.post('/signup', userData)
  return response.data
}

export default api

