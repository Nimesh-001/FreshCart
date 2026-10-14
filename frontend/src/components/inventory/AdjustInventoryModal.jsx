import React, { useState, useEffect } from 'react'
import productService from '../../services/productService'
import inventoryService from '../../services/inventoryService'

export function AdjustInventoryModal({ isOpen, onClose, initialProduct = null, onSuccess }) {
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)

  const [productId, setProductId] = useState('')
  const [adjustType, setAdjustType] = useState('DECREASE') // 'INCREASE' | 'DECREASE'
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      setError(null)
      setValidationErrors({})
      setQuantity('')
      setReason('')
      setAdjustType('DECREASE')

      const initId = initialProduct?.productId ? String(initialProduct.productId) : ''
      setProductId(initId)

      loadProducts()
    }
  }, [isOpen, initialProduct])

  const loadProducts = async () => {
    setLoadingProducts(true)
    try {
      const res = await productService.getAllProducts({ size: 100 })
      setProducts(res?.data?.content || res?.data || [])
    } catch (err) {
      setError('Failed to load products: ' + (err.message || ''))
    } finally {
      setLoadingProducts(false)
    }
  }

  const quickReasons = [
    'Damaged goods',
    'Inventory audit recount',
    'Expired items discarded',
    'Customer return restock',
    'Warehouse shrinkage / loss',
  ]

  const validate = () => {
    const errs = {}
    if (!productId) {
      errs.productId = 'Product is required'
    }
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0 || !Number.isInteger(Number(quantity))) {
      errs.quantity = 'Quantity must be a positive integer greater than 0'
    }
    if (!reason.trim()) {
      errs.reason = 'Reason for inventory adjustment is required'
    } else if (reason.trim().length > 255) {
      errs.reason = 'Reason cannot exceed 255 characters'
    }
    setValidationErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!validate()) return

    setSubmitting(true)
    try {
      const parsedQty = Number(quantity)
      const finalChange = adjustType === 'INCREASE' ? parsedQty : -parsedQty

      const payload = {
        productId: Number(productId),
        quantityChange: finalChange,
        reason: reason.trim(),
      }

      const res = await inventoryService.adjustInventory(payload)
      onSuccess?.(res?.data)
      onClose()
    } catch (err) {
      // Backend returns e.g. 400 Bad Request if adjustment would make stock negative
      setError(err.message || 'Failed to adjust inventory')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-100 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Adjust Inventory</h3>
              <p className="text-xs text-slate-500">Manual stock corrections, shrinkage, or audit adjustments</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Global Error */}
        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Product Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Product <span className="text-rose-500">*</span>
            </label>
            {loadingProducts ? (
              <p className="mt-1 text-xs text-slate-500">Loading catalog...</p>
            ) : (
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                disabled={submitting || Boolean(initialProduct)}
                className={`mt-1.5 w-full rounded-xl border bg-slate-50/50 px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-1 transition-colors ${
                  validationErrors.productId
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500'
                }`}
              >
                <option value="">-- Select Product --</option>
                {products.map((p) => (
                  <option key={p.productId} value={p.productId}>
                    {p.productName} (Current Stock: {p.stockQuantity ?? 0}) #{p.productId}
                  </option>
                ))}
              </select>
            )}
            {validationErrors.productId && (
              <p className="mt-1 text-xs text-rose-600">{validationErrors.productId}</p>
            )}
          </div>

          {/* Adjustment Direction */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Adjustment Type <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAdjustType('DECREASE')}
                className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-sm font-semibold transition-all ${
                  adjustType === 'DECREASE'
                    ? 'border-rose-500 bg-rose-50/80 text-rose-800 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-base font-bold">-</span>
                <span>Decrease Stock</span>
              </button>
              <button
                type="button"
                onClick={() => setAdjustType('INCREASE')}
                className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-sm font-semibold transition-all ${
                  adjustType === 'INCREASE'
                    ? 'border-emerald-500 bg-emerald-50/80 text-emerald-800 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-base font-bold">+</span>
                <span>Increase Stock</span>
              </button>
            </div>
          </div>

          {/* Quantity Change */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Quantity to {adjustType === 'INCREASE' ? 'Add' : 'Deduct'} <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 5"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={submitting}
              className={`mt-1.5 w-full rounded-xl border bg-slate-50/50 px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 transition-colors ${
                validationErrors.quantity
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                  : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500'
              }`}
            />
            {validationErrors.quantity && (
              <p className="mt-1 text-xs text-rose-600">{validationErrors.quantity}</p>
            )}
            <p className="mt-1 text-[11px] text-slate-400">
              Net change: {adjustType === 'INCREASE' ? `+${quantity || 0}` : `-${quantity || 0}`} units.
            </p>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Reason for Adjustment <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              maxLength={255}
              placeholder="Explain why this inventory adjustment is being made..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={submitting}
              className={`mt-1.5 w-full rounded-xl border bg-slate-50/50 px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 transition-colors ${
                validationErrors.reason
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                  : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500'
              }`}
            />
            {validationErrors.reason && (
              <p className="mt-1 text-xs text-rose-600">{validationErrors.reason}</p>
            )}

            {/* Quick Suggestions */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {quickReasons.map((qr) => (
                <button
                  key={qr}
                  type="button"
                  onClick={() => setReason(qr)}
                  className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  {qr}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-amber-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Applying...</span>
                </>
              ) : (
                <span>Confirm Adjustment</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdjustInventoryModal
