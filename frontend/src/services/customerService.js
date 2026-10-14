import api from '../api/client'

export const customerService = {
  /**
   * Search or list customers
   * @param {string} [search] - Optional search query
   * @returns {Promise<ApiResponse<CustomerResponse[]>>}
   */
  async searchCustomers(search) {
    const params = {}
    if (search && search.trim()) {
      params.search = search.trim()
    }
    return await api.get('/customers', { params })
  },

  /**
   * Get single customer by ID (includes addresses in backend response)
   * @param {number|string} customerId
   * @returns {Promise<ApiResponse<CustomerResponse>>}
   */
  async getCustomerById(customerId) {
    return await api.get(`/customers/${customerId}`)
  },

  /**
   * Register a new customer
   * @param {object} payload - RegisterCustomerRequest
   * @returns {Promise<ApiResponse<CustomerResponse>>}
   */
  async registerCustomer(payload) {
    return await api.post('/customers/register', payload)
  },

  /**
   * Update customer profile
   * @param {number|string} customerId
   * @param {object} payload - UpdateCustomerProfileRequest
   * @returns {Promise<ApiResponse<CustomerResponse>>}
   */
  async updateCustomerProfile(customerId, payload) {
    return await api.put(`/customers/${customerId}`, payload)
  },

  /**
   * Get addresses for customer
   * @param {number|string} customerId
   * @returns {Promise<ApiResponse<AddressResponse[]>>}
   */
  async getCustomerAddresses(customerId) {
    return await api.get(`/customers/${customerId}/addresses`)
  },

  /**
   * Add a new address for customer
   * @param {number|string} customerId
   * @param {object} payload - AddressRequest
   * @returns {Promise<ApiResponse<AddressResponse>>}
   */
  async addCustomerAddress(customerId, payload) {
    return await api.post(`/customers/${customerId}/addresses`, payload)
  },

  /**
   * Update existing address for customer
   * @param {number|string} customerId
   * @param {number|string} addressId
   * @param {object} payload - AddressRequest
   * @returns {Promise<ApiResponse<AddressResponse>>}
   */
  async updateCustomerAddress(customerId, addressId, payload) {
    return await api.put(`/customers/${customerId}/addresses/${addressId}`, payload)
  },

  /**
   * Get purchase summary for customer
   * @param {number|string} customerId
   * @returns {Promise<ApiResponse<CustomerPurchaseSummaryResponse>>}
   */
  async getCustomerPurchaseSummary(customerId) {
    return await api.get(`/customers/${customerId}/purchase-summary`)
  },
}

export default customerService
