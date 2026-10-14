import api from '../api/client'

export const productService = {
  /**
   * Search and filter products
   * @param {object} [filters]
   * @param {string} [filters.search]
   * @param {number|string} [filters.categoryId]
   * @param {boolean} [filters.activeOnly]
   * @returns {Promise<ApiResponse<ProductResponse[]>>}
   */
  async searchProducts({ search, categoryId, activeOnly } = {}) {
    const params = {}
    if (search && search.trim()) {
      params.search = search.trim()
    }
    if (categoryId !== undefined && categoryId !== null && categoryId !== '') {
      params.categoryId = categoryId
    }
    if (activeOnly !== undefined && activeOnly !== null && activeOnly !== '') {
      params.activeOnly = activeOnly
    }
    return await api.get('/products', { params })
  },

  /**
   * Get single product by ID
   * @param {number|string} productId
   * @returns {Promise<ApiResponse<ProductResponse>>}
   */
  async getProductById(productId) {
    return await api.get(`/products/${productId}`)
  },

  /**
   * Add a new product
   * @param {object} payload - CreateProductRequest
   * @returns {Promise<ApiResponse<ProductResponse>>}
   */
  async addProduct(payload) {
    return await api.post('/products', payload)
  },

  /**
   * Update an existing product
   * @param {number|string} productId
   * @param {object} payload - UpdateProductRequest
   * @returns {Promise<ApiResponse<ProductResponse>>}
   */
  async updateProduct(productId, payload) {
    return await api.put(`/products/${productId}`, payload)
  },

  /**
   * Get performance metrics for all products
   * @returns {Promise<ApiResponse<ProductPerformanceResponse[]>>}
   */
  async getAllProductPerformance() {
    return await api.get('/products/performance')
  },

  /**
   * Get performance metrics for a single product
   * @param {number|string} productId
   * @returns {Promise<ApiResponse<ProductPerformanceResponse[]>>}
   */
  async getSingleProductPerformance(productId) {
    return await api.get(`/products/${productId}/performance`)
  },
}

export default productService
