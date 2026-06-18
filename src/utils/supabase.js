import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://imfcfqvobqpttymiesdf.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltZmNmcXZvYnFwdHR5bWllc2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MjI3MTEsImV4cCI6MjA5Njk5ODcxMX0.A6ABkokHAFOxpJEag7wouqmazJIUiF1O5MVk7GxcMag'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Creates a new auth user without replacing the current admin session.
// REQUIRED: Supabase Dashboard → Authentication → Providers → Email → turn OFF "Confirm email"
// so new students/instructors can login immediately without email verification.
export async function signUpNewUser(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY },
    body: JSON.stringify({ email, password }),
  })
  const json = await res.json()
  if (!res.ok) {
    const msg = json.msg || json.error_description || json.message || 'Signup failed'
    return { userId: null, error: msg }
  }
  const userId = json.id || json.user?.id || null
  return { userId, error: null }
}