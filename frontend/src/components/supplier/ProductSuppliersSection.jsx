import React, { useState, useEffect, useCallback } from 'react'
import supplierService from '../../services/supplierService'
import { formatCurrency, formatDateTime } from '../../utils/formatters'
import LoadingSpinner from '../LoadingSpinner'
import ErrorMessage from '../ErrorMessage'
import AssignSupplierModal from './AssignSupplierModal'
import EditSupplierPriceModal from './EditSupplierPriceModal'

export function ProductSuppliersSection({ productId, productName }) {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [removingId, setRemovingId] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  const fetchProductSuppliers = useCallback(async () => {
    if (!productId) return
    setLoading(true)
    setError(null)
    try {
      const res = await supplierService.getSuppliersByProductId(productId)
      setSuppliers(res?.data || [])
    } catch (err) {
      setError(err.message || 'Failed to load product suppliers')
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    fetchProductSuppliers()
  }, [fetchProductSuppliers])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleAssignSuccess = (created) => {
    showToast(`Supplier assigned successfully!`)
    fetchProductSuppliers()
  }

  const handleEditPriceSuccess = (updated) => {
    showToast(`Supplier price updated successfully!`)
    fetchProductSuppliers()
  }

  const handleRemoveSupplier = async (supplier) => {
    if (!window.confirm(`Are you sure you want to remove supplier "${supplier.supplierName}" from this product?`)) {
      return
    }
    setRemovingId(supplier.supplierId)
    try {
      await supplierService.removeSupplierFromProduct(productId, supplier.supplierId)
      showToast(`Supplier "${supplier.supplierName}" removed from product.`)
      fetchProductSuppliers()
    } catch (err) {
      alert(`Failed to remove supplier: ${err.message || ''}`)
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="border-b border-emerald-200 bg-emerald-50 px-6 py-2.5 text-xs font-semibold text-emerald-800 flex items-center justify-between">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-emerald-600 hover:text-emerald-900">
            &times;
          </button>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Product Suppliers</h3>
            <p className="text-xs text-slate-500">Authorized vendor sources and unit supply purchase agreements</p>
          </div>
        </div>
        <button
          onClick={() => setIsAssignModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Assign Supplier</span>
        </button>
      </div>

      {/* Body */}
      <div className="p-6">
        {loading ? (
          <div className="py-8 flex justify-center">
            <LoadingSpinner size="md" message="Loading assigned suppliers..." />
          </div>
        ) : error ? (
          <ErrorMessage
            title="Failed to load suppliers"
            message={error}
            onRetry={fetchProductSuppliers}
          />
        ) : suppliers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h4 className="mt-3 text-sm font-semibold text-slate-800">No Suppliers Assigned</h4>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              Assign an active supplier to enable inventory restocking and purchase tracking for this product.
            </p>
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Assign First Supplier
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-2.5 px-3">Supplier</th>
                  <th className="py-2.5 px-3">Contact</th>
                  <th className="py-2.5 px-3">Supply Price</th>
                  <th className="py-2.5 px-3">Last Supplied</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {suppliers.map((s) => (
                  <tr key={s.supplierId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{s.supplierName}</div>
                      <div className="text-xs font-mono text-slate-400">ID: #{s.supplierId}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-xs font-medium text-slate-700">{s.contactPerson || '—'}</div>
                      <div className="text-[11px] text-slate-400">
                        {s.supplierEmail || s.supplierPhone || ''}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-emerald-700">
                      {formatCurrency(s.supplierPrice ?? 0)}
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-500">
                      {s.lastSuppliedDate ? formatDateTime(s.lastSuppliedDate) : 'Never'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingSupplier(s)}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          Edit Price
                        </button>
                        <button
                          onClick={() => handleRemoveSupplier(s)}
                          disabled={removingId === s.supplierId}
                          className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50 transition-colors"
                          title="Remove supplier assignment"
                        >
                          {removingId === s.supplierId ? 'Removing...' : 'Remove'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Supplier Modal */}
      <AssignSupplierModal
        isOpen={isAssignModalOpen}
        productId={productId}
        productName={productName}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={handleAssignSuccess}
      />

      {/* Edit Supplier Price Modal */}
      <EditSupplierPriceModal
        isOpen={Boolean(editingSupplier)}
        productId={productId}
        supplier={editingSupplier}
        onClose={() => setEditingSupplier(null)}
        onSuccess={handleEditPriceSuccess}
      />
    </div>
  )
}

export default ProductSuppliersSection
