import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import healthService from '../services/healthService'

export function Header({ onMenuClick }) {
  const location = useLocation()
  const [dbStatus, setDbStatus] = useState('checking') // 'checking' | 'connected' | 'unavailable'

  useEffect(() => {
    let isMounted = true

    async function checkHealth() {
      try {
        const res = await healthService.checkDatabaseHealth()
        if (isMounted) {
          if (res && res.success && res.data && res.data.status === 'UP') {
            setDbStatus('connected')
          } else {
            setDbStatus('unavailable')
          }
        }
      } catch (err) {
        if (isMounted) {
          setDbStatus('unavailable')
        }
      }
    }

    checkHealth()
    const timer = setInterval(checkHealth, 30000)
    return () => {
      isMounted = false
      clearInterval(timer)
    }
  }, [])

  const path = location.pathname.replace('/', '')
  const pageTitle = path ? path.charAt(0).toUpperCase() + path.slice(1) : 'Dashboard'

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden cursor-pointer"
          aria-label="Open sidebar"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">{pageTitle}</h1>
          <p className="text-xs text-slate-400 hidden sm:block">FreshCart Operations Portal</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Backend health status badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold">
          {dbStatus === 'checking' && (
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
              Checking API...
            </span>
          )}
          {dbStatus === 'connected' && (
            <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50/50">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Backend Connected
            </span>
          )}
          {dbStatus === 'unavailable' && (
            <span className="flex items-center gap-1.5 text-red-700 bg-red-50/50">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              Backend Unavailable
            </span>
          )}
        </div>

        {/* User avatar badge placeholder */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 text-xs font-bold">
            OP
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
