import React, { useState } from 'react'
import customerService from '../../services/customerService'
import { formatDateTime } from '../../utils/formatters'
import StatusBadge from '../StatusBadge'

export function CustomerProfileCard({ customer, onProfileUpdated }) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: customer?.firstName || '',
    lastName: customer?.lastName || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
  })
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [generalError, setGeneralError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  const handleStartEdit = () => {
    setFormData({
      firstName: customer?.firstName || '',
      lastName: customer?.lastName || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
    })
    setFieldErrors({})
    setGeneralError(null)
    setSuccessMessage(null)
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setFieldErrors({})
    setGeneralError(null)
  }

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
    setGeneralError(null)
    setFieldErrors({})
    setSuccessMessage(null)

    const errors = {}
    if (!formData.firstName.trim()) errors.firstName = 'First name is required'
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required'
    if (!formData.email.trim()) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Email format is invalid'
    }
    if (!formData.phone.trim()) errors.phone = 'Phone number is required'

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setLoading(false)
      return
    }

    try {
      const response = await customerService.updateCustomerProfile(customer.customerId, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      })

      setSuccessMessage('Customer profile updated successfully!')
      setIsEditing(false)
      if (onProfileUpdated) {
        onProfileUpdated(response?.data)
      }
      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
    } catch (err) {
      if (err.errors && typeof err.errors === 'object') {
        setFieldErrors(err.errors)
      }
      setGeneralError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold text-lg">
            {customer?.firstName ? customer.firstName[0].toUpperCase() : 'C'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{customer?.fullName || 'Customer Profile'}</h2>
              <StatusBadge status={customer?.isActive ? 'ACTIVE' : 'DOWN'} label={customer?.isActive ? 'Active' : 'Inactive'} />
            </div>
            <p className="text-xs text-slate-500 font-mono">@{customer?.username} • ID #{customer?.customerId}</p>
          </div>
        </div>

        <div>
          {!isEditing ? (
            <button
              type="button"
              onClick={handleStartEdit}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span>Edit Profile</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="mx-6 mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {generalError && (
        <div className="mx-6 mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 flex items-center gap-2">
          <svg className="w-4 h-4 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="font-medium">{generalError}</span>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {!isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</span>
              <p className="mt-1 text-sm font-medium text-slate-900">{customer?.fullName || '—'}</p>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Username</span>
              <p className="mt-1 text-sm font-mono text-slate-900">{customer?.username || '—'}</p>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</span>
              <p className="mt-1 text-sm font-medium text-slate-900">{customer?.email || '—'}</p>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</span>
              <p className="mt-1 text-sm font-medium text-slate-900">{customer?.phone || '—'}</p>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Account Role</span>
              <p className="mt-1 text-sm font-medium text-slate-900 capitalize">{customer?.role || 'Customer'}</p>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Since</span>
              <p className="mt-1 text-sm font-medium text-slate-900">{formatDateTime(customer?.createdAt)}</p>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Internal User ID</span>
              <p className="mt-1 text-sm font-mono text-slate-600">#{customer?.userId}</p>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer ID</span>
              <p className="mt-1 text-sm font-mono text-slate-600">#{customer?.customerId}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                    fieldErrors.firstName
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50/20'
                      : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-200'
                  }`}
                />
                {fieldErrors.firstName && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                    fieldErrors.lastName
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50/20'
                      : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-200'
                  }`}
                />
                {fieldErrors.lastName && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.lastName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                    fieldErrors.email
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50/20'
                      : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-200'
                  }`}
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                    fieldErrors.phone
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50/20'
                      : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-200'
                  }`}
                />
                {fieldErrors.phone && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>
                )}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCancelEdit}
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
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default CustomerProfileCard
