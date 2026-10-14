import React, { useState, useEffect } from 'react'
import reviewService from '../../services/reviewService'
import productService from '../../services/productService'

export function AddReviewModal({ isOpen, onClose, onSuccess }) {
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)

  const [customerId, setCustomerId] = useState('')
  const [productId, setProductId] = useState('')
  const [orderId, setOrderId] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen) {
      setCustomerId('')
      setProductId('')
      setOrderId('')
      setRating(5)
      setComment('')
      setError(null)
      loadProducts()
    }
  }, [isOpen])

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!customerId || Number(customerId) <= 0) {
      setError('Valid Customer ID is required')
      return
    }
    if (!productId) {
      setError('Product is required')
      return
    }
    if (!orderId || Number(orderId) <= 0) {
      setError('Delivered Order ID is required')
      return
    }
    if (!rating || rating < 1 || rating > 5) {
      setError('Rating must be between 1 and 5')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const payload = {
        customerId: Number(customerId),
        productId: Number(productId),
        orderId: Number(orderId),
        rating: Number(rating),
        comment: comment.trim() || undefined,
      }
      const res = await reviewService.addReview(payload)
      onSuccess?.(res?.data)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to submit review')
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Add Product Review</h3>
              <p className="text-xs text-slate-500">Verified buyer rating and feedback</p>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Customer ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 1"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                disabled={submitting}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Order ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 101"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                disabled={submitting}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Rule: The order must belong to this customer, contain this product, and be in DELIVERED status.
          </p>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Select Product <span className="text-rose-500">*</span>
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              disabled={submitting || loadingProducts}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">-- Choose Product --</option>
              {products.map((p) => (
                <option key={p.productId} value={p.productId}>
                  {p.productName} (#{p.productId})
                </option>
              ))}
            </select>
          </div>

          {/* Rating 1-5 */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Rating (1–5 Stars) <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    star <= rating ? 'text-amber-400 hover:text-amber-500' : 'text-slate-300 hover:text-slate-400'
                  }`}
                >
                  <svg className="w-7 h-7 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
              <span className="ml-2 text-xs font-bold text-slate-700">{rating} / 5 Stars</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Review Comments (Optional)
            </label>
            <textarea
              rows={3}
              maxLength={500}
              placeholder="Share thoughts on quality, freshness, and packaging..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={submitting}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
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
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Post Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddReviewModal
