import React, { useState, useEffect } from 'react'
import reviewService from '../../services/reviewService'

export function EditReviewModal({ isOpen, onClose, review, onSuccess }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen && review) {
      setRating(review.rating || 5)
      setComment(review.comment || '')
      setError(null)
    }
  }, [isOpen, review])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!review) return
    if (!rating || rating < 1 || rating > 5) {
      setError('Rating must be between 1 and 5')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const payload = {
        customerId: review.customerId,
        rating: Number(rating),
        comment: comment.trim() || undefined,
      }
      const res = await reviewService.updateReview(review.reviewId, payload)
      onSuccess?.(res?.data)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to update review')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen || !review) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Edit Review</h3>
              <p className="text-xs text-slate-500">Review #{review.reviewId} for {review.productName}</p>
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
              placeholder="Update your review comments..."
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
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-amber-700 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Update Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditReviewModal
