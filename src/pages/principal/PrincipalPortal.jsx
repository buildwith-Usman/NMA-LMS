import { useState } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import Header from '../../components/layout/Header'
import { StatCard, StatusBadge, Badge, Table, SectionHeader, Modal, ProgressBar, MiniStat, SelectFilter, Card, FileUploadBox, CertificatePDF } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { GraduationCap, Users, BookOpen, AlertCircle, Calendar, BarChart3, CheckSquare, Send, Plus, ExternalLink, Award, ClipboardList } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const PAGES = { dashboard:'Principal Dashboard', team:'My Team', students:'Students', courses:'Courses', complaints:'Complaints', tasks:'Assign Tasks', surveys:'Surveys', certificates:'Certificates', meetings:'Meetings', reports:'Reports', messages:'Messages' }

export default function PrincipalPortal() {
  const [active, setActive] = useState('dashboard')
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar activeKey={active} onNavigate={setActive}/>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={PAGES[active]||active}/>
        <main className="flex-1 overflow-y-auto p-5">
          {active==='dashboard'   && <PrinDash onNavigate={setActive}/>}
          {active==='team'        && <PrinTeam/>}
          {active==='students'    && <PrinStudents/>}
          {active==='courses'     && <PrinCourses/>}
          {active==='complaints'  && <PrinComplaints/>}
          {active==='tasks'       && <PrinTasks/>}
          {active==='surveys'     && <PrinSurveys/>}
          {active==='certificates'&& <PrinCertificates/>}
          {active==='meetings'    && <PrinMeetings/>}
          {active==='reports'     && <PrinReports/>}
          {active==='messages'    && <PrinMessages/>}
        </main>
      </div>
    </div>
  )
}

