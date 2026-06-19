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
    // Check instructors and students tables first — they are the definitive source of truth
    // for those roles and cannot be overridden by whatever profiles.role says.
    const [{ data: instructor }, { data: student }] = await Promise.all([
      supabase.from('instructors').select('name, sub, status').eq('auth_id', authUser.id).maybeSingle(),
      supabase.from('students').select('name, status, gpa, attendance_rate').eq('auth_id', authUser.id).maybeSingle(),
    ])

    if (instructor) {
      setUser({
        id: authUser.id, email: authUser.email,
        name: instructor.name, role: 'instructor',
        color: '#8b5cf6', sub: instructor.sub || '', status: instructor.status,
      })
      await loadNotifs(authUser.id)
      setLoading(false)
      return
    }

    if (student) {
      setUser({
        id: authUser.id, email: authUser.email,
        name: student.name, role: 'student',
        color: '#6366f1', sub: '', status: student.status,
        gpa: student.gpa, attendanceRate: student.attendance_rate,
      })
      await loadNotifs(authUser.id)
      setLoading(false)
      return
    }

    // Admin staff — fall back to profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (profile) {
      setUser({
        id: authUser.id, email: authUser.email,
        name: profile.name, role: profile.role,
        color: profile.color, sub: profile.sub,
        gpa: profile.gpa, attendanceRate: profile.attendance_rate,
        status: profile.status,
      })
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

  const ROLE_LABELS = {
    student: 'Student', instructor: 'Instructor', academic: 'Academic Team',
    captain: 'Captain / Owner', principal: 'Principal',
    foundation_lead: 'Foundation Lead', affairs: 'Affairs Team',
    training_ops: 'Training Operations', nida: 'Student Services',
  }

  const loginWithRoleCheck = async (email, password, expectedRole) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }

    const userId = data.user.id

    // Students: validate against the students table by auth_id
    if (expectedRole === 'student') {
      const { data: rec } = await supabase
        .from('students')
        .select('id, status')
        .eq('auth_id', userId)
        .single()
      if (!rec) {
        await supabase.auth.signOut()
        return { error: 'No student account found for these credentials. Please contact your administrator.' }
      }
      if (rec.status === 'inactive') {
        await supabase.auth.signOut()
        return { error: 'Your student account has been deactivated. Please contact your administrator.' }
      }
      return { success: true }
    }

    // Instructors: validate against the instructors table by auth_id
    if (expectedRole === 'instructor') {
      const { data: rec } = await supabase
        .from('instructors')
        .select('id, status')
        .eq('auth_id', userId)
        .single()
      if (!rec) {
        await supabase.auth.signOut()
        return { error: 'No instructor account found for these credentials. Please contact your administrator.' }
      }
      if (rec.status === 'inactive') {
        await supabase.auth.signOut()
        return { error: 'Your instructor account has been deactivated. Please contact your administrator.' }
      }
      return { success: true }
    }

    // All other roles (admin staff): validate via profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (!profile) {
      await supabase.auth.signOut()
      return { error: 'Account setup incomplete. Please contact your administrator.' }
    }

    if (profile.role !== expectedRole) {
      await supabase.auth.signOut()
      const actual = ROLE_LABELS[profile.role] || profile.role
      return { error: `Wrong portal. This account belongs to the "${actual}" role. Please go back and select the correct portal.` }
    }

    return { success: true }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setNotifs([])
  }

  // Push a notification to all users of a given role.
  // Students and instructors live in their own tables (with auth_id), not in profiles.
  // For those two roles we query the correct table so instructors never receive student
  // notifications and vice-versa, regardless of what profiles.role says.
  const pushNotif = async (role, text, type = 'info', module = null) => {
    let userIds = []

    if (role === 'student') {
      const { data } = await supabase
        .from('students').select('auth_id').not('auth_id', 'is', null)
      userIds = (data || []).map(s => s.auth_id).filter(Boolean)
    } else if (role === 'instructor') {
      const { data } = await supabase
        .from('instructors').select('auth_id').not('auth_id', 'is', null)
      userIds = (data || []).map(i => i.auth_id).filter(Boolean)
    } else {
      const { data } = await supabase
        .from('profiles').select('id').eq('role', role)
      userIds = (data || []).map(p => p.id)
    }

    if (userIds.length) {
      await supabase.from('notifications').insert(
        userIds.map(uid => ({ user_id: uid, text, type, unread: true, ...(module && { module }) }))
      )
    }
    if (user?.id && userIds.includes(user.id)) await loadNotifs(user.id)
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
    <AuthContext.Provider value={{ user, login, loginWithRoleCheck, logout, loading, notifs, pushNotif, readAll, readOne, refreshNotifs }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
