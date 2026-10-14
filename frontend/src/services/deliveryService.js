import api from '../api/client'

export const deliveryService = {
  /**
   * Assign delivery to an order
   * @param {Object} payload - { orderId, deliveryPerson, deliveryPhone }
   */
  async assignDelivery(payload) {
    return await api.post('/deliveries/assign', payload)
  },

  /**
   * Update delivery status
   * @param {number|string} orderId
   * @param {string} status - PENDING, ASSIGNED, OUT_FOR_DELIVERY, DELIVERED, FAILED
   */
  async updateDeliveryStatus(orderId, status) {
    return await api.put(`/deliveries/${orderId}/status`, { status })
  },

  /**
   * Get delivery details for an order
   * @param {number|string} orderId
   */
  async getDeliveryByOrderId(orderId) {
    return await api.get(`/deliveries/${orderId}`)
  },

  /**
   * Search tracking records
   * @param {Object} params - { customerId, orderStatus, deliveryStatus, paymentStatus }
   */
  async searchTracking(params = {}) {
    return await api.get('/deliveries/tracking', { params })
  },

  /**
   * Get tracking details for an order
   * @param {number|string} orderId
   * @param {number|string} [customerId]
   */
  async getTrackingByOrderId(orderId, customerId = null) {
    const params = {}
    if (customerId) params.customerId = customerId
    return await api.get(`/deliveries/tracking/${orderId}`, { params })
  },
}

export default deliveryService
