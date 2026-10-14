import React, { useState, useEffect, useCallback } from 'react'
import categoryService from '../services/categoryService'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import EmptyState from '../components/EmptyState'
import StatusBadge from '../components/StatusBadge'
import CategoryModal from '../components/category/CategoryModal'
import DeactivateCategoryModal from '../components/category/DeactivateCategoryModal'

export function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeOnly, setActiveOnly] = useState('') // '' = all, 'true' = active only
  const [searchQuery, setSearchQuery] = useState('')

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [deactivatingCategory, setDeactivatingCategory] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  const fetchCategories = useCallback(async (filterActive) => {
    setLoading(true)
    setError(null)
    try {
      const param = filterActive === 'true' ? true : undefined
      const response = await categoryService.getAllCategories(param)
      setCategories(response?.data || [])
    } catch (err) {
      setError(err.message || 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories(activeOnly)
  }, [fetchCategories, activeOnly])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleCreateOpen = () => {
    setSelectedCategory(null)
    setIsModalOpen(true)
  }

  const handleEditOpen = (cat) => {
    setSelectedCategory(cat)
    setIsModalOpen(true)
  }

  const handleModalSuccess = (cat) => {
    showToast(`Category ${cat?.categoryName || ''} saved successfully!`)
    fetchCategories(activeOnly)
  }

  const handleDeactivateSuccess = () => {
    showToast('Category deactivated successfully!')
    fetchCategories(activeOnly)
  }

  // Filter categories by local search query
  const filteredCategories = categories.filter((c) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      c.categoryName?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Category Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Define and organize catalog product categories and classifications.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateOpen}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Create Category</span>
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

      {/* Filter & Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
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
              placeholder="Filter categories by name or description..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-10 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Active status dropdown and refresh */}
          <div className="flex items-center gap-2">
            <select
              value={activeOnly}
              onChange={(e) => setActiveOnly(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-semibold text-slate-700 shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="true">Active Only</option>
            </select>

            <button
              type="button"
              onClick={() => fetchCategories(activeOnly)}
              disabled={loading}
              title="Refresh categories"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Table / Results */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16">
            <LoadingSpinner size="lg" message="Loading categories..." />
          </div>
        ) : error ? (
          <div className="p-8">
            <ErrorMessage
              title="Unable to load categories"
              message={error}
              onRetry={() => fetchCategories(activeOnly)}
            />
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-8">
            {searchQuery ? (
              <EmptyState
                title="No matching categories"
                description={`No categories match "${searchQuery}".`}
                actionText="Clear Filter"
                onAction={() => setSearchQuery('')}
              />
            ) : (
              <EmptyState
                title="No categories registered"
                description="Create your first product category to organize catalog items."
                actionText="Create Category"
                onAction={handleCreateOpen}
              />
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-4">Category</th>
                  <th scope="col" className="px-6 py-4">Description</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCategories.map((cat) => (
                  <tr key={cat.categoryId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 font-bold text-emerald-700">
                          {cat.categoryName ? cat.categoryName[0].toUpperCase() : 'C'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{cat.categoryName}</div>
                          <div className="text-xs text-slate-400 font-mono">ID #{cat.categoryId}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-600 max-w-md">
                      {cat.description || <span className="text-slate-400 italic">No description provided</span>}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge
                        status={cat.isActive ? 'ACTIVE' : 'INACTIVE'}
                        label={cat.isActive ? 'Active' : 'Inactive'}
                      />
                    </td>

                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleEditOpen(cat)}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-emerald-600 transition-colors cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        <span>Edit</span>
                      </button>

                      {cat.isActive && (
                        <button
                          type="button"
                          onClick={() => setDeactivatingCategory(cat)}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-xs hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition-colors cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                          <span>Deactivate</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        category={selectedCategory}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      {/* Deactivate Category Modal */}
      <DeactivateCategoryModal
        isOpen={Boolean(deactivatingCategory)}
        category={deactivatingCategory}
        onClose={() => setDeactivatingCategory(null)}
        onSuccess={handleDeactivateSuccess}
      />
    </div>
  )
}

export default CategoriesPage
