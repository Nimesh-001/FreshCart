import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import customerService from '../services/customerService'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import EmptyState from '../components/EmptyState'
import StatusBadge from '../components/StatusBadge'
import RegisterCustomerModal from '../components/customer/RegisterCustomerModal'
import { formatDate } from '../utils/formatters'

export function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [successToast, setSuccessToast] = useState(null)

  const fetchCustomers = useCallback(async (query) => {
    setLoading(true)
    setError(null)
    try {
      const response = await customerService.searchCustomers(query)
      setCustomers(response?.data || [])
    } catch (err) {
      setError(err.message || 'Failed to fetch customer list')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCustomers(appliedSearch)
  }, [fetchCustomers, appliedSearch])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setAppliedSearch(searchQuery)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setAppliedSearch('')
  }

  const handleRegistrationSuccess = (newCustomer) => {
    setSuccessToast(`Customer ${newCustomer?.username || ''} registered successfully!`)
    fetchCustomers(appliedSearch)
    setTimeout(() => setSuccessToast(null), 4000)
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Customer Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            View directory, register new customer accounts, and inspect customer profiles.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsRegisterModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <span>Register Customer</span>
        </button>
      </div>

      {/* Success Banner */}
      {successToast && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-semibold">{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold uppercase"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search Bar & Controls */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
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
              placeholder="Search customers by name, username, email, or phone..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-10 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                aria-label="Clear search input"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <span>Search</span>
            </button>

            <button
              type="button"
              onClick={() => fetchCustomers(appliedSearch)}
              disabled={loading}
              title="Refresh customer list"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </form>

        {appliedSearch && (
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <span>Filtered by:</span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 font-semibold text-emerald-800 border border-emerald-200">
              "{appliedSearch}"
              <button onClick={handleClearSearch} className="hover:text-emerald-950 font-bold ml-1 cursor-pointer">×</button>
            </span>
          </div>
        )}
      </div>

      {/* Main Table / State Container */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16">
            <LoadingSpinner size="lg" message="Loading customers..." />
          </div>
        ) : error ? (
          <div className="p-8">
            <ErrorMessage
              title="Unable to load customers"
              message={error}
              onRetry={() => fetchCustomers(appliedSearch)}
            />
          </div>
        ) : customers.length === 0 ? (
          <div className="p-8">
            {appliedSearch ? (
              <EmptyState
                title="No customers match your search"
                description={`No results found for "${appliedSearch}". Try searching with a different term.`}
                actionText="Clear Search"
                onAction={handleClearSearch}
              />
            ) : (
              <EmptyState
                title="No customers found"
                description="There are currently no customers registered in FreshCart. Register your first customer to get started."
                actionText="Register Customer"
                onAction={() => setIsRegisterModalOpen(true)}
              />
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-4">Customer</th>
                  <th scope="col" className="px-6 py-4">Contact Info</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4">Registered Date</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.customerId} className="hover:bg-slate-50/60 transition-colors">
                    {/* Customer */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 font-bold text-emerald-700">
                          {c.fullName ? c.fullName[0].toUpperCase() : 'C'}
                        </div>
                        <div>
                          <Link
                            to={`/customers/${c.customerId}`}
                            className="font-semibold text-slate-900 hover:text-emerald-600 transition-colors"
                          >
                            {c.fullName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unnamed Customer'}
                          </Link>
                          <div className="text-xs text-slate-400 font-mono">
                            @{c.username} • ID #{c.customerId}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <div className="text-slate-800 font-medium">{c.email || '—'}</div>
                        <div className="text-xs text-slate-400">{c.phone || '—'}</div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <StatusBadge
                        status={c.isActive ? 'ACTIVE' : 'DOWN'}
                        label={c.isActive ? 'Active' : 'Inactive'}
                      />
                    </td>

                    {/* Registered Date */}
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                      {formatDate(c.createdAt)}
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/customers/${c.customerId}`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                      >
                        <span>View Details</span>
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

      {/* Register Customer Modal */}
      <RegisterCustomerModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={handleRegistrationSuccess}
      />
    </div>
  )
}

export default CustomersPage