function PrinDash({ onNavigate }) {
  const { user } = useAuth()
  const { getStats, attendanceChart, mockCourses, mockStudents, mockInstructors, mockComplaints, mockMeetings, mockTasks, mockAttendance } = useData()
  const stats = getStats()
  const [drill, setDrill] = useState(null)
  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="rounded-2xl bg-gradient-to-r from-violet-700 to-purple-900 p-5 text-white">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-white/60 text-xs">Academy Leadership</p>
            <h2 className="font-bold text-2xl mt-0.5">{user?.name} 🏛️</h2>
            <p className="text-white/50 text-sm mt-1">Click any stat to drill down · Full academy oversight</p>
          </div>
          <div className="text-5xl opacity-10">🏛️</div>
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">👥 Students & Academic</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total Students"   value={stats.totalStudents}    icon={GraduationCap} color="blue"   onClick={()=>setDrill('students')}   clickLabel="View by course"/>
          <StatCard label="At-Risk Students" value={stats.atRisk}           icon={AlertCircle}   color="red"    onClick={()=>setDrill('atrisk')}     clickLabel="View at-risk"/>
          <StatCard label="Instructors"      value={stats.totalInstructors} icon={Users}         color="purple" onClick={()=>setDrill('instructors')} clickLabel="View instructors"/>
          <StatCard label="Active Courses"   value={stats.activeCourses}    icon={BookOpen}      color="teal"   onClick={()=>setDrill('courses')}    clickLabel="View courses"/>
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">⚙️ Operations</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Pending Complaints" value={stats.pendingComplaints}  icon={AlertCircle}   color="amber"  onClick={()=>setDrill('complaints')} clickLabel="View complaints"/>
          <StatCard label="Pending Tasks"      value={stats.pendingTasks}       icon={CheckSquare}   color="orange" onClick={()=>setDrill('tasks')}      clickLabel="View tasks"/>
          <StatCard label="Avg Attendance"     value={`${stats.avgAttendance}%`}icon={BarChart3}     color="green"  onClick={()=>setDrill('attendance')} clickLabel="By course"/>
          <StatCard label="Meetings"           value={stats.upcomingMeetings}   icon={Calendar}      color="indigo" onClick={()=>setDrill('meetings')}   clickLabel="View meetings"/>
        </div>
      </div>
      <Card>
        <SectionHeader title="Attendance Trend"/>
        <ResponsiveContainer width="100%" height={130}>
          <AreaChart data={attendanceChart}>
            <defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15}/><stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
            <XAxis dataKey="week" tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/>
            <YAxis domain={[70,100]} tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false} unit="%"/>
            <Tooltip contentStyle={{borderRadius:10,border:'none'}}/>
            <Area type="monotone" dataKey="rate" stroke="#7c3aed" strokeWidth={2} fill="url(#pg)"/>
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <Modal open={drill==='students'} onClose={()=>setDrill(null)} title="Students by Course" wide>
        <div className="space-y-3">
          <div className="flex gap-2 mb-3"><MiniStat label="Total" value={stats.totalStudents} color="blue"/><MiniStat label="Active" value={stats.activeStudents} color="green"/><MiniStat label="At Risk" value={stats.atRisk} color="red"/></div>
          {mockCourses.map(c=>(
            <div key={c.id} className="border border-gray-100 rounded-xl p-3">
              <div className="flex justify-between mb-2"><p className="font-semibold text-sm">{c.name}</p><Badge color="blue">{c.enrolledStudents?.length||0} enrolled</Badge></div>
              {mockStudents.filter(s=>s.courses?.includes(c.id)).map(s=>(
                <div key={s.id} className="flex justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
                  <span className="font-medium">{s.name}</span>
                  <div className="flex gap-3"><span className="text-gray-400">Att: {s.attendanceRate}%</span><span className="text-gray-400">GPA: {s.gpa}</span><StatusBadge status={s.status}/></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Modal>
      <Modal open={drill==='atrisk'} onClose={()=>setDrill(null)} title="At-Risk Students" wide>
        {mockStudents.filter(s=>s.status==='at-risk').map(s=>(
          <div key={s.id} className="mb-4 p-4 border border-red-100 bg-red-50/30 rounded-xl">
            <div className="flex justify-between mb-3"><p className="font-bold text-gray-900">{s.name}</p><StatusBadge status={s.status}/></div>
            <div className="flex gap-2 mb-3"><MiniStat label="Attendance" value={`${s.attendanceRate}%`} color="red"/><MiniStat label="GPA" value={s.gpa} color="amber"/></div>
            <div>{s.courses?.map(cid=>{const c=mockCourses.find(x=>x.id===cid);return c?<p key={cid} className="text-xs text-gray-600">• {c.name}</p>:null})}</div>
          </div>
        ))}
      </Modal>
      <Modal open={drill==='instructors'} onClose={()=>setDrill(null)} title="All Instructors" wide>
        <Table columns={[{key:'name',label:'Name',render:v=><span className="font-medium">{v}</span>},{key:'sub',label:'Role'},{key:'students',label:'Students',render:v=><Badge color="blue">{v}</Badge>},{key:'status',label:'Status',render:v=><StatusBadge status={v}/>}]} data={mockInstructors}/>
      </Modal>
      <Modal open={drill==='courses'} onClose={()=>setDrill(null)} title="All Courses" wide>
        {mockCourses.map(c=>(
          <div key={c.id} className="mb-3 p-3 border border-gray-100 rounded-xl">
            <div className="flex justify-between mb-1"><p className="font-semibold text-sm">{c.name}</p><Badge color="teal">{c.progress}%</Badge></div>
            <ProgressBar value={c.progress} color="teal" size="lg"/>
          </div>
        ))}
      </Modal>
      <Modal open={drill==='complaints'} onClose={()=>setDrill(null)} title="Pending Complaints" wide>
        <Table columns={[{key:'from',label:'From'},{key:'subject',label:'Subject'},{key:'priority',label:'Priority',render:v=><Badge color={v==='high'?'red':v==='medium'?'amber':'green'}>{v}</Badge>},{key:'status',label:'Status',render:v=><StatusBadge status={v}/>}]} data={mockComplaints.filter(c=>c.status==='pending')}/>
      </Modal>
      <Modal open={drill==='tasks'} onClose={()=>setDrill(null)} title="Pending Tasks" wide>
        <Table columns={[{key:'title',label:'Task'},{key:'assignedTo',label:'Assigned To'},{key:'dueDate',label:'Due'},{key:'priority',label:'Priority',render:v=><Badge color={v==='high'?'red':v==='medium'?'amber':'green'}>{v}</Badge>},{key:'status',label:'Status',render:v=><StatusBadge status={v}/>}]} data={mockTasks.filter(t=>t.status!=='completed')}/>
      </Modal>
      <Modal open={drill==='attendance'} onClose={()=>setDrill(null)} title="Attendance by Course" wide>
        {mockCourses.map(c=>{
          const recs=mockAttendance.filter(a=>a.courseId===c.id)
          const rate=recs.length?Math.round(recs.filter(r=>r.status==='present').length/recs.length*100):0
          return(
            <div key={c.id} className="mb-3 p-3 border border-gray-100 rounded-xl">
              <div className="flex justify-between mb-1"><p className="font-semibold text-sm">{c.name}</p><span className={`font-bold text-sm ${rate>=80?'text-green-600':rate>=60?'text-amber-500':'text-red-500'}`}>{rate}%</span></div>
              <ProgressBar value={rate} color={rate>=80?'green':rate>=60?'amber':'red'} size="lg"/>
            </div>
          )
        })}
      </Modal>
      <Modal open={drill==='meetings'} onClose={()=>setDrill(null)} title="Upcoming Meetings" wide>
        {mockMeetings.filter(m=>m.status==='upcoming').map(m=>(
          <div key={m.id} className="mb-3 p-3 border border-gray-100 rounded-xl">
            <div className="flex justify-between mb-1"><p className="font-semibold text-sm">{m.title}</p><StatusBadge status={m.status}/></div>
            <p className="text-xs text-gray-500">{m.date} · {m.participants?.join(', ')}</p>
            {m.link&&<a href={m.link} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline mt-1 flex items-center gap-1"><ExternalLink className="w-3 h-3"/>Join</a>}
          </div>
        ))}
      </Modal>
    </div>
  )
}

function PrinTeam() {
  const { mockTasks } = useData()
  const TEAM = [
    {id:1,name:'Mohammad Abdullah',role:'Foundation Lead',    dept:'Foundation',  status:'active',tasks:mockTasks.filter(t=>t.assignedToRole==='foundation_lead').length},
    {id:2,name:'Asad',             role:'Training Ops Mgr',  dept:'Operations',  status:'active',tasks:mockTasks.filter(t=>t.assignedTo==='Asad').length},
    {id:3,name:'Stuart',           role:'Training Ops Mgr',  dept:'Operations',  status:'active',tasks:mockTasks.filter(t=>t.assignedTo==='Stuart').length},
    {id:4,name:'Nida',             role:'Student Services',  dept:'Services',    status:'active',tasks:mockTasks.filter(t=>t.assignedTo==='Nida').length},
    {id:5,name:'Ali',              role:'Academic Assistant', dept:'Academic',    status:'active',tasks:0},
    {id:6,name:'Mohammad (Academic)',role:'Academic Admin',   dept:'Academic',    status:'active',tasks:0},
    {id:7,name:'Abdullah (Academic)',role:'Academic Admin',   dept:'Academic',    status:'active',tasks:0},
    {id:8,name:'Abdulaziz',        role:'Quality Coordinator',dept:'Academic',   status:'active',tasks:mockTasks.filter(t=>t.assignedTo==='Abdulaziz').length},
  ]
  return (
    <Card className="animate-fadeIn">
      <SectionHeader title="My Direct Team"/>
      <Table columns={[
        {key:'name',label:'Name',render:v=><span className="font-semibold">{v}</span>},
        {key:'role',label:'Role'},
        {key:'dept',label:'Department',render:v=><Badge color="blue">{v}</Badge>},
        {key:'tasks',label:'Active Tasks',render:v=><Badge color={v>0?'amber':'green'}>{v}</Badge>},
        {key:'status',label:'Status',render:v=><StatusBadge status={v}/>},
      ]} data={TEAM}/>
    </Card>
  )
}

function PrinStudents() {
  const { mockStudents, mockCourses } = useData()
  const [cid, setCid] = useState('')
  const filtered = mockStudents.filter(s=>cid===''||s.courses?.includes(parseInt(cid)))
  return (
    <div className="space-y-4 animate-fadeIn">
      <Card>
        <div className="flex gap-3 mb-4">
          <SelectFilter label="Course" value={cid} onChange={setCid} options={mockCourses.map(c=>({value:String(c.id),label:c.name}))} placeholder="Select Course First"/>
        </div>
        {cid&&<div className="flex gap-2 mb-4"><MiniStat label="Showing" value={filtered.length} color="blue"/><MiniStat label="At Risk" value={filtered.filter(s=>s.status==='at-risk').length} color="red"/></div>}
        <Table columns={[{key:'name',label:'Student',render:v=><span className="font-medium">{v}</span>},{key:'attendanceRate',label:'Attendance',render:v=><div className="flex items-center gap-2 min-w-24"><ProgressBar value={v} color={v>=80?'green':v>=60?'amber':'red'}/><span className="text-xs">{v}%</span></div>},{key:'gpa',label:'GPA'},{key:'status',label:'Status',render:v=><StatusBadge status={v}/>}]} data={filtered} emptyMsg="Select a course to view students."/>
      </Card>
    </div>
  )
}

function PrinCourses() {
  const { mockCourses, mockStudents } = useData()
  const [sel, setSel] = useState(null)
  return (
    <div className="space-y-3 animate-fadeIn">
      {mockCourses.map(c=>(
        <Card key={c.id} className="cursor-pointer hover:shadow-md transition-all" onClick={()=>setSel(c)}>
          <div className="flex justify-between mb-2"><div><p className="font-semibold text-gray-900">{c.name}</p><p className="text-xs text-gray-400">{c.instructor} · {c.enrolledStudents?.length||0} students</p></div><Badge color="teal">{c.progress}%</Badge></div>
          <ProgressBar value={c.progress} color="teal" size="lg"/>
          <p className="text-[10px] text-blue-500 mt-2">↗ Click to see enrolled students</p>
        </Card>
      ))}
      <Modal open={!!sel} onClose={()=>setSel(null)} title={sel?.name||''} wide>
        {sel&&<Table columns={[{key:'name',label:'Student',render:v=><span className="font-medium">{v}</span>},{key:'attendanceRate',label:'Att.',render:v=><span className={v>=80?'text-green-600':v>=60?'text-amber-500':'text-red-500'}>{v}%</span>},{key:'gpa',label:'GPA'},{key:'status',label:'Status',render:v=><StatusBadge status={v}/>}]} data={mockStudents.filter(s=>s.courses?.includes(sel.id))} emptyMsg="No students enrolled."/>}
      </Modal>
    </div>
  )
}

function PrinComplaints() {
  const { mockComplaints } = useData()
  const [priority, setPriority] = useState('')
  const filtered = mockComplaints.filter(c=>priority===''||c.priority===priority)
  return (
    <div className="space-y-4 animate-fadeIn">
      <Card>
        <div className="flex gap-3 mb-4">
          <SelectFilter label="Priority" value={priority} onChange={setPriority} options={[{value:'high',label:'🔴 High'},{value:'medium',label:'🟡 Medium'},{value:'low',label:'🟢 Low'}]} placeholder="All Priorities"/>
        </div>
        <div className="flex gap-2 mb-4">
          <MiniStat label="High"    value={mockComplaints.filter(c=>c.priority==='high').length}   color="red"/>
          <MiniStat label="Pending" value={mockComplaints.filter(c=>c.status==='pending').length}  color="amber"/>
          <MiniStat label="Resolved"value={mockComplaints.filter(c=>c.status==='resolved').length} color="green"/>
        </div>
        <Table columns={[{key:'from',label:'From'},{key:'subject',label:'Subject'},{key:'priority',label:'Priority',render:v=><Badge color={v==='high'?'red':v==='medium'?'amber':'green'}>{v}</Badge>},{key:'status',label:'Status',render:v=><StatusBadge status={v}/>},{key:'date',label:'Date'}]} data={filtered}/>
      </Card>
    </div>
  )
}

function PrinTasks() {
  const { user, pushNotif } = useAuth()
  const { mockTasks, addTask } = useData()
  const [modal, setModal] = useState(false)
  const [form, setForm]   = useState({title:'',assignedTo:'Asad',assignedToRole:'training_ops',dueDate:'',priority:'medium',note:''})
  const TEAM = [
    {name:'Asad',   role:'training_ops'},
    {name:'Stuart', role:'training_ops'},
    {name:'Nida',   role:'nida'},
  ]
  const add = async ()=>{
    if(!form.title) return
    const t=TEAM.find(x=>x.name===form.assignedTo)
    await addTask({...form,assignedBy:user?.name,assignedToRole:t?.role||'training_ops'})
    await pushNotif(t?.role||'training_ops',`Task from ${user?.name}: "${form.title}"`, 'task')
    setModal(false); setForm({title:'',assignedTo:'Asad',assignedToRole:'training_ops',dueDate:'',priority:'medium',note:''})
  }
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex justify-end"><button onClick={()=>setModal(true)} className="btn-primary text-xs"><Plus className="w-3.5 h-3.5"/>Assign Task</button></div>
      <Card>
        <Table columns={[{key:'title',label:'Task',render:v=><span className="font-medium">{v}</span>},{key:'assignedTo',label:'Assigned To'},{key:'dueDate',label:'Due'},{key:'priority',label:'Priority',render:v=><Badge color={v==='high'?'red':v==='medium'?'amber':'green'}>{v}</Badge>},{key:'status',label:'Status',render:v=><StatusBadge status={v}/>}]} data={mockTasks}/>
      </Card>
      <Modal open={modal} onClose={()=>setModal(false)} title="Assign Task">
        <div className="space-y-4">
          <div><label className="label">Task Title</label><input className="input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Task description…"/></div>
          <div><label className="label">Assign To</label>
            <select className="input" value={form.assignedTo} onChange={e=>{const t=TEAM.find(x=>x.name===e.target.value);setForm({...form,assignedTo:e.target.value,assignedToRole:t?.role||''})}}>
              {TEAM.map(t=><option key={t.name}>{t.name}</option>)}
            </select>
          </div>
          <div><label className="label">Due Date</label><input type="date" className="input" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})}/></div>
          <div><label className="label">Priority</label><select className="input" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
          <div><label className="label">Note</label><textarea className="input" rows={2} value={form.note} onChange={e=>setForm({...form,note:e.target.value})} placeholder="Additional instructions…"/></div>
          <button onClick={add} className="btn-primary w-full">Assign & Notify</button>
        </div>
      </Modal>
    </div>
  )
}

function PrinSurveys() {
  const { user, pushNotif } = useAuth()
  const { mockSurveys, mockStudents, addSurvey } = useData()
  const [modal, setModal] = useState(false)
  const [form, setForm]   = useState({title:'',deadline:'',questions:['','']})
  const create = async ()=>{
    const qs = form.questions.filter(q=>q.trim()).map((q,i)=>({id:i+1,text:q}))
    await addSurvey({title:form.title,createdBy:user?.name,deadline:form.deadline,status:'active',sentTo:'students',questions:qs,sent:mockStudents.length})
    await pushNotif('student',`New survey from ${user?.name}: "${form.title}"`, 'survey')
    setModal(false); setForm({title:'',deadline:'',questions:['','']})
  }
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex justify-end"><button onClick={()=>setModal(true)} className="btn-primary text-xs"><Plus className="w-3.5 h-3.5"/>Create Survey</button></div>
      {mockSurveys.map(s=>(
        <Card key={s.id}>
          <div className="flex justify-between mb-2"><div><p className="font-semibold text-gray-900">{s.title}</p><p className="text-xs text-gray-400">By {s.createdBy} · Due: {s.deadline}</p></div><StatusBadge status={s.status}/></div>
          <div className="flex items-center gap-3"><span className="text-sm font-bold text-violet-600">{s.responses.length}</span><span className="text-xs text-gray-400">/ {s.sent} responded</span><div className="flex-1"><ProgressBar value={(s.responses.length/s.sent)*100} color="purple" size="lg"/></div></div>
        </Card>
      ))}
      <Modal open={modal} onClose={()=>setModal(false)} title="Create Survey" wide>
        <div className="space-y-4">
          <div><label className="label">Survey Title</label><input className="input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Semester Feedback Survey"/></div>
          <div><label className="label">Deadline</label><input type="date" className="input" value={form.deadline} onChange={e=>setForm({...form,deadline:e.target.value})}/></div>
          <div>
            <label className="label">Questions</label>
            {form.questions.map((q,i)=>(
              <div key={i} className="flex gap-2 mb-2">
                <span className="text-xs text-gray-400 mt-2.5 w-4">{i+1}.</span>
                <input className="input flex-1" value={q} onChange={e=>{const qs=[...form.questions];qs[i]=e.target.value;setForm({...form,questions:qs})}} placeholder={`Question ${i+1}…`}/>
              </div>
            ))}
            <button type="button" onClick={()=>setForm({...form,questions:[...form.questions,'']})} className="text-xs text-violet-600 hover:underline font-medium">+ Add Question</button>
          </div>
          <button onClick={create} className="btn-primary w-full">Create & Send to Students</button>
        </div>
      </Modal>
    </div>
  )
}

