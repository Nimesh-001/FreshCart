import React, { useState, useEffect } from 'react'
import supplierService from '../../services/supplierService'

export function EditSupplierPriceModal({ isOpen, onClose, productId, supplier, onSuccess }) {
  const [supplierPrice, setSupplierPrice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [validationError, setValidationError] = useState('')

  useEffect(() => {
    if (isOpen && supplier) {
      setSupplierPrice(supplier.supplierPrice !== undefined ? String(supplier.supplierPrice) : '')
      setError(null)
      setValidationError('')
    }
  }, [isOpen, supplier])

  const validate = () => {
    if (supplierPrice === '' || supplierPrice === null || isNaN(Number(supplierPrice))) {
      setValidationError('Valid supplier price is required')
      return false
    }
    if (Number(supplierPrice) < 0) {
      setValidationError('Supplier price cannot be negative')
      return false
    }
    setValidationError('')
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!validate()) return

    setSubmitting(true)
    try {
      const payload = {
        supplierPrice: Number(supplierPrice),
      }
      const res = await supplierService.updateProductSupplier(productId, supplier.supplierId, payload)
      onSuccess?.(res?.data)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to update supplier price')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen || !supplier) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Update Supplier Price</h3>
              <p className="text-xs text-slate-500">{supplier.supplierName} (#{supplier.supplierId})</p>
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

        {/* Global Error */}
        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Supplier Price */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Contracted Supply Price ($) <span className="text-rose-500">*</span>
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
                value={supplierPrice}
                onChange={(e) => setSupplierPrice(e.target.value)}
                disabled={submitting}
                className={`w-full rounded-xl border bg-slate-50/50 pl-8 pr-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 transition-colors ${
                  validationError
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500'
                }`}
              />
            </div>
            {validationError && (
              <p className="mt-1 text-xs text-rose-600">{validationError}</p>
            )}
            <p className="mt-1 text-[11px] text-slate-400">
              New purchase price per unit for this supplier partnership. Must be &ge; $0.00.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-amber-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Updating...</span>
                </>
              ) : (
                <span>Save Price</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditSupplierPriceModal
