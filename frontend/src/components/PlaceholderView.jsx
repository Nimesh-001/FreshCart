import React from 'react'
import { Link } from 'react-router-dom'

export function PlaceholderView({ title, description, phaseTag, icon, endpoints = [] }) {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{title}</h2>
            {phaseTag && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {phaseTag}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 self-start text-xs font-semibold text-slate-600 hover:text-emerald-600 transition-colors"
        >
          &larr; Back to Dashboard
        </Link>
      </div>

      {/* Placeholder Content Container */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 sm:p-12 text-center shadow-xs">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 mb-4">
          {icon || (
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          )}
        </div>
        <h3 className="text-lg font-bold text-slate-900">{title} Module Foundation</h3>
        <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          The frontend routing, layout, and API foundations are ready. The underlying REST endpoints and database stored procedures are fully operational on the backend.
        </p>

        {endpoints.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-100 max-w-lg mx-auto text-left">
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Connected Backend Endpoints</span>
            <div className="space-y-1.5 font-mono text-xs">
              {endpoints.map((ep, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-700">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    ep.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                    ep.method === 'PUT' ? 'bg-amber-100 text-amber-700' :
                    ep.method === 'DELETE' ? 'bg-red-100 text-red-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {ep.method}
                  </span>
                  <span className="text-slate-600">{ep.path}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PlaceholderView
