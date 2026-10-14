import React, { useState, useEffect, useCallback } from 'react'
import customerService from '../../services/customerService'
import { formatCurrency, formatDateTime } from '../../utils/formatters'
import LoadingSpinner from '../LoadingSpinner'

export function CustomerPurchaseSummary({ customerId }) {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSummary = useCallback(async () => {
    if (!customerId) return
    setLoading(true)
    setError(null)
    try {
      const response = await customerService.getCustomerPurchaseSummary(customerId)
      setSummary(response?.data || null)
    } catch (err) {
      setError(err.message || 'Failed to load purchase summary')
    } finally {
      setLoading(false)
    }
  }, [customerId])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Purchase Summary</h3>
            <p className="text-xs text-slate-500">Order activity and completed purchase metrics</p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchSummary}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <LoadingSpinner size="md" message="Loading purchase summary..." />
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 flex items-start gap-2.5">
            <svg className="w-4 h-4 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="font-medium">{error}</p>
              <button
                onClick={fetchSummary}
                className="mt-2 text-xs font-semibold underline text-red-900 hover:text-red-950 cursor-pointer"
              >
                Retry
              </button>
            </div>
          </div>
        ) : !summary ? (
          <div className="text-center py-6 text-slate-500 text-sm">No purchase summary data available.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Stat 1: Total Orders */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Orders</span>
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">{summary.totalOrders ?? 0}</p>
              <p className="mt-1 text-xs text-slate-500">Lifetime orders placed</p>
            </div>

            {/* Stat 2: Completed / Paid Order Value */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Completed Order Value</span>
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-emerald-700">
                {formatCurrency(summary.completedOrPaidOrderValue ?? 0)}
              </p>
              <p className="mt-1 text-xs text-slate-500">Paid or delivered order total</p>
            </div>

            {/* Stat 3: Latest Order Date */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Latest Order</span>
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="mt-3 text-sm font-bold text-slate-900 truncate">
                {summary.latestOrderDate ? formatDateTime(summary.latestOrderDate) : 'No orders yet'}
              </p>
              <p className="mt-1 text-xs text-slate-500">Most recent purchase date</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomerPurchaseSummary
