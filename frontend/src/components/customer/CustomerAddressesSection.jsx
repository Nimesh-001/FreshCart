import React, { useState, useEffect, useCallback } from 'react'
import customerService from '../../services/customerService'
import LoadingSpinner from '../LoadingSpinner'
import EmptyState from '../EmptyState'

export function CustomerAddressesSection({ customerId }) {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionSuccess, setActionSuccess] = useState(null)

  // Modal / Form state for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null) // null for Add, Address object for Edit
  const [formData, setFormData] = useState({
    addressLine: '',
    city: '',
    province: '',
    postalCode: '',
    isDefault: false,
  })
  const [formLoading, setFormLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formGeneralError, setFormGeneralError] = useState(null)

  const fetchAddresses = useCallback(async () => {
    if (!customerId) return
    setLoading(true)
    setError(null)
    try {
      const response = await customerService.getCustomerAddresses(customerId)
      setAddresses(response?.data || [])
    } catch (err) {
      setError(err.message || 'Failed to load addresses')
    } finally {
      setLoading(false)
    }
  }, [customerId])

  useEffect(() => {
    fetchAddresses()
  }, [fetchAddresses])

  const openAddModal = () => {
    setEditingAddress(null)
    setFormData({
      addressLine: '',
      city: '',
      province: '',
      postalCode: '',
      isDefault: addresses.length === 0, // Auto-default if first address
    })
    setFieldErrors({})
    setFormGeneralError(null)
    setIsModalOpen(true)
  }

  const openEditModal = (addr) => {
    setEditingAddress(addr)
    setFormData({
      addressLine: addr.addressLine || '',
      city: addr.city || '',
      province: addr.province || '',
      postalCode: addr.postalCode || '',
      isDefault: Boolean(addr.isDefault),
    })
    setFieldErrors({})
    setFormGeneralError(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingAddress(null)
    setFieldErrors({})
    setFormGeneralError(null)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }))
    }
    setFormGeneralError(null)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setFieldErrors({})
    setFormGeneralError(null)

    const errors = {}
    if (!formData.addressLine.trim()) errors.addressLine = 'Address line is required'
    if (!formData.city.trim()) errors.city = 'City is required'

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setFormLoading(false)
      return
    }

    const payload = {
      addressLine: formData.addressLine.trim(),
      city: formData.city.trim(),
      province: formData.province.trim(),
      postalCode: formData.postalCode.trim(),
      isDefault: Boolean(formData.isDefault),
    }

    try {
      if (editingAddress) {
        await customerService.updateCustomerAddress(customerId, editingAddress.addressId, payload)
        setActionSuccess('Address updated successfully!')
      } else {
        await customerService.addCustomerAddress(customerId, payload)
        setActionSuccess('New address added successfully!')
      }
      closeModal()
      await fetchAddresses()
      setTimeout(() => setActionSuccess(null), 3000)
    } catch (err) {
      if (err.errors && typeof err.errors === 'object') {
        setFieldErrors(err.errors)
      }
      setFormGeneralError(err.message || 'Failed to save address')
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Saved Addresses</h3>
            <p className="text-xs text-slate-500">Delivery destinations for this customer</p>
          </div>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Address</span>
        </button>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="mx-6 mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-semibold">{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="m-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 flex items-start gap-2.5">
          <svg className="w-4 h-4 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="font-medium">{error}</p>
            <button
              onClick={fetchAddresses}
              className="mt-2 text-xs font-semibold underline text-red-900 hover:text-red-950 cursor-pointer"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="p-6">
        {loading ? (
          <LoadingSpinner size="md" message="Loading addresses..." />
        ) : addresses.length === 0 ? (
          <EmptyState
            title="No addresses registered"
            description="This customer currently does not have any saved delivery addresses."
            actionText="Add First Address"
            onAction={openAddModal}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.addressId}
                className={`relative rounded-xl border p-4.5 transition-all ${
                  addr.isDefault
                    ? 'border-emerald-300 bg-emerald-50/20 shadow-xs ring-1 ring-emerald-200'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Address #{addr.addressId}
                    </span>
                    {addr.isDefault && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Default
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => openEditModal(addr)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Edit address"
                    aria-label={`Edit address #${addr.addressId}`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>

                <p className="text-sm font-semibold text-slate-900 leading-snug">{addr.addressLine}</p>
                <div className="mt-2 text-xs text-slate-600 space-y-0.5">
                  <p>
                    <span className="text-slate-400">City:</span> {addr.city}
                  </p>
                  {addr.province && (
                    <p>
                      <span className="text-slate-400">Province:</span> {addr.province}
                    </p>
                  )}
                  {addr.postalCode && (
                    <p>
                      <span className="text-slate-400">Postal Code:</span> {addr.postalCode}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={closeModal} />
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <div className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all border border-slate-100">
              {/* Modal header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {editingAddress ? `Edit Address #${editingAddress.addressId}` : 'Add New Address'}
                    </h3>
                    <p className="text-xs text-slate-500">Provide shipping & location information</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                {formGeneralError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="font-medium">{formGeneralError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Address Line <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="addressLine"
                    value={formData.addressLine}
                    onChange={handleInputChange}
                    placeholder="e.g. 123 Main Street, Apt 4B"
                    disabled={formLoading}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                      fieldErrors.addressLine
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50/20'
                        : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-200'
                    }`}
                  />
                  {fieldErrors.addressLine && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.addressLine}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="e.g. Colombo"
                      disabled={formLoading}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                        fieldErrors.city
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50/20'
                          : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-200'
                      }`}
                    />
                    {fieldErrors.city && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Province / State
                    </label>
                    <input
                      type="text"
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
                      placeholder="e.g. Western"
                      disabled={formLoading}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="e.g. 00100"
                    disabled={formLoading}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="isDefault"
                      checked={formData.isDefault}
                      onChange={handleInputChange}
                      disabled={formLoading}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                    />
                    <span className="text-xs font-medium text-slate-700">
                      Set as default delivery address for this customer
                    </span>
                  </label>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={formLoading}
                    className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {formLoading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>{editingAddress ? 'Update Address' : 'Add Address'}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerAddressesSection
