import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard,Users,BookOpen,LogOut,MessageSquare,ClipboardList,Calendar,ChevronLeft,ChevronRight,FileText,BarChart3,GraduationCap,AlertCircle,Send,CheckSquare,Award,Video,Bell,UserPlus,Star,Briefcase,Shield,Trophy } from 'lucide-react'
import clsx from 'clsx'

const NAV = {
  captain:         [{l:'Overview',i:LayoutDashboard,k:'overview'},{l:'Students',i:GraduationCap,k:'students'},{l:'Instructors',i:Users,k:'instructors'},{l:'Courses',i:BookOpen,k:'courses'},{l:'Attendance',i:ClipboardList,k:'attendance'},{l:'Complaints',i:AlertCircle,k:'complaints'},{l:'Surveys',i:ClipboardList,k:'surveys'},{l:'Meetings',i:Calendar,k:'meetings'},{l:'Reports',i:BarChart3,k:'reports'},{l:'Tasks',i:CheckSquare,k:'tasks'},{l:'Certificates',i:Award,k:'certificates'},{l:'Messages',i:MessageSquare,k:'messages'}],
  principal:       [{l:'Dashboard',i:LayoutDashboard,k:'dashboard'},{l:'My Team',i:Users,k:'team'},{l:'Students',i:GraduationCap,k:'students'},{l:'Courses',i:BookOpen,k:'courses'},{l:'Complaints',i:AlertCircle,k:'complaints'},{l:'Assign Tasks',i:CheckSquare,k:'tasks'},{l:'Surveys',i:ClipboardList,k:'surveys'},{l:'Certificates',i:Award,k:'certificates'},{l:'Meetings',i:Calendar,k:'meetings'},{l:'Reports',i:BarChart3,k:'reports'},{l:'Messages',i:MessageSquare,k:'messages'}],
  foundation_lead: [{l:'Dashboard',i:LayoutDashboard,k:'dashboard'},{l:'Team',i:Users,k:'team'},{l:'Courses',i:BookOpen,k:'courses'},{l:'Students',i:GraduationCap,k:'students'},{l:'Attendance',i:ClipboardList,k:'attendance'},{l:'Complaints',i:AlertCircle,k:'complaints'},{l:'Tasks',i:CheckSquare,k:'tasks'},{l:'Surveys',i:ClipboardList,k:'surveys'},{l:'Certificates',i:Award,k:'certificates'},{l:'Meetings',i:Calendar,k:'meetings'},{l:'Messages',i:MessageSquare,k:'messages'},{l:'Reports',i:BarChart3,k:'reports'}],
  affairs:         [{l:'Dashboard',i:LayoutDashboard,k:'dashboard'},{l:'Students',i:GraduationCap,k:'students'},{l:'Complaints',i:AlertCircle,k:'complaints'},{l:'Surveys',i:ClipboardList,k:'surveys'},{l:'Meetings',i:Calendar,k:'meetings'},{l:'My Tasks',i:CheckSquare,k:'tasks'},{l:'Reports',i:FileText,k:'reports'}],
  training_ops:    [{l:'Dashboard',i:LayoutDashboard,k:'dashboard'},{l:'Messages',i:MessageSquare,k:'messages'},{l:'Academic Team',i:Users,k:'academic_team'},{l:'Meetings',i:Calendar,k:'meetings'},{l:'My Tasks',i:CheckSquare,k:'tasks'},{l:'Reports',i:BarChart3,k:'reports'}],
  nida:            [{l:'Dashboard',i:LayoutDashboard,k:'dashboard'},{l:'Admissions',i:UserPlus,k:'admissions'},{l:'Students',i:GraduationCap,k:'students'},{l:'Instructors',i:Users,k:'instructors'},{l:'Attendance',i:ClipboardList,k:'attendance'},{l:'Assignments',i:FileText,k:'assignments'},{l:'Quizzes',i:CheckSquare,k:'quizzes'},{l:'Complaints',i:AlertCircle,k:'complaints'},{l:'My Tasks',i:CheckSquare,k:'tasks'},{l:'Records',i:BarChart3,k:'records'}],
  academic:        [{l:'Dashboard',i:LayoutDashboard,k:'dashboard'},{l:'Students',i:GraduationCap,k:'students'},{l:'Instructors',i:Users,k:'instructors'},{l:'Courses',i:BookOpen,k:'courses'},{l:'Attendance',i:ClipboardList,k:'attendance'},{l:'Assignments',i:FileText,k:'assignments'},{l:'Quizzes',i:CheckSquare,k:'quizzes'},{l:'Quality',i:Star,k:'quality'},{l:'Meetings',i:Calendar,k:'meetings'},{l:'My Tasks',i:CheckSquare,k:'tasks'},{l:'Reports',i:BarChart3,k:'reports'}],
  instructor:      [{l:'Dashboard',i:LayoutDashboard,k:'dashboard'},{l:'My Courses',i:BookOpen,k:'courses'},{l:'My Students',i:GraduationCap,k:'students'},{l:'Attendance',i:ClipboardList,k:'attendance'},{l:'Assignments',i:FileText,k:'assignments'},{l:'Quizzes',i:CheckSquare,k:'quizzes'},{l:'Live Class',i:Video,k:'liveclass'},{l:'Results',i:Trophy,k:'results'},{l:'Complaints',i:AlertCircle,k:'complaints'},{l:'Meetings',i:Calendar,k:'meetings'},{l:'Reports',i:BarChart3,k:'reports'}],
  student:         [{l:'Dashboard',i:LayoutDashboard,k:'dashboard'},{l:'My Courses',i:BookOpen,k:'courses'},{l:'Assignments',i:FileText,k:'assignments'},{l:'Quizzes',i:CheckSquare,k:'quizzes'},{l:'Live Class',i:Video,k:'liveclass'},{l:'Attendance',i:ClipboardList,k:'attendance'},{l:'Grades',i:BarChart3,k:'grades'},{l:'Results',i:Trophy,k:'results'},{l:'Surveys',i:Send,k:'surveys'},{l:'Complaints',i:MessageSquare,k:'complaints'},{l:'Certificates',i:Award,k:'certificates'}],
}

