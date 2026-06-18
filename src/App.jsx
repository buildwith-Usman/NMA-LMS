import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import CaptainPortal       from './pages/captain/CaptainPortal'
import PrincipalPortal     from './pages/principal/PrincipalPortal'
import FoundationPortal    from './pages/foundation/FoundationPortal'
import AffairsPortal       from './pages/affairs/AffairsPortal'
import TrainingOpsPortal   from './pages/affairs/TrainingOpsPortal'
import NidaPortal          from './pages/nida/NidaPortal'
import AcademicPortal      from './pages/academic/AcademicPortal'
import InstructorPortal    from './pages/instructor/InstructorPortal'
import StudentPortal       from './pages/student/StudentPortal'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2c3e5a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-white/20 border-t-white rounded-full animate-spin" style={{borderWidth:3}}/>
          <p className="text-white/50 text-sm">Loading NMA LMS…</p>
        </div>
      </div>
    )
  }

  if (!user) return <Login/>

  // Route by role
  if (user.role === 'captain')         return <CaptainPortal/>
  if (user.role === 'principal')       return <PrincipalPortal/>
  if (user.role === 'foundation_lead') return <FoundationPortal/>
  if (user.role === 'affairs')         return <AffairsPortal/>
  if (user.role === 'training_ops')    return <TrainingOpsPortal/>
  if (user.role === 'nida')            return <NidaPortal/>
  if (user.role === 'academic')        return <AcademicPortal/>
  if (user.role === 'instructor')      return <InstructorPortal/>
  if (user.role === 'student')         return <StudentPortal/>

  return <Login/>
}
