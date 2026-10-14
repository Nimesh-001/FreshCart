import React, { useState, useEffect } from 'react'
import deliveryService from '../../services/deliveryService'

export function UpdateDeliveryStatusModal({ isOpen, onClose, orderId, currentStatus, onSuccess }) {
  const [status, setStatus] = useState('OUT_FOR_DELIVERY')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen) {
      setStatus(currentStatus || 'OUT_FOR_DELIVERY')
      setError(null)
    }
  }, [isOpen, currentStatus])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!orderId) return

    setSubmitting(true)
    setError(null)
    try {
      const res = await deliveryService.updateDeliveryStatus(orderId, status)
      onSuccess?.(res?.data)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to update delivery status')
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Update Delivery Status</h3>
              <p className="text-xs text-slate-500">For Order #{orderId}</p>
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              New Delivery Status <span className="text-rose-500">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={submitting}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ASSIGNED">ASSIGNED — Courier allocated</option>
              <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY — En route to customer</option>
              <option value="DELIVERED">DELIVERED — Successfully handed over</option>
              <option value="FAILED">FAILED — Delivery attempt failed</option>
            </select>
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
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Save Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UpdateDeliveryStatusModal
