import React, { useState, useEffect } from 'react'
import productService from '../../services/productService'
import categoryService from '../../services/categoryService'

export function EditProductModal({ isOpen, product, onClose, onSuccess }) {
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)

  const [formData, setFormData] = useState({
    categoryId: '',
    productName: '',
    description: '',
    price: '',
    reorderLevel: '10',
    isActive: true,
  })

  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [generalError, setGeneralError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  useEffect(() => {
    if (isOpen && product) {
      setFormData({
        categoryId: String(product.categoryId || ''),
        productName: product.productName || '',
        description: product.description || '',
        price: product.price != null ? String(product.price) : '',
        reorderLevel: product.reorderLevel != null ? String(product.reorderLevel) : '10',
        isActive: product.isActive != null ? product.isActive : true,
      })
      setFieldErrors({})
      setGeneralError(null)
      setSuccessMessage(null)

      const loadCategories = async () => {
        setCategoriesLoading(true)
        try {
          // Load all categories so current product's category is always selectable even if inactive
          const res = await categoryService.getAllCategories()
          setCategories(res?.data || [])
        } catch {
          // ignore
        } finally {
          setCategoriesLoading(false)
        }
      }
      loadCategories()
    }
  }, [isOpen, product])

  if (!isOpen || !product) return null

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
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
    if (!formData.categoryId) errors.categoryId = 'Category is required'
    if (!formData.productName.trim()) {
      errors.productName = 'Product name is required'
    } else if (formData.productName.trim().length > 150) {
      errors.productName = 'Product name must not exceed 150 characters'
    }

    if (formData.description && formData.description.length > 2000) {
      errors.description = 'Description must not exceed 2000 characters'
    }

    if (formData.price === '' || isNaN(formData.price) || Number(formData.price) < 0) {
      errors.price = 'Price must be a non-negative number'
    }

    if (
      formData.reorderLevel === '' ||
      isNaN(formData.reorderLevel) ||
      Number(formData.reorderLevel) < 0 ||
      !Number.isInteger(Number(formData.reorderLevel))
    ) {
      errors.reorderLevel = 'Reorder level must be a non-negative whole number'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setLoading(false)
      return
    }

    const payload = {
      categoryId: parseInt(formData.categoryId, 10),
      productName: formData.productName.trim(),
      description: formData.description?.trim() || null,
      price: parseFloat(formData.price),
      reorderLevel: parseInt(formData.reorderLevel, 10),
      isActive: Boolean(formData.isActive),
    }

    try {
      const response = await productService.updateProduct(product.productId, payload)
      setSuccessMessage('Product updated successfully!')
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
      setGeneralError(err.message || 'Failed to update product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all border border-slate-100">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Product #{product.productId}</h3>
                <p className="text-xs text-slate-500">Update pricing, category, details, and active status</p>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                    fieldErrors.productName
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50/20'
                      : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-200'
                  }`}
                />
                {fieldErrors.productName && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.productName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  disabled={loading || categoriesLoading}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                    fieldErrors.categoryId
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50/20'
                      : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-200'
                  }`}
                >
                  {categories.map((c) => (
                    <option key={c.categoryId} value={c.categoryId}>
                      {c.categoryName} {!c.isActive ? '(Inactive)' : ''}
                    </option>
                  ))}
                </select>
                {fieldErrors.categoryId && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.categoryId}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Price ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                    fieldErrors.price
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50/20'
                      : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-200'
                  }`}
                />
                {fieldErrors.price && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Reorder Level <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  name="reorderLevel"
                  value={formData.reorderLevel}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                    fieldErrors.reorderLevel
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50/20'
                      : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-200'
                  }`}
                />
                {fieldErrors.reorderLevel && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.reorderLevel}</p>
                )}
              </div>
            </div>

            {/* Active Status Checkbox */}
            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-800">Active in Store Catalog</span>
                  <p className="text-[11px] text-slate-500">
                    When active, customers can find and purchase this grocery item.
                  </p>
                </div>
              </label>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
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
                    <span>Saving Product...</span>
                  </>
                ) : (
                  <span>Update Product</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditProductModal
