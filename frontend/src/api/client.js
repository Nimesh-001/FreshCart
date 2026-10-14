import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    let normalizedMessage = 'An unexpected error occurred. Please try again.'

    if (error.response) {
      const data = error.response.data
      if (data && typeof data === 'object') {
        if (data.message) {
          normalizedMessage = data.message
        } else if (data.errors && typeof data.errors === 'object') {
          normalizedMessage = Object.values(data.errors).join(', ')
        }
      } else if (typeof data === 'string') {
        normalizedMessage = data
      }
    } else if (error.request) {
      normalizedMessage = 'Unable to connect to FreshCart server. Please ensure the backend is running.'
    } else if (error.message) {
      normalizedMessage = error.message
    }

    const enhancedError = new Error(normalizedMessage)
    enhancedError.status = error.response ? error.response.status : null
    enhancedError.originalError = error
    enhancedError.errors = error.response?.data?.errors || null

    return Promise.reject(enhancedError)
  }
)

export default api