function PrinCertificates() {
  const { user, pushNotif } = useAuth()
  const { mockStudents, mockCourses, mockCertificates, issueCertificate } = useData()
  const [modal, setModal] = useState(false)
  const [viewCert, setViewCert] = useState(null)
  const [form, setForm]   = useState({studentId:'',courseId:'',grade:'A'})
  const issue = async ()=>{
    const s = mockStudents.find(x=>x.id===parseInt(form.studentId))
    const c = mockCourses.find(x=>x.id===parseInt(form.courseId))
    if(!s||!c) return
    await issueCertificate({studentId:s.id,studentName:s.name,courseId:c.id,courseName:c.name,issuedBy:user?.name,grade:form.grade})
    await pushNotif('student',`Certificate issued: "${c.name}"`, 'certificate')
    setModal(false); setForm({studentId:'',courseId:'',grade:'A'})
  }
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex justify-end"><button onClick={()=>setModal(true)} className="btn-primary text-xs"><Award className="w-3.5 h-3.5"/>Issue Certificate</button></div>
      <Card>
        <SectionHeader title="Issued Certificates"/>
        <Table columns={[{key:'studentName',label:'Student'},{key:'courseName',label:'Course'},{key:'grade',label:'Grade'},{key:'issuedBy',label:'Issued By'},{key:'issuedAt',label:'Date'},{key:'id',label:'',render:(_,row)=><button onClick={()=>setViewCert(row)} className="text-xs text-blue-600 hover:underline">View</button>}]} data={mockCertificates}/>
      </Card>
      <Modal open={modal} onClose={()=>setModal(false)} title="Issue Certificate">
        <div className="space-y-4">
          <div><label className="label">Student</label><select className="input" value={form.studentId} onChange={e=>setForm({...form,studentId:e.target.value})}><option value="">Select student…</option>{mockStudents.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <div><label className="label">Course</label><select className="input" value={form.courseId} onChange={e=>setForm({...form,courseId:e.target.value})}><option value="">Select course…</option>{mockCourses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div><label className="label">Grade</label><select className="input" value={form.grade} onChange={e=>setForm({...form,grade:e.target.value})}>{['A+','A','A-','B+','B','B-','C+','C','Pass'].map(g=><option key={g}>{g}</option>)}</select></div>
          <button onClick={issue} className="btn-primary w-full">Issue & Notify Student</button>
        </div>
      </Modal>
      {viewCert&&<CertificatePDF cert={viewCert} onClose={()=>setViewCert(null)}/>}
    </div>
  )
}

function PrinMeetings() {
  const { user, pushNotif } = useAuth()
  const { mockMeetings, addMeeting } = useData()
  const [modal, setModal] = useState(false)
  const [form, setForm]   = useState({title:'',date:'',link:'',platform:'teams',invitees:[]})
  const ALLOWED = [
    {name:'Captain',                          role:'captain'},
    {name:'Mohammad Abdullah (Foundation Lead)', role:'foundation_lead'},
    {name:'Asad (Training Ops)',              role:'training_ops'},
    {name:'Stuart (Training Ops)',            role:'training_ops'},
    {name:'Nida',                             role:'nida'},
    {name:'Ali (Academic)',                   role:'academic'},
    {name:'Abdulaziz (Quality)',              role:'academic'},
  ]
  const toggle = (name,role)=>{const e=form.invitees.find(i=>i.name===name);setForm({...form,invitees:e?form.invitees.filter(i=>i.name!==name):[...form.invitees,{name,role}]})}
  const create = async ()=>{
    if(!form.title||!form.date) return
    await addMeeting({...form,createdBy:user?.name,createdByRole:'principal',participants:[user?.name,...form.invitees.map(i=>i.name)],participantRoles:['principal',...form.invitees.map(i=>i.role)],status:'upcoming'})
    for (const i of form.invitees) await pushNotif(i.role,`${user?.name} scheduled: "${form.title}"`, 'meeting')
    setModal(false); setForm({title:'',date:'',link:'',platform:'teams',invitees:[]})
  }
  return (
    <div className="space-y-3 animate-fadeIn">
      <div className="flex justify-end"><button onClick={()=>setModal(true)} className="btn-primary text-xs"><Plus className="w-3.5 h-3.5"/>Schedule Meeting</button></div>
      {mockMeetings.map(m=>(
        <Card key={m.id} className="flex justify-between items-start">
          <div>
            <div className="flex gap-2 mb-1"><p className="font-semibold text-gray-900">{m.title}</p><StatusBadge status={m.status}/>{m.participantRoles?.includes('principal')&&m.createdByRole!=='principal'&&<Badge color="purple">Invited</Badge>}</div>
            <p className="text-xs text-gray-500">{m.date}</p>
            <p className="text-xs text-gray-400 mt-0.5">{m.participants?.join(', ')}</p>
          </div>
          {m.status==='upcoming'&&m.link&&<a href={m.link} target="_blank" rel="noreferrer" className="btn-primary text-xs py-1.5">Join <ExternalLink className="w-3 h-3"/></a>}
        </Card>
      ))}
      <Modal open={modal} onClose={()=>setModal(false)} title="Schedule Meeting" wide>
        <div className="space-y-4">
          <div><label className="label">Title</label><input className="input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></div>
          <div><label className="label">Date & Time</label><input type="datetime-local" className="input" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></div>
          <div><label className="label">Platform</label><select className="input" value={form.platform} onChange={e=>setForm({...form,platform:e.target.value})}><option value="teams">Microsoft Teams</option><option value="google">Google Meet</option><option value="zoom">Zoom</option></select></div>
          <div><label className="label">Meeting Link</label><input className="input" value={form.link} onChange={e=>setForm({...form,link:e.target.value})} placeholder="https://…"/></div>
          <div>
            <label className="label">Select Participants</label>
            <div className="space-y-1.5 max-h-52 overflow-y-auto">
              {ALLOWED.map(inv=>(
                <label key={inv.name} className="flex items-center gap-2 p-2.5 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" className="accent-violet-600" checked={!!form.invitees.find(i=>i.name===inv.name)} onChange={()=>toggle(inv.name,inv.role)}/>
                  <span className="text-sm text-gray-800">{inv.name}</span>
                </label>
              ))}
            </div>
          </div>
          <button onClick={create} className="btn-primary w-full">Create & Notify All</button>
        </div>
      </Modal>
    </div>
  )
}

function PrinReports() {
  const { user, pushNotif } = useAuth()
  const { mockReports, addReport } = useData()
  const [form, setForm] = useState({to:'captain',type:'Academy Summary',period:'',content:''})
  const [file, setFile] = useState(null)
  const [sent, setSent] = useState(false)
  const send = async ()=>{
    if(!form.content.trim()) return
    await addReport({from:user?.name,fromRole:'principal',to:form.to==='captain'?'Captain':'Foundation Lead',type:form.type,period:form.period,content:form.content+(file?` [File: ${file.name}]`:''),fileName:file?.name||null})
    await pushNotif(form.to,`Report from ${user?.name}: "${form.type}"`, 'report')
    setSent(true); setTimeout(()=>setSent(false),2500)
  }
  return (
    <div className="grid lg:grid-cols-2 gap-4 animate-fadeIn">
      <Card>
        <SectionHeader title="Submit Report"/>
        <div className="space-y-3">
          <div><label className="label">Send To</label><select className="input" value={form.to} onChange={e=>setForm({...form,to:e.target.value})}><option value="captain">Captain</option><option value="foundation_lead">Foundation Lead</option></select></div>
          <div><label className="label">Report Type</label><select className="input" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option>Academy Summary</option><option>Student Performance</option><option>Complaint Report</option><option>Operations Report</option><option>Quality Report</option></select></div>
          <div><label className="label">Period</label><input className="input" value={form.period} onChange={e=>setForm({...form,period:e.target.value})} placeholder="e.g. July 2024"/></div>
          <div><label className="label">Content</label><textarea className="input" rows={4} value={form.content} onChange={e=>setForm({...form,content:e.target.value})} placeholder="Report details…"/></div>
          <FileUploadBox onFile={setFile} label="Attach File (optional)" hint="Upload PDF, DOCX, Excel, or image"/>
          {sent?<div className="p-2.5 bg-green-50 text-green-700 rounded-xl text-xs text-center font-medium">✓ Report sent!</div>:<button onClick={send} className="btn-primary w-full"><Send className="w-3.5 h-3.5"/>Send Report</button>}
        </div>
      </Card>
      <Card>
        <SectionHeader title="Report History"/>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {mockReports.map(r=>(
            <div key={r.id} className="p-3 border border-gray-100 rounded-xl">
              <div className="flex justify-between mb-1"><p className="text-xs font-semibold text-gray-900">{r.type}</p><Badge color="purple">{r.fromRole}</Badge></div>
              <p className="text-[10px] text-gray-400">To: {r.to} · {r.sentAt}</p>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{r.content}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function PrinMessages() {
  const { user, pushNotif } = useAuth()
  const { mockMessages, sendMessage } = useData()
  const [form, setForm] = useState({to:'foundation_lead',text:''})
  const msgs = mockMessages.filter(m=>m.fromRole==='principal'||m.toRole==='principal')
  const CONTACTS = [{role:'captain',name:'Captain'},{role:'foundation_lead',name:'Mohammad Abdullah'},{role:'training_ops',name:'Asad / Stuart'},{role:'nida',name:'Nida'},{role:'academic',name:'Academic Team'}]
  const send = async ()=>{
    if(!form.text.trim()) return
    const c=CONTACTS.find(x=>x.role===form.to)
    await sendMessage({fromRole:'principal',from:user?.name,toRole:form.to,to:c?.name,text:form.text})
    await pushNotif(form.to,`Message from ${user?.name}: "${form.text.slice(0,50)}"`, 'message')
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
            <div key={m.id} className={`p-3 rounded-xl text-xs ${m.fromRole==='principal'?'bg-violet-50 ml-4':'bg-gray-50 mr-4'}`}>
              <p className="font-semibold text-gray-700 mb-0.5">{m.fromRole==='principal'?'You → '+m.to:m.from}</p>
              <p className="text-gray-600">{m.text}</p>
              <p className="text-gray-400 mt-1">{m.time}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
