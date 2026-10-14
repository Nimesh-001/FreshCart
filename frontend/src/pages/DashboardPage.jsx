import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import healthService from '../services/healthService'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

export function DashboardPage() {
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const checkHealth = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await healthService.checkDatabaseHealth()
      setHealth(response.data)
    } catch (err) {
      setError(err.message || 'Unable to connect to the backend server.')
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    checkHealth()
  }, [])

  const placeholderCards = [
    {
      title: 'Customers',
      count: 'Active Registry',
      description: 'Customer profiles, addresses, directory',
      color: 'from-blue-500 to-indigo-600',
      to: '/customers',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      title: 'Products',
      count: 'Catalog Ready',
      description: 'Active products, categories, pricing',
      color: 'from-emerald-500 to-teal-600',
      to: '/products',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      title: 'Orders',
      count: 'Pipeline Ready',
      description: 'Checkout, cancellation, order tracking',
      color: 'from-amber-500 to-orange-600',
      to: '/orders',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      title: 'Inventory',
      count: 'Stock Monitoring',
      description: 'Warehouse stock, adjustments, low-stock',
      color: 'from-purple-500 to-violet-600',
      to: '/inventory',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      title: 'Sales',
      count: 'Daily Reporting',
      description: 'Sales summaries, revenue metrics',
      color: 'from-rose-500 to-pink-600',
      to: '/reports',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-900 text-white p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3">
            Phase 8 Foundation Active
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            FreshCart Grocery Management
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            Welcome to the centralized operations portal. The React and Tailwind CSS foundation is integrated with the Spring Boot JDBC backend on port 8080.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 opacity-10 pointer-events-none">
          <svg className="w-64 h-64 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </div>
      </div>

      {/* Backend Connectivity Status Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Backend Connectivity Check</h3>
              <p className="text-xs text-slate-500">Tests connection via <code className="text-slate-700 bg-slate-100 px-1 py-0.5 rounded font-mono">GET /api/health/db</code></p>
            </div>
          </div>
          <button
            onClick={checkHealth}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Status
          </button>
        </div>

        <div className="pt-4">
          {loading && <LoadingSpinner size="md" message="Probing backend health endpoint..." />}

          {!loading && error && (
            <ErrorMessage
              title="Backend Unavailable"
              message={error}
              onRetry={checkHealth}
            />
          )}

          {!loading && !error && health && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Connection</span>
                <div className="mt-1 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-lg font-bold text-emerald-950">Backend Connected</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Database Catalog</span>
                <div className="mt-1 text-lg font-bold text-slate-900 font-mono">
                  {health.database || 'freshcart_db'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Database Probe</span>
                <div className="mt-1 text-lg font-bold text-slate-900">
                  {health.queryCheck === 'SUCCESS' ? 'Healthy (Probe 1 OK)' : health.queryCheck}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Placeholder Summary Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900">System Modules (Placeholders)</h3>
          <span className="text-xs text-slate-400">Foundation Ready for Feature Implementation</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {placeholderCards.map((card) => (
            <Link
              key={card.title}
              to={card.to}
              className="group rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${card.color} flex items-center justify-center shadow-xs mb-4 group-hover:scale-105 transition-transform`}>
                  {card.icon}
                </div>
                <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {card.title}
                </h4>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {card.description}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-600">
                <span>{card.count}</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
