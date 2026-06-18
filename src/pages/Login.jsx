import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Lock, Mail, ArrowLeft } from 'lucide-react'

// Role selection cards
const ROLE_CARDS = [
  { role:'captain',         label:'Captain / Owner',               emoji:'⚓', sub:'Academy Owner Portal',               grad:'from-amber-500 to-orange-600',   email:'captain@nma.sa' },
  { role:'principal',       label:'Principal',                     emoji:'🏛️', sub:'Academy Leadership Portal',           grad:'from-violet-600 to-purple-800',   email:'principal@nma.sa' },
  { role:'foundation_lead', label:'Foundation Lead',               emoji:'🧭', sub:'Foundation Department Portal',        grad:'from-blue-600 to-blue-900',       email:'lead@nma.sa' },
  { role:'affairs',         label:'Affairs Team',                  emoji:'📋', sub:'Student & Trainee Affairs Portal',   grad:'from-teal-500 to-emerald-700',    email:'affairs1@nma.sa' },
  { role:'training_ops',    label:'Training Operations Manager',   emoji:'🎯', sub:'Operations Management Portal',       grad:'from-amber-600 to-yellow-700',    email:'asad@nma.sa' },
  { role:'nida',            label:'Student Services — Nida',       emoji:'🌟', sub:'Student Services Coordinator Portal',grad:'from-pink-500 to-rose-700',       email:'nida@nma.sa' },
  { role:'academic',        label:'Academic Team',                 emoji:'📐', sub:'Academic Administration Portal',     grad:'from-emerald-600 to-green-800',   email:'ali@nma.sa' },
  { role:'instructor',      label:'Instructor',                    emoji:'📚', sub:'Course Instructor Portal',            grad:'from-indigo-500 to-violet-700',   email:'essam@nma.sa' },
  { role:'student',         label:'Student',                       emoji:'🎓', sub:'Student Learning Portal',             grad:'from-sky-500 to-cyan-700',        email:'ahmed@nma.sa' },
]

export default function Login() {
  const { login } = useAuth()
  const [step, setStep]       = useState('select') // 'select' | 'credentials'
  const [selected, setSelected] = useState(null)
  const [email, setEmail]     = useState('')
  const [pw, setPw]           = useState('')
  const [show, setShow]       = useState(false)
  const [err, setErr]         = useState('')
  const [loading, setLoading] = useState(false)

  const handleSelectRole = (card) => {
    setSelected(card)
    setEmail(card.email) // pre-fill for demo
    setPw('password')    // pre-fill for demo
    setErr('')
    setStep('credentials')
  }

  const handleLogin = (e) => {
    e?.preventDefault()
    if (!email.trim()) { setErr('Please enter your email'); return }
    if (!pw.trim())    { setErr('Please enter your password'); return }
    setLoading(true)
    setTimeout(() => {
      const result = login(email, pw)
      if (result.error) { setErr(result.error); setLoading(false) }
    }, 600)
  }

  return (
    <div className="min-h-screen bg-[#2c3e5a] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Top bar */}
          <div className="h-1.5 bg-gradient-to-r from-teal-400 via-blue-500 to-teal-400"/>

          {/* Header */}
          <div className="px-8 pt-7 pb-5 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <img src="/nma-logo.png" alt="NMA" className="w-14 h-14 object-contain flex-shrink-0"/>
              <div>
                <h1 className="font-bold text-[#1a3a6e] text-base leading-tight">NATIONAL MARITIME ACADEMY</h1>
                <p className="text-[#2ba8b5] text-xs mt-0.5">الأكاديمية الوطنية البحرية</p>
                <p className="text-gray-400 text-xs mt-0.5">Learning Management System</p>
              </div>
            </div>
          </div>

          <div className="p-7">
            {/* STEP 1 — Role Selection */}
            {step === 'select' && (
              <div className="animate-fadeIn">
                <h2 className="text-[#2ba8b5] text-xl font-bold mb-1">Select Your Role</h2>
                <p className="text-gray-400 text-sm mb-5">Choose who you are to access your portal</p>
                <div className="grid grid-cols-3 gap-2.5">
                  {ROLE_CARDS.map(card => (
                    <button key={card.role} onClick={() => handleSelectRole(card)}
                      className="flex flex-col items-center p-3.5 border-2 border-gray-100 rounded-xl hover:border-[#2ba8b5] hover:bg-[#2ba8b5]/5 transition-all group cursor-pointer">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.grad} flex items-center justify-center text-xl mb-2 shadow-sm group-hover:scale-110 transition-transform`}>
                        {card.emoji}
                      </div>
                      <p className="text-xs font-semibold text-gray-700 text-center leading-tight">{card.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2 — Credentials */}
            {step === 'credentials' && (
              <div className="animate-slideUp">
                <button onClick={() => { setStep('select'); setErr('') }}
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-5 transition-colors">
                  <ArrowLeft className="w-4 h-4"/> Back to roles
                </button>

                {/* Selected role badge */}
                <div className={`flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r ${selected?.grad} mb-6`}>
                  <span className="text-2xl">{selected?.emoji}</span>
                  <div>
                    <p className="font-bold text-white text-sm">{selected?.label}</p>
                    <p className="text-white/60 text-xs">{selected?.sub}</p>
                  </div>
                </div>

                <h2 className="text-[#2ba8b5] text-xl font-bold mb-5">Sign In</h2>

                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="label">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                      <input type="email" value={email} onChange={e=>{setEmail(e.target.value);setErr('')}}
                        placeholder="your@email.com"
                        className="input pl-10"/>
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="label">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                      <input type={show?'text':'password'} value={pw} onChange={e=>{setPw(e.target.value);setErr('')}}
                        placeholder="Enter your password"
                        className="input pl-10 pr-10"/>
                      <button type="button" onClick={()=>setShow(!show)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {show ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                      </button>
                    </div>
                  </div>

                  {/* Row: remember + forgot */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded accent-[#2ba8b5]"/>
                      Remember me
                    </label>
                    <button type="button" className="text-sm text-[#2ba8b5] hover:underline">Forgot Password?</button>
                  </div>

                  {err && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{err}</p>}

                  <button type="submit" disabled={loading}
                    className="w-full py-3 bg-[#2ba8b5] hover:bg-[#229aa7] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                    {loading
                      ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Signing In…</>
                      : 'LOGIN'
                    }
                  </button>

                  <p className="text-center text-xs text-gray-300">Demo: email pre-filled · password: <strong>password</strong></p>
                </form>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-100 px-7 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/microbits-logo.jpg" alt="Microbits" className="w-6 h-6 object-contain rounded opacity-50"/>
              <span className="text-xs text-gray-400">Developed by <strong className="text-gray-500">Microbits</strong></span>
            </div>
            <span className="text-xs text-gray-300">v3.0</span>
          </div>
        </div>
      </div>
    </div>
  )
}
