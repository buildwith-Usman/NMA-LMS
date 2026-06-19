import { useState } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import Header from '../../components/layout/Header'
import { StatCard, StatusBadge, Badge, Table, SectionHeader, ProgressBar, Modal, MiniStat, SelectFilter, Card } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import {
  GraduationCap, Users, BookOpen, AlertCircle, Calendar, BarChart3, Award,
  ClipboardList, ExternalLink, Send, Plus, FileText, Search,
  Edit2, Trash2, CheckSquare, ThumbsUp, ThumbsDown, RotateCcw,
  Forward, Eye, CheckCircle, Download,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'

const PAGES = {
  overview:'Overview', students:'Students', instructors:'Instructors',
  courses:'Courses', attendance:'Attendance', complaints:'Complaints',
  surveys:'Surveys', meetings:'Meetings', reports:'Reports',
  messages:'Messages', tasks:'Tasks', certificates:'Certificates',
}

export default function CaptainPortal() {
  const [active, setActive] = useState('overview')
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar activeKey={active} onNavigate={setActive}/>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={PAGES[active] || active} onNavigate={setActive}/>
        <main className="flex-1 overflow-y-auto p-5">
          {active==='overview'     && <CaptainOverview/>}
          {active==='students'     && <CaptainStudents/>}
          {active==='instructors'  && <CaptainInstructors/>}
          {active==='courses'      && <CaptainCourses/>}
          {active==='attendance'   && <CaptainAttendance/>}
          {active==='complaints'   && <CaptainComplaints/>}
          {active==='surveys'      && <CaptainSurveys/>}
          {active==='meetings'     && <CaptainMeetings/>}
          {active==='reports'      && <CaptainReports/>}
          {active==='messages'     && <CaptainMessages/>}
          {active==='tasks'        && <CaptainTasks/>}
          {active==='certificates' && <CaptainCertificates/>}
        </main>
      </div>
    </div>
  )
}

// ── Overview ─────────────────────────────────────────────────────────────────

