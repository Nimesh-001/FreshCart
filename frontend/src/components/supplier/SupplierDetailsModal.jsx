import React from 'react'
import StatusBadge from '../StatusBadge'
import { formatDateTime } from '../../utils/formatters'

export function SupplierDetailsModal({ isOpen, onClose, supplier }) {
  if (!isOpen || !supplier) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-100 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{supplier.supplierName}</h3>
              <p className="text-xs font-mono text-slate-500">ID: #{supplier.supplierId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Status</span>
              <div className="mt-1">
                <StatusBadge status={supplier.isActive ? 'ACTIVE' : 'INACTIVE'} />
              </div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Registered On</span>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {formatDateTime(supplier.createdAt)}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-4 space-y-3">
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Contact Person</span>
              <p className="mt-0.5 text-sm font-medium text-slate-800">{supplier.contactPerson || '—'}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Email</span>
                <a
                  href={`mailto:${supplier.email}`}
                  className="mt-0.5 text-sm font-medium text-emerald-600 hover:underline break-all"
                >
                  {supplier.email || '—'}
                </a>
              </div>
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Phone</span>
                <p className="mt-0.5 text-sm font-medium text-slate-800">{supplier.phone || '—'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-4">
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Physical Address</span>
            <p className="mt-1 text-sm text-slate-700 leading-relaxed">
              {supplier.address || 'No address specified.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default SupplierDetailsModal
