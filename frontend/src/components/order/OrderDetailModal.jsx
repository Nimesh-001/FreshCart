import React from 'react'
import { formatCurrency, formatDateTime } from '../../utils/formatters'
import StatusBadge from '../StatusBadge'

export function OrderDetailModal({ isOpen, onClose, order, onCancelOrder }) {
  if (!isOpen || !order) return null

  const isCancellable = order.status === 'PENDING' || order.status === 'PROCESSING'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl border border-slate-100 transition-all max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Order #{order.orderId} Details</h3>
              <p className="text-xs text-slate-500">Placed on {formatDateTime(order.orderDate)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Status Highlights */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">Order Status</span>
            <div className="mt-1"><StatusBadge status={order.status} /></div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">Payment Status</span>
            <div className="mt-1"><StatusBadge status={order.paymentStatus || 'PENDING'} /></div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">Payment Method</span>
            <p className="mt-1 text-xs font-semibold text-slate-800">{order.paymentMethod || '—'}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Amount</span>
            <p className="mt-1 text-sm font-bold text-emerald-700">{formatCurrency(order.totalAmount)}</p>
          </div>
        </div>

        {/* Order Items Table */}
        <div className="mt-5 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Order Items ({order.items?.length || 0})</h4>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3 text-center">Quantity</th>
                  <th className="py-2.5 px-3">Unit Price</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items?.map((item) => (
                  <tr key={item.orderItemId || item.productId}>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {item.productName}
                      <span className="ml-1 text-[10px] text-slate-400 font-mono">#{item.productId}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-600 font-medium">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-slate-600">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700">{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
          <div>
            {isCancellable && (
              <button
                type="button"
                onClick={() => onCancelOrder?.(order)}
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
              >
                Cancel Order
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailModal
