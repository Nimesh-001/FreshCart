import React, { useState } from 'react'
import paymentService from '../services/paymentService'
import { formatCurrency, formatDateTime } from '../utils/formatters'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import StatusBadge from '../components/StatusBadge'
import ProcessPaymentModal from '../components/payment/ProcessPaymentModal'
import RefundModal from '../components/payment/RefundModal'

export function PaymentsPage() {
  const [lookupOrderId, setLookupOrderId] = useState('')
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Modals
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false)
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleLookup = async (e) => {
    if (e) e.preventDefault()
    if (!lookupOrderId.trim()) {
      setError('Please enter an Order ID to search')
      return
    }

    setLoading(true)
    setError(null)
    setPayment(null)
    try {
      const res = await paymentService.getPaymentByOrderId(lookupOrderId.trim())
      setPayment(res?.data || null)
    } catch (err) {
      setError(err.message || `No payment record found for Order #${lookupOrderId}`)
    } finally {
      setLoading(false)
    }
  }

  const handleProcessSuccess = (result) => {
    showToast(result?.message || 'Payment processed successfully!')
    setLookupOrderId(String(result?.orderId || ''))
    setPayment(result)
  }

  const handleRefundSuccess = (result) => {
    showToast(result?.message || 'Refund issued successfully!')
    if (payment) {
      setPayment({
        ...payment,
        paymentStatus: result?.paymentStatus || 'REFUNDED',
        orderStatus: result?.orderStatus || payment.orderStatus,
      })
    }
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Payment Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Simulated payment settlements, transaction ledger, and order refund processing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsProcessModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Process Payment</span>
          </button>
        </div>
      </div>

      {/* Security notice banner */}
      <div className="rounded-2xl border border-teal-200 bg-teal-50/70 p-4 text-xs text-teal-900 flex items-start gap-3">
        <svg className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <div>
          <span className="font-bold">Simulated Payment Gateway:</span> CARD and ONLINE transactions are processed instantaneously within the simulation engine. FreshCart does not store sensitive card numbers, CVVs, or PINs.
        </div>
      </div>

      {/* Lookup Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="number"
              placeholder="Enter Order ID to inspect payment details..."
              value={lookupOrderId}
              onChange={(e) => setLookupOrderId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            Search Payment
          </button>
        </form>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <LoadingSpinner size="lg" message="Searching payment registry..." />
        </div>
      ) : error ? (
        <ErrorMessage
          title="Payment Search"
          message={error}
          onRetry={handleLookup}
        />
      ) : payment ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">Order #{payment.orderId} Payment</h3>
                {payment.isSimulated && (
                  <span className="rounded-md bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-800 uppercase tracking-wider">
                    Simulated
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Payment ID: #{payment.paymentId}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={payment.paymentStatus} />
              {(payment.paymentStatus === 'PAID' || payment.paymentStatus === 'SUCCESS') && (
                <button
                  type="button"
                  onClick={() => setIsRefundModalOpen(true)}
                  className="rounded-xl border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition-colors"
                >
                  Issue Refund
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Amount Paid</span>
              <p className="mt-1 text-2xl font-bold text-emerald-700">{formatCurrency(payment.amount)}</p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Payment Method</span>
              <p className="mt-1 text-base font-semibold text-slate-800">{payment.paymentMethod}</p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Transaction Ref</span>
              <p className="mt-1 text-xs font-mono font-medium text-slate-700 break-all">{payment.transactionReference || '—'}</p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Payment Date</span>
              <p className="mt-1 text-xs font-medium text-slate-800">{formatDateTime(payment.paymentDate)}</p>
            </div>
          </div>

          {payment.message && (
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Gateway Message:</span> {payment.message}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900">Search or Process Payments</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
            Enter an Order ID above to look up transaction status, or click Process Payment to record a new payment settlement.
          </p>
        </div>
      )}

      {/* Process Payment Modal */}
      <ProcessPaymentModal
        isOpen={isProcessModalOpen}
        onClose={() => setIsProcessModalOpen(false)}
        onSuccess={handleProcessSuccess}
      />

      {/* Refund Modal */}
      <RefundModal
        isOpen={isRefundModalOpen}
        orderId={payment?.orderId}
        onClose={() => setIsRefundModalOpen(false)}
        onSuccess={handleRefundSuccess}
      />
    </div>
  )
}

export default PaymentsPage
