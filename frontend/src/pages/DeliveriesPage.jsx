import React, { useState, useEffect, useCallback } from 'react'
import deliveryService from '../services/deliveryService'
import { formatDateTime } from '../utils/formatters'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import EmptyState from '../components/EmptyState'
import StatusBadge from '../components/StatusBadge'
import AssignDeliveryModal from '../components/delivery/AssignDeliveryModal'
import UpdateDeliveryStatusModal from '../components/delivery/UpdateDeliveryStatusModal'

export function DeliveriesPage() {
  const [trackingRecords, setTrackingRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [orderStatusFilter, setOrderStatusFilter] = useState('')
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState('')
  const [searchOrderId, setSearchOrderId] = useState('')

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [selectedOrderIdForAssign, setSelectedOrderIdForAssign] = useState('')
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [selectedTrackingForUpdate, setSelectedTrackingForUpdate] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  const fetchTracking = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (orderStatusFilter) params.orderStatus = orderStatusFilter
      if (deliveryStatusFilter) params.deliveryStatus = deliveryStatusFilter

      const res = await deliveryService.searchTracking(params)
      setTrackingRecords(res?.data || [])
    } catch (err) {
      setError(err.message || 'Failed to load delivery and tracking records')
    } finally {
      setLoading(false)
    }
  }, [orderStatusFilter, deliveryStatusFilter])

  useEffect(() => {
    fetchTracking()
  }, [fetchTracking])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleOpenAssign = (orderId = '') => {
    setSelectedOrderIdForAssign(orderId)
    setIsAssignModalOpen(true)
  }

  const handleOpenUpdate = (rec) => {
    setSelectedTrackingForUpdate(rec)
    setIsUpdateModalOpen(true)
  }

  const handleAssignSuccess = (data) => {
    showToast(data?.message || 'Delivery courier assigned successfully!')
    fetchTracking()
  }

  const handleUpdateSuccess = (data) => {
    showToast(data?.message || 'Delivery status updated successfully!')
    fetchTracking()
  }

  const filteredRecords = trackingRecords.filter(rec => {
    if (!searchOrderId.trim()) return true
    return String(rec.orderId).includes(searchOrderId.trim())
  })

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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Delivery & Tracking</h1>
          <p className="mt-1 text-sm text-slate-500">
            Dispatch couriers, track fulfillment milestones, and monitor delivery logistics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenAssign('')}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Assign Courier</span>
          </button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Filter by Order ID..."
              value={searchOrderId}
              onChange={(e) => setSearchOrderId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Status filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={deliveryStatusFilter}
              onChange={(e) => setDeliveryStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Delivery Statuses</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="FAILED">Failed</option>
            </select>

            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Order Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" message="Loading delivery tracking records..." />
        </div>
      ) : error ? (
        <ErrorMessage
          title="Failed to Load Tracking"
          message={error}
          onRetry={fetchTracking}
        />
      ) : filteredRecords.length === 0 ? (
        <EmptyState
          title="No Delivery Tracking Records Found"
          description="Place orders or assign couriers to begin tracking live fulfillment status."
          actionLabel="Assign Courier"
          onAction={() => handleOpenAssign('')}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Order Status</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Delivery Status</th>
                  <th className="py-3 px-4">Courier Info</th>
                  <th className="py-3 px-4">Milestones</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredRecords.map((rec) => (
                  <tr key={rec.orderId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-700">
                      #{rec.orderId}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-600">
                      Customer #{rec.customerId}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={rec.orderStatus} />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5">
                        <StatusBadge status={rec.paymentStatus || 'PENDING'} />
                        <span className="text-[10px] text-slate-400">{rec.paymentMethod || '—'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {rec.deliveryStatus ? (
                        <StatusBadge status={rec.deliveryStatus} />
                      ) : (
                        <span className="text-xs text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {rec.deliveryPerson ? (
                        <div className="text-xs">
                          <div className="font-semibold text-slate-800">{rec.deliveryPerson}</div>
                          <div className="text-slate-400">{rec.deliveryPhone}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {rec.deliveredAt ? (
                        <span className="text-emerald-700 font-medium">Delivered: {formatDateTime(rec.deliveredAt)}</span>
                      ) : rec.assignedAt ? (
                        <span>Assigned: {formatDateTime(rec.assignedAt)}</span>
                      ) : (
                        <span>Order: {formatDateTime(rec.orderDate)}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {!rec.deliveryStatus ? (
                          <button
                            type="button"
                            onClick={() => handleOpenAssign(rec.orderId)}
                            className="rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                          >
                            Assign
                          </button>
                        ) : rec.deliveryStatus !== 'DELIVERED' ? (
                          <button
                            type="button"
                            onClick={() => handleOpenUpdate(rec)}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            Status
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-emerald-600">Complete</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3 text-xs text-slate-500">
            Showing {filteredRecords.length} tracking records
          </div>
        </div>
      )}

      {/* Assign Modal */}
      <AssignDeliveryModal
        isOpen={isAssignModalOpen}
        initialOrderId={selectedOrderIdForAssign}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={handleAssignSuccess}
      />

      {/* Update Status Modal */}
      <UpdateDeliveryStatusModal
        isOpen={isUpdateModalOpen}
        orderId={selectedTrackingForUpdate?.orderId}
        currentStatus={selectedTrackingForUpdate?.deliveryStatus}
        onClose={() => setIsUpdateModalOpen(false)}
        onSuccess={handleUpdateSuccess}
      />
    </div>
  )
}

export default DeliveriesPage
