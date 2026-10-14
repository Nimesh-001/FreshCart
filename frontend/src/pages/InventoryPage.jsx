import React, { useState, useEffect, useCallback, useMemo } from 'react'
import inventoryService from '../services/inventoryService'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import StatusBadge from '../components/StatusBadge'
import ReceiveStockModal from '../components/inventory/ReceiveStockModal'
import AdjustInventoryModal from '../components/inventory/AdjustInventoryModal'

export function InventoryPage() {
  const [lowStockItems, setLowStockItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL') // 'ALL' | 'LOW STOCK' | 'OUT OF STOCK'

  // Modal states
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false)
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  const fetchLowStock = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await inventoryService.getLowStockItems()
      setLowStockItems(res?.data || [])
    } catch (err) {
      setError(err.message || 'Failed to load low stock inventory')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLowStock()
  }, [fetchLowStock])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const handleReceiveSuccess = (result) => {
    const msg = result?.message || `Successfully received stock for ${result?.productName || 'product'}. New stock: ${result?.newQuantity ?? ''}`
    showToast(msg)
    fetchLowStock()
  }

  const handleAdjustSuccess = (result) => {
    const msg = result?.message || `Stock adjusted for ${result?.productName || 'product'}. New stock: ${result?.newQuantity ?? ''}`
    showToast(msg)
    fetchLowStock()
  }

  const handleOpenReceive = (product = null) => {
    setSelectedProduct(product)
    setIsReceiveModalOpen(true)
  }

  const handleOpenAdjust = (product = null) => {
    setSelectedProduct(product)
    setIsAdjustModalOpen(true)
  }

  // Statistics
  const outOfStockCount = useMemo(() => {
    return lowStockItems.filter(item => item.stockStatus === 'OUT OF STOCK' || item.quantity === 0).length
  }, [lowStockItems])

  const lowStockCount = useMemo(() => {
    return lowStockItems.filter(item => item.stockStatus === 'LOW STOCK' && item.quantity > 0).length
  }, [lowStockItems])

  // Filter and search items
  const filteredItems = useMemo(() => {
    return lowStockItems.filter((item) => {
      const matchesSearch =
        !searchQuery.trim() ||
        item.productName.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        String(item.productId).includes(searchQuery.trim())

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'OUT OF STOCK' && (item.stockStatus === 'OUT OF STOCK' || item.quantity === 0)) ||
        (statusFilter === 'LOW STOCK' && item.stockStatus === 'LOW STOCK' && item.quantity > 0)

      return matchesSearch && matchesStatus
    })
  }, [lowStockItems, searchQuery, statusFilter])

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 shadow-lg animate-in fade-in slide-in-from-top duration-300">
          <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inventory Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Real-time stock level monitoring, replenishment orders, and manual adjustments.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleOpenAdjust(null)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span>Adjust Inventory</span>
          </button>
          <button
            onClick={() => handleOpenReceive(null)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>Receive Stock</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Low-stock alert count */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Low Stock Alerts
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{lowStockItems.length}</p>
          <p className="mt-1 text-xs text-slate-500">Products at or below minimum reorder thresholds</p>
        </div>

        {/* Critical Out of Stock */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Out of Stock
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-rose-600">{outOfStockCount}</p>
          <p className="mt-1 text-xs text-slate-500">Products completely depleted with 0 units</p>
        </div>

        {/* Needs Replenishment */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Low Stock Warnings
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-600">{lowStockCount}</p>
          <p className="mt-1 text-xs text-slate-500">Units remaining but replenishment required soon</p>
        </div>
      </div>

      {/* Main Low Stock Table & Controls */}
      <div className="space-y-4">
        {/* Controls Bar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <svg
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search low-stock products by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500">Status:</label>
              <div className="inline-flex rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setStatusFilter('ALL')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    statusFilter === 'ALL'
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  All ({lowStockItems.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('OUT OF STOCK')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    statusFilter === 'OUT OF STOCK'
                      ? 'bg-white text-rose-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Out of Stock ({outOfStockCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('LOW STOCK')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    statusFilter === 'LOW STOCK'
                      ? 'bg-white text-amber-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Low Stock ({lowStockCount})
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" message="Scanning inventory and reorder thresholds..." />
          </div>
        ) : error ? (
          <ErrorMessage
            title="Failed to Load Inventory"
            message={error}
            onRetry={fetchLowStock}
          />
        ) : filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">
              {searchQuery || statusFilter !== 'ALL'
                ? 'No matching low stock items found'
                : 'Inventory Levels are Healthy'}
            </h3>
            <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
              {searchQuery || statusFilter !== 'ALL'
                ? 'Try adjusting your search query or status filter.'
                : 'All products currently have stock levels above their configured reorder thresholds.'}
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                onClick={() => handleOpenReceive(null)}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
              >
                Receive Stock
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Product ID</th>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Current Stock</th>
                    <th className="py-3 px-4">Reorder Level</th>
                    <th className="py-3 px-4">Stock Status</th>
                    <th className="py-3 px-4 text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredItems.map((item) => (
                    <tr key={item.productId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-500 font-semibold">
                        #{item.productId}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {item.productName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-bold ${
                            item.quantity === 0
                              ? 'text-rose-600'
                              : 'text-amber-600'
                          }`}
                        >
                          {item.quantity} units
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {item.reorderLevel} units
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge
                          status={item.stockStatus}
                          label={item.stockStatus}
                        />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenReceive(item)}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span>Receive</span>
                          </button>
                          <button
                            onClick={() => handleOpenAdjust(item)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <span>Adjust</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3 text-xs text-slate-500 flex justify-between items-center">
              <span>Showing {filteredItems.length} of {lowStockItems.length} low stock alerts</span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="font-medium text-emerald-600 hover:underline"
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Receive Stock Modal */}
      <ReceiveStockModal
        isOpen={isReceiveModalOpen}
        initialProduct={selectedProduct}
        onClose={() => {
          setIsReceiveModalOpen(false)
          setSelectedProduct(null)
        }}
        onSuccess={handleReceiveSuccess}
      />

      {/* Adjust Inventory Modal */}
      <AdjustInventoryModal
        isOpen={isAdjustModalOpen}
        initialProduct={selectedProduct}
        onClose={() => {
          setIsAdjustModalOpen(false)
          setSelectedProduct(null)
        }}
        onSuccess={handleAdjustSuccess}
      />
    </div>
  )
}

export default InventoryPage