function CaptainOverview() {
  const { getStats, attendanceChart, mockCourses, mockStudents, mockInstructors, mockComplaints, mockMeetings, mockSurveys, mockAttendance, mockAssignments, mockCertificates } = useData()
  const stats = getStats()
  const [drill, setDrill] = useState(null)

  // Dynamic attendance per student from actual records
  const computeAttendance = (studentId) => {
    const recs = mockAttendance.filter(a => a.studentId === studentId)
    if (!recs.length) return null
    return Math.round(recs.filter(r => r.status === 'present').length / recs.length * 100)
  }

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="rounded-2xl bg-gradient-to-r from-[#1e3a6e] to-[#2563eb] p-5 text-white">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-white/60 text-xs">Academy Owner</p>
            <h2 className="font-bold text-2xl mt-0.5">Captain Turki ⚓</h2>
            <p className="text-white/50 text-sm mt-1">Click any stat to drill into details</p>
          </div>
          <div className="text-5xl opacity-10 select-none">🚢</div>
        </div>
      </div>

      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">👥 Students</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total Students"   value={stats.totalStudents}       icon={GraduationCap} color="blue"   onClick={()=>setDrill('students_all')}  clickLabel="View by course"/>
          <StatCard label="At-Risk Students" value={stats.atRisk}              icon={AlertCircle}   color="red"    onClick={()=>setDrill('students_risk')} clickLabel="View at-risk details"/>
          <StatCard label="Avg Attendance"   value={`${stats.avgAttendance}%`} icon={ClipboardList} color="green"  onClick={()=>setDrill('attendance')}    clickLabel="View by course"/>
          <StatCard label="Average GPA"      value={stats.avgGpa}              icon={BarChart3}     color="purple" onClick={()=>setDrill('gpa')}           clickLabel="View grades"/>
        </div>
      </div>

      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">📚 Academic</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Active Courses"  value={stats.activeCourses}    icon={BookOpen}  color="teal"   onClick={()=>setDrill('courses')}      clickLabel="View courses"/>
          <StatCard label="Instructors"     value={stats.totalInstructors} icon={Users}     color="indigo" onClick={()=>setDrill('instructors')}  clickLabel="View instructors"/>
          <StatCard label="Pending Grading" value={stats.pendingGrading}   icon={FileText}  color="amber"  onClick={()=>setDrill('grading')}      clickLabel="View submissions"/>
          <StatCard label="Certificates"    value={stats.totalCertificates}icon={Award}     color="sky"    onClick={()=>setDrill('certificates')} clickLabel="View certificates"/>
        </div>
      </div>

      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">⚙️ Operations</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="High Priority"     value={stats.highComplaints}    icon={AlertCircle}   color="red"   onClick={()=>setDrill('complaints_high')}    clickLabel="View high priority"/>
          <StatCard label="Pending Complaints"value={stats.pendingComplaints} icon={AlertCircle}   color="amber" onClick={()=>setDrill('complaints_pending')} clickLabel="View pending"/>
          <StatCard label="Meetings"          value={stats.upcomingMeetings}  icon={Calendar}      color="blue"  onClick={()=>setDrill('meetings')}           clickLabel="View meetings"/>
          <StatCard label="Active Surveys"    value={stats.activeSurveys}     icon={ClipboardList} color="teal"  onClick={()=>setDrill('surveys')}            clickLabel="View surveys"/>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <SectionHeader title="Attendance Trend — 6 Weeks"/>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={attendanceChart}>
              <defs><linearGradient id="cag" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1e3a6e" stopOpacity={0.15}/><stop offset="95%" stopColor="#1e3a6e" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="week" tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/>
              <YAxis domain={[70,100]} tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false} unit="%"/>
              <Tooltip contentStyle={{borderRadius:10,border:'none',boxShadow:'0 4px 16px rgba(0,0,0,.08)'}}/>
              <Area type="monotone" dataKey="rate" stroke="#1e3a6e" strokeWidth={2} fill="url(#cag)"/>
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionHeader title="Course Progress"/>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={mockCourses.map(c=>({name:c.name.split(' ')[0],v:c.progress}))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="name" tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false} unit="%"/>
              <Tooltip contentStyle={{borderRadius:10,border:'none'}}/>
              <Bar dataKey="v" fill="#2ba8b5" radius={[4,4,0,0]} name="Progress"/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Modal open={drill==='students_all'} onClose={()=>setDrill(null)} title="Students by Course" wide>
        <div className="space-y-3">
          <div className="flex gap-3 mb-4">
            <MiniStat label="Total" value={stats.totalStudents} color="blue"/>
            <MiniStat label="Active" value={stats.activeStudents} color="green"/>
            <MiniStat label="At Risk" value={stats.atRisk} color="red"/>
            <MiniStat label="Avg GPA" value={stats.avgGpa} color="purple"/>
          </div>
          {mockCourses.map(c=>(
            <div key={c.id} className="border border-gray-100 rounded-xl p-3">
              <div className="flex justify-between mb-2"><p className="font-semibold text-sm text-gray-900">{c.name}</p><Badge color="teal">{c.enrolledStudents?.length||0} enrolled</Badge></div>
              {mockStudents.filter(s=>s.courses?.includes(c.id)).map(s=>{
                const att = computeAttendance(s.id) ?? s.attendanceRate
                return (
                  <div key={s.id} className="flex justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
                    <span className="font-medium text-gray-800">{s.name}</span>
                    <div className="flex gap-3"><span className="text-gray-400">Att: {att}%</span><span className="text-gray-400">GPA: {s.gpa}</span><StatusBadge status={s.status}/></div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </Modal>

      <Modal open={drill==='students_risk'} onClose={()=>setDrill(null)} title="At-Risk Students" wide>
        {mockStudents.filter(s=>s.status==='at-risk').map(s=>{
          const att = computeAttendance(s.id) ?? s.attendanceRate
          return (
            <div key={s.id} className="mb-4 p-4 border border-red-100 bg-red-50/30 rounded-xl">
              <div className="flex justify-between mb-3"><p className="font-bold text-gray-900">{s.name}</p><StatusBadge status={s.status}/></div>
              <div className="flex gap-3 mb-3"><MiniStat label="Attendance" value={`${att}%`} color="red"/><MiniStat label="GPA" value={s.gpa} color="amber"/><MiniStat label="Courses" value={s.courses?.length||0} color="gray"/></div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Risk Factors</p>
                {att < 70 && <p className="text-xs text-red-600">• Attendance below 70% ({att}%)</p>}
                {s.gpa < 2.5 && <p className="text-xs text-red-600">• GPA below 2.5 ({s.gpa})</p>}
              </div>
              <div className="mt-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Enrolled Courses</p>
                {s.courses?.map(cid=>{const c=mockCourses.find(x=>x.id===cid); return c ? <p key={cid} className="text-xs text-gray-600">• {c.name} ({c.instructor})</p> : null})}
              </div>
            </div>
          )
        })}
      </Modal>

      <Modal open={drill==='attendance'} onClose={()=>setDrill(null)} title="Attendance by Course" wide>
        {mockCourses.map(c=>{
          const recs=mockAttendance.filter(a=>a.courseId===c.id)
          const rate=recs.length?Math.round(recs.filter(r=>r.status==='present').length/recs.length*100):0
          return(
            <div key={c.id} className="mb-3 p-3 border border-gray-100 rounded-xl">
              <div className="flex justify-between mb-1"><p className="font-semibold text-sm">{c.name}</p><span className={`font-bold text-sm ${rate>=80?'text-green-600':rate>=60?'text-amber-500':'text-red-500'}`}>{rate}%</span></div>
              <ProgressBar value={rate} color={rate>=80?'green':rate>=60?'amber':'red'} size="lg"/>
              <div className="flex gap-4 mt-1 text-[10px] text-gray-400">
                <span>Present: {recs.filter(r=>r.status==='present').length}</span>
                <span>Absent: {recs.filter(r=>r.status==='absent').length}</span>
                <span>Late: {recs.filter(r=>r.status==='late').length}</span>
              </div>
            </div>
          )
        })}
      </Modal>

      <Modal open={drill==='gpa'} onClose={()=>setDrill(null)} title="Student Grades" wide>
        <Table columns={[{key:'name',label:'Student',render:v=><span className="font-medium">{v}</span>},{key:'gpa',label:'GPA',render:v=><span className={`font-bold ${v>=3.5?'text-green-600':v>=2.5?'text-amber-500':'text-red-500'}`}>{v}</span>},{key:'attendanceRate',label:'Attendance',render:v=><span className={v>=80?'text-green-600':v>=60?'text-amber-500':'text-red-500'}>{v}%</span>},{key:'status',label:'Status',render:v=><StatusBadge status={v}/>}]} data={mockStudents}/>
      </Modal>

      <Modal open={drill==='courses'} onClose={()=>setDrill(null)} title="All Courses" wide>
        {mockCourses.map(c=>(
          <div key={c.id} className="mb-3 p-3 border border-gray-100 rounded-xl">
            <div className="flex justify-between mb-1"><p className="font-semibold text-sm">{c.name}</p><Badge color="teal">{c.progress}%</Badge></div>
            <p className="text-xs text-gray-400 mb-1.5">{c.instructor} · {c.enrolledStudents?.length||0} students · Next: {c.nextClass}</p>
            <ProgressBar value={c.progress} color="teal" size="lg"/>
          </div>
        ))}
      </Modal>

      <Modal open={drill==='instructors'} onClose={()=>setDrill(null)} title="All Instructors" wide>
        <Table columns={[{key:'name',label:'Name',render:v=><span className="font-medium">{v}</span>},{key:'sub',label:'Role'},{key:'students',label:'Students',render:v=><Badge color="blue">{v}</Badge>},{key:'status',label:'Status',render:v=><StatusBadge status={v}/>}]} data={mockInstructors}/>
      </Modal>

      <Modal open={drill==='grading'} onClose={()=>setDrill(null)} title="Pending Grading" wide>
        <div className="space-y-2">
          {mockAssignments.flatMap(a=>a.submissions.filter(s=>s.status==='submitted').map(s=>({...s,asgTitle:a.title,courseId:a.courseId}))).map((s,i)=>(
            <div key={i} className="flex justify-between p-2.5 bg-amber-50 rounded-xl text-xs">
              <div><p className="font-medium text-gray-800">{s.studentName}</p><p className="text-gray-400">{s.asgTitle}</p></div>
              <Badge color="amber">Awaiting Grade</Badge>
            </div>
          ))}
        </div>
      </Modal>

      <Modal open={drill==='certificates'} onClose={()=>setDrill(null)} title="Issued Certificates" wide>
        <Table columns={[{key:'studentName',label:'Student'},{key:'courseName',label:'Course'},{key:'grade',label:'Grade'},{key:'issuedBy',label:'Issued By'},{key:'issuedAt',label:'Date'}]} data={mockCertificates}/>
      </Modal>

      <Modal open={drill==='complaints_high'} onClose={()=>setDrill(null)} title="High Priority Complaints" wide>
        {mockComplaints.filter(c=>c.priority==='high').map(c=>(
          <div key={c.id} className="mb-3 p-3 border border-red-100 bg-red-50/30 rounded-xl">
            <div className="flex justify-between mb-1"><p className="font-semibold text-sm">{c.subject}</p><Badge color="red">High</Badge></div>
            <p className="text-xs text-gray-500 mb-1">{c.desc}</p>
            <div className="flex gap-4 text-[10px] text-gray-400"><span>From: {c.from} ({c.fromRole})</span><span>Handler: {c.assignedTo}</span><span>{c.date}</span></div>
            <div className="mt-1"><StatusBadge status={c.status}/></div>
          </div>
        ))}
      </Modal>

      <Modal open={drill==='complaints_pending'} onClose={()=>setDrill(null)} title="Pending Complaints" wide>
        <Table columns={[{key:'from',label:'From'},{key:'subject',label:'Subject'},{key:'priority',label:'Priority',render:v=><Badge color={v==='high'?'red':v==='medium'?'amber':'green'}>{v}</Badge>},{key:'date',label:'Date'}]} data={mockComplaints.filter(c=>c.status==='pending')}/>
      </Modal>

      <Modal open={drill==='meetings'} onClose={()=>setDrill(null)} title="Upcoming Meetings" wide>
        {mockMeetings.filter(m=>m.status==='upcoming').map(m=>(
          <div key={m.id} className="mb-3 p-3 border border-blue-100 rounded-xl">
            <div className="flex justify-between mb-1"><p className="font-semibold text-sm">{m.title}</p><StatusBadge status={m.status}/></div>
            <p className="text-xs text-gray-500">{m.date} · {m.participants?.join(', ')}</p>
            {m.link&&<a href={m.link} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-flex items-center gap-1"><ExternalLink className="w-3 h-3"/>Join</a>}
          </div>
        ))}
      </Modal>

      <Modal open={drill==='surveys'} onClose={()=>setDrill(null)} title="Active Surveys" wide>
        {mockSurveys.filter(s=>s.status==='active').map(s=>(
          <div key={s.id} className="mb-3 p-3 border border-teal-100 rounded-xl">
            <div className="flex justify-between mb-2"><p className="font-semibold text-sm">{s.title}</p><StatusBadge status={s.status}/></div>
            <div className="flex items-center gap-3"><span className="text-xs"><strong>{s.responses.length}</strong>/{s.sent}</span><div className="flex-1"><ProgressBar value={(s.responses.length/s.sent)*100} color="teal"/></div><span className="text-[10px] text-gray-400">{Math.round((s.responses.length/s.sent)*100)}%</span></div>
          </div>
        ))}
      </Modal>
    </div>
  )
}

// ── Students ──────────────────────────────────────────────────────────────────

function CaptainStudents() {
  const { mockStudents, mockCourses, mockAttendance, mockAssignments, mockQuizzes } = useData()
  const [courseId, setCourseId] = useState('')
  const [statusF, setStatusF]   = useState('')
  const [selStudent, setSelStudent] = useState(null)

  const computeAttendance = (studentId) => {
    const recs = mockAttendance.filter(a => a.studentId === studentId)
    if (!recs.length) return null
    return Math.round(recs.filter(r => r.status === 'present').length / recs.length * 100)
  }

  const computeCourseAttendance = (studentId, cId) => {
    const recs = mockAttendance.filter(a => a.studentId === studentId && a.courseId === cId)
    if (!recs.length) return null
    return Math.round(recs.filter(r => r.status === 'present').length / recs.length * 100)
  }

  const students = mockStudents.map(s => ({
    ...s,
    dynamicAttendance: computeAttendance(s.id) ?? s.attendanceRate,
  }))

  const filtered = students.filter(s =>
    (courseId===''||s.courses?.includes(parseInt(courseId))) &&
    (statusF===''||s.status===statusF)
  )

  const getStudentDetail = (student) => {
    const enrolledCourses = mockCourses.filter(c => student.courses?.includes(c.id))
    const assignments     = mockAssignments.filter(a => student.courses?.includes(a.courseId))
    const quizzes         = mockQuizzes.filter(q => student.courses?.includes(q.courseId))
    const submitted = assignments.filter(a => a.submissions.some(s => s.studentId === student.id)).length
    const graded    = assignments.filter(a => a.submissions.some(s => s.studentId === student.id && s.status==='graded')).length
    const quizResults = quizzes.map(q => {
      const sub = q.submissions.find(s => s.studentId === student.id)
      return sub ? { title: q.title, score: sub.overrideGrade ?? sub.score } : null
    }).filter(Boolean)
    return { enrolledCourses, assignments, submitted, graded, quizResults }
  }

  const avgAtt = filtered.length ? Math.round(filtered.reduce((a,s)=>a+s.dynamicAttendance,0)/filtered.length) : 0

  return (
    <div className="space-y-4 animate-fadeIn">
      <Card>
        <div className="flex flex-wrap gap-3 mb-4">
          <SelectFilter label="Course" value={courseId} onChange={setCourseId} options={mockCourses.map(c=>({value:String(c.id),label:c.name}))} placeholder="All Courses"/>
          <SelectFilter label="Status" value={statusF}  onChange={setStatusF}  options={[{value:'active',label:'Active'},{value:'at-risk',label:'At Risk'}]} placeholder="All Status"/>
        </div>
        <div className="flex gap-2 mb-4">
          <MiniStat label="Showing"       value={filtered.length}                                        color="blue"/>
          <MiniStat label="At Risk"        value={filtered.filter(s=>s.status==='at-risk').length}        color="red"/>
          <MiniStat label="Active"         value={filtered.filter(s=>s.status==='active').length}         color="green"/>
          <MiniStat label="Avg Attendance" value={`${avgAtt}%`}                                          color="teal"/>
        </div>
        <Table
          columns={[
            {key:'name',label:'Name',render:v=><span className="font-medium">{v}</span>},
            {key:'dynamicAttendance',label:'Attendance',render:v=><div className="flex items-center gap-2 min-w-24"><ProgressBar value={v} color={v>=80?'green':v>=60?'amber':'red'}/><span className="text-xs">{v}%</span></div>},
            {key:'gpa',label:'GPA',render:v=><span className={`font-bold text-sm ${v>=3.5?'text-green-600':v>=2.5?'text-amber-500':'text-red-500'}`}>{v}</span>},
            {key:'status',label:'Status',render:v=><StatusBadge status={v}/>},
            {key:'courses',label:'Courses',render:v=><Badge color="blue">{v?.length||0}</Badge>},
            {key:'id',label:'',render:(v,row)=><button onClick={()=>setSelStudent(row)} className="text-blue-600 hover:underline text-xs">Details</button>},
          ]}
          data={filtered}
          emptyMsg="No students match filters."
        />
      </Card>

      <Modal open={!!selStudent} onClose={()=>setSelStudent(null)} title={selStudent?.name||'Student Details'} wide>
        {selStudent && (()=>{
          const detail = getStudentDetail(selStudent)
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <MiniStat label="Attendance" value={`${selStudent.dynamicAttendance}%`} color={selStudent.dynamicAttendance>=80?'green':selStudent.dynamicAttendance>=60?'amber':'red'}/>
                <MiniStat label="GPA"  value={selStudent.gpa||'—'} color="purple"/>
                <MiniStat label="Courses" value={selStudent.courses?.length||0} color="blue"/>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Status:</span>
                <StatusBadge status={selStudent.status}/>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Enrolled Courses & Attendance</p>
                {detail.enrolledCourses.length===0 && <p className="text-xs text-gray-400">Not enrolled in any course.</p>}
                {detail.enrolledCourses.map(c=>{
                  const att = computeCourseAttendance(selStudent.id, c.id)
                  return (
                    <div key={c.id} className="flex justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
                      <span className="font-medium text-gray-800">{c.name}</span>
                      <span className={att!==null?(att>=80?'text-green-600':att>=60?'text-amber-500':'text-red-500'):'text-gray-400'}>
                        {att!==null ? `${att}% attendance` : 'No records'}
                      </span>
                    </div>
                  )
                })}
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Assignment Progress</p>
                <div className="flex gap-3">
                  <MiniStat label="Submitted" value={detail.submitted}            color="blue"/>
                  <MiniStat label="Graded"    value={detail.graded}               color="green"/>
                  <MiniStat label="Total"     value={detail.assignments.length}   color="gray"/>
                </div>
              </div>
              {detail.quizResults.length>0 && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Assessment Results</p>
                  {detail.quizResults.map((r,i)=>(
                    <div key={i} className="flex justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
                      <span className="text-gray-700">{r.title}</span>
                      <Badge color={r.score>=70?'green':'red'}>{r.score}%</Badge>
                    </div>
                  ))}
                </div>
              )}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Risk Assessment</p>
                {selStudent.dynamicAttendance < 70 && <p className="text-xs text-red-600">• Attendance below 70% ({selStudent.dynamicAttendance}%)</p>}
                {(selStudent.gpa||0) < 2.5 && <p className="text-xs text-red-600">• GPA below 2.5 ({selStudent.gpa})</p>}
                {selStudent.dynamicAttendance>=70 && (selStudent.gpa||0)>=2.5 && <p className="text-xs text-green-600">• No critical risk factors detected</p>}
              </div>
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}

// ── Instructors ───────────────────────────────────────────────────────────────

function CaptainInstructors() {
  const { mockInstructors, mockCourses, mockStudents, mockAttendance } = useData()
  const [sel, setSel] = useState(null)

  // Match courses by FK (instructorId) OR by the instructor name string — whichever is available
  const getInstructorCourses = (insId, insName) =>
    mockCourses.filter(c =>
      (insId && c.instructorId === insId) ||
      (insName && c.instructor && c.instructor === insName)
    )

  // Compute % from actual attendance records: course-specific → overall → static DB field
  const computeAttendance = (studentId, courseId) => {
    const courseRecs = mockAttendance.filter(a => a.studentId === studentId && a.courseId === courseId)
    if (courseRecs.length > 0)
      return Math.round(courseRecs.filter(r => r.status === 'present').length / courseRecs.length * 100)
    const allRecs = mockAttendance.filter(a => a.studentId === studentId)
    if (allRecs.length > 0)
      return Math.round(allRecs.filter(r => r.status === 'present').length / allRecs.length * 100)
    return null
  }

  // Return enrolled students enriched with real computed attendance for the given course
  const getEnrichedCourseStudents = (course) =>
    mockStudents
      .filter(s => course.enrolledStudents?.includes(s.id) || s.courses?.includes(course.id))
      .map(s => ({ ...s, computedAtt: computeAttendance(s.id, course.id) ?? s.attendanceRate }))

  const getInstructorStudents = (insId, insName) => {
    const courses  = getInstructorCourses(insId, insName)
    const enrolled = new Set(courses.flatMap(c => c.enrolledStudents || []))
    return mockStudents.filter(s => enrolled.has(s.id) || s.courses?.some(cid => courses.some(c => c.id === cid)))
  }

  return (
    <div className="space-y-3 animate-fadeIn">
      {mockInstructors.map(ins=>{
        const courses      = getInstructorCourses(ins.id, ins.name)
        const studentCount = new Set(courses.flatMap(c => c.enrolledStudents||[])).size
        return (
          <Card key={ins.id} className="cursor-pointer hover:shadow-md transition-all" onClick={()=>setSel(ins)}>
            <div className="flex items-start justify-between">
              <div><p className="font-semibold text-gray-900">{ins.name}</p><p className="text-xs text-gray-400 mt-0.5">{ins.sub} · {ins.email}</p></div>
              <div className="flex gap-2">
                <Badge color="blue">{studentCount} students</Badge>
                <Badge color="teal">{courses.length} courses</Badge>
                <StatusBadge status={ins.status}/>
              </div>
            </div>
            <div className="mt-2"><p className="text-xs text-gray-400">Courses: {courses.map(c=>c.name).join(', ')||'—'}</p></div>
            <p className="text-[10px] text-blue-500 mt-2">↗ Click to see students</p>
          </Card>
        )
      })}

      <Modal open={!!sel} onClose={()=>setSel(null)} title={sel?.name||''} wide>
        {sel && (()=>{
          const courses     = getInstructorCourses(sel.id, sel.name)
          const allStudents = getInstructorStudents(sel.id, sel.name)
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <MiniStat label="Total Students" value={allStudents.length} color="blue"/>
                <MiniStat label="Courses"        value={courses.length}     color="teal"/>
                <MiniStat label="Status"         value={sel.status}         color="green"/>
              </div>
              <div>
                <p className="label">Courses Taught</p>
                {courses.length===0 && <p className="text-xs text-gray-400">No courses assigned to this instructor.</p>}
                {courses.map(c=>{
                  const courseStudents = getEnrichedCourseStudents(c)
                  return (
                    <div key={c.id} className="mb-3 p-3 bg-gray-50 rounded-xl">
                      <div className="flex justify-between mb-1">
                        <p className="font-semibold text-sm">{c.name}</p>
                        <div className="flex gap-2"><Badge color="blue">{courseStudents.length} students</Badge><Badge color="teal">{c.progress}%</Badge></div>
                      </div>
                      <ProgressBar value={c.progress} color="teal"/>
                      <div className="mt-2">
                        <p className="label mt-2">Enrolled Students</p>
                        <Table
                          columns={[
                            {key:'name',label:'Name',render:v=><span className="font-medium">{v}</span>},
                            {key:'computedAtt',label:'Attendance',render:v=><span className={v>=80?'text-green-600':v>=60?'text-amber-500':'text-red-500'}>{v}%</span>},
                            {key:'gpa',label:'GPA'},
                            {key:'status',label:'Status',render:v=><StatusBadge status={v}/>},
                          ]}
                          data={courseStudents}
                          emptyMsg="No students enrolled."
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}

// ── Courses ───────────────────────────────────────────────────────────────────

function CaptainCourses() {
  const { mockCourses, mockStudents, mockAttendance, mockAssignments, mockQuizzes } = useData()
  const [sel, setSel] = useState(null)

  const getEnrolledData = (course) => {
    // Cross-check: enrolled from course side OR student side — whichever is available
    const enrolled = mockStudents.filter(s =>
      course.enrolledStudents?.includes(s.id) ||
      s.courses?.includes(course.id)
    )
    return enrolled.map(s => {
      const recs = mockAttendance.filter(a => a.studentId===s.id && a.courseId===course.id)
      const allRecs = mockAttendance.filter(a => a.studentId===s.id)
      const attPct = recs.length
        ? Math.round(recs.filter(r=>r.status==='present').length/recs.length*100)
        : allRecs.length
          ? Math.round(allRecs.filter(r=>r.status==='present').length/allRecs.length*100)
          : s.attendanceRate
      const courseAsgs    = mockAssignments.filter(a => a.courseId===course.id)
      const submitted     = courseAsgs.filter(a => a.submissions.some(sub=>sub.studentId===s.id)).length
      const pending       = courseAsgs.length - submitted
      const courseQuizzes = mockQuizzes.filter(q => q.courseId===course.id)
      const avgScore = courseQuizzes.length
        ? Math.round(courseQuizzes.reduce((acc,q)=>{
            const sub = q.submissions.find(sub=>sub.studentId===s.id)
            return acc + (sub ? (sub.overrideGrade??sub.score) : 0)
          },0) / courseQuizzes.length)
        : null
      return { ...s, courseAttendance: attPct, submitted, pending, totalAsgs: courseAsgs.length, avgScore }
    })
  }

  return (
    <div className="space-y-3 animate-fadeIn">
      {mockCourses.map(c=>(
        <Card key={c.id} className="cursor-pointer hover:shadow-md transition-all" onClick={()=>setSel(c)}>
          <div className="flex justify-between mb-2">
            <div><p className="font-semibold text-gray-900">{c.name}</p><p className="text-xs text-gray-400">{c.instructor} · {c.enrolledStudents?.length||0} students · Next: {c.nextClass}</p></div>
            <Badge color="teal">{c.progress}%</Badge>
          </div>
          <ProgressBar value={c.progress} color="teal" size="lg"/>
          <p className="text-[10px] text-blue-500 mt-2">↗ Click to see enrolled students</p>
        </Card>
      ))}

      <Modal open={!!sel} onClose={()=>setSel(null)} title={sel?.name||''} wide>
        {sel && (()=>{
          const data = getEnrolledData(sel)
          return (
            <div className="space-y-4">
              <div className="flex gap-3">
                <MiniStat label="Students"   value={data.length}           color="blue"/>
                <MiniStat label="Progress"   value={`${sel.progress}%`}   color="teal"/>
                <MiniStat label="Instructor" value={sel.instructor||'—'}  color="gray"/>
              </div>
              {data.length===0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No students enrolled.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {['Student','Email','Attendance','Assignments','Assessment','Status'].map(h=>(
                          <th key={h} className="text-left py-2.5 px-2 text-[10px] font-bold text-gray-400 uppercase whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.map(s=>(
                        <tr key={s.id} className="border-b border-gray-50">
                          <td className="py-2 px-2 font-medium text-gray-900 whitespace-nowrap">{s.name}</td>
                          <td className="py-2 px-2 text-xs text-gray-500">{s.email||'—'}</td>
                          <td className="py-2 px-2">
                            <span className={`text-xs font-medium ${s.courseAttendance>=80?'text-green-600':s.courseAttendance>=60?'text-amber-500':'text-red-500'}`}>
                              {s.courseAttendance}%
                            </span>
                          </td>
                          <td className="py-2 px-2">
                            <span className="text-xs text-gray-600">{s.submitted}/{s.totalAsgs}</span>
                            {s.pending>0&&<Badge color="amber" className="ml-1 text-[10px]">{s.pending} pending</Badge>}
                          </td>
                          <td className="py-2 px-2">
                            {s.avgScore!==null
                              ? <Badge color={s.avgScore>=70?'green':'red'}>{s.avgScore}%</Badge>
                              : <span className="text-xs text-gray-400">—</span>}
                          </td>
                          <td className="py-2 px-2"><StatusBadge status={s.status}/></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="flex gap-2">
                {sel.teamsLink&&<a href={sel.teamsLink} target="_blank" rel="noreferrer" className="btn-secondary text-xs py-1.5"><ExternalLink className="w-3 h-3"/>Teams</a>}
                {sel.classroomLink&&<a href={sel.classroomLink} target="_blank" rel="noreferrer" className="btn-secondary text-xs py-1.5"><ExternalLink className="w-3 h-3"/>Classroom</a>}
              </div>
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}

// ── Attendance ────────────────────────────────────────────────────────────────

function CaptainAttendance() {
  const { mockAttendance, mockCourses } = useData()
  const [cid, setCid] = useState('')
  const recs = mockAttendance.filter(a=>cid===''||a.courseId===parseInt(cid))
  const rate = recs.length?Math.round(recs.filter(r=>r.status==='present').length/recs.length*100):0
  return (
    <div className="space-y-4 animate-fadeIn">
      <Card>
        <div className="flex gap-3 mb-4">
          <SelectFilter label="Course" value={cid} onChange={setCid} options={mockCourses.map(c=>({value:String(c.id),label:c.name}))} placeholder="Select Course"/>
        </div>
        {cid && (
          <div className="flex gap-2 mb-4">
            <MiniStat label="Present" value={recs.filter(r=>r.status==='present').length} color="green"/>
            <MiniStat label="Absent"  value={recs.filter(r=>r.status==='absent').length}  color="red"/>
            <MiniStat label="Late"    value={recs.filter(r=>r.status==='late').length}     color="amber"/>
            <MiniStat label="Rate"    value={`${rate}%`} color="blue"/>
          </div>
        )}
        <Table columns={[{key:'studentName',label:'Student'},{key:'courseId',label:'Course',render:v=>mockCourses.find(c=>c.id===v)?.name?.split(' ')[0]||`#${v}`},{key:'date',label:'Date'},{key:'status',label:'Status',render:v=><StatusBadge status={v}/>}]} data={recs} emptyMsg="Select a course to see attendance."/>
      </Card>
    </div>
  )
}

// ── Complaints ────────────────────────────────────────────────────────────────

function CaptainComplaints() {
  const { mockComplaints } = useData()
  const [priority, setPriority] = useState('')
  const [status,   setStatus]   = useState('')
  const filtered = mockComplaints.filter(c=>(priority===''||c.priority===priority)&&(status===''||c.status===status))
  return (
    <div className="space-y-4 animate-fadeIn">
      <Card>
        <div className="flex flex-wrap gap-3 mb-4">
          <SelectFilter label="Priority" value={priority} onChange={setPriority} options={[{value:'high',label:'🔴 High'},{value:'medium',label:'🟡 Medium'},{value:'low',label:'🟢 Low'}]} placeholder="All Priorities"/>
          <SelectFilter label="Status"   value={status}   onChange={setStatus}   options={[{value:'pending',label:'Pending'},{value:'in-review',label:'In Review'},{value:'resolved',label:'Resolved'}]} placeholder="All Status"/>
        </div>
        <div className="flex gap-2 mb-4">
          <MiniStat label="High"     value={mockComplaints.filter(c=>c.priority==='high').length}   color="red"/>
          <MiniStat label="Pending"  value={mockComplaints.filter(c=>c.status==='pending').length}  color="amber"/>
          <MiniStat label="Resolved" value={mockComplaints.filter(c=>c.status==='resolved').length} color="green"/>
        </div>
        <Table columns={[{key:'from',label:'From'},{key:'fromRole',label:'Type',render:v=><Badge color="gray">{v}</Badge>},{key:'subject',label:'Subject'},{key:'priority',label:'Priority',render:v=><Badge color={v==='high'?'red':v==='medium'?'amber':'green'}>{v}</Badge>},{key:'status',label:'Status',render:v=><StatusBadge status={v}/>},{key:'date',label:'Date'}]} data={filtered} emptyMsg="No complaints match filters."/>
      </Card>
    </div>
  )
}

// ── Surveys ───────────────────────────────────────────────────────────────────

const SATISFACTION_LEVELS = ['very satisfied','satisfied','neutral','dissatisfied','very dissatisfied']
const SAT_COLORS = { 'very satisfied':'#10b981','satisfied':'#34d399','neutral':'#f59e0b','dissatisfied':'#f97316','very dissatisfied':'#ef4444' }

function analyzeSatisfaction(survey) {
  const counts = Object.fromEntries(SATISFACTION_LEVELS.map(l=>[l,0]))
  let total = 0
  survey.responses.forEach(r=>{
    Object.values(r.answers||{}).forEach(answer=>{
      const ans = String(answer).toLowerCase().trim()
      SATISFACTION_LEVELS.forEach(level=>{ if(ans===level||ans.includes(level)){counts[level]++;total++} })
    })
  })
  if(!total) return null
  return SATISFACTION_LEVELS.map(l=>({
    name: l.split(' ').map(w=>w[0].toUpperCase()+w.slice(1)).join(' '),
    value: counts[l],
    pct: Math.round(counts[l]/total*100),
    color: SAT_COLORS[l],
  })).filter(d=>d.value>0)
}

function CaptainSurveys() {
  const { mockSurveys } = useData()
  const [selSurvey, setSelSurvey] = useState(null)

  const total       = mockSurveys.length
  const completed   = mockSurveys.filter(s=>s.status==='completed').length
  const active      = mockSurveys.filter(s=>s.status==='active').length
  const totalSent   = mockSurveys.reduce((a,s)=>a+(s.sent||0),0)
  const totalResp   = mockSurveys.reduce((a,s)=>a+s.responses.length,0)
  const partPct     = totalSent>0 ? Math.round(totalResp/totalSent*100) : 0
  const completePct = total>0    ? Math.round(completed/total*100)      : 0

  const surveyBarData = mockSurveys.map(s=>({
    name: s.title.length>14 ? s.title.slice(0,12)+'…' : s.title,
    responded: s.responses.length,
    notResponded: Math.max(0,(s.sent||0)-s.responses.length),
  }))

  const partPie = [
    {name:'Responded',    value:totalResp,              color:'#10b981'},
    {name:'Not Responded',value:totalSent-totalResp,    color:'#e5e7eb'},
  ].filter(d=>d.value>0)

  const statusPie = [
    {name:'Active',    value:active,    color:'#3b82f6'},
    {name:'Completed', value:completed, color:'#10b981'},
  ].filter(d=>d.value>0)

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MiniStat label="Total Surveys"   value={total}         color="blue"/>
        <MiniStat label="Completed"       value={completed}     color="green"/>
        <MiniStat label="Active / Pending"value={active}        color="amber"/>
        <MiniStat label="Response Rate"   value={`${partPct}%`} color="teal"/>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card>
          <SectionHeader title="Participation Rate"/>
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie data={partPie} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" startAngle={90} endAngle={-270}>
                  {partPie.map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <p className="text-2xl font-bold text-gray-900 -mt-4">{partPct}%</p>
            <p className="text-xs text-gray-400 mt-1">{totalResp} of {totalSent} responded</p>
          </div>
        </Card>
        <Card>
          <SectionHeader title="Survey Status"/>
          {statusPie.length>0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={statusPie} cx="50%" cy="50%" outerRadius={55} dataKey="value" label={({name,percent})=>`${name}: ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {statusPie.map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip/>
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-xs text-gray-400 text-center py-8">No surveys yet</p>}
        </Card>
        <Card>
          <SectionHeader title="Completion Rates"/>
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-1"><span>Survey Completion</span><span className="font-bold">{completePct}%</span></div>
              <ProgressBar value={completePct} color="green" size="lg"/>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-1"><span>Participation Rate</span><span className="font-bold">{partPct}%</span></div>
              <ProgressBar value={partPct} color="teal" size="lg"/>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="text-center bg-blue-50 rounded-xl p-2"><p className="font-bold text-blue-700">{totalSent}</p><p className="text-[10px] text-blue-500">Total Invited</p></div>
              <div className="text-center bg-green-50 rounded-xl p-2"><p className="font-bold text-green-700">{totalResp}</p><p className="text-[10px] text-green-500">Total Responded</p></div>
            </div>
          </div>
        </Card>
      </div>

      {mockSurveys.length>0 && (
        <Card>
          <SectionHeader title="Response Distribution by Survey"/>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={surveyBarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="name" tick={{fontSize:9,fill:'#9ca3af'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{borderRadius:10,border:'none'}}/>
              <Bar dataKey="responded"    fill="#10b981" radius={[4,4,0,0]} name="Responded" stackId="a"/>
              <Bar dataKey="notResponded" fill="#e5e7eb" radius={[4,4,0,0]} name="Not Responded" stackId="a"/>
              <Legend iconSize={8} wrapperStyle={{fontSize:10}}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      <div className="space-y-3">
        {mockSurveys.length===0 && <Card><p className="text-xs text-gray-400 text-center py-8">No surveys created yet.</p></Card>}
        {mockSurveys.map(s=>{
          const responded    = s.responses.length
          const invited      = s.sent||0
          const notResponded = Math.max(0,invited-responded)
          const pct          = invited>0 ? Math.round(responded/invited*100) : 0
          const satisfaction = analyzeSatisfaction(s)
          return (
            <Card key={s.id}>
              <div className="flex justify-between mb-3">
                <div><p className="font-semibold text-gray-900">{s.title}</p><p className="text-xs text-gray-400">By {s.createdBy} · Due: {s.deadline}</p></div>
                <div className="flex items-center gap-2"><StatusBadge status={s.status}/><button onClick={()=>setSelSurvey(s)} className="text-xs text-blue-600 hover:underline">Details</button></div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center bg-blue-50 rounded-xl p-2"><p className="font-bold text-blue-700">{invited}</p><p className="text-[10px] text-blue-500">Invited</p></div>
                <div className="text-center bg-green-50 rounded-xl p-2"><p className="font-bold text-green-700">{responded}</p><p className="text-[10px] text-green-500">Responded</p></div>
                <div className="text-center bg-gray-50 rounded-xl p-2"><p className="font-bold text-gray-700">{notResponded}</p><p className="text-[10px] text-gray-500">Pending</p></div>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1"><ProgressBar value={pct} color="teal" size="lg"/></div>
                <span className="text-xs font-bold text-teal-600 w-10 text-right">{pct}%</span>
              </div>
              {satisfaction && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Satisfaction Breakdown</p>
                  {satisfaction.map(sat=>(
                    <div key={sat.name} className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-600 w-32">{sat.name}</span>
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{width:`${sat.pct}%`,backgroundColor:sat.color}}/>
                      </div>
                      <span className="text-xs font-bold w-10 text-right" style={{color:sat.color}}>{sat.pct}%</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )
        })}
      </div>

      <Modal open={!!selSurvey} onClose={()=>setSelSurvey(null)} title={selSurvey?.title||'Survey Details'} wide>
        {selSurvey && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <MiniStat label="Invited"    value={selSurvey.sent||0}                                                                               color="blue"/>
              <MiniStat label="Responded"  value={selSurvey.responses.length}                                                                      color="green"/>
              <MiniStat label="Completion" value={`${selSurvey.sent>0?Math.round(selSurvey.responses.length/selSurvey.sent*100):0}%`}              color="teal"/>
            </div>
            <div>
              <p className="label mb-2">Questions ({selSurvey.questions.length})</p>
              {selSurvey.questions.map((q,i)=>(
                <div key={q.id} className="mb-1.5 p-2.5 bg-gray-50 rounded-xl">
                  <p className="text-xs font-medium text-gray-700">Q{i+1}: {q.text}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="label mb-2">Recent Responses ({selSurvey.responses.length})</p>
              {selSurvey.responses.length===0 && <p className="text-xs text-gray-400">No responses yet.</p>}
              {selSurvey.responses.slice(0,5).map((r,i)=>(
                <div key={i} className="mb-2 p-2.5 border border-gray-100 rounded-xl">
                  <p className="text-xs font-medium text-gray-700 mb-1">{r.studentName} · {r.submittedAt}</p>
                  {r.comment && <p className="text-xs text-gray-500 italic">"{r.comment}"</p>}
                </div>
              ))}
              {selSurvey.responses.length>5 && <p className="text-xs text-gray-400 text-center">+{selSurvey.responses.length-5} more responses</p>}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

// ── Meetings ──────────────────────────────────────────────────────────────────

function CaptainMeetings() {
  const { user, pushNotif } = useAuth()
  const { mockMeetings, addMeeting, updateMeeting, deleteMeeting } = useData()
  const [modal,      setModal]      = useState(false)
  const [editModal,  setEditModal]  = useState(null)
  const [delConfirm, setDelConfirm] = useState(null)
  const [form,     setForm]     = useState({title:'',date:'',link:'',platform:'teams',invitees:[]})
  const [editForm, setEditForm] = useState({title:'',date:'',link:'',platform:'teams'})

  const ALLOWED = [
    {name:'Principal',role:'principal'},
    {name:'Mohammad Abdullah (Foundation Lead)',role:'foundation_lead'},
    {name:'Academic Team',role:'academic'},
    {name:'Student Affairs',role:'affairs'},
    {name:'Training Operations',role:'training_ops'},
  ]

  // Only show meetings created by captain OR meetings where captain is a participant
  const myMeetings = mockMeetings.filter(m=>
    m.createdByRole==='captain' ||
    m.participantRoles?.includes('captain')
  )

  const canEdit = (m) => m.createdByRole==='captain'

  const toggle = (name,role) => {
    const e = form.invitees.find(i=>i.name===name)
    setForm({...form, invitees: e ? form.invitees.filter(i=>i.name!==name) : [...form.invitees,{name,role}]})
  }

  const create = async () => {
    if(!form.title||!form.date) return
    await addMeeting({
      ...form, createdBy:user?.name, createdByRole:'captain',
      participants:[user?.name,...form.invitees.map(i=>i.name)],
      participantRoles:['captain',...form.invitees.map(i=>i.role)],
      status:'upcoming',
    })
    for(const i of form.invitees) {
      await pushNotif(i.role,`${user?.name} scheduled a meeting: "${form.title}" on ${form.date}`,'meeting')
    }
    setModal(false)
    setForm({title:'',date:'',link:'',platform:'teams',invitees:[]})
  }

  const openEdit = (m) => {
    setEditForm({title:m.title,date:m.date,link:m.link,platform:m.platform})
    setEditModal(m)
  }

  const saveEdit = async () => {
    if(!editModal) return
    await updateMeeting(editModal.id, editForm)
    for(const role of (editModal.participantRoles||[])) {
      if(role!=='captain') await pushNotif(role,`Meeting "${editModal.title}" has been updated by Captain`,'meeting')
    }
    setEditModal(null)
  }

  const handleDelete = async (m) => {
    await deleteMeeting(m.id)
    for(const role of (m.participantRoles||[])) {
      if(role!=='captain') await pushNotif(role,`Meeting "${m.title}" has been cancelled by Captain`,'meeting')
    }
    setDelConfirm(null)
  }

  return (
    <div className="space-y-3 animate-fadeIn">
      <div className="flex justify-end">
        <button onClick={()=>setModal(true)} className="btn-primary text-xs"><Plus className="w-3.5 h-3.5"/>Schedule Meeting</button>
      </div>

      {myMeetings.length===0 && (
        <Card><p className="text-xs text-gray-400 text-center py-8">No meetings found for your account.</p></Card>
      )}

      {myMeetings.map(m=>(
        <Card key={m.id}>
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-1">
                <p className="font-semibold text-gray-900">{m.title}</p>
                <StatusBadge status={m.status}/>
                {m.createdByRole==='captain' && <Badge color="amber">Your meeting</Badge>}
              </div>
              <p className="text-xs text-gray-500">{m.date} · {m.platform}</p>
              <p className="text-xs text-gray-400 mt-0.5">{m.participants?.join(', ')}</p>
            </div>
            <div className="flex flex-col gap-1.5 ml-3 flex-shrink-0">
              {m.status==='upcoming'&&m.link&&(
                <a href={m.link} target="_blank" rel="noreferrer" className="btn-primary text-xs py-1.5">Join <ExternalLink className="w-3 h-3"/></a>
              )}
              {canEdit(m) && (
                <>
                  <button onClick={()=>openEdit(m)} className="btn-secondary text-xs py-1.5"><Edit2 className="w-3 h-3"/>Edit</button>
                  {delConfirm===m.id ? (
                    <div className="flex gap-1">
                      <button onClick={()=>handleDelete(m)} className="btn-secondary text-xs py-1 text-red-500">Confirm</button>
                      <button onClick={()=>setDelConfirm(null)} className="btn-secondary text-xs py-1">No</button>
                    </div>
                  ) : (
                    <button onClick={()=>setDelConfirm(m.id)} className="btn-secondary text-xs py-1.5 text-red-400"><Trash2 className="w-3 h-3"/>Cancel</button>
                  )}
                </>
              )}
            </div>
          </div>
        </Card>
      ))}

      <Modal open={modal} onClose={()=>setModal(false)} title="Schedule Meeting" wide>
        <div className="space-y-4">
          <div><label className="label">Title</label><input className="input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Meeting title"/></div>
          <div><label className="label">Date & Time</label><input type="datetime-local" className="input" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></div>
          <div><label className="label">Platform</label><select className="input" value={form.platform} onChange={e=>setForm({...form,platform:e.target.value})}><option value="teams">Microsoft Teams</option><option value="google">Google Meet</option><option value="zoom">Zoom</option></select></div>
          <div><label className="label">Meeting Link</label><input className="input" value={form.link} onChange={e=>setForm({...form,link:e.target.value})} placeholder="https://…"/></div>
          <div>
            <label className="label">Invite Participants</label>
            {ALLOWED.map(inv=>(
              <label key={inv.name} className="flex items-center gap-2 p-2.5 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 mb-1.5">
                <input type="checkbox" className="accent-[#1e3a6e]" checked={!!form.invitees.find(i=>i.name===inv.name)} onChange={()=>toggle(inv.name,inv.role)}/>
                <p className="text-sm font-medium text-gray-800">{inv.name}</p>
              </label>
            ))}
          </div>
          <button onClick={create} className="btn-primary w-full">Create & Notify Participants</button>
        </div>
      </Modal>

      <Modal open={!!editModal} onClose={()=>setEditModal(null)} title="Edit Meeting" wide>
        <div className="space-y-4">
          <div><label className="label">Title</label><input className="input" value={editForm.title} onChange={e=>setEditForm({...editForm,title:e.target.value})}/></div>
          <div><label className="label">Date & Time</label><input type="datetime-local" className="input" value={editForm.date} onChange={e=>setEditForm({...editForm,date:e.target.value})}/></div>
          <div><label className="label">Platform</label><select className="input" value={editForm.platform} onChange={e=>setEditForm({...editForm,platform:e.target.value})}><option value="teams">Microsoft Teams</option><option value="google">Google Meet</option><option value="zoom">Zoom</option></select></div>
          <div><label className="label">Meeting Link</label><input className="input" value={editForm.link} onChange={e=>setEditForm({...editForm,link:e.target.value})} placeholder="https://…"/></div>
          <button onClick={saveEdit} className="btn-primary w-full">Update Meeting & Notify Participants</button>
        </div>
      </Modal>
    </div>
  )
}

// ── Reports ───────────────────────────────────────────────────────────────────

const REPORT_ACTION_LABELS = {
  review:'started reviewing', approve:'approved', reject:'rejected',
  complete:'marked completed', revision:'sent back for revision',
}
const REPORT_STATUS_MAP = {
  review:'in-review', approve:'approved', reject:'rejected',
  complete:'completed', revision:'in-revision',
}
const FORWARD_ROLES = [
  {value:'principal',     label:'Principal'},
  {value:'foundation_lead',label:'Foundation Lead'},
  {value:'academic',      label:'Academic Team'},
  {value:'affairs',       label:'Affairs Team'},
  {value:'training_ops',  label:'Training Operations'},
]
const ROLE_NAMES = {principal:'Principal',foundation_lead:'Foundation Lead',academic:'Academic Team',affairs:'Affairs Team',training_ops:'Training Operations'}

function CaptainReports() {
  const { user, pushNotif } = useAuth()
  const { mockReports, updateReport, addReport } = useData()
  const [actionModal,  setActionModal]  = useState(null) // {report, action}
  const [forwardModal, setForwardModal] = useState(null)
  const [comment,      setComment]      = useState('')
  const [forwardRole,  setForwardRole]  = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Captain only sees reports sent to him
  const captainReports = mockReports.filter(r=>r.toRole==='captain')
  const filtered = captainReports.filter(r=>statusFilter===''||r.status===statusFilter)

  const total       = captainReports.length
  const pending     = captainReports.filter(r=>r.status==='received'||r.status==='pending').length
  const inProgress  = captainReports.filter(r=>r.status==='in-review'||r.status==='in-progress').length
  const done        = captainReports.filter(r=>r.status==='completed'||r.status==='approved').length
  const rejected    = captainReports.filter(r=>r.status==='rejected').length
  const completePct = total>0 ? Math.round(done/total*100) : 0

  const statusPie = [
    {name:'Pending',     value:pending,    color:'#f59e0b'},
    {name:'In Progress', value:inProgress, color:'#3b82f6'},
    {name:'Completed',   value:done,       color:'#10b981'},
    {name:'Rejected',    value:rejected,   color:'#ef4444'},
  ].filter(d=>d.value>0)

  const deptData = ['principal','foundation_lead','affairs','training_ops','academic','nida'].map(role=>({
    name: role.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()).slice(0,10),
    count: captainReports.filter(r=>r.fromRole===role).length,
  })).filter(d=>d.count>0)

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const now    = new Date()
  const monthlyData = Array.from({length:6},(_,i)=>{
    const d = new Date(now.getFullYear(),now.getMonth()-5+i,1)
    const m=d.getMonth(); const y=d.getFullYear()
    return {
      name: months[m],
      count: captainReports.filter(r=>{const rd=new Date(r.sentAt);return rd.getMonth()===m&&rd.getFullYear()===y}).length,
    }
  })

  const handleAction = async (action, report, feedback='') => {
    const newStatus = REPORT_STATUS_MAP[action] || action
    await updateReport(report.id,{status:newStatus,feedback})
    await pushNotif(report.fromRole,`Captain has ${REPORT_ACTION_LABELS[action]||action} your report: "${report.type} — ${report.period}"`,'report')
    setActionModal(null)
    setComment('')
  }

  const handleForward = async () => {
    if(!forwardModal||!forwardRole) return
    await addReport({
      from:user?.name, fromRole:'captain',
      to:ROLE_NAMES[forwardRole]||forwardRole, toRole:forwardRole,
      type:forwardModal.type, period:forwardModal.period,
      content:`[Forwarded by Captain] ${forwardModal.content}`,
    })
    await updateReport(forwardModal.id,{status:'forwarded',feedback:`Forwarded to ${ROLE_NAMES[forwardRole]}`})
    setForwardModal(null)
    setForwardRole('')
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MiniStat label="Total Received"  value={total}      color="blue"/>
        <MiniStat label="Pending Review"  value={pending}    color="amber"/>
        <MiniStat label="In Progress"     value={inProgress} color="blue"/>
        <MiniStat label="Completed"       value={done}       color="green"/>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card>
          <SectionHeader title="Status Distribution"/>
          {statusPie.length>0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={statusPie} cx="50%" cy="50%" outerRadius={55} dataKey="value" label={({percent})=>`${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {statusPie.map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip/>
                <Legend iconSize={8} wrapperStyle={{fontSize:10}}/>
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-xs text-gray-400 text-center py-10">No reports yet</p>}
        </Card>
        <Card>
          <SectionHeader title="Department-wise Reports"/>
          {deptData.length>0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="name" tick={{fontSize:9,fill:'#9ca3af'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{borderRadius:10,border:'none'}}/>
                <Bar dataKey="count" fill="#1e3a6e" radius={[4,4,0,0]} name="Reports"/>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-xs text-gray-400 text-center py-10">No data</p>}
        </Card>
        <Card>
          <SectionHeader title="Monthly Trend"/>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={monthlyData}>
              <defs><linearGradient id="rptGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1e3a6e" stopOpacity={0.15}/><stop offset="95%" stopColor="#1e3a6e" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="name" tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{borderRadius:10,border:'none'}}/>
              <Area type="monotone" dataKey="count" stroke="#1e3a6e" strokeWidth={2} fill="url(#rptGrad)" name="Reports"/>
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <div className="flex justify-between mb-2">
          <span className="text-sm font-semibold">Completion Rate</span>
          <span className="font-bold text-green-600">{completePct}%</span>
        </div>
        <ProgressBar value={completePct} color="green" size="lg"/>
      </Card>

      <Card>
        <div className="flex gap-3 mb-4">
          <SelectFilter label="Status" value={statusFilter} onChange={setStatusFilter}
            options={[
              {value:'received',label:'Received'},{value:'in-review',label:'In Review'},
              {value:'in-revision',label:'Needs Revision'},{value:'approved',label:'Approved'},
              {value:'rejected',label:'Rejected'},{value:'completed',label:'Completed'},
              {value:'forwarded',label:'Forwarded'},
            ]}
            placeholder="All Status"/>
        </div>
        <div className="space-y-3">
          {filtered.length===0 && <p className="text-xs text-gray-400 text-center py-8">No reports received yet.</p>}
          {filtered.map(r=>(
            <div key={r.id} className="border border-gray-100 rounded-xl p-3">
              <div className="flex justify-between mb-1">
                <p className="font-semibold text-sm text-gray-900">{r.type} — {r.period}</p>
                <StatusBadge status={r.status}/>
              </div>
              <p className="text-xs text-gray-400 mb-2">From: {r.from} ({r.fromRole}) · {r.sentAt}</p>
              <p className="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2 mb-3">{r.content}</p>
              {r.feedback && <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2 mb-3">Feedback: {r.feedback}</p>}
              <div className="flex flex-wrap gap-2">
                <button onClick={()=>{setActionModal({report:r,action:'review'});setComment('')}} className="btn-secondary text-xs py-1"><Eye className="w-3 h-3"/>Review</button>
                <button onClick={()=>{setActionModal({report:r,action:'approve'});setComment('')}} className="btn-secondary text-xs py-1 text-green-600"><ThumbsUp className="w-3 h-3"/>Approve</button>
                <button onClick={()=>{setActionModal({report:r,action:'reject'});setComment('')}} className="btn-secondary text-xs py-1 text-red-500"><ThumbsDown className="w-3 h-3"/>Reject</button>
                <button onClick={()=>{setActionModal({report:r,action:'revision'});setComment('')}} className="btn-secondary text-xs py-1"><RotateCcw className="w-3 h-3"/>Revision</button>
                <button onClick={()=>{setActionModal({report:r,action:'complete'});setComment('')}} className="btn-secondary text-xs py-1 text-teal-600"><CheckCircle className="w-3 h-3"/>Complete</button>
                <button onClick={()=>{setForwardModal(r);setForwardRole('')}} className="btn-secondary text-xs py-1"><Forward className="w-3 h-3"/>Forward</button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Modal open={!!actionModal} onClose={()=>{setActionModal(null);setComment('')}} title={`${actionModal?.action?.charAt(0).toUpperCase()||''}${actionModal?.action?.slice(1)||''} Report`} wide>
        {actionModal && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-sm font-semibold text-gray-900">{actionModal.report.type} — {actionModal.report.period}</p>
              <p className="text-xs text-gray-500 mt-1">From: {actionModal.report.from} ({actionModal.report.fromRole})</p>
            </div>
            <div><label className="label">Comment / Feedback</label><textarea className="input" rows={3} value={comment} onChange={e=>setComment(e.target.value)} placeholder="Add your comments..."/></div>
            <button onClick={()=>handleAction(actionModal.action,actionModal.report,comment)} className="btn-primary w-full">Submit & Notify Sender</button>
          </div>
        )}
      </Modal>

      <Modal open={!!forwardModal} onClose={()=>setForwardModal(null)} title="Forward Report" wide>
        {forwardModal && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-sm font-semibold">{forwardModal.type} — {forwardModal.period}</p>
              <p className="text-xs text-gray-500">From: {forwardModal.from}</p>
            </div>
            <div>
              <label className="label">Forward To</label>
              <select className="input" value={forwardRole} onChange={e=>setForwardRole(e.target.value)}>
                <option value="">Select Role…</option>
                {FORWARD_ROLES.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <button onClick={handleForward} disabled={!forwardRole} className="btn-primary w-full disabled:opacity-60">
              <Forward className="w-3.5 h-3.5"/>Forward Report & Notify
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}

// ── Tasks ─────────────────────────────────────────────────────────────────────

const TASK_ASSIGNEES = [
  {name:'Principal',          role:'principal'},
  {name:'Foundation Lead',    role:'foundation_lead'},
  {name:'Academic Team',      role:'academic'},
  {name:'Student Affairs',    role:'affairs'},
  {name:'Training Operations',role:'training_ops'},
]

function CaptainTasks() {
  const { user, pushNotif } = useAuth()
  const { mockTasks, addTask, updateTask } = useData()
  const [modal,        setModal]        = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityF,    setPriorityF]    = useState('')
  const [form, setForm] = useState({title:'',assignedToRole:'',dueDate:'',priority:'medium',note:''})

  const filtered = mockTasks.filter(t=>
    (statusFilter===''||t.status===statusFilter) &&
    (priorityF===''||t.priority===priorityF)
  )

  const total      = mockTasks.length
  const pending    = mockTasks.filter(t=>t.status==='pending').length
  const inProgress = mockTasks.filter(t=>t.status==='in-progress').length
  const completed  = mockTasks.filter(t=>t.status==='completed').length
  const rejected   = mockTasks.filter(t=>t.status==='rejected').length
  const completePct = total>0 ? Math.round(completed/total*100) : 0

  const statusData = [
    {name:'Pending',     value:pending,    color:'#f59e0b'},
    {name:'In Progress', value:inProgress, color:'#3b82f6'},
    {name:'Completed',   value:completed,  color:'#10b981'},
    {name:'Rejected',    value:rejected,   color:'#ef4444'},
  ].filter(d=>d.value>0)

  const byRole = TASK_ASSIGNEES.map(a=>({
    name: a.name.split(' ')[0],
    total: mockTasks.filter(t=>t.assignedToRole===a.role).length,
    done:  mockTasks.filter(t=>t.assignedToRole===a.role&&t.status==='completed').length,
  }))

  const create = async () => {
    if(!form.title||!form.assignedToRole) return
    const assignee = TASK_ASSIGNEES.find(a=>a.role===form.assignedToRole)
    await addTask({
      ...form,
      assignedTo: assignee?.name||form.assignedToRole,
      createdBy: user?.name,
      createdByRole: 'captain',
      status: 'pending',
    })
    await pushNotif(form.assignedToRole,`Captain assigned you a task: "${form.title}" — due ${form.dueDate||'TBD'}`,'task')
    setModal(false)
    setForm({title:'',assignedToRole:'',dueDate:'',priority:'medium',note:''})
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex justify-end">
        <button onClick={()=>setModal(true)} className="btn-primary text-xs"><Plus className="w-3.5 h-3.5"/>Create Task</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MiniStat label="Total Tasks"  value={total}      color="blue"/>
        <MiniStat label="Pending"      value={pending}    color="amber"/>
        <MiniStat label="In Progress"  value={inProgress} color="blue"/>
        <MiniStat label="Completed"    value={completed}  color="green"/>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <SectionHeader title="Task Status Distribution"/>
          {statusData.length>0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={60} dataKey="value" label={({name,percent})=>`${name}: ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {statusData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip/>
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-xs text-gray-400 text-center py-10">No tasks yet</p>}
        </Card>
        <Card>
          <SectionHeader title="Tasks by Role"/>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={byRole}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="name" tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{borderRadius:10,border:'none'}}/>
              <Bar dataKey="total" fill="#1e3a6e" radius={[4,4,0,0]} name="Total"/>
              <Bar dataKey="done"  fill="#10b981" radius={[4,4,0,0]} name="Completed"/>
              <Legend iconSize={8} wrapperStyle={{fontSize:10}}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <div className="flex justify-between mb-2">
          <span className="text-sm font-semibold">Overall Completion Rate</span>
          <span className="font-bold text-green-600">{completePct}%</span>
        </div>
        <ProgressBar value={completePct} color="green" size="lg"/>
      </Card>

      <Card>
        <div className="flex flex-wrap gap-3 mb-4">
          <SelectFilter label="Status" value={statusFilter} onChange={setStatusFilter}
            options={[{value:'pending',label:'Pending'},{value:'in-progress',label:'In Progress'},{value:'completed',label:'Completed'},{value:'rejected',label:'Rejected'}]}
            placeholder="All Status"/>
          <SelectFilter label="Priority" value={priorityF} onChange={setPriorityF}
            options={[{value:'high',label:'🔴 High'},{value:'medium',label:'🟡 Medium'},{value:'low',label:'🟢 Low'}]}
            placeholder="All Priority"/>
        </div>
        <Table
          columns={[
            {key:'title',         label:'Task',       render:v=><span className="font-medium">{v}</span>},
            {key:'assignedTo',    label:'Assigned To'},
            {key:'dueDate',       label:'Due Date'},
            {key:'priority',      label:'Priority',   render:v=><Badge color={v==='high'?'red':v==='medium'?'amber':'green'}>{v}</Badge>},
            {key:'status',        label:'Status',     render:v=><StatusBadge status={v}/>},
            {key:'note',          label:'Note',       render:v=>v?<span className="text-xs text-gray-500 truncate max-w-32 block">{v}</span>:<span className="text-gray-300">—</span>},
          ]}
          data={filtered}
          emptyMsg="No tasks found."
        />
      </Card>

      <Modal open={modal} onClose={()=>setModal(false)} title="Create New Task" wide>
        <div className="space-y-4">
          <div><label className="label">Task Title</label><input className="input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Task title…"/></div>
          <div>
            <label className="label">Assign To</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {TASK_ASSIGNEES.map(a=>(
                <button key={a.role} type="button"
                  onClick={()=>setForm({...form,assignedToRole:a.role})}
                  className={`text-xs rounded-xl border px-3 py-2 text-left transition-colors ${
                    form.assignedToRole===a.role
                      ? 'bg-[#1e3a6e] text-white border-[#1e3a6e]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}>
                  {a.name}
                </button>
              ))}
            </div>
            {form.assignedToRole && (
              <p className="text-[10px] text-blue-500 mt-1">Selected: {TASK_ASSIGNEES.find(a=>a.role===form.assignedToRole)?.name}</p>
            )}
          </div>
          <div><label className="label">Due Date</label><input type="date" className="input" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})}/></div>
          <div>
            <label className="label">Priority</label>
            <select className="input" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </div>
          <div><label className="label">Instructions / Notes</label><textarea className="input" rows={3} value={form.note} onChange={e=>setForm({...form,note:e.target.value})} placeholder="Instructions…"/></div>
          <button onClick={create} disabled={!form.title||!form.assignedToRole} className="btn-primary w-full disabled:opacity-60">Create Task & Notify Assignee</button>
        </div>
      </Modal>
    </div>
  )
}

// ── Certificates ──────────────────────────────────────────────────────────────

function CaptainCertificates() {
  const { mockCertificates, mockCourses } = useData()
  const [search,   setSearch]   = useState('')
  const [courseF,  setCourseF]  = useState('')
  const [selCert,  setSelCert]  = useState(null)

  const filtered = mockCertificates.filter(c=>
    (!search || c.studentName.toLowerCase().includes(search.toLowerCase()) || c.courseName.toLowerCase().includes(search.toLowerCase())) &&
    (courseF===''||String(c.courseId)===courseF)
  )

  const byCourse = mockCourses.map(c=>({
    name: c.name.split(' ')[0],
    certs: mockCertificates.filter(cert=>cert.courseId===c.id).length,
  })).filter(d=>d.certs>0)

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const now    = new Date()
  const byMonth = Array.from({length:6},(_,i)=>{
    const d = new Date(now.getFullYear(),now.getMonth()-5+i,1)
    const m=d.getMonth(); const y=d.getFullYear()
    return {
      name: months[m],
      count: mockCertificates.filter(c=>{
        const cd=new Date(c.issuedAt); return cd.getMonth()===m&&cd.getFullYear()===y
      }).length,
    }
  })

  const thisMonthCount = byMonth[byMonth.length-1]?.count||0

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MiniStat label="Total Issued"  value={mockCertificates.length} color="blue"/>
        <MiniStat label="This Month"    value={thisMonthCount}          color="green"/>
        <MiniStat label="Courses"       value={byCourse.length}         color="teal"/>
        <MiniStat label="Showing"       value={filtered.length}         color="gray"/>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <SectionHeader title="Certificates by Course"/>
          {byCourse.length>0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={byCourse}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="name" tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{borderRadius:10,border:'none'}}/>
                <Bar dataKey="certs" fill="#1e3a6e" radius={[4,4,0,0]} name="Certificates"/>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-xs text-gray-400 text-center py-8">No certificates issued yet</p>}
        </Card>
        <Card>
          <SectionHeader title="Monthly Trend (Last 6 Months)"/>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={byMonth}>
              <defs><linearGradient id="certGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1e3a6e" stopOpacity={0.15}/><stop offset="95%" stopColor="#1e3a6e" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="name" tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{borderRadius:10,border:'none'}}/>
              <Area type="monotone" dataKey="count" stroke="#1e3a6e" strokeWidth={2} fill="url(#certGrad)" name="Certificates"/>
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-48">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
            <input className="input pl-8" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search student or course…"/>
          </div>
          <SelectFilter label="Course" value={courseF} onChange={setCourseF} options={mockCourses.map(c=>({value:String(c.id),label:c.name}))} placeholder="All Courses"/>
        </div>
        <Table
          columns={[
            {key:'studentName', label:'Student', render:v=><span className="font-medium">{v}</span>},
            {key:'courseName',  label:'Course'},
            {key:'grade',       label:'Grade',   render:v=><Badge color="teal">{v||'—'}</Badge>},
            {key:'issuedBy',    label:'Issued By'},
            {key:'issuedAt',    label:'Issue Date'},
            {key:'id',          label:'',        render:(v,row)=><button onClick={()=>setSelCert(row)} className="text-blue-600 hover:underline text-xs">View</button>},
          ]}
          data={filtered}
          emptyMsg="No certificates found."
        />
      </Card>

      <Modal open={!!selCert} onClose={()=>setSelCert(null)} title="Certificate Details">
        {selCert && (
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-[#1e3a6e] to-[#2563eb] rounded-2xl p-5 text-white text-center">
              <p className="text-white/60 text-xs mb-1">Certificate of Completion</p>
              <p className="font-bold text-2xl">{selCert.studentName}</p>
              <p className="text-white/70 text-sm mt-1">{selCert.courseName}</p>
              {selCert.grade && <div className="mt-2"><Badge color="amber">{selCert.grade}</Badge></div>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] text-gray-400 uppercase">Issue Date</p>
                <p className="text-sm font-semibold">{selCert.issuedAt||'—'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] text-gray-400 uppercase">Issued By</p>
                <p className="text-sm font-semibold">{selCert.issuedBy||'—'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn-secondary flex-1 text-xs" onClick={()=>window.print()}><Download className="w-3.5 h-3.5"/>Print / Download</button>
              <button onClick={()=>setSelCert(null)} className="btn-primary flex-1 text-xs">Close</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

// ── Messages ──────────────────────────────────────────────────────────────────

function CaptainMessages() {
  const { user, pushNotif } = useAuth()
  const { mockMessages, sendMessage } = useData()
  const [form, setForm] = useState({to:'foundation_lead',text:''})
  const msgs = mockMessages.filter(m=>m.fromRole==='captain'||m.toRole==='captain')
  const CONTACTS = [{role:'principal',name:'Principal'},{role:'foundation_lead',name:'Mohammad Abdullah'}]
  const send = async () => {
    if(!form.text.trim()) return
    const c=CONTACTS.find(x=>x.role===form.to)
    await sendMessage({fromRole:'captain',from:user?.name,toRole:form.to,to:c?.name,text:form.text})
    await pushNotif(form.to,`${user?.name}: "${form.text.slice(0,40)}"`, 'message')
    setForm({...form,text:''})
  }
  return (
    <div className="grid lg:grid-cols-2 gap-4 animate-fadeIn">
      <Card>
        <SectionHeader title="Send Message"/>
        <div className="space-y-3">
          <div><label className="label">To</label><select className="input" value={form.to} onChange={e=>setForm({...form,to:e.target.value})}>{CONTACTS.map(c=><option key={c.role} value={c.role}>{c.name}</option>)}</select></div>
          <div><label className="label">Message</label><textarea className="input" rows={4} value={form.text} onChange={e=>setForm({...form,text:e.target.value})} placeholder="Type message…"/></div>
          <button onClick={send} className="btn-primary w-full"><Send className="w-3.5 h-3.5"/>Send</button>
        </div>
      </Card>
      <Card>
        <SectionHeader title="Messages"/>
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {msgs.length===0&&<p className="text-xs text-gray-400 text-center py-8">No messages yet</p>}
          {msgs.map(m=>(
            <div key={m.id} className={`p-3 rounded-xl text-xs ${m.fromRole==='captain'?'bg-amber-50 ml-6':'bg-gray-50 mr-6'}`}>
              <p className="font-semibold text-gray-700 mb-0.5">{m.fromRole==='captain'?'You → '+m.to:m.from}</p>
              <p className="text-gray-600">{m.text}</p>
              <p className="text-gray-400 mt-1">{m.time}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
