import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import productService from '../services/productService'
import { formatCurrency, formatDateTime } from '../utils/formatters'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import StatusBadge from '../components/StatusBadge'
import EditProductModal from '../components/product/EditProductModal'
import ProductSuppliersSection from '../components/supplier/ProductSuppliersSection'

export function ProductDetailPage() {
  const { productId } = useParams()
  const [product, setProduct] = useState(null)
  const [performance, setPerformance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  const fetchProductData = useCallback(async () => {
    if (!productId) return
    setLoading(true)
    setError(null)
    try {
      const [prodRes, perfRes] = await Promise.all([
        productService.getProductById(productId),
        productService.getSingleProductPerformance(productId),
      ])
      setProduct(prodRes?.data || null)
      // The performance endpoint returns an array containing the single product's record
      if (perfRes?.data && perfRes.data.length > 0) {
        setPerformance(perfRes.data[0])
      } else {
        setPerformance(null)
      }
    } catch (err) {
      setError(err.message || 'Failed to load product details')
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    fetchProductData()
  }, [fetchProductData])

  const handleEditSuccess = (updated) => {
    setProduct(updated)
    setToastMessage('Product updated successfully!')
    setTimeout(() => setToastMessage(null), 3000)
    // Refresh performance record as well
    fetchProductData()
  }

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" message="Loading product details and performance..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Products</span>
        </Link>
        <ErrorMessage
          title="Product Error"
          message={error}
          onRetry={fetchProductData}
        />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="space-y-4">
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Products</span>
        </Link>
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          Product not found.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <nav className="flex items-center space-x-2 text-xs font-medium text-slate-500">
          <Link to="/products" className="hover:text-emerald-600 transition-colors">
            Products
          </Link>
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-slate-800 font-semibold truncate max-w-xs">
            {product.productName}
          </span>
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span>Edit Product</span>
          </button>

          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to List</span>
          </Link>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-semibold">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold uppercase"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Product Overview Card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold text-lg">
              {product.productName ? product.productName[0].toUpperCase() : 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{product.productName}</h2>
                <StatusBadge status={product.isActive ? 'ACTIVE' : 'INACTIVE'} label={product.isActive ? 'Active' : 'Inactive'} />
              </div>
              <p className="text-xs text-slate-500 font-mono">
                Product ID #{product.productId} • Category: {product.categoryName || 'Unassigned'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Price</span>
            <span className="text-xl font-bold text-slate-900">{formatCurrency(product.price)}</span>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Stock</span>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900">{product.stockQuantity ?? 0}</span>
              {product.stockStatus && (
                <StatusBadge status={product.stockStatus} label={product.stockStatus} />
              )}
            </div>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Reorder Level</span>
            <p className="mt-1 text-base font-semibold text-slate-800">{product.reorderLevel ?? 0} units</p>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</span>
            <p className="mt-1 text-base font-medium text-slate-800">{product.categoryName || '—'}</p>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Created Date</span>
            <p className="mt-1 text-sm font-medium text-slate-800">{formatDateTime(product.createdAt)}</p>
          </div>
        </div>

        {product.description && (
          <div className="px-6 pb-6 pt-2 border-t border-slate-100">
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description</span>
            <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
          </div>
        )}
      </div>

      {/* Product Performance Section */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Performance Metrics</h3>
            <p className="text-xs text-slate-500">Official sales volume and revenue generated by this product</p>
          </div>
        </div>

        <div className="p-6">
          {!performance ? (
            <div className="text-center py-6 text-slate-500 text-sm">
              No performance records available for this product yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Units Sold */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Units Sold</span>
                <p className="mt-2 text-2xl font-bold text-slate-900">{performance.unitsSold ?? 0}</p>
                <p className="mt-1 text-xs text-slate-500">Customer purchases recorded</p>
              </div>

              {/* Sales Revenue */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Revenue</span>
                <p className="mt-2 text-2xl font-bold text-emerald-700">{formatCurrency(performance.salesRevenue ?? 0)}</p>
                <p className="mt-1 text-xs text-slate-500">Gross sales value</p>
              </div>

              {/* Stock Health */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Stock Status</span>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xl font-bold text-slate-900">{performance.stockQuantity ?? 0}</span>
                  {performance.stockStatus && (
                    <StatusBadge status={performance.stockStatus} label={performance.stockStatus} />
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500">Available inventory units</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Suppliers Section */}
      <ProductSuppliersSection productId={productId} productName={product.productName} />

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={isEditModalOpen}
        product={product}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
      />
    </div>
  )
}

export default ProductDetailPage
