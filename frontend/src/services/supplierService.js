import api from '../api/client'

export const supplierService = {
  /**
   * Add a new supplier
   * @param {object} payload - CreateSupplierRequest { supplierName, contactPerson, email, phone, address }
   * @returns {Promise<ApiResponse<SupplierResponse>>}
   */
  async addSupplier(payload) {
    return await api.post('/suppliers', payload)
  },

  /**
   * Get supplier by ID
   * @param {number|string} supplierId
   * @returns {Promise<ApiResponse<SupplierResponse>>}
   */
  async getSupplierById(supplierId) {
    return await api.get(`/suppliers/${supplierId}`)
  },

  /**
   * Get all suppliers, optionally filtered by active status
   * @param {boolean} [activeOnly]
   * @returns {Promise<ApiResponse<SupplierResponse[]>>}
   */
  async getAllSuppliers(activeOnly) {
    const params = {}
    if (activeOnly !== undefined && activeOnly !== null && activeOnly !== '') {
      params.activeOnly = activeOnly
    }
    return await api.get('/suppliers', { params })
  },

  /**
   * Get suppliers assigned to a product
   * @param {number|string} productId
   * @returns {Promise<ApiResponse<ProductSupplierResponse[]>>}
   */
  async getSuppliersByProductId(productId) {
    return await api.get(`/products/${productId}/suppliers`)
  },

  /**
   * Assign a supplier to a product
   * @param {number|string} productId
   * @param {object} payload - ProductSupplierRequest { supplierId, supplierPrice }
   * @returns {Promise<ApiResponse<ProductSupplierResponse>>}
   */
  async assignSupplierToProduct(productId, payload) {
    return await api.post(`/products/${productId}/suppliers`, payload)
  },

  /**
   * Update supplier price for a product
   * @param {number|string} productId
   * @param {number|string} supplierId
   * @param {object} payload - UpdateProductSupplierRequest { supplierPrice }
   * @returns {Promise<ApiResponse<ProductSupplierResponse>>}
   */
  async updateProductSupplier(productId, supplierId, payload) {
    return await api.put(`/products/${productId}/suppliers/${supplierId}`, payload)
  },

  /**
   * Remove supplier from product
   * @param {number|string} productId
   * @param {number|string} supplierId
   * @returns {Promise<ApiResponse<void>>}
   */
  async removeSupplierFromProduct(productId, supplierId) {
    return await api.delete(`/products/${productId}/suppliers/${supplierId}`)
  },
}

export default supplierService
