import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [notifs, setNotifs]   = useState([])

  const loadNotifs = async (userId) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30)
    setNotifs(data || [])
  }

  const loadProfile = async (authUser) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()
    if (profile) {
      const u = {
        id: authUser.id,
        email: authUser.email,
        name: profile.name,
        role: profile.role,
        color: profile.color,
        sub: profile.sub,
        gpa: profile.gpa,
        attendanceRate: profile.attendance_rate,
        status: profile.status,
      }
      setUser(u)
      await loadNotifs(authUser.id)
    }
    setLoading(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadProfile(session.user)
      } else {
        setUser(null)
        setNotifs([])
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return { success: true }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setNotifs([])
  }

  // Push a notification to all users of a given role
  const pushNotif = async (role, text, type = 'info') => {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', role)
    if (profiles?.length) {
      await supabase.from('notifications').insert(
        profiles.map(p => ({ user_id: p.id, text, type, unread: true }))
      )
    }
    if (user?.role === role) await loadNotifs(user.id)
  }

  const readAll = async () => {
    if (!user) return
    await supabase.from('notifications').update({ unread: false }).eq('user_id', user.id)
    setNotifs(prev => prev.map(n => ({ ...n, unread: false })))
  }

  const readOne = async (id) => {
    if (!user) return
    await supabase.from('notifications').update({ unread: false }).eq('id', id)
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n))
  }

  const refreshNotifs = async () => {
    if (user) await loadNotifs(user.id)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, notifs, pushNotif, readAll, readOne, refreshNotifs }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
