import React, { useState, useEffect } from 'react'
import productService from '../../services/productService'
import categoryService from '../../services/categoryService'

export function AddProductModal({ isOpen, onClose, onSuccess }) {
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)

  const [formData, setFormData] = useState({
    categoryId: '',
    productName: '',
    description: '',
    price: '',
    reorderLevel: '10',
    initialQuantity: '0',
  })

  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [generalError, setGeneralError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  useEffect(() => {
    if (isOpen) {
      setFormData({
        categoryId: '',
        productName: '',
        description: '',
        price: '',
        reorderLevel: '10',
        initialQuantity: '0',
      })
      setFieldErrors({})
      setGeneralError(null)
      setSuccessMessage(null)

      // Fetch active categories for dropdown
      const loadCategories = async () => {
        setCategoriesLoading(true)
        try {
          const res = await categoryService.getAllCategories(true)
          setCategories(res?.data || [])
          if (res?.data?.length > 0) {
            setFormData((prev) => ({ ...prev, categoryId: String(res.data[0].categoryId) }))
          }
        } catch {
          // ignore or show error
        } finally {
          setCategoriesLoading(false)
        }
      }
      loadCategories()
    }
  }, [isOpen])

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

    if (
      formData.initialQuantity === '' ||
      isNaN(formData.initialQuantity) ||
      Number(formData.initialQuantity) < 0 ||
      !Number.isInteger(Number(formData.initialQuantity))
    ) {
      errors.initialQuantity = 'Initial quantity must be a non-negative whole number'
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
      initialQuantity: parseInt(formData.initialQuantity, 10),
    }

    try {
      const response = await productService.addProduct(payload)
      setSuccessMessage('Product created successfully!')
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
      setGeneralError(err.message || 'Failed to create product')
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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Add New Product</h3>
                <p className="text-xs text-slate-500">Create item, assign category, and set starting inventory</p>
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
              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  placeholder="e.g. Organic Whole Milk"
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

              {/* Category */}
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
                  {categories.length === 0 ? (
                    <option value="">No active categories found</option>
                  ) : (
                    categories.map((c) => (
                      <option key={c.categoryId} value={c.categoryId}>
                        {c.categoryName}
                      </option>
                    ))
                  )}
                </select>
                {fieldErrors.categoryId && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.categoryId}</p>
                )}
              </div>
            </div>

            {/* Price, Reorder Level, Initial Quantity */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  placeholder="0.00"
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
                  placeholder="10"
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

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Initial Stock <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  name="initialQuantity"
                  value={formData.initialQuantity}
                  onChange={handleChange}
                  placeholder="0"
                  disabled={loading}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                    fieldErrors.initialQuantity
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50/20'
                      : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-200'
                  }`}
                />
                {fieldErrors.initialQuantity && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.initialQuantity}</p>
                )}
              </div>
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
                placeholder="Product details, origins, packaging size..."
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
                    <span>Creating Product...</span>
                  </>
                ) : (
                  <span>Add Product</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddProductModal
