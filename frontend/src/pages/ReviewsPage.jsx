import React, { useState, useEffect, useCallback } from 'react'
import reviewService from '../services/reviewService'
import productService from '../services/productService'
import { formatDateTime } from '../utils/formatters'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import EmptyState from '../components/EmptyState'
import AddReviewModal from '../components/review/AddReviewModal'
import EditReviewModal from '../components/review/EditReviewModal'

export function ReviewsPage() {
  const [activeTab, setActiveTab] = useState('ANALYSIS') // 'ANALYSIS' | 'LIST'
  const [analysisList, setAnalysisList] = useState([])
  const [loadingAnalysis, setLoadingAnalysis] = useState(true)

  // Product reviews tab
  const [products, setProducts] = useState([])
  const [selectedProductId, setSelectedProductId] = useState('')
  const [productReviews, setProductReviews] = useState([])
  const [loadingReviews, setLoadingReviews] = useState(false)

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingReview, setEditingReview] = useState(null)
  const [error, setError] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  // Fetch analysis
  const fetchAnalysis = useCallback(async () => {
    setLoadingAnalysis(true)
    setError(null)
    try {
      const res = await reviewService.getReviewAnalysis()
      setAnalysisList(res?.data || [])
    } catch (err) {
      setError(err.message || 'Failed to load review analysis')
    } finally {
      setLoadingAnalysis(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchAnalysis()
    loadProducts()
  }, [fetchAnalysis])

  const loadProducts = async () => {
    try {
      const res = await productService.getAllProducts({ size: 100 })
      const list = res?.data?.content || res?.data || []
      setProducts(list)
      if (list.length > 0) {
        setSelectedProductId(String(list[0].productId))
      }
    } catch {
      // ignore
    }
  }

  // Fetch reviews for specific product
  const fetchProductReviews = useCallback(async (prodId) => {
    if (!prodId) return
    setLoadingReviews(true)
    try {
      const res = await reviewService.getReviewsByProductId(prodId)
      setProductReviews(res?.data || [])
    } catch (err) {
      setError(err.message || 'Failed to load product reviews')
    } finally {
      setLoadingReviews(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'LIST' && selectedProductId) {
      fetchProductReviews(selectedProductId)
    }
  }, [activeTab, selectedProductId, fetchProductReviews])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleAddSuccess = () => {
    showToast('Review submitted successfully!')
    fetchAnalysis()
    if (selectedProductId) {
      fetchProductReviews(selectedProductId)
    }
  }

  const handleEditSuccess = () => {
    showToast('Review updated successfully!')
    fetchAnalysis()
    if (selectedProductId) {
      fetchProductReviews(selectedProductId)
    }
  }

  const handleSelectProductForView = (prodId) => {
    setSelectedProductId(String(prodId))
    setActiveTab('LIST')
  }

  const renderStars = (rating) => {
    return (
      <div className="flex items-center text-amber-400">
        {[1, 2, 3, 4, 5].map((s) => (
          <svg
            key={s}
            className={`w-4 h-4 ${s <= rating ? 'fill-current' : 'text-slate-200 fill-current'}`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reviews & Ratings</h1>
          <p className="mt-1 text-sm text-slate-500">
            Customer feedback, star ratings analysis, and verified buyer satisfaction scores.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Review</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('ANALYSIS')}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 -mb-px ${
            activeTab === 'ANALYSIS'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Product Review Analysis
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('LIST')}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 -mb-px ${
            activeTab === 'LIST'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Product Reviews Feed
        </button>
      </div>

      {error && (
        <ErrorMessage
          title="Review Module Alert"
          message={error}
          onRetry={activeTab === 'ANALYSIS' ? fetchAnalysis : () => fetchProductReviews(selectedProductId)}
        />
      )}

      {/* Tab 1: Product Review Analysis */}
      {activeTab === 'ANALYSIS' && (
        <>
          {loadingAnalysis ? (
            <div className="py-20 flex justify-center">
              <LoadingSpinner size="lg" message="Computing product satisfaction metrics..." />
            </div>
          ) : analysisList.length === 0 ? (
            <EmptyState
              title="No Review Analysis Available"
              description="Customer feedback and star ratings will generate automated satisfaction metrics."
              actionLabel="Add Review"
              onAction={() => setIsAddModalOpen(true)}
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Avg Rating</th>
                      <th className="py-3 px-4">Sentiment Label</th>
                      <th className="py-3 px-4 text-center">Total Reviews</th>
                      <th className="py-3 px-4">Sentiment Breakdown</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {analysisList.map((item) => (
                      <tr key={item.productId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">{item.productName}</div>
                          <div className="text-xs font-mono text-slate-400">#{item.productId}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                          {item.categoryName || '—'}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-base">
                              {item.averageRating ? Number(item.averageRating).toFixed(1) : '0.0'}
                            </span>
                            {renderStars(Math.round(item.averageRating || 0))}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            item.overallRatingLabel === 'POSITIVE' || item.overallRatingLabel === 'EXCELLENT'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : item.overallRatingLabel === 'NEGATIVE' || item.overallRatingLabel === 'POOR'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {item.overallRatingLabel || 'NEUTRAL'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                          {item.totalReviews}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-emerald-700 font-semibold">{item.positiveReviews} Pos</span>
                            <span className="text-slate-300">&bull;</span>
                            <span className="text-amber-700 font-semibold">{item.averageReviews} Avg</span>
                            <span className="text-slate-300">&bull;</span>
                            <span className="text-rose-700 font-semibold">{item.negativeReviews} Neg</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleSelectProductForView(item.productId)}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            View Feed
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Tab 2: Product Reviews Feed */}
      {activeTab === 'LIST' && (
        <div className="space-y-4">
          {/* Product Picker */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Select Product:
              </span>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {products.map((p) => (
                  <option key={p.productId} value={p.productId}>
                    {p.productName} (#{p.productId})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loadingReviews ? (
            <div className="py-16 flex justify-center">
              <LoadingSpinner size="lg" message="Loading product reviews feed..." />
            </div>
          ) : productReviews.length === 0 ? (
            <EmptyState
              title="No Reviews for this Product Yet"
              description="Be the first verified customer to leave a review after order delivery."
              actionLabel="Add Review"
              onAction={() => setIsAddModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {productReviews.map((rev) => (
                <div key={rev.reviewId} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{rev.customerName || `Customer #${rev.customerId}`}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Order #{rev.orderId}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        {renderStars(rev.rating)}
                        <span className="text-xs font-bold text-slate-700">{rev.ratingLabel || `${rev.rating} / 5`}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingReview(rev)}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Edit
                    </button>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {rev.comment || <span className="text-slate-400 italic">No written comment provided.</span>}
                  </p>

                  <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-400">
                    Posted on {formatDateTime(rev.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Review Modal */}
      <AddReviewModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Edit Review Modal */}
      <EditReviewModal
        isOpen={Boolean(editingReview)}
        review={editingReview}
        onClose={() => setEditingReview(null)}
        onSuccess={handleEditSuccess}
      />
    </div>
  )
}

export default ReviewsPage
