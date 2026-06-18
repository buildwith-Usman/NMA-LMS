import { useState, useRef, useEffect } from 'react'
import { Bell, Search, X, CheckCheck, Check } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import clsx from 'clsx'

const NOTIF_ICONS = {
  complaint:'⚠️', survey:'📋', meeting:'📅', assignment:'📝',
  quiz:'❓', grade:'🎯', certificate:'🎓', task:'✅',
  info:'ℹ️', report:'📊', message:'💬', admission:'👤',
}
const ROLE_COLOR = {
  captain:'bg-amber-500', principal:'bg-violet-600', foundation_lead:'bg-blue-700',
  affairs:'bg-teal-600',  training_ops:'bg-amber-600', nida:'bg-pink-600',
  academic:'bg-emerald-600', instructor:'bg-indigo-600', student:'bg-sky-500',
}

export default function Header({ title }) {
  const { user, notifs, readAll, readOne } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const unread = notifs.filter(n => n.unread).length

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center px-5 gap-4 sticky top-0 z-20 shadow-sm">
      <h1 className="font-bold text-sm text-gray-900 flex-1 truncate">{title}</h1>

      {/* Search */}
      <div className="relative hidden md:block">
        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
        <input type="text" placeholder="Search…"
          className="pl-8 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl w-40 focus:outline-none focus:ring-2 focus:ring-blue-200"/>
      </div>

      {/* Bell with working notification panel */}
      <div className="relative" ref={ref}>
        <button onClick={() => setOpen(!open)}
          className="relative w-8 h-8 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">
          <Bell className="w-3.5 h-3.5 text-gray-600"/>
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-10 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/80">
              <span className="font-semibold text-xs text-gray-900">
                Notifications {unread > 0 && <span className="text-red-500 ml-1">({unread} new)</span>}
              </span>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button onClick={readAll}
                    className="flex items-center gap-1 text-[10px] text-blue-600 hover:underline font-medium">
                    <CheckCheck className="w-3 h-3"/> All read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5"/>
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {notifs.length === 0
                ? <div className="py-10 text-center text-xs text-gray-400">No notifications</div>
                : notifs.map(n => (
                  <div key={n.id} onClick={() => readOne(n.id)}
                    className={clsx('px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-gray-50 transition-colors', n.unread && 'bg-blue-50/60')}>
                    <span className="text-sm mt-0.5 flex-shrink-0">{NOTIF_ICONS[n.type] || 'ℹ️'}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-700 leading-snug">{n.text}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{n.time}</p>
                    </div>
                    {n.unread
                      ? <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"/>
                      : <Check className="w-3 h-3 text-gray-300 flex-shrink-0 mt-0.5"/>
                    }
                  </div>
                ))
              }
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50">
              <p className="text-[10px] text-gray-400 text-center">Click a notification to mark as read</p>
            </div>
          </div>
        )}
      </div>

      {/* Avatar */}
      <div className={clsx('w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-bold', ROLE_COLOR[user?.role] || 'bg-slate-600')}>
        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
      </div>
    </header>
  )
}
