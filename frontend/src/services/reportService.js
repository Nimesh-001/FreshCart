import api from '../api/client'

export const reportService = {
  /**
   * Get sales report by date range
   * @param {string} [startDate] - YYYY-MM-DD
   * @param {string} [endDate] - YYYY-MM-DD
   */
  async getSalesReport(startDate = null, endDate = null) {
    const params = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    return await api.get('/reports/sales', { params })
  },

  /**
   * Get customer purchase report
   * @param {string} [startDate]
   * @param {string} [endDate]
   * @param {number|string} [customerId]
   */
  async getCustomerPurchaseReport(startDate = null, endDate = null, customerId = null) {
    const params = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    if (customerId) params.customerId = customerId
    return await api.get('/reports/customer-purchases', { params })
  },

  /**
   * Get customer purchase summary by customer ID
   * @param {number|string} customerId
   */
  async getCustomerPurchaseSummary(customerId) {
    return await api.get(`/reports/customer-summary/${customerId}`)
  },
}

export default reportService
