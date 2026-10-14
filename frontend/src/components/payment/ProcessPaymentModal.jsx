import React, { useState, useEffect } from 'react'
import paymentService from '../../services/paymentService'

export function ProcessPaymentModal({ isOpen, onClose, initialOrderId = '', initialAmount = '', onSuccess }) {
  const [orderId, setOrderId] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CARD') // 'CARD' | 'ONLINE' | 'CASH_ON_DELIVERY'
  const [transactionReference, setTransactionReference] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen) {
      setOrderId(initialOrderId ? String(initialOrderId) : '')
      setAmount(initialAmount ? String(initialAmount) : '')
      setPaymentMethod('CARD')
      setTransactionReference(`TXN-SIM-${Math.floor(100000 + Math.random() * 900000)}`)
      setError(null)
    }
  }, [isOpen, initialOrderId, initialAmount])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!orderId || Number(orderId) <= 0) {
      setError('Valid Order ID is required')
      return
    }
    if (amount === '' || isNaN(Number(amount)) || Number(amount) < 0) {
      setError('Payment amount must be non-negative')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const payload = {
        orderId: Number(orderId),
        paymentMethod: paymentMethod,
        amount: Number(amount),
        transactionReference: transactionReference || undefined,
      }
      const res = await paymentService.processPayment(payload)
      onSuccess?.(res?.data)
      onClose()
    } catch (err) {
      setError(err.message || 'Payment processing failed')
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Process Payment</h3>
              <p className="text-xs text-slate-500">Simulate order transaction settlement</p>
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
          {/* Order ID */}
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
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Payment Amount ($) <span className="text-rose-500">*</span>
            </label>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={submitting}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-8 pr-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Must exactly match the order total amount.</p>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Payment Method <span className="text-rose-500">*</span>
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              disabled={submitting}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="CARD">Credit/Debit Card (Simulated)</option>
              <option value="ONLINE">Online / UPI (Simulated)</option>
              <option value="CASH_ON_DELIVERY">Cash On Delivery (PENDING until fulfilled)</option>
            </select>
          </div>

          {/* Transaction Reference */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Transaction Reference
            </label>
            <input
              type="text"
              value={transactionReference}
              onChange={(e) => setTransactionReference(e.target.value)}
              disabled={submitting}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-800 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Simulated payment reference. No sensitive payment cards or banking PINs are collected.
            </p>
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
              {submitting ? 'Processing...' : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProcessPaymentModal
