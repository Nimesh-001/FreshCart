import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import productService from '../services/productService'
import categoryService from '../services/categoryService'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import EmptyState from '../components/EmptyState'
import StatusBadge from '../components/StatusBadge'
import AddProductModal from '../components/product/AddProductModal'
import EditProductModal from '../components/product/EditProductModal'
import ProductPerformanceView from '../components/product/ProductPerformanceView'
import { formatCurrency, formatDate } from '../utils/formatters'

export function ProductsPage() {
  const [activeTab, setActiveTab] = useState('catalog') // 'catalog' | 'performance'
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters matching backend parameters
  const [searchQuery, setSearchQuery] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [activeOnly, setActiveOnly] = useState('') // '' = all, 'true' = active only

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  // Fetch categories once for the filter dropdown
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoryService.getAllCategories()
        setCategories(res?.data || [])
      } catch {
        // ignore
      }
    }
    loadCategories()
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const filters = {}
      if (appliedSearch.trim()) filters.search = appliedSearch.trim()
      if (selectedCategory) filters.categoryId = parseInt(selectedCategory, 10)
      if (activeOnly === 'true') filters.activeOnly = true

      const response = await productService.searchProducts(filters)
      setProducts(response?.data || [])
    } catch (err) {
      setError(err.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [appliedSearch, selectedCategory, activeOnly])

  useEffect(() => {
    if (activeTab === 'catalog') {
      fetchProducts()
    }
  }, [fetchProducts, activeTab])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setAppliedSearch(searchQuery)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setAppliedSearch('')
    setSelectedCategory('')
    setActiveOnly('')
  }

  const handleAddSuccess = (newProduct) => {
    showToast(`Product "${newProduct?.productName || ''}" added successfully!`)
    fetchProducts()
  }

  const handleEditSuccess = (updatedProduct) => {
    showToast(`Product "${updatedProduct?.productName || ''}" updated successfully!`)
    fetchProducts()
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Product Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Maintain grocery items, pricing, inventory reorder thresholds, and sales metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'catalog'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Product Catalog
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('performance')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'performance'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Performance Analytics
        </button>
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

      {activeTab === 'performance' ? (
        /* Performance View */
        <ProductPerformanceView />
      ) : (
        /* Catalog View */
        <>
          {/* Search & Filter Controls */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
              {/* Search text input */}
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products by title or description..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-10 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      setAppliedSearch('')
                    }}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Category dropdown filter */}
              <div className="w-full lg:w-56">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-semibold text-slate-700 shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.categoryName} {!cat.isActive ? '(Inactive)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Only status filter */}
              <div className="w-full lg:w-44">
                <select
                  value={activeOnly}
                  onChange={(e) => setActiveOnly(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-semibold text-slate-700 shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  <option value="true">Active Only</option>
                </select>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Search
                </button>

                <button
                  type="button"
                  onClick={fetchProducts}
                  disabled={loading}
                  title="Refresh products"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Active filter badges */}
            {(appliedSearch || selectedCategory || activeOnly) && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-1">
                <span>Active filters:</span>
                {appliedSearch && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-800 border border-emerald-200">
                    Query: "{appliedSearch}"
                  </span>
                )}
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-0.5 font-semibold text-blue-800 border border-blue-200">
                    Category: {categories.find((c) => String(c.categoryId) === selectedCategory)?.categoryName || selectedCategory}
                  </span>
                )}
                {activeOnly && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-800 border border-emerald-200">
                    Status: Active Only
                  </span>
                )}
                <button
                  onClick={handleClearFilters}
                  className="text-xs font-semibold text-red-600 hover:text-red-800 underline ml-1 cursor-pointer"
                >
                  Reset all
                </button>
              </div>
            )}
          </div>

          {/* Table / Results */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            {loading ? (
              <div className="py-16">
                <LoadingSpinner size="lg" message="Loading product catalog..." />
              </div>
            ) : error ? (
              <div className="p-8">
                <ErrorMessage
                  title="Failed to load products"
                  message={error}
                  onRetry={fetchProducts}
                />
              </div>
            ) : products.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No products found"
                  description="No grocery products matched your criteria. Add your first product or clear filters."
                  actionText="Add Product"
                  onAction={() => setIsAddModalOpen(true)}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th scope="col" className="px-6 py-4">Product</th>
                      <th scope="col" className="px-6 py-4">Category</th>
                      <th scope="col" className="px-6 py-4">Price</th>
                      <th scope="col" className="px-6 py-4">Stock Level</th>
                      <th scope="col" className="px-6 py-4">Status</th>
                      <th scope="col" className="px-6 py-4">Added On</th>
                      <th scope="col" className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((p) => (
                      <tr key={p.productId} className="hover:bg-slate-50/60 transition-colors">
                        {/* Product */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">
                              {p.productName ? p.productName[0].toUpperCase() : 'P'}
                            </div>
                            <div>
                              <Link
                                to={`/products/${p.productId}`}
                                className="font-semibold text-slate-900 hover:text-emerald-600 transition-colors"
                              >
                                {p.productName}
                              </Link>
                              <div className="text-xs text-slate-400 font-mono">ID #{p.productId}</div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4 text-slate-600">
                          {p.categoryName || '—'}
                        </td>

                        {/* Price */}
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {formatCurrency(p.price)}
                        </td>

                        {/* Stock & Status */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">{p.stockQuantity ?? 0}</span>
                            {p.stockStatus && (
                              <StatusBadge status={p.stockStatus} label={p.stockStatus} />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Reorder at {p.reorderLevel ?? 0}
                          </div>
                        </td>

                        {/* Active */}
                        <td className="px-6 py-4">
                          <StatusBadge
                            status={p.isActive ? 'ACTIVE' : 'INACTIVE'}
                            label={p.isActive ? 'Active' : 'Inactive'}
                          />
                        </td>

                        {/* Created Date */}
                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap text-xs">
                          {formatDate(p.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => setEditingProduct(p)}
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-emerald-600 transition-colors cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            <span>Edit</span>
                          </button>

                          <Link
                            to={`/products/${p.productId}`}
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                          >
                            <span>Details</span>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={Boolean(editingProduct)}
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
        onSuccess={handleEditSuccess}
      />
    </div>
  )
}

export default ProductsPage
