import { createContext, useContext, useState, useEffect } from 'react'
import { getNotifications, markAllRead, markOneRead, addNotification, EMAIL_TO_USER, USERS } from '../utils/mockData'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [notifs, setNotifs]   = useState([])

  const refreshNotifs = (role) => setNotifs(getNotifications(role))

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('nma_v3_user')
      if (saved) {
        const u = JSON.parse(saved)
        setUser(u)
        setNotifs(getNotifications(u.role))
      }
    } catch {}
    setLoading(false)
  }, [])

  // Real login: email + password
  const login = (email, password) => {
    if (!password || password.length < 1) return { error: 'Please enter your password' }
    const userKey = EMAIL_TO_USER[email?.toLowerCase()]
    if (!userKey) return { error: 'Email not found. Check your credentials.' }
    const userData = USERS[userKey]
    if (!userData) return { error: 'User not found.' }
    const u = { ...userData, email: email.toLowerCase(), loginTime: new Date().toISOString() }
    sessionStorage.setItem('nma_v3_user', JSON.stringify(u))
    setUser(u)
    setNotifs(getNotifications(u.role))
    return { success: true, user: u }
  }

  const logout = () => {
    sessionStorage.removeItem('nma_v3_user')
    setUser(null)
    setNotifs([])
  }

  const pushNotif = (role, text, type = 'info') => {
    addNotification(role, text, type)
    if (user?.role === role) setNotifs(getNotifications(role))
  }

  const readAll = () => {
    if (!user) return
    markAllRead(user.role)
    setNotifs(getNotifications(user.role))
  }

  const readOne = (id) => {
    if (!user) return
    markOneRead(user.role, id)
    setNotifs(getNotifications(user.role))
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, notifs, pushNotif, readAll, readOne, refreshNotifs }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