const ACCENT = { captain:'from-amber-600 to-orange-700', principal:'from-violet-700 to-purple-900', foundation_lead:'from-blue-700 to-blue-900', affairs:'from-teal-600 to-emerald-700', training_ops:'from-amber-600 to-yellow-700', nida:'from-pink-600 to-rose-700', academic:'from-emerald-600 to-green-800', instructor:'from-indigo-600 to-violet-700', student:'from-sky-500 to-cyan-700' }
const EMOJIS = { captain:'⚓', principal:'🏛️', foundation_lead:'🧭', affairs:'📋', training_ops:'🎯', nida:'🌟', academic:'📐', instructor:'📚', student:'🎓' }

export default function Sidebar({ activeKey, onNavigate }) {
  const { user, logout, notifs } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const navItems = NAV[user?.role] || []
  const unread = notifs.filter(n => n.unread).length

  return (
    <aside className={clsx('h-screen bg-[#0f172a] flex flex-col transition-all duration-300 sticky top-0 z-30 flex-shrink-0', collapsed ? 'w-14' : 'w-56')}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 py-3.5 border-b border-white/5">
        <img src="/nma-logo.png" alt="NMA" className="w-8 h-8 object-contain rounded-lg flex-shrink-0 bg-white/10 p-0.5"/>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-white text-xs font-bold leading-tight truncate">NMA LMS</p>
            <p className="text-white/30 text-[10px] truncate">Maritime Academy</p>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-white/25 hover:text-white/60 flex-shrink-0 p-0.5">
          {collapsed ? <ChevronRight className="w-3.5 h-3.5"/> : <ChevronLeft className="w-3.5 h-3.5"/>}
        </button>
      </div>

      {/* User info */}
      {!collapsed && (
        <div className={clsx('px-3 py-2.5 border-b border-white/5 bg-gradient-to-r', ACCENT[user?.role] || 'from-slate-700 to-slate-800')}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {EMOJIS[user?.role] || user?.name?.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-white text-[11px] font-semibold truncate">{user?.name}</p>
              <p className="text-white/50 text-[9px] truncate">{user?.sub || user?.role?.replace('_',' ')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ l: label, i: Icon, k: key }) => (
          <button key={key} onClick={() => onNavigate(key)} title={collapsed ? label : undefined}
            className={clsx('sidebar-link', activeKey === key && 'active', collapsed && 'justify-center px-0')}>
            <Icon className="w-3.5 h-3.5 flex-shrink-0"/>
            {!collapsed && <span className="truncate">{label}</span>}
            {key === 'messages' && unread > 0 && !collapsed && (
              <span className="ml-auto bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold flex-shrink-0">{unread}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-2 border-t border-white/5 space-y-1">
        {!collapsed && (
          <div className="flex items-center gap-2 px-2 py-1.5">
            <img src="/microbits-logo.jpg" alt="" className="w-4 h-4 object-contain rounded opacity-30"/>
            <span className="text-white/20 text-[9px] truncate">Microbits</span>
          </div>
        )}
        <button onClick={logout} title={collapsed ? 'Sign Out' : undefined}
          className={clsx('sidebar-link text-red-400/70 hover:bg-red-500/10 hover:text-red-400', collapsed && 'justify-center px-0')}>
          <LogOut className="w-3.5 h-3.5"/>
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  )
}
