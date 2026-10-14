import React, { useState, useEffect } from 'react'
import deliveryService from '../../services/deliveryService'

export function AssignDeliveryModal({ isOpen, onClose, initialOrderId = '', onSuccess }) {
  const [orderId, setOrderId] = useState('')
  const [deliveryPerson, setDeliveryPerson] = useState('')
  const [deliveryPhone, setDeliveryPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen) {
      setOrderId(initialOrderId ? String(initialOrderId) : '')
      setDeliveryPerson('')
      setDeliveryPhone('')
      setError(null)
    }
  }, [isOpen, initialOrderId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!orderId || Number(orderId) <= 0) {
      setError('Valid Order ID is required')
      return
    }
    if (!deliveryPerson.trim()) {
      setError('Delivery person name is required')
      return
    }
    if (!deliveryPhone.trim()) {
      setError('Delivery contact phone is required')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const payload = {
        orderId: Number(orderId),
        deliveryPerson: deliveryPerson.trim(),
        deliveryPhone: deliveryPhone.trim(),
      }
      const res = await deliveryService.assignDelivery(payload)
      onSuccess?.(res?.data)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to assign delivery')
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Assign Delivery Courier</h3>
              <p className="text-xs text-slate-500">Dispatch personnel to fulfill customer order</p>
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
              Order ID <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              placeholder="e.g. 101"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              disabled={submitting || Boolean(initialOrderId)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Only paid or processing orders can be assigned.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Delivery Person Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              maxLength={100}
              placeholder="e.g. Alex Rider"
              value={deliveryPerson}
              onChange={(e) => setDeliveryPerson(e.target.value)}
              disabled={submitting}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Courier Phone Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              maxLength={20}
              placeholder="e.g. +1-555-019-3388"
              value={deliveryPhone}
              onChange={(e) => setDeliveryPhone(e.target.value)}
              disabled={submitting}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Assigning...' : 'Assign Courier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AssignDeliveryModal
