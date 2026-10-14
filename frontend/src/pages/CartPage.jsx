import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import customerService from '../services/customerService'
import cartService from '../services/cartService'
import { formatCurrency } from '../utils/formatters'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import EmptyState from '../components/EmptyState'
import AddToCartModal from '../components/cart/AddToCartModal'
import CheckoutModal from '../components/cart/CheckoutModal'

export function CartPage() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingItemId, setUpdatingItemId] = useState(null)

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // Initial load of customers
  useEffect(() => {
    async function loadCustomers() {
      try {
        const res = await customerService.searchCustomers('')
        const list = res?.data || []
        setCustomers(list)
        if (list.length > 0) {
          setSelectedCustomerId(String(list[0].customerId))
        } else {
          setLoading(false)
        }
      } catch (err) {
        setError('Failed to load customers: ' + (err.message || ''))
        setLoading(false)
      }
    }
    loadCustomers()
  }, [])

  // Fetch active cart whenever customer changes
  const fetchCart = useCallback(async () => {
    if (!selectedCustomerId) return
    setLoading(true)
    setError(null)
    try {
      const res = await cartService.getActiveCart(selectedCustomerId)
      setCart(res?.data || null)
    } catch (err) {
      setError(err.message || 'Failed to load active cart')
    } finally {
      setLoading(false)
    }
  }, [selectedCustomerId])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleUpdateQuantity = async (productId, newQty) => {
    if (newQty < 1) {
      handleRemoveItem(productId)
      return
    }
    setUpdatingItemId(productId)
    try {
      const payload = {
        customerId: Number(selectedCustomerId),
        productId: Number(productId),
        quantity: Number(newQty),
      }
      const res = await cartService.updateCartItem(payload)
      setCart(res?.data || null)
      showToast('Cart quantity updated')
    } catch (err) {
      alert(`Failed to update quantity: ${err.message || ''}`)
    } finally {
      setUpdatingItemId(null)
    }
  }

  const handleRemoveItem = async (productId) => {
    setUpdatingItemId(productId)
    try {
      const res = await cartService.removeCartItem(selectedCustomerId, productId)
      setCart(res?.data || null)
      showToast('Item removed from cart')
    } catch (err) {
      alert(`Failed to remove item: ${err.message || ''}`)
    } finally {
      setUpdatingItemId(null)
    }
  }

  const handleCheckoutSuccess = (order) => {
    showToast(`Order #${order?.orderId} placed successfully! Total: ${formatCurrency(order?.totalAmount || 0)}`)
    fetchCart()
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Shopping Cart</h1>
          <p className="mt-1 text-sm text-slate-500">
            Active grocery carts, real-time inventory checks, and checkout processing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            disabled={!selectedCustomerId}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Customer Switcher Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Customer:
            </span>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {customers.map((c) => (
                <option key={c.customerId} value={c.customerId}>
                  {c.fullName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.username || 'Customer'} ({c.email}) #{c.customerId}
                </option>
              ))}
            </select>
          </div>
          {cart && (
            <div className="text-xs text-slate-500 font-medium">
              Cart ID: <span className="font-mono text-slate-800">#{cart.cartId}</span> &bull; Status: <span className="font-semibold text-emerald-700">{cart.status}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Cart Content */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" message="Loading shopping cart items..." />
        </div>
      ) : error ? (
        <ErrorMessage
          title="Failed to Load Cart"
          message={error}
          onRetry={fetchCart}
        />
      ) : !cart || !cart.items || cart.items.length === 0 ? (
        <EmptyState
          title="Your Active Cart is Empty"
          description="Browse products and add fresh groceries to this customer's active basket."
          actionLabel="Add Products"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items List */}
          <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4 text-center">Quantity</th>
                    <th className="py-3 px-4 text-right">Subtotal</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {cart.items.map((item) => (
                    <tr key={item.cartItemId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{item.productName}</div>
                        <div className="text-xs text-slate-400 font-mono">#{item.productId} &bull; {item.availableStock} in stock</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                            disabled={updatingItemId === item.productId}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-50 font-bold"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-semibold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                            disabled={updatingItemId === item.productId || item.quantity >= item.availableStock}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-50 font-bold"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                        {formatCurrency(item.subtotal)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.productId)}
                          disabled={updatingItemId === item.productId}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Remove item"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cart Summary Card */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Order Summary
              </h3>

              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Distinct Items:</span>
                  <span className="font-semibold text-slate-800">{cart.totalItems}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Units:</span>
                  <span className="font-semibold text-slate-800">{cart.totalUnits}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-3 text-base font-bold text-slate-900">
                  <span>Subtotal:</span>
                  <span className="text-emerald-700">{formatCurrency(cart.totalAmount)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCheckoutModalOpen(true)}
                className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      <AddToCartModal
        isOpen={isAddModalOpen}
        customerId={selectedCustomerId}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          showToast('Product added to active cart')
          fetchCart()
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        customerId={selectedCustomerId}
        cart={cart}
        onClose={() => setIsCheckoutModalOpen(false)}
        onSuccess={handleCheckoutSuccess}
      />
    </div>
  )
}

export default CartPage
