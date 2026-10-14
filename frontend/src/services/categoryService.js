import api from '../api/client'

export const categoryService = {
  /**
   * Get all categories, optionally filtered by active status
   * @param {boolean} [activeOnly]
   * @returns {Promise<ApiResponse<CategoryResponse[]>>}
   */
  async getAllCategories(activeOnly) {
    const params = {}
    if (activeOnly !== undefined && activeOnly !== null && activeOnly !== '') {
      params.activeOnly = activeOnly
    }
    return await api.get('/categories', { params })
  },

  /**
   * Get category by ID
   * @param {number|string} categoryId
   * @returns {Promise<ApiResponse<CategoryResponse>>}
   */
  async getCategoryById(categoryId) {
    return await api.get(`/categories/${categoryId}`)
  },

  /**
   * Create a new category
   * @param {object} payload - CategoryRequest { categoryName, description }
   * @returns {Promise<ApiResponse<CategoryResponse>>}
   */
  async createCategory(payload) {
    return await api.post('/categories', payload)
  },

  /**
   * Update category by ID
   * @param {number|string} categoryId
   * @param {object} payload - CategoryRequest { categoryName, description }
   * @returns {Promise<ApiResponse<CategoryResponse>>}
   */
  async updateCategory(categoryId, payload) {
    return await api.put(`/categories/${categoryId}`, payload)
  },

  /**
   * Deactivate a category (soft-delete according to backend semantics)
   * @param {number|string} categoryId
   * @returns {Promise<ApiResponse<void>>}
   */
  async deactivateCategory(categoryId) {
    return await api.delete(`/categories/${categoryId}`)
  },
}

export default categoryService
