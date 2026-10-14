import React, { useState, useEffect } from 'react'
import productService from '../../services/productService'
import supplierService from '../../services/supplierService'
import inventoryService from '../../services/inventoryService'

export function ReceiveStockModal({ isOpen, onClose, initialProduct = null, onSuccess }) {
  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(false)

  const [productId, setProductId] = useState('')
  const [supplierId, setSupplierId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [supplierPrice, setSupplierPrice] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})

  // Fetch products and active suppliers on open
  useEffect(() => {
    if (isOpen) {
      setError(null)
      setValidationErrors({})
      setQuantity('')
      setSupplierPrice('')

      const initId = initialProduct?.productId ? String(initialProduct.productId) : ''
      setProductId(initId)
      setSupplierId('')

      loadInitialData(initId)
    }
  }, [isOpen, initialProduct])

  const loadInitialData = async (selectedProdId) => {
    setLoadingOptions(true)
    try {
      const [prodRes, supRes] = await Promise.all([
        productService.getAllProducts({ size: 100 }),
        supplierService.getAllSuppliers(true),
      ])
      const prodList = prodRes?.data?.content || prodRes?.data || []
      const supList = supRes?.data || []
      setProducts(prodList)
      setSuppliers(supList)

      if (selectedProdId) {
        // Fetch suppliers specifically assigned to this product to see if price can be pre-filled
        try {
          const prodSups = await supplierService.getSuppliersByProductId(selectedProdId)
          if (prodSups?.data && prodSups.data.length > 0) {
            const first = prodSups.data[0]
            setSupplierId(String(first.supplierId))
            if (first.supplierPrice !== undefined && first.supplierPrice !== null) {
              setSupplierPrice(String(first.supplierPrice))
            }
          }
        } catch {
          // ignore error if product suppliers fail
        }
      }
    } catch (err) {
      setError('Failed to load products/suppliers list: ' + (err.message || ''))
    } finally {
      setLoadingOptions(false)
    }
  }

  // When product changes, try to inspect assigned suppliers
  const handleProductChange = async (e) => {
    const newProdId = e.target.value
    setProductId(newProdId)
    setSupplierId('')
    setSupplierPrice('')

    if (newProdId) {
      try {
        const prodSups = await supplierService.getSuppliersByProductId(newProdId)
        if (prodSups?.data && prodSups.data.length > 0) {
          const first = prodSups.data[0]
          setSupplierId(String(first.supplierId))
          if (first.supplierPrice !== undefined && first.supplierPrice !== null) {
            setSupplierPrice(String(first.supplierPrice))
          }
        }
      } catch {
        // fallback to user manually picking supplier
      }
    }
  }

  // When supplier changes, if matching an assigned supplier, auto-fill price
  const handleSupplierChange = async (e) => {
    const newSupId = e.target.value
    setSupplierId(newSupId)
    if (productId && newSupId) {
      try {
        const prodSups = await supplierService.getSuppliersByProductId(productId)
        const match = prodSups?.data?.find(s => String(s.supplierId) === String(newSupId))
        if (match && match.supplierPrice !== undefined) {
          setSupplierPrice(String(match.supplierPrice))
        }
      } catch {
        // no-op
      }
    }
  }

  const validate = () => {
    const errs = {}
    if (!productId) {
      errs.productId = 'Product is required'
    }
    if (!supplierId) {
      errs.supplierId = 'Supplier is required'
    }
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) < 1 || !Number.isInteger(Number(quantity))) {
      errs.quantity = 'Quantity must be a positive integer (at least 1)'
    }
    if (supplierPrice === '' || supplierPrice === null || isNaN(Number(supplierPrice)) || Number(supplierPrice) < 0) {
      errs.supplierPrice = 'Valid supplier price is required (>= 0)'
    }
    setValidationErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!validate()) return

    setSubmitting(true)
    try {
      const payload = {
        productId: Number(productId),
        supplierId: Number(supplierId),
        quantity: Number(quantity),
        supplierPrice: Number(supplierPrice),
      }
      const res = await inventoryService.receiveStock(payload)
      onSuccess?.(res?.data)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to receive stock')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-100 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Receive Stock / Purchase</h3>
              <p className="text-xs text-slate-500">Log incoming inventory shipment from a vendor</p>
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
          {/* Product Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Product <span className="text-rose-500">*</span>
            </label>
            {loadingOptions ? (
              <p className="mt-1 text-xs text-slate-500">Loading catalog...</p>
            ) : (
              <select
                value={productId}
                onChange={handleProductChange}
                disabled={submitting || Boolean(initialProduct)}
                className={`mt-1.5 w-full rounded-xl border bg-slate-50/50 px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-1 transition-colors ${
                  validationErrors.productId
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500'
                }`}
              >
                <option value="">-- Select Product --</option>
                {products.map((p) => (
                  <option key={p.productId} value={p.productId}>
                    {p.productName} (Current Stock: {p.stockQuantity ?? 0}) #{p.productId}
                  </option>
                ))}
              </select>
            )}
            {validationErrors.productId && (
              <p className="mt-1 text-xs text-rose-600">{validationErrors.productId}</p>
            )}
          </div>

          {/* Supplier Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Supplier <span className="text-rose-500">*</span>
            </label>
            <select
              value={supplierId}
              onChange={handleSupplierChange}
              disabled={submitting || loadingOptions}
              className={`mt-1.5 w-full rounded-xl border bg-slate-50/50 px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-1 transition-colors ${
                validationErrors.supplierId
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                  : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500'
              }`}
            >
              <option value="">-- Select Active Supplier --</option>
              {suppliers.map((s) => (
                <option key={s.supplierId} value={s.supplierId}>
                  {s.supplierName} (#{s.supplierId})
                </option>
              ))}
            </select>
            {validationErrors.supplierId && (
              <p className="mt-1 text-xs text-rose-600">{validationErrors.supplierId}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Quantity */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Units Received <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 50"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={submitting}
                className={`mt-1.5 w-full rounded-xl border bg-slate-50/50 px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 transition-colors ${
                  validationErrors.quantity
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500'
                }`}
              />
              {validationErrors.quantity && (
                <p className="mt-1 text-xs text-rose-600">{validationErrors.quantity}</p>
              )}
            </div>

            {/* Supplier Price */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Unit Purchase Price ($) <span className="text-rose-500">*</span>
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
                    validationErrors.supplierPrice
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                      : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500'
                  }`}
                />
              </div>
              {validationErrors.supplierPrice && (
                <p className="mt-1 text-xs text-rose-600">{validationErrors.supplierPrice}</p>
              )}
            </div>
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
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Receiving...</span>
                </>
              ) : (
                <span>Receive Stock</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReceiveStockModal
