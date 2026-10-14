import React, { useState, useEffect, useCallback, useMemo } from 'react'
import reportService from '../services/reportService'
import customerService from '../services/customerService'
import { formatCurrency, formatDateTime } from '../utils/formatters'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import EmptyState from '../components/EmptyState'

export function ReportsPage() {
  const [activeReport, setActiveReport] = useState('SALES') // 'SALES' | 'PURCHASES' | 'SUMMARY'

  // Sales report state
  const [salesData, setSalesData] = useState([])
  const [salesStartDate, setSalesStartDate] = useState('')
  const [salesEndDate, setSalesEndDate] = useState('')
  const [loadingSales, setLoadingSales] = useState(false)
  const [salesError, setSalesError] = useState(null)

  // Customer Purchases state
  const [purchasesData, setPurchasesData] = useState([])
  const [purchasesStartDate, setPurchasesStartDate] = useState('')
  const [purchasesEndDate, setPurchasesEndDate] = useState('')
  const [loadingPurchases, setLoadingPurchases] = useState(false)
  const [purchasesError, setPurchasesError] = useState(null)

  // Customer Summary state
  const [customers, setCustomers] = useState([])
  const [summaryCustomerId, setSummaryCustomerId] = useState('')
  const [customerSummary, setCustomerSummary] = useState(null)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [summaryError, setSummaryError] = useState(null)

  // Load customers for summary dropdown
  useEffect(() => {
    async function loadCustomers() {
      try {
        const res = await customerService.searchCustomers('')
        const list = res?.data || []
        setCustomers(list)
        if (list.length > 0) {
          setSummaryCustomerId(String(list[0].customerId))
        }
      } catch {
        // ignore
      }
    }
    loadCustomers()
  }, [])

  // 1. Fetch Sales Report
  const fetchSalesReport = useCallback(async () => {
    setLoadingSales(true)
    setSalesError(null)
    try {
      const res = await reportService.getSalesReport(salesStartDate || null, salesEndDate || null)
      setSalesData(res?.data || [])
    } catch (err) {
      setSalesError(err.message || 'Failed to generate sales report')
    } finally {
      setLoadingSales(false)
    }
  }, [salesStartDate, salesEndDate])

  // 2. Fetch Customer Purchases
  const fetchPurchasesReport = useCallback(async () => {
    setLoadingPurchases(true)
    setPurchasesError(null)
    try {
      const res = await reportService.getCustomerPurchaseReport(
        purchasesStartDate || null,
        purchasesEndDate || null
      )
      setPurchasesData(res?.data || [])
    } catch (err) {
      setPurchasesError(err.message || 'Failed to generate customer purchase report')
    } finally {
      setLoadingPurchases(false)
    }
  }, [purchasesStartDate, purchasesEndDate])

  // 3. Fetch Customer Summary
  const fetchCustomerSummary = useCallback(async (cId) => {
    if (!cId) return
    setLoadingSummary(true)
    setSummaryError(null)
    try {
      const res = await reportService.getCustomerPurchaseSummary(cId)
      setCustomerSummary(res?.data || null)
    } catch (err) {
      setSummaryError(err.message || 'Failed to load customer summary')
    } finally {
      setLoadingSummary(false)
    }
  }, [])

  useEffect(() => {
    if (activeReport === 'SALES') {
      fetchSalesReport()
    } else if (activeReport === 'PURCHASES') {
      fetchPurchasesReport()
    } else if (activeReport === 'SUMMARY' && summaryCustomerId) {
      fetchCustomerSummary(summaryCustomerId)
    }
  }, [activeReport, summaryCustomerId, fetchSalesReport, fetchPurchasesReport, fetchCustomerSummary])

  // Aggregate Sales totals
  const salesTotals = useMemo(() => {
    return salesData.reduce(
      (acc, row) => ({
        totalSales: acc.totalSales + Number(row.totalSales || 0),
        totalOrders: acc.totalOrders + Number(row.totalOrders || 0),
        deliveredOrders: acc.deliveredOrders + Number(row.deliveredOrders || 0),
      }),
      { totalSales: 0, totalOrders: 0, deliveredOrders: 0 }
    )
  }, [salesData])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Business Reports & Analytics</h1>
          <p className="mt-1 text-sm text-slate-500">
            Executive sales performance, customer procurement history, and lifetime order analytics.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        {[
          { id: 'SALES', label: 'Daily Sales Report' },
          { id: 'PURCHASES', label: 'Customer Purchase Ledger' },
          { id: 'SUMMARY', label: 'Single Customer Lifetime Summary' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveReport(tab.id)}
            className={`pb-3 text-sm font-semibold transition-all border-b-2 -mb-px ${
              activeReport === tab.id
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Sales Report */}
      {activeReport === 'SALES' && (
        <div className="space-y-6">
          {/* Date Range Bar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Date Range:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={salesStartDate}
                  onChange={(e) => setSalesStartDate(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-slate-400 text-xs font-medium">to</span>
                <input
                  type="date"
                  value={salesEndDate}
                  onChange={(e) => setSalesEndDate(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <button
                type="button"
                onClick={fetchSalesReport}
                className="rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                Apply Filter
              </button>
              {(salesStartDate || salesEndDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setSalesStartDate('')
                    setSalesEndDate('')
                  }}
                  className="text-xs font-medium text-slate-500 hover:text-slate-800"
                >
                  Clear dates
                </button>
              )}
            </div>
          </div>

          {/* Sales Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Revenue
              </span>
              <p className="mt-2 text-2xl font-bold text-emerald-700">
                {formatCurrency(salesTotals.totalSales)}
              </p>
              <p className="mt-1 text-xs text-slate-400">Sum of order totals for period</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Orders Placed
              </span>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {salesTotals.totalOrders}
              </p>
              <p className="mt-1 text-xs text-slate-400">Gross orders received</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Delivered Orders
              </span>
              <p className="mt-2 text-2xl font-bold text-blue-700">
                {salesTotals.deliveredOrders}
              </p>
              <p className="mt-1 text-xs text-slate-400">Fulfilled and delivered shipments</p>
            </div>
          </div>

          {/* Table */}
          {loadingSales ? (
            <div className="py-16 flex justify-center">
              <LoadingSpinner size="lg" message="Generating executive sales report..." />
            </div>
          ) : salesError ? (
            <ErrorMessage
              title="Sales Report Error"
              message={salesError}
              onRetry={fetchSalesReport}
            />
          ) : salesData.length === 0 ? (
            <EmptyState
              title="No Sales Records Found"
              description="No orders have been recorded in the selected date window."
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Sales Date</th>
                      <th className="py-3 px-4 text-center">Total Orders</th>
                      <th className="py-3 px-4 text-center">Delivered Orders</th>
                      <th className="py-3 px-4 text-right">Daily Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {salesData.map((row, idx) => (
                      <tr key={row.salesDate || idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {row.salesDate}
                        </td>
                        <td className="py-3.5 px-4 text-center font-medium text-slate-700">
                          {row.totalOrders}
                        </td>
                        <td className="py-3.5 px-4 text-center font-medium text-blue-700">
                          {row.deliveredOrders}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                          {formatCurrency(row.totalSales)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Customer Purchase Report */}
      {activeReport === 'PURCHASES' && (
        <div className="space-y-6">
          {/* Date Range Bar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Date Window:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={purchasesStartDate}
                  onChange={(e) => setPurchasesStartDate(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-slate-400 text-xs font-medium">to</span>
                <input
                  type="date"
                  value={purchasesEndDate}
                  onChange={(e) => setPurchasesEndDate(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <button
                type="button"
                onClick={fetchPurchasesReport}
                className="rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                Filter Ledger
              </button>
            </div>
          </div>

          {loadingPurchases ? (
            <div className="py-16 flex justify-center">
              <LoadingSpinner size="lg" message="Compiling customer purchase ledger..." />
            </div>
          ) : purchasesError ? (
            <ErrorMessage
              title="Customer Purchase Report Error"
              message={purchasesError}
              onRetry={fetchPurchasesReport}
            />
          ) : purchasesData.length === 0 ? (
            <EmptyState
              title="No Purchase Records Found"
              description="No customer purchase activity recorded within the specified period."
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4 text-center">Total Orders</th>
                      <th className="py-3 px-4">Avg Order Value</th>
                      <th className="py-3 px-4">Last Order</th>
                      <th className="py-3 px-4 text-right">Total Purchases</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {purchasesData.map((cust) => (
                      <tr key={cust.customerId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {cust.firstName} {cust.lastName}
                          <span className="block text-[11px] font-mono font-normal text-slate-400">
                            #{cust.customerId}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          {cust.email}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                          {cust.totalOrders}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">
                          {formatCurrency(cust.averageOrderValue)}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500">
                          {cust.lastOrderDate ? formatDateTime(cust.lastOrderDate) : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                          {formatCurrency(cust.totalPurchaseAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Customer Purchase Summary */}
      {activeReport === 'SUMMARY' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Select Customer:
              </span>
              <select
                value={summaryCustomerId}
                onChange={(e) => setSummaryCustomerId(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {customers.map((c) => (
                  <option key={c.customerId} value={c.customerId}>
                    {c.fullName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.username || 'Customer'} ({c.email}) #{c.customerId}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loadingSummary ? (
            <div className="py-16 flex justify-center">
              <LoadingSpinner size="lg" message="Loading customer purchase summary..." />
            </div>
          ) : summaryError ? (
            <ErrorMessage
              title="Customer Summary Error"
              message={summaryError}
              onRetry={() => fetchCustomerSummary(summaryCustomerId)}
            />
          ) : customerSummary ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-900">{customerSummary.fullName}</h3>
                <p className="text-xs text-slate-500">{customerSummary.email} &bull; Customer #{customerSummary.customerId}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Total Lifetime Orders</span>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{customerSummary.totalOrders}</p>
                  <p className="mt-1 text-xs text-slate-400">Total orders submitted</p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Settled Order Value</span>
                  <p className="mt-1 text-2xl font-bold text-emerald-700">{formatCurrency(customerSummary.completedOrPaidOrderValue)}</p>
                  <p className="mt-1 text-xs text-slate-400">Paid or delivered orders</p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Most Recent Order</span>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {customerSummary.latestOrderDate ? formatDateTime(customerSummary.latestOrderDate) : 'No orders yet'}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">Latest checkout activity</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default ReportsPage
