import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import customerService from '../services/customerService'
import CustomerProfileCard from '../components/customer/CustomerProfileCard'
import CustomerAddressesSection from '../components/customer/CustomerAddressesSection'
import CustomerPurchaseSummary from '../components/customer/CustomerPurchaseSummary'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

export function CustomerDetailPage() {
  const { customerId } = useParams()
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCustomerDetails = useCallback(async () => {
    if (!customerId) return
    setLoading(true)
    setError(null)
    try {
      const response = await customerService.getCustomerById(customerId)
      setCustomer(response?.data || null)
    } catch (err) {
      setError(err.message || 'Failed to load customer details')
    } finally {
      setLoading(false)
    }
  }, [customerId])

  useEffect(() => {
    fetchCustomerDetails()
  }, [fetchCustomerDetails])

  const handleProfileUpdated = (updatedCustomer) => {
    setCustomer(updatedCustomer)
  }

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" message="Loading customer profile..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link
          to="/customers"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Customers</span>
        </Link>
        <ErrorMessage
          title="Customer Not Found or Error"
          message={error}
          onRetry={fetchCustomerDetails}
        />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="space-y-4">
        <Link
          to="/customers"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Customers</span>
        </Link>
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          Customer not found.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <nav className="flex items-center space-x-2 text-xs font-medium text-slate-500">
          <Link to="/customers" className="hover:text-emerald-600 transition-colors">
            Customers
          </Link>
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-slate-800 font-semibold truncate max-w-xs">
            {customer.fullName || `@${customer.username}`}
          </span>
        </nav>

        <Link
          to="/customers"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to List</span>
        </Link>
      </div>

      {/* Customer Profile Section */}
      <CustomerProfileCard
        customer={customer}
        onProfileUpdated={handleProfileUpdated}
      />

      {/* Purchase Summary Section */}
      <CustomerPurchaseSummary customerId={customerId} />

      {/* Addresses Management Section */}
      <CustomerAddressesSection customerId={customerId} />
    </div>
  )
}

export default CustomerDetailPage
