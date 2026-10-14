import api from '../api/client'

export const orderService = {
  /**
   * Checkout an active cart to place an order
   * @param {Object} payload - { customerId, addressId, paymentMethod }
   */
  async checkout(payload) {
    return await api.post('/orders/checkout', payload)
  },

  /**
   * Cancel an eligible order
   * @param {number|string} orderId
   * @param {number|string} customerId
   */
  async cancelOrder(orderId, customerId) {
    return await api.post(
      `/orders/${orderId}/cancel`,
      { customerId: Number(customerId) },
      { params: { customerId: Number(customerId) } }
    )
  },

  /**
   * Retrieve order history for a customer
   * @param {number|string} customerId
   */
  async getOrderHistory(customerId) {
    return await api.get('/orders', {
      params: { customerId },
    })
  },

  /**
   * Retrieve single order details
   * @param {number|string} orderId
   * @param {number|string} customerId
   */
  async getOrderById(orderId, customerId) {
    return await api.get(`/orders/${orderId}`, {
      params: { customerId },
    })
  },
}

export default orderService
