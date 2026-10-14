import React from 'react'

export function StatusBadge({ status, label }) {
  if (!status) return null

  const s = String(status).toUpperCase()

  const config = {
    SUCCESS: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    UP: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'IN STOCK': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    IN_STOCK: 'bg-emerald-50 text-emerald-700 border-emerald-200',

    PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200',
    ASSIGNED: 'bg-blue-50 text-blue-700 border-blue-200',
    OUT_FOR_DELIVERY: 'bg-sky-50 text-sky-700 border-sky-200',

    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    'LOW STOCK': 'bg-amber-50 text-amber-700 border-amber-200',
    LOW_STOCK: 'bg-amber-50 text-amber-700 border-amber-200',

    DOWN: 'bg-red-50 text-red-700 border-red-200',
    FAILED: 'bg-red-50 text-red-700 border-red-200',
    CANCELLED: 'bg-red-50 text-red-700 border-red-200',
    'OUT OF STOCK': 'bg-red-50 text-red-700 border-red-200',
    OUT_OF_STOCK: 'bg-red-50 text-red-700 border-red-200',
    INACTIVE: 'bg-slate-100 text-slate-700 border-slate-300',

    REFUNDED: 'bg-purple-50 text-purple-700 border-purple-200',
  }[s] || 'bg-slate-50 text-slate-700 border-slate-200'

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
      {label || status}
    </span>
  )
}

export default StatusBadge
