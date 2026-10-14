import React, { useState, useEffect } from 'react'
import productService from '../../services/productService'
import cartService from '../../services/cartService'
import { formatCurrency } from '../../utils/formatters'

export function AddToCartModal({ isOpen, onClose, customerId, onSuccess }) {
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen) {
      setSelectedProductId('')
      setQuantity(1)
      setError(null)
      loadProducts()
    }
  }, [isOpen])

  const loadProducts = async () => {
    setLoadingProducts(true)
    try {
      const res = await productService.getAllProducts({ size: 100 })
      const list = res?.data?.content || res?.data || []
      // Only active products with stock > 0
      setProducts(list.filter(p => p.isActive && p.stockQuantity > 0))
    } catch (err) {
      setError('Failed to load products: ' + (err.message || ''))
    } finally {
      setLoadingProducts(false)
    }
  }

  const selectedProduct = products.find(p => String(p.productId) === String(selectedProductId))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedProductId) {
      setError('Please select a product')
      return
    }
    if (!quantity || Number(quantity) < 1) {
      setError('Quantity must be at least 1')
      return
    }
    if (selectedProduct && Number(quantity) > selectedProduct.stockQuantity) {
      setError(`Cannot add more than available stock (${selectedProduct.stockQuantity} units)`)
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const payload = {
        customerId: Number(customerId),
        productId: Number(selectedProductId),
        quantity: Number(quantity),
      }
      const res = await cartService.addItemToCart(payload)
      onSuccess?.(res?.data)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to add item to cart')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Add to Cart</h3>
              <p className="text-xs text-slate-500">For Customer #{customerId}</p>
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

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Select Product <span className="text-rose-500">*</span>
            </label>
            {loadingProducts ? (
              <p className="mt-1 text-xs text-slate-500">Loading active catalog...</p>
            ) : (
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                disabled={submitting}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
              >
                <option value="">-- Choose a grocery product --</option>
                {products.map((p) => (
                  <option key={p.productId} value={p.productId}>
                    {p.productName} — {formatCurrency(p.price)} ({p.stockQuantity} in stock)
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedProduct && (
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 flex justify-between items-center text-xs">
              <span className="text-slate-600">Price per unit:</span>
              <span className="font-bold text-emerald-700 text-sm">{formatCurrency(selectedProduct.price)}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Quantity <span className="text-rose-500">*</span>
            </label>
            <div className="mt-1.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity(q => Math.max(1, Number(q) - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 font-bold"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={selectedProduct?.stockQuantity || 99}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 rounded-xl border border-slate-200 bg-white py-1.5 text-center text-sm font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setQuantity(q => (selectedProduct ? Math.min(selectedProduct.stockQuantity, Number(q) + 1) : Number(q) + 1))}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 font-bold"
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedProductId}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50"
            >
              {submitting ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddToCartModal
