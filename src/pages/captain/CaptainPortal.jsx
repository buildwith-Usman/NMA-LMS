import { useState } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import Header from '../../components/layout/Header'
import { StatCard, StatusBadge, Badge, Table, SectionHeader, ProgressBar, Modal, MiniStat, SelectFilter, Card } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { GraduationCap, Users, BookOpen, AlertCircle, Calendar, BarChart3, Award, ClipboardList, ExternalLink, Send, Plus, FileText } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const PAGES = { overview:'Overview', students:'Students', instructors:'Instructors', courses:'Courses', attendance:'Attendance', complaints:'Complaints', surveys:'Surveys', meetings:'Meetings', reports:'Reports', messages:'Messages' }

export default function CaptainPortal() {
  const [active, setActive] = useState('overview')
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar activeKey={active} onNavigate={setActive}/>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={PAGES[active] || active}/>
        <main className="flex-1 overflow-y-auto p-5">
          {active==='overview'    && <CaptainOverview/>}
          {active==='students'    && <CaptainStudents/>}
          {active==='instructors' && <CaptainInstructors/>}
          {active==='courses'     && <CaptainCourses/>}
          {active==='attendance'  && <CaptainAttendance/>}
          {active==='complaints'  && <CaptainComplaints/>}
          {active==='surveys'     && <CaptainSurveys/>}
          {active==='meetings'    && <CaptainMeetings/>}
          {active==='reports'     && <CaptainReports/>}
          {active==='messages'    && <CaptainMessages/>}
        </main>
      </div>
    </div>
  )
}

function CaptainOverview() {
  const { getStats, attendanceChart, mockCourses, mockStudents, mockInstructors, mockComplaints, mockMeetings, mockSurveys, mockAttendance, mockAssignments, mockCertificates } = useData()
  const stats = getStats()
  const [drill, setDrill] = useState(null)
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
              {mockStudents.filter(s=>s.courses?.includes(c.id)).map(s=>(
                <div key={s.id} className="flex justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
                  <span className="font-medium text-gray-800">{s.name}</span>
                  <div className="flex gap-3"><span className="text-gray-400">Att: {s.attendanceRate}%</span><span className="text-gray-400">GPA: {s.gpa}</span><StatusBadge status={s.status}/></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Modal>

      <Modal open={drill==='students_risk'} onClose={()=>setDrill(null)} title="At-Risk Students" wide>
        {mockStudents.filter(s=>s.status==='at-risk').map(s=>(
          <div key={s.id} className="mb-4 p-4 border border-red-100 bg-red-50/30 rounded-xl">
            <div className="flex justify-between mb-3"><p className="font-bold text-gray-900">{s.name}</p><StatusBadge status={s.status}/></div>
            <div className="flex gap-3 mb-3"><MiniStat label="Attendance" value={`${s.attendanceRate}%`} color="red"/><MiniStat label="GPA" value={s.gpa} color="amber"/><MiniStat label="Courses" value={s.courses?.length||0} color="gray"/></div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Risk Factors</p>
              {s.attendanceRate < 70 && <p className="text-xs text-red-600">• Attendance below 70% ({s.attendanceRate}%)</p>}
              {s.gpa < 2.5 && <p className="text-xs text-red-600">• GPA below 2.5 ({s.gpa})</p>}
            </div>
            <div className="mt-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Enrolled Courses</p>
              {s.courses?.map(cid=>{const c=mockCourses.find(x=>x.id===cid); return c ? <p key={cid} className="text-xs text-gray-600">• {c.name} ({c.instructor})</p> : null})}
            </div>
          </div>
        ))}
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

function CaptainStudents() {
  const { mockStudents, mockCourses } = useData()
  const [courseId, setCourseId] = useState('')
  const [statusF,  setStatusF]  = useState('')
  const filtered = mockStudents.filter(s=>(courseId===''||s.courses?.includes(parseInt(courseId)))&&(statusF===''||s.status===statusF))
  return (
    <div className="space-y-4 animate-fadeIn">
      <Card>
        <div className="flex flex-wrap gap-3 mb-4">
          <SelectFilter label="Course" value={courseId} onChange={setCourseId} options={mockCourses.map(c=>({value:String(c.id),label:c.name}))} placeholder="All Courses"/>
          <SelectFilter label="Status" value={statusF}  onChange={setStatusF}  options={[{value:'active',label:'Active'},{value:'at-risk',label:'At Risk'}]} placeholder="All Status"/>
        </div>
        <div className="flex gap-2 mb-4">
          <MiniStat label="Showing" value={filtered.length} color="blue"/>
          <MiniStat label="At Risk"  value={filtered.filter(s=>s.status==='at-risk').length} color="red"/>
          <MiniStat label="Active"   value={filtered.filter(s=>s.status==='active').length}  color="green"/>
        </div>
        <Table columns={[
          {key:'name',label:'Name',render:v=><span className="font-medium">{v}</span>},
          {key:'attendanceRate',label:'Attendance',render:v=><div className="flex items-center gap-2 min-w-24"><ProgressBar value={v} color={v>=80?'green':v>=60?'amber':'red'}/><span className="text-xs">{v}%</span></div>},
          {key:'gpa',label:'GPA',render:v=><span className={`font-bold text-sm ${v>=3.5?'text-green-600':v>=2.5?'text-amber-500':'text-red-500'}`}>{v}</span>},
          {key:'status',label:'Status',render:v=><StatusBadge status={v}/>},
          {key:'courses',label:'Courses',render:v=><Badge color="blue">{v?.length||0}</Badge>},
        ]} data={filtered} emptyMsg="No students match filters."/>
      </Card>
    </div>
  )
}

function CaptainInstructors() {
  const { mockInstructors, mockCourses, mockStudents } = useData()
  const [sel, setSel] = useState(null)
  return (
    <div className="space-y-3 animate-fadeIn">
      {mockInstructors.map(ins=>(
        <Card key={ins.id} className="cursor-pointer hover:shadow-md transition-all" onClick={()=>setSel(ins)}>
          <div className="flex items-start justify-between">
            <div><p className="font-semibold text-gray-900">{ins.name}</p><p className="text-xs text-gray-400 mt-0.5">{ins.sub} · {ins.email}</p></div>
            <div className="flex gap-2"><Badge color="blue">{ins.students} students</Badge><StatusBadge status={ins.status}/></div>
          </div>
          <div className="mt-2"><p className="text-xs text-gray-400">Courses: {ins.courses?.map(cid=>mockCourses.find(c=>c.id===cid)?.name).filter(Boolean).join(', ')||'—'}</p></div>
          <p className="text-[10px] text-blue-500 mt-2">↗ Click to see students</p>
        </Card>
      ))}
      <Modal open={!!sel} onClose={()=>setSel(null)} title={sel?.name||''} wide>
        {sel && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <MiniStat label="Students" value={sel.students} color="blue"/>
              <MiniStat label="Courses" value={sel.courses?.length||0} color="teal"/>
              <MiniStat label="Status" value={sel.status} color="green"/>
            </div>
            <div>
              <p className="label">Courses Taught</p>
              {sel.courses?.map(cid=>{
                const c=mockCourses.find(x=>x.id===cid)
                return c ? (
                  <div key={cid} className="mb-3 p-3 bg-gray-50 rounded-xl">
                    <div className="flex justify-between mb-1"><p className="font-semibold text-sm">{c.name}</p><Badge color="teal">{c.progress}%</Badge></div>
                    <ProgressBar value={c.progress} color="teal"/>
                    <div className="mt-2">
                      <p className="label mt-2">Enrolled Students</p>
                      <Table columns={[{key:'name',label:'Name',render:v=><span className="font-medium">{v}</span>},{key:'attendanceRate',label:'Attendance',render:v=><span className={v>=80?'text-green-600':v>=60?'text-amber-500':'text-red-500'}>{v}%</span>},{key:'gpa',label:'GPA'},{key:'status',label:'Status',render:v=><StatusBadge status={v}/>}]} data={mockStudents.filter(s=>s.courses?.includes(c.id))} emptyMsg="No students."/>
                    </div>
                  </div>
                ) : null
              })}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function CaptainCourses() {
  const { mockCourses, mockStudents } = useData()
  const [sel, setSel] = useState(null)
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
        {sel && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <MiniStat label="Students" value={sel.enrolledStudents?.length||0} color="blue"/>
              <MiniStat label="Progress" value={`${sel.progress}%`} color="teal"/>
            </div>
            <Table columns={[{key:'name',label:'Student',render:v=><span className="font-medium">{v}</span>},{key:'attendanceRate',label:'Attendance',render:v=><span className={v>=80?'text-green-600':v>=60?'text-amber-500':'text-red-500'}>{v}%</span>},{key:'gpa',label:'GPA'},{key:'status',label:'Status',render:v=><StatusBadge status={v}/>}]} data={mockStudents.filter(s=>s.courses?.includes(sel.id))} emptyMsg="No students enrolled."/>
            <div className="flex gap-2">
              {sel.teamsLink&&<a href={sel.teamsLink} target="_blank" rel="noreferrer" className="btn-secondary text-xs py-1.5"><ExternalLink className="w-3 h-3"/>Teams</a>}
              {sel.classroomLink&&<a href={sel.classroomLink} target="_blank" rel="noreferrer" className="btn-secondary text-xs py-1.5"><ExternalLink className="w-3 h-3"/>Classroom</a>}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

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

function CaptainSurveys() {
  const { mockSurveys } = useData()
  return (
    <div className="space-y-3 animate-fadeIn">
      {mockSurveys.map(s=>(
        <Card key={s.id}>
          <div className="flex justify-between mb-3"><div><p className="font-semibold text-gray-900">{s.title}</p><p className="text-xs text-gray-400">By {s.createdBy} · Due: {s.deadline}</p></div><StatusBadge status={s.status}/></div>
          <div className="flex items-center gap-3"><span className="text-sm font-bold text-teal-600">{s.responses.length}</span><span className="text-xs text-gray-400">/ {s.sent} responded</span><div className="flex-1"><ProgressBar value={(s.responses.length/s.sent)*100} color="teal" size="lg"/></div><span className="text-xs text-gray-400">{Math.round((s.responses.length/s.sent)*100)}%</span></div>
        </Card>
      ))}
    </div>
  )
}

function CaptainMeetings() {
  const { user, pushNotif } = useAuth()
  const { mockMeetings, addMeeting } = useData()
  const [modal, setModal] = useState(false)
  const [form, setForm]   = useState({title:'',date:'',link:'',platform:'teams',invitees:[]})
  const ALLOWED = [{name:'Principal',role:'principal'},{name:'Mohammad Abdullah (Foundation Lead)',role:'foundation_lead'}]
  const toggle  = (name,role)=>{ const e=form.invitees.find(i=>i.name===name); setForm({...form,invitees:e?form.invitees.filter(i=>i.name!==name):[...form.invitees,{name,role}]}) }
  const create  = async ()=>{
    if(!form.title||!form.date) return
    await addMeeting({...form,createdBy:user?.name,createdByRole:'captain',participants:[user?.name,...form.invitees.map(i=>i.name)],participantRoles:['captain',...form.invitees.map(i=>i.role)],status:'upcoming'})
    for (const i of form.invitees) await pushNotif(i.role,`${user?.name} scheduled: "${form.title}"`, 'meeting')
    setModal(false); setForm({title:'',date:'',link:'',platform:'teams',invitees:[]})
  }
  return (
    <div className="space-y-3 animate-fadeIn">
      <div className="flex justify-end"><button onClick={()=>setModal(true)} className="btn-primary text-xs"><Plus className="w-3.5 h-3.5"/>Schedule Meeting</button></div>
      {mockMeetings.map(m=>(
        <Card key={m.id} className="flex justify-between items-start">
          <div>
            <div className="flex gap-2 mb-1"><p className="font-semibold text-gray-900">{m.title}</p><StatusBadge status={m.status}/></div>
            <p className="text-xs text-gray-500">{m.date}</p>
            <p className="text-xs text-gray-400 mt-0.5">{m.participants?.join(', ')}</p>
          </div>
          {m.status==='upcoming'&&m.link&&<a href={m.link} target="_blank" rel="noreferrer" className="btn-primary text-xs py-1.5">Join <ExternalLink className="w-3 h-3"/></a>}
        </Card>
      ))}
      <Modal open={modal} onClose={()=>setModal(false)} title="Schedule Meeting" wide>
        <div className="space-y-4">
          <div><label className="label">Title</label><input className="input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Meeting title"/></div>
          <div><label className="label">Date & Time</label><input type="datetime-local" className="input" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></div>
          <div><label className="label">Platform</label><select className="input" value={form.platform} onChange={e=>setForm({...form,platform:e.target.value})}><option value="teams">Microsoft Teams</option><option value="google">Google Meet</option><option value="zoom">Zoom</option></select></div>
          <div><label className="label">Meeting Link</label><input className="input" value={form.link} onChange={e=>setForm({...form,link:e.target.value})} placeholder="https://…"/></div>
          <div>
            <label className="label">Invite (Principal or Foundation Lead)</label>
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
    </div>
  )
}

function CaptainReports() {
  const { mockReports } = useData()
  return (
    <div className="space-y-3 animate-fadeIn">
      {mockReports.map(r=>(
        <Card key={r.id}>
          <div className="flex justify-between mb-1"><p className="font-semibold text-sm text-gray-900">{r.type} — {r.period}</p><Badge color="gray">{r.fromRole}</Badge></div>
          <p className="text-xs text-gray-400 mb-2">From: {r.from} · {r.sentAt}</p>
          <p className="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">{r.content}</p>
        </Card>
      ))}
    </div>
  )
}

function CaptainMessages() {
  const { user, pushNotif } = useAuth()
  const { mockMessages, sendMessage } = useData()
  const [form, setForm] = useState({to:'foundation_lead',text:''})
  const msgs = mockMessages.filter(m=>m.fromRole==='captain'||m.toRole==='captain')
  const CONTACTS = [{role:'principal',name:'Principal'},{role:'foundation_lead',name:'Mohammad Abdullah'}]
  const send = async ()=>{
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
