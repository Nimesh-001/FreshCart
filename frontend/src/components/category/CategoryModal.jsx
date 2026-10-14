import React, { useState, useEffect } from 'react'
import categoryService from '../../services/categoryService'

export function CategoryModal({ isOpen, category = null, onClose, onSuccess }) {
  const isEditing = Boolean(category)
  const [formData, setFormData] = useState({
    categoryName: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [generalError, setGeneralError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  useEffect(() => {
    if (category) {
      setFormData({
        categoryName: category.categoryName || '',
        description: category.description || '',
      })
    } else {
      setFormData({
        categoryName: '',
        description: '',
      })
    }
    setFieldErrors({})
    setGeneralError(null)
    setSuccessMessage(null)
  }, [category, isOpen])

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }))
    }
    setGeneralError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setFieldErrors({})
    setGeneralError(null)
    setSuccessMessage(null)

    const errors = {}
    if (!formData.categoryName.trim()) {
      errors.categoryName = 'Category name is required'
    } else if (formData.categoryName.trim().length > 100) {
      errors.categoryName = 'Category name must not exceed 100 characters'
    }

    if (formData.description && formData.description.length > 255) {
      errors.description = 'Description must not exceed 255 characters'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setLoading(false)
      return
    }

    const payload = {
      categoryName: formData.categoryName.trim(),
      description: formData.description?.trim() || null,
    }

    try {
      let response
      if (isEditing) {
        response = await categoryService.updateCategory(category.categoryId, payload)
        setSuccessMessage('Category updated successfully!')
      } else {
        response = await categoryService.createCategory(payload)
        setSuccessMessage('Category created successfully!')
      }

      setTimeout(() => {
        if (onSuccess) {
          onSuccess(response?.data)
        }
        onClose()
      }, 700)
    } catch (err) {
      if (err.errors && typeof err.errors === 'object') {
        setFieldErrors(err.errors)
      }
      setGeneralError(err.message || `Failed to ${isEditing ? 'update' : 'create'} category`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all border border-slate-100">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isEditing ? `Edit Category #${category.categoryId}` : 'Create Category'}
                </h3>
                <p className="text-xs text-slate-500">Group and classify grocery merchandise</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {generalError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 flex items-start gap-2.5">
                <svg className="w-4 h-4 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="font-medium flex-1">{generalError}</div>
              </div>
            )}

            {successMessage && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div className="font-semibold">{successMessage}</div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="categoryName"
                value={formData.categoryName}
                onChange={handleChange}
                placeholder="e.g. Dairy & Eggs"
                disabled={loading}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                  fieldErrors.categoryName
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50/20'
                    : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-200'
                }`}
              />
              {fieldErrors.categoryName && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.categoryName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief summary of items in this category (max 255 chars)"
                disabled={loading}
                className={`w-full rounded-xl border px-3.5 py-2 text-sm transition-colors focus:outline-none focus:ring-2 resize-none ${
                  fieldErrors.description
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50/20'
                    : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-200'
                }`}
              />
              {fieldErrors.description && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.description}</p>
              )}
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{isEditing ? 'Update Category' : 'Create Category'}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CategoryModal
