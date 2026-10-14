import React, { useState, useEffect } from 'react'
import customerService from '../../services/customerService'
import orderService from '../../services/orderService'
import { formatCurrency } from '../../utils/formatters'

export function CheckoutModal({ isOpen, onClose, customerId, cart, onSuccess }) {
  const [addresses, setAddresses] = useState([])
  const [loadingAddresses, setLoadingAddresses] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CARD') // 'CASH_ON_DELIVERY' | 'CARD' | 'ONLINE'
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen && customerId) {
      setSelectedAddressId('')
      setPaymentMethod('CARD')
      setError(null)
      loadAddresses()
    }
  }, [isOpen, customerId])

  const loadAddresses = async () => {
    setLoadingAddresses(true)
    try {
      const res = await customerService.getCustomerAddresses(customerId)
      const list = res?.data || []
      setAddresses(list)
      if (list.length > 0) {
        // Pre-select primary address if available, or first
        const primary = list.find(a => a.isPrimary) || list[0]
        setSelectedAddressId(String(primary.addressId))
      }
    } catch (err) {
      setError('Failed to load delivery addresses: ' + (err.message || ''))
    } finally {
      setLoadingAddresses(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedAddressId) {
      setError('Please select a delivery address')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const payload = {
        customerId: Number(customerId),
        addressId: Number(selectedAddressId),
        paymentMethod: paymentMethod,
      }
      const res = await orderService.checkout(payload)
      onSuccess?.(res?.data)
      onClose()
    } catch (err) {
      setError(err.message || 'Checkout failed')
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Checkout Order</h3>
              <p className="text-xs text-slate-500">Review cart summary and select delivery details</p>
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

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Order Summary box */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Total Items:</span>
              <span className="font-semibold text-slate-800">{cart?.totalItems || 0} unique items ({cart?.totalUnits || 0} units)</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200/60 pt-2">
              <span>Order Total:</span>
              <span className="text-emerald-700 text-base">{formatCurrency(cart?.totalAmount || 0)}</span>
            </div>
          </div>

          {/* Delivery Address Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Delivery Address <span className="text-rose-500">*</span>
            </label>
            {loadingAddresses ? (
              <p className="mt-1 text-xs text-slate-500">Loading saved addresses...</p>
            ) : addresses.length === 0 ? (
              <div className="mt-1.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                No delivery addresses found for Customer #{customerId}. Please add an address on the Customer page first.
              </div>
            ) : (
              <select
                value={selectedAddressId}
                onChange={(e) => setSelectedAddressId(e.target.value)}
                disabled={submitting}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
              >
                {addresses.map((a) => (
                  <option key={a.addressId} value={a.addressId}>
                    {a.addressLine || a.addressLine1 || 'Address'}, {a.city}, {a.province || a.state || ''} {a.postalCode} {a.isDefault || a.isPrimary ? '(Default)' : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Payment Method <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'CARD', label: 'Credit Card (Simulated)' },
                { id: 'ONLINE', label: 'Online / UPI (Simulated)' },
                { id: 'CASH_ON_DELIVERY', label: 'Cash On Delivery' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id)}
                  className={`rounded-xl border p-2.5 text-xs font-semibold text-center transition-all ${
                    paymentMethod === m.id
                      ? 'border-emerald-500 bg-emerald-50/80 text-emerald-800 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-slate-400">
              {paymentMethod === 'CASH_ON_DELIVERY'
                ? 'Payment status will remain PENDING until delivery.'
                : 'Payment will be simulated and marked PAID upon checkout.'}
            </p>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || addresses.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50"
            >
              {submitting ? 'Placing Order...' : 'Confirm & Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CheckoutModal
