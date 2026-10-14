import React from 'react'

export function LoadingSpinner({ size = 'md', message = 'Loading...' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }[size] || 'w-8 h-8 border-3'

  return (
    <div className="flex flex-col items-center justify-center p-6 text-slate-500">
      <div
        className={`${sizeClasses} border-slate-200 border-t-emerald-600 rounded-full animate-spin`}
        role="status"
        aria-label="loading"
      />
      {message && <p className="mt-3 text-sm font-medium text-slate-600">{message}</p>}
    </div>
  )
}

export default LoadingSpinner
