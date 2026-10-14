import api from '../api/client'

export const reviewService = {
  /**
   * Submit a product review
   * @param {Object} payload - { customerId, productId, orderId, rating, comment }
   */
  async addReview(payload) {
    return await api.post('/reviews', payload)
  },

  /**
   * Update an existing product review
   * @param {number|string} reviewId
   * @param {Object} payload - { customerId, rating, comment }
   */
  async updateReview(reviewId, payload) {
    return await api.put(`/reviews/${reviewId}`, payload)
  },

  /**
   * Get single review by ID
   * @param {number|string} reviewId
   */
  async getReviewById(reviewId) {
    return await api.get(`/reviews/${reviewId}`)
  },

  /**
   * Get reviews for a product
   * @param {number|string} productId
   */
  async getReviewsByProductId(productId) {
    return await api.get(`/reviews/product/${productId}`)
  },

  /**
   * Get review analysis for all products or a specific product
   * @param {number|string} [productId]
   */
  async getReviewAnalysis(productId = null) {
    const params = {}
    if (productId) params.productId = productId
    return await api.get('/reviews/analysis', { params })
  },
}

export default reviewService
