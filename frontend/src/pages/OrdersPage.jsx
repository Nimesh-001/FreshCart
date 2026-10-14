import React, { useState, useEffect, useCallback } from 'react'
import customerService from '../services/customerService'
import orderService from '../services/orderService'
import { formatCurrency, formatDateTime } from '../utils/formatters'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import EmptyState from '../components/EmptyState'
import StatusBadge from '../components/StatusBadge'
import OrderDetailModal from '../components/order/OrderDetailModal'

export function OrdersPage() {
  const [customers, setCustomers] = useState([])
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Details modal
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [cancellingOrderId, setCancellingOrderId] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  useEffect(() => {
    async function loadCustomers() {
      try {
        const res = await customerService.searchCustomers('')
        const list = res?.data || []
        setCustomers(list)
        if (list.length > 0) {
          setSelectedCustomerId(String(list[0].customerId))
        } else {
          setLoading(false)
        }
      } catch (err) {
        setError('Failed to load customers: ' + (err.message || ''))
        setLoading(false)
      }
    }
    loadCustomers()
  }, [])

  const fetchOrders = useCallback(async () => {
    if (!selectedCustomerId) return
    setLoading(true)
    setError(null)
    try {
      const res = await orderService.getOrderHistory(selectedCustomerId)
      setOrders(res?.data || [])
    } catch (err) {
      setError(err.message || 'Failed to load order history')
    } finally {
      setLoading(false)
    }
  }, [selectedCustomerId])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleOpenDetail = (order) => {
    setSelectedOrder(order)
    setIsDetailModalOpen(true)
  }

  const handleCancelOrder = async (order) => {
    if (!window.confirm(`Are you sure you want to cancel Order #${order.orderId}? This will restock the inventory.`)) {
      return
    }

    setCancellingOrderId(order.orderId)
    try {
      const res = await orderService.cancelOrder(order.orderId, selectedCustomerId)
      showToast(`Order #${order.orderId} cancelled successfully`)
      setIsDetailModalOpen(false)
      fetchOrders()
    } catch (err) {
      alert(`Failed to cancel order: ${err.message || ''}`)
    } finally {
      setCancellingOrderId(null)
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Order Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Customer order history, line item breakdown, and order cancellation processing.
          </p>
        </div>
      </div>

      {/* Customer Selector */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Select Customer:
            </span>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {customers.map((c) => (
                <option key={c.customerId} value={c.customerId}>
                  {c.fullName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.username || 'Customer'} ({c.email}) #{c.customerId}
                </option>
              ))}
            </select>
          </div>
          <div className="text-xs text-slate-500">
            Total Orders: <span className="font-semibold text-slate-800">{orders.length}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" message="Loading customer order history..." />
        </div>
      ) : error ? (
        <ErrorMessage
          title="Failed to Load Orders"
          message={error}
          onRetry={fetchOrders}
        />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No Orders Placed Yet"
          description="This customer does not have any recorded orders yet."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Order Status</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {orders.map((order) => {
                  const isCancellable = order.status === 'PENDING' || order.status === 'PROCESSING'
                  return (
                    <tr key={order.orderId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-700">
                        #{order.orderId}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {formatDateTime(order.orderDate)}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {order.itemLineCount ?? order.items?.length ?? 0} lines ({order.totalUnits ?? 0} units)
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-700">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-0.5">
                          <StatusBadge status={order.paymentStatus || 'PENDING'} />
                          <span className="text-[10px] text-slate-400">{order.paymentMethod || '—'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(order)}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            Details
                          </button>
                          {isCancellable && (
                            <button
                              type="button"
                              onClick={() => handleCancelOrder(order)}
                              disabled={cancellingOrderId === order.orderId}
                              className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50 transition-colors"
                            >
                              {cancellingOrderId === order.orderId ? 'Cancelling...' : 'Cancel'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      <OrderDetailModal
        isOpen={isDetailModalOpen}
        order={selectedOrder}
        onClose={() => setIsDetailModalOpen(false)}
        onCancelOrder={handleCancelOrder}
      />
    </div>
  )
}

export default OrdersPage
