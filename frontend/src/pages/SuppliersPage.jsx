import React, { useState, useEffect, useCallback, useMemo } from 'react'
import supplierService from '../services/supplierService'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import EmptyState from '../components/EmptyState'
import StatusBadge from '../components/StatusBadge'
import AddSupplierModal from '../components/supplier/AddSupplierModal'
import SupplierDetailsModal from '../components/supplier/SupplierDetailsModal'

export function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeOnly, setActiveOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  const fetchSuppliers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Backend supports: GET /api/suppliers?activeOnly=
      const res = await supplierService.getAllSuppliers(activeOnly ? true : false)
      setSuppliers(res?.data || [])
    } catch (err) {
      setError(err.message || 'Failed to load suppliers')
    } finally {
      setLoading(false)
    }
  }, [activeOnly])

  useEffect(() => {
    fetchSuppliers()
  }, [fetchSuppliers])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleAddSuccess = (newSupplier) => {
    showToast(`Supplier "${newSupplier.supplierName}" added successfully!`)
    fetchSuppliers()
  }

  const handleOpenDetails = (supplier) => {
    setSelectedSupplier(supplier)
    setIsDetailsModalOpen(true)
  }

  // Client-side search filtering
  const filteredSuppliers = useMemo(() => {
    if (!searchQuery.trim()) return suppliers
    const q = searchQuery.toLowerCase().trim()
    return suppliers.filter(s =>
      (s.supplierName && s.supplierName.toLowerCase().includes(q)) ||
      (s.contactPerson && s.contactPerson.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      (s.phone && s.phone.toLowerCase().includes(q)) ||
      String(s.supplierId).includes(q)
    )
  }, [suppliers, searchQuery])

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 shadow-lg animate-in fade-in slide-in-from-top duration-300">
          <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Supplier Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage vendor partnerships, contact profiles, and product procurement sources.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {/* Controls / Filter Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, contact, email or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </div>

          {/* Active / All Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500">Filter:</label>
            <div className="inline-flex rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setActiveOnly(false)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  !activeOnly
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All Suppliers
              </button>
              <button
                type="button"
                onClick={() => setActiveOnly(true)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeOnly
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Active Only
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" message="Loading suppliers directory..." />
        </div>
      ) : error ? (
        <ErrorMessage
          title="Failed to Load Suppliers"
          message={error}
          onRetry={fetchSuppliers}
        />
      ) : filteredSuppliers.length === 0 ? (
        <EmptyState
          title="No Suppliers Found"
          description={
            searchQuery
              ? `No suppliers match your search query "${searchQuery}".`
              : activeOnly
              ? 'No active suppliers currently registered.'
              : 'Get started by onboarding your first product supplier.'
          }
          actionLabel="Add Supplier"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Supplier Name</th>
                  <th className="py-3 px-4">Contact Person</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier.supplierId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500 font-semibold">
                      #{supplier.supplierId}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {supplier.supplierName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {supplier.contactPerson || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs space-y-0.5">
                        {supplier.email && (
                          <div className="text-slate-600 font-medium">{supplier.email}</div>
                        )}
                        {supplier.phone && (
                          <div className="text-slate-400">{supplier.phone}</div>
                        )}
                        {!supplier.email && !supplier.phone && (
                          <span className="text-slate-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={supplier.isActive ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetails(supplier)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3 text-xs text-slate-500 flex justify-between items-center">
            <span>Showing {filteredSuppliers.length} of {suppliers.length} suppliers</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="font-medium text-emerald-600 hover:underline"
              >
                Clear filter
              </button>
            )}
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      <AddSupplierModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Supplier Details Modal */}
      <SupplierDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false)
          setSelectedSupplier(null)
        }}
        supplier={selectedSupplier}
      />
    </div>
  )
}

export default SuppliersPage
