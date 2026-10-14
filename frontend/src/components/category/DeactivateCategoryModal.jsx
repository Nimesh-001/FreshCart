import React, { useState } from 'react'
import categoryService from '../../services/categoryService'

export function DeactivateCategoryModal({ isOpen, category, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen || !category) return null

  const handleDeactivate = async () => {
    setLoading(true)
    setError(null)
    try {
      await categoryService.deactivateCategory(category.categoryId)
      if (onSuccess) {
        onSuccess(category.categoryId)
      }
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to deactivate category')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all border border-slate-100 p-6">
          <div className="flex items-center gap-3.5 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Deactivate Category</h3>
              <p className="text-xs text-slate-500 font-mono">#{category.categoryId} • {category.categoryName}</p>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            Are you sure you want to deactivate <span className="font-semibold text-slate-900">"{category.categoryName}"</span>?
          </p>
          <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-500 space-y-1">
            <p className="font-medium text-slate-700">Backend behavior note:</p>
            <p>• Category status will change to <span className="font-semibold text-slate-700">Inactive</span>.</p>
            <p>• Existing products remain linked, but new products cannot be assigned to inactive categories.</p>
          </div>

          {error && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              {error}
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeactivate}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-amber-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Deactivating...</span>
                </>
              ) : (
                <span>Confirm Deactivation</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeactivateCategoryModal
