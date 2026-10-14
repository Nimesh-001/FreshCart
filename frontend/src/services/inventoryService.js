import api from '../api/client'

export const inventoryService = {
  /**
   * Receive stock from supplier for a product
   * @param {object} payload - ReceiveStockRequest { productId, supplierId, quantity, supplierPrice }
   * @returns {Promise<ApiResponse<InventoryOperationResponse>>}
   */
  async receiveStock(payload) {
    return await api.post('/inventory/receive-stock', payload)
  },

  /**
   * Adjust inventory quantity for a product
   * @param {object} payload - AdjustInventoryRequest { productId, quantityChange, reason }
   * @returns {Promise<ApiResponse<InventoryOperationResponse>>}
   */
  async adjustInventory(payload) {
    return await api.post('/inventory/adjust', payload)
  },

  /**
   * Get all products currently at or below their reorder level (low stock)
   * @returns {Promise<ApiResponse<LowStockItemResponse[]>>}
   */
  async getLowStockItems() {
    return await api.get('/inventory/low-stock')
  },
}

export default inventoryService
