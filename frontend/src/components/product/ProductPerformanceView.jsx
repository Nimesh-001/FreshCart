import React, { useState, useEffect, useCallback } from 'react'
import productService from '../../services/productService'
import { formatCurrency } from '../../utils/formatters'
import LoadingSpinner from '../LoadingSpinner'
import ErrorMessage from '../ErrorMessage'
import EmptyState from '../EmptyState'
import StatusBadge from '../StatusBadge'

export function ProductPerformanceView() {
  const [performanceData, setPerformanceData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchPerformance = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await productService.getAllProductPerformance()
      setPerformanceData(response?.data || [])
    } catch (err) {
      setError(err.message || 'Failed to fetch product performance data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPerformance()
  }, [fetchPerformance])

  // Computed summary metrics directly from backend values
  const totalUnitsSold = performanceData.reduce((acc, p) => acc + (Number(p.unitsSold) || 0), 0)
  const totalRevenue = performanceData.reduce((acc, p) => acc + (Number(p.salesRevenue) || 0), 0)
  const topProduct = [...performanceData].sort((a, b) => (Number(b.unitsSold) || 0) - (Number(a.unitsSold) || 0))[0]

  const filteredData = performanceData.filter((p) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      p.productName?.toLowerCase().includes(q) ||
      p.categoryName?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Units Sold */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Units Sold</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{totalUnitsSold.toLocaleString()}</p>
          <p className="mt-1 text-xs text-slate-500">All-time grocery units purchased</p>
        </div>

        {/* Total Sales Revenue */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Gross Sales Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-700">{formatCurrency(totalRevenue)}</p>
          <p className="mt-1 text-xs text-slate-500">Cumulative sales across catalog</p>
        </div>

        {/* Top Performer */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Top Performing Product</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-base font-bold text-slate-900 truncate">
            {topProduct && (Number(topProduct.unitsSold) || 0) > 0 ? topProduct.productName : 'No sales yet'}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {topProduct && (Number(topProduct.unitsSold) || 0) > 0
              ? `${topProduct.unitsSold} units (${formatCurrency(topProduct.salesRevenue)})`
              : 'Awaiting customer orders'}
          </p>
        </div>
      </div>

      {/* Search & Refresh Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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
              placeholder="Filter performance by product or category..."
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

          <button
            type="button"
            onClick={fetchPerformance}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh Metrics</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16">
            <LoadingSpinner size="lg" message="Loading performance analysis..." />
          </div>
        ) : error ? (
          <div className="p-8">
            <ErrorMessage
              title="Failed to load performance data"
              message={error}
              onRetry={fetchPerformance}
            />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No performance records"
              description="No product performance data matches your criteria."
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
                  <th scope="col" className="px-6 py-4">Current Stock</th>
                  <th scope="col" className="px-6 py-4 text-center">Units Sold</th>
                  <th scope="col" className="px-6 py-4 text-right">Revenue</th>
                  <th scope="col" className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map((item) => (
                  <tr key={item.productId} className="hover:bg-slate-50/60 transition-colors">
                    {/* Product */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{item.productName}</div>
                      <div className="text-xs text-slate-400 font-mono">ID #{item.productId}</div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 text-slate-600">
                      {item.categoryName || '—'}
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {formatCurrency(item.price)}
                    </td>

                    {/* Stock & Status */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{item.stockQuantity ?? 0}</span>
                        {item.stockStatus && (
                          <StatusBadge status={item.stockStatus} label={item.stockStatus} />
                        )}
                      </div>
                    </td>

                    {/* Units Sold */}
                    <td className="px-6 py-4 text-center font-bold text-slate-900">
                      {item.unitsSold ?? 0}
                    </td>

                    {/* Sales Revenue */}
                    <td className="px-6 py-4 text-right font-bold text-emerald-700">
                      {formatCurrency(item.salesRevenue ?? 0)}
                    </td>

                    {/* Active */}
                    <td className="px-6 py-4 text-center">
                      <StatusBadge
                        status={item.isActive ? 'ACTIVE' : 'INACTIVE'}
                        label={item.isActive ? 'Active' : 'Inactive'}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductPerformanceView
