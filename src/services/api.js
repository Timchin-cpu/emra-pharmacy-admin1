import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://api.programsa.ru/api'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (credentials) => api.post('/admin/login', credentials),
  getMe: () => api.get('/admin/me'),
}

export const dashboardAPI = {
  getStats: () => api.get('/admin/dashboard'),
}

export const productsAPI = {
  getAll: (params) => api.get('/admin/products', { params }),
  getById: (id) => api.get(`/admin/products/${id}`),
  create: (data) => api.post('/admin/products', data),
  update: (id, data) => api.put(`/admin/products/${id}`, data),
  delete: (id) => api.delete(`/admin/products/${id}`),
  updateStock: (id, stock) => api.patch(`/admin/products/${id}/stock`, { stock }),
  toggle: (id) => api.patch(`/admin/products/${id}/toggle`),
}

export const categoriesAPI = {
  getAll: () => api.get('/admin/categories'),
  create: (data) => api.post('/admin/categories', data),
  update: (id, data) => api.put(`/admin/categories/${id}`, data),
  delete: (id) => api.delete(`/admin/categories/${id}`),
}

export const ordersAPI = {
  getAll: (params) => api.get('/admin/orders', { params }),
  getById: (id) => api.get(`/admin/orders/${id}`),
  updateStatus: (id, data) => api.patch(`/admin/orders/${id}/status`, data),
}

export const promoCodesAPI = {
  getAll: () => api.get('/admin/promo-codes'),
  create: (data) => api.post('/admin/promo-codes', data),
  update: (id, data) => api.put(`/admin/promo-codes/${id}`, data),
  delete: (id) => api.delete(`/admin/promo-codes/${id}`),
}

export const bannersAPI = {
  getAll: () => api.get('/admin/banners'),
  create: (data) => api.post('/admin/banners', data),
  update: (id, data) => api.put(`/admin/banners/${id}`, data),
  delete: (id) => api.delete(`/admin/banners/${id}`),
  // Управление товарами баннера
  addProducts:    (id, productIds) => api.post(`/admin/banners/${id}/products`, { productIds }),
  removeProduct:  (bannerId, productId) => api.delete(`/admin/banners/${bannerId}/products/${productId}`),
  reorderProducts:(id, productIds) => api.put(`/admin/banners/${id}/products/reorder`, { productIds }),
}

export const settingsAPI = {
  get: () => api.get('/admin/settings'),
  update: (data) => api.put('/admin/settings', data),
}

export default api