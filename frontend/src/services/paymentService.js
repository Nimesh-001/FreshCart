import api from '../api/client'

export const paymentService = {
  /**
   * Process payment for an order
   * @param {Object} payload - { orderId, customerId, paymentMethod, amount, transactionReference }
   */
  async processPayment(payload) {
    return await api.post('/payments/process', payload)
  },

  /**
   * Refund payment for an eligible order
   * @param {number|string} orderId
   * @param {number|string} [customerId]
   * @param {string} [reason]
   */
  async processRefund(orderId, customerId = null, reason = '') {
    return await api.post(`/payments/${orderId}/refund`, {
      orderId: Number(orderId),
      customerId: customerId ? Number(customerId) : null,
      reason: reason || 'Customer requested refund',
    })
  },

  /**
   * Retrieve payment record for an order
   * @param {number|string} orderId
   * @param {number|string} [customerId]
   */
  async getPaymentByOrderId(orderId, customerId = null) {
    const params = {}
    if (customerId) params.customerId = customerId
    return await api.get(`/payments/${orderId}`, { params })
  },
}

export default paymentService
