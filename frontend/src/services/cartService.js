import api from '../api/client'

export const cartService = {
  /**
   * Add a product to the active cart
   * @param {Object} payload - { customerId, productId, quantity }
   */
  async addItemToCart(payload) {
    return await api.post('/cart/items', payload)
  },

  /**
   * Update quantity of an item in the active cart
   * @param {Object} payload - { customerId, productId, quantity }
   */
  async updateCartItem(payload) {
    return await api.put('/cart/items', payload)
  },

  /**
   * Remove a product from the active cart
   * @param {number|string} customerId
   * @param {number|string} productId
   */
  async removeCartItem(customerId, productId) {
    return await api.delete(`/cart/items/${productId}`, {
      params: { customerId },
    })
  },

  /**
   * Retrieve active cart for a customer
   * @param {number|string} customerId
   */
  async getActiveCart(customerId) {
    return await api.get('/cart', {
      params: { customerId },
    })
  },
}

export default cartService
