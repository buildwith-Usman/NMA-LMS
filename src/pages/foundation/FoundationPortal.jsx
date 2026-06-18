import { useState } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import Header from '../../components/layout/Header'
import { StatCard, StatusBadge, Badge, Table, SectionHeader, Modal, ProgressBar, MiniStat, SelectFilter, Card, FileUploadBox, CertificatePDF } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { GraduationCap, Users, BookOpen, AlertCircle, Calendar, BarChart3, CheckSquare, Send, Plus, ExternalLink, Award, ClipboardList } from 'lucide-react'

const PAGES = { dashboard:'Foundation Dashboard', team:'My Team', courses:'Courses', students:'Students', attendance:'Attendance', complaints:'Complaints', tasks:'Assign Tasks', surveys:'Surveys', certificates:'Certificates', meetings:'Meetings', messages:'Messages', reports:'Reports' }

export default function FoundationPortal() {
  const [active, setActive] = useState('dashboard')
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar activeKey={active} onNavigate={setActive}/>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={PAGES[active]||active}/>
        <main className="flex-1 overflow-y-auto p-5">
          {active==='dashboard'   && <FLDash/>}
          {active==='team'        && <FLTeam/>}
          {active==='courses'     && <FLCourses/>}
          {active==='students'    && <FLStudents/>}
          {active==='attendance'  && <FLAttendance/>}
          {active==='complaints'  && <FLComplaints/>}
          {active==='tasks'       && <FLTasks/>}
          {active==='surveys'     && <FLSurveys/>}
          {active==='certificates'&& <FLCertificates/>}
          {active==='meetings'    && <FLMeetings/>}
          {active==='messages'    && <FLMessages/>}
          {active==='reports'     && <FLReports/>}
        </main>
      </div>
    </div>
  )
}

function FLDash() {
  const { user } = useAuth()
  const { getStats, mockCourses, mockStudents, mockComplaints, mockTasks, mockSurveys, mockMeetings, mockAttendance } = useData()
  const stats = getStats()
  const [drill, setDrill] = useState(null)
  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="rounded-2xl bg-gradient-to-r from-blue-700 to-blue-900 p-5 text-white">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-white/60 text-xs">Foundation Lead</p>
            <h2 className="font-bold text-2xl mt-0.5">{user?.name} 🧭</h2>
            <p className="text-white/50 text-sm mt-1">Click any stat for detailed breakdown</p>
          </div>
          <div className="text-5xl opacity-10">🧭</div>
        </div>
      </div>

      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">👥 Academy Status</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total Students"   value={stats.totalStudents}       icon={GraduationCap} color="blue"   onClick={()=>setDrill('students')}   clickLabel="View by course"/>
          <StatCard label="At-Risk Students" value={stats.atRisk}              icon={AlertCircle}   color="red"    onClick={()=>setDrill('atrisk')}     clickLabel="View details"/>
          <StatCard label="Active Courses"   value={stats.activeCourses}       icon={BookOpen}      color="teal"   onClick={()=>setDrill('courses')}    clickLabel="View courses"/>
          <StatCard label="Avg Attendance"   value={`${stats.avgAttendance}%`} icon={BarChart3}     color="green"  onClick={()=>setDrill('attendance')} clickLabel="By course"/>
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">⚙️ Operations</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Pending Complaints" value={stats.pendingComplaints}  icon={AlertCircle}   color="amber"  onClick={()=>setDrill('complaints')} clickLabel="View complaints"/>
          <StatCard label="Pending Tasks"      value={stats.pendingTasks}       icon={CheckSquare}   color="orange" onClick={()=>setDrill('tasks')}      clickLabel="View tasks"/>
          <StatCard label="Active Surveys"     value={stats.activeSurveys}      icon={ClipboardList} color="purple" onClick={()=>setDrill('surveys')}    clickLabel="View surveys"/>
          <StatCard label="Meetings"           value={stats.upcomingMeetings}   icon={Calendar}      color="indigo" onClick={()=>setDrill('meetings')}   clickLabel="View meetings"/>
        </div>
      </div>

      <Modal open={drill==='students'} onClose={()=>setDrill(null)} title="Students by Course" wide>
        <div className="flex gap-2 mb-4"><MiniStat label="Total" value={stats.totalStudents} color="blue"/><MiniStat label="Active" value={stats.activeStudents} color="green"/><MiniStat label="At Risk" value={stats.atRisk} color="red"/></div>
        {mockCourses.map(c=>(
          <div key={c.id} className="mb-3 border border-gray-100 rounded-xl p-3">
            <div className="flex justify-between mb-2"><p className="font-semibold text-sm">{c.name}</p><Badge color="blue">{c.enrolledStudents?.length||0}</Badge></div>
            {mockStudents.filter(s=>s.courses?.includes(c.id)).map(s=>(
              <div key={s.id} className="flex justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
                <span className="font-medium">{s.name}</span>
                <div className="flex gap-3"><span className="text-gray-400">{s.attendanceRate}%</span><span className="text-gray-400">GPA {s.gpa}</span><StatusBadge status={s.status}/></div>
              </div>
            ))}
          </div>
        ))}
      </Modal>
      <Modal open={drill==='atrisk'} onClose={()=>setDrill(null)} title="At-Risk Students" wide>
        {mockStudents.filter(s=>s.status==='at-risk').map(s=>(
          <div key={s.id} className="mb-3 p-4 border border-red-100 bg-red-50/30 rounded-xl">
            <div className="flex justify-between mb-2"><p className="font-bold">{s.name}</p><StatusBadge status={s.status}/></div>
            <div className="flex gap-2 mb-2"><MiniStat label="Attendance" value={`${s.attendanceRate}%`} color="red"/><MiniStat label="GPA" value={s.gpa} color="amber"/></div>
            {s.attendanceRate < 70 && <p className="text-xs text-red-600">• Attendance below 70%</p>}
            {s.gpa < 2.5 && <p className="text-xs text-red-600">• GPA below 2.5</p>}
          </div>
        ))}
      </Modal>
      <Modal open={drill==='courses'} onClose={()=>setDrill(null)} title="All Courses" wide>
        {mockCourses.map(c=>(
          <div key={c.id} className="mb-3 p-3 border border-gray-100 rounded-xl">
            <div className="flex justify-between mb-1"><p className="font-semibold text-sm">{c.name}</p><Badge color="teal">{c.progress}%</Badge></div>
            <p className="text-xs text-gray-400">{c.instructor} · {c.enrolledStudents?.length||0} students</p>
            <ProgressBar value={c.progress} color="teal" size="lg" />
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
            </div>
          )
        })}
      </Modal>
      <Modal open={drill==='complaints'} onClose={()=>setDrill(null)} title="Pending Complaints" wide>
        <Table columns={[{key:'from',label:'From'},{key:'subject',label:'Subject'},{key:'priority',label:'Priority',render:v=><Badge color={v==='high'?'red':v==='medium'?'amber':'green'}>{v}</Badge>},{key:'status',label:'Status',render:v=><StatusBadge status={v}/>}]} data={mockComplaints.filter(c=>c.status==='pending')}/>
      </Modal>
      <Modal open={drill==='tasks'} onClose={()=>setDrill(null)} title="All Tasks" wide>
        <Table columns={[{key:'title',label:'Task'},{key:'assignedTo',label:'Assigned To'},{key:'priority',label:'Priority',render:v=><Badge color={v==='high'?'red':v==='medium'?'amber':'green'}>{v}</Badge>},{key:'status',label:'Status',render:v=><StatusBadge status={v}/>}]} data={mockTasks.filter(t=>t.status!=='completed')}/>
      </Modal>
      <Modal open={drill==='surveys'} onClose={()=>setDrill(null)} title="Active Surveys" wide>
        {mockSurveys.filter(s=>s.status==='active').map(s=>(
          <div key={s.id} className="mb-3 p-3 border border-gray-100 rounded-xl">
            <div className="flex justify-between mb-2"><p className="font-semibold text-sm">{s.title}</p><StatusBadge status={s.status}/></div>
            <div className="flex items-center gap-3"><span className="text-xs"><strong>{s.responses.length}</strong>/{s.sent}</span><div className="flex-1"><ProgressBar value={(s.responses.length/s.sent)*100} color="teal"/></div></div>
          </div>
        ))}
      </Modal>
      <Modal open={drill==='meetings'} onClose={()=>setDrill(null)} title="Upcoming Meetings" wide>
        {mockMeetings.filter(m=>m.status==='upcoming').map(m=>(
          <div key={m.id} className="mb-3 p-3 border border-gray-100 rounded-xl">
            <div className="flex justify-between mb-1"><p className="font-semibold text-sm">{m.title}</p><StatusBadge status={m.status}/></div>
            <p className="text-xs text-gray-500">{m.date} · {m.participants?.join(', ')}</p>
          </div>
        ))}
      </Modal>
    </div>
  )
}

function FLTeam() {
  const TEAM = [
    {id:4,name:'Abdullmhun',role:'Student Affairs Assistant',  dept:'Affairs',   status:'active'},
    {id:5,name:'Muflih',    role:'Trainee Affairs Specialist', dept:'Affairs',   status:'active'},
    {id:6,name:'Asad',      role:'Training Ops Manager',       dept:'Operations',status:'active'},
    {id:7,name:'Stuart',    role:'Training Ops Manager',       dept:'Operations',status:'active'},
    {id:13,name:'Essam',    role:'Support Instructor',         dept:'Instructors',status:'active'},
    {id:14,name:'Mohammed Khery',role:'Support Instructor',    dept:'Instructors',status:'active'},
    {id:15,name:'Mohammed Soliman',role:'Support Instructor',  dept:'Instructors',status:'active'},
  ]
  return (
    <Card className="animate-fadeIn">
      <SectionHeader title="Foundation Team"/>
      <Table columns={[{key:'name',label:'Name',render:v=><span className="font-semibold">{v}</span>},{key:'role',label:'Role'},{key:'dept',label:'Dept',render:v=><Badge color="blue">{v}</Badge>},{key:'status',label:'Status',render:v=><StatusBadge status={v}/>}]} data={TEAM}/>
    </Card>
  )
}

function FLCourses() {
  const { mockCourses, mockStudents } = useData()
  const [sel, setSel] = useState(null)
  return (
    <div className="space-y-3 animate-fadeIn">
      {mockCourses.map(c=>(
        <Card key={c.id} className="cursor-pointer hover:shadow-md transition-all" onClick={()=>setSel(c)}>
          <div className="flex justify-between mb-2"><div><p className="font-semibold">{c.name}</p><p className="text-xs text-gray-400">{c.instructor} · {c.enrolledStudents?.length||0} students · Next: {c.nextClass}</p></div><Badge color="teal">{c.progress}%</Badge></div>
          <ProgressBar value={c.progress} color="teal" size="lg"/>
          <p className="text-[10px] text-blue-500 mt-2">↗ Click to see enrolled students</p>
        </Card>
      ))}
      <Modal open={!!sel} onClose={()=>setSel(null)} title={sel?.name||''} wide>
        {sel&&<Table columns={[{key:'name',label:'Student',render:v=><span className="font-medium">{v}</span>},{key:'attendanceRate',label:'Att.',render:v=><span className={v>=80?'text-green-600':v>=60?'text-amber-500':'text-red-500'}>{v}%</span>},{key:'gpa',label:'GPA'},{key:'status',label:'Status',render:v=><StatusBadge status={v}/>}]} data={mockStudents.filter(s=>s.courses?.includes(sel.id))} emptyMsg="No students."/>}
      </Modal>
    </div>
  )
}

function FLStudents() {
  const { mockStudents, mockCourses } = useData()
  const [cid, setCid] = useState('')
  const filtered = mockStudents.filter(s=>cid===''||s.courses?.includes(parseInt(cid)))
  return (
    <Card className="animate-fadeIn">
      <div className="flex gap-3 mb-4"><SelectFilter label="Course" value={cid} onChange={setCid} options={mockCourses.map(c=>({value:String(c.id),label:c.name}))} placeholder="All Courses"/></div>
      <Table columns={[{key:'name',label:'Name',render:v=><span className="font-medium">{v}</span>},{key:'attendanceRate',label:'Att.',render:v=><div className="flex items-center gap-2 min-w-20"><ProgressBar value={v} color={v>=80?'green':v>=60?'amber':'red'}/><span className="text-xs">{v}%</span></div>},{key:'gpa',label:'GPA'},{key:'status',label:'Status',render:v=><StatusBadge status={v}/>}]} data={filtered}/>
    </Card>
  )
}

function FLAttendance() {
  const { mockAttendance, mockCourses } = useData()
  const [cid, setCid] = useState('')
  const recs = mockAttendance.filter(a=>cid===''||a.courseId===parseInt(cid))
  const rate = recs.length?Math.round(recs.filter(r=>r.status==='present').length/recs.length*100):0
  return (
    <Card className="animate-fadeIn">
      <div className="flex gap-3 mb-4"><SelectFilter label="Course" value={cid} onChange={setCid} options={mockCourses.map(c=>({value:String(c.id),label:c.name}))} placeholder="Select Course"/></div>
      {cid&&<div className="flex gap-2 mb-4"><MiniStat label="Present" value={recs.filter(r=>r.status==='present').length} color="green"/><MiniStat label="Absent" value={recs.filter(r=>r.status==='absent').length} color="red"/><MiniStat label="Late" value={recs.filter(r=>r.status==='late').length} color="amber"/><MiniStat label="Rate" value={`${rate}%`} color="blue"/></div>}
      <Table columns={[{key:'studentName',label:'Student'},{key:'courseId',label:'Course',render:v=>mockCourses.find(c=>c.id===v)?.name?.split(' ')[0]||`#${v}`},{key:'date',label:'Date'},{key:'status',label:'Status',render:v=><StatusBadge status={v}/>}]} data={recs} emptyMsg="Select a course to view records."/>
    </Card>
  )
}

function FLComplaints() {
  const { user } = useAuth()
  const { mockComplaints, updateComplaint } = useData()
  const [priority, setPriority] = useState('')
  const [status,   setStatus]   = useState('')
  const [modal, setModal]   = useState(null)
  const [note, setNote]     = useState('')
  const filtered = mockComplaints.filter(c=>(priority===''||c.priority===priority)&&(status===''||c.status===status))
  const update = async (id, st)=>{
    await updateComplaint(id, st, note, user?.name)
    setModal(null); setNote('')
  }
  return (
    <div className="space-y-4 animate-fadeIn">
      <Card>
        <div className="flex flex-wrap gap-3 mb-4">
          <SelectFilter label="Priority" value={priority} onChange={setPriority} options={[{value:'high',label:'🔴 High'},{value:'medium',label:'🟡 Medium'},{value:'low',label:'🟢 Low'}]} placeholder="All Priorities"/>
          <SelectFilter label="Status" value={status} onChange={setStatus} options={[{value:'pending',label:'Pending'},{value:'in-review',label:'In Review'},{value:'resolved',label:'Resolved'}]} placeholder="All Status"/>
        </div>
        <div className="flex gap-2 mb-4"><MiniStat label="High" value={mockComplaints.filter(c=>c.priority==='high').length} color="red"/><MiniStat label="Pending" value={mockComplaints.filter(c=>c.status==='pending').length} color="amber"/><MiniStat label="Resolved" value={mockComplaints.filter(c=>c.status==='resolved').length} color="green"/></div>
        <div className="space-y-2">
          {filtered.map(c=>(
            <div key={c.id} className="p-3 border border-gray-100 rounded-xl">
              <div className="flex justify-between mb-1">
                <div><p className="font-medium text-sm text-gray-900">{c.subject}</p><p className="text-xs text-gray-400">{c.from} · {c.date}</p></div>
                <div className="flex gap-2 items-start"><Badge color={c.priority==='high'?'red':c.priority==='medium'?'amber':'green'}>{c.priority}</Badge><StatusBadge status={c.status}/></div>
              </div>
              <p className="text-xs text-gray-500 mb-2">{c.desc}</p>
              <button onClick={()=>setModal(c)} className="text-xs text-blue-600 font-medium hover:underline">Update Status →</button>
            </div>
          ))}
        </div>
      </Card>
      <Modal open={!!modal} onClose={()=>setModal(null)} title={`Update: ${modal?.subject||''}`}>
        <div className="space-y-4">
          <div><label className="label">New Status</label>
            <div className="flex gap-2">
              {['in-review','resolved'].map(s=>(
                <button key={s} onClick={()=>update(modal?.id,s)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-medium capitalize hover:bg-gray-50 transition-colors">{s.replace('-',' ')}</button>
              ))}
            </div>
          </div>
          <div><label className="label">Note</label><textarea className="input" rows={3} value={note} onChange={e=>setNote(e.target.value)} placeholder="Add a note…"/></div>
        </div>
      </Modal>
    </div>
  )
}

function FLTasks() {
  const { user, pushNotif } = useAuth()
  const { mockTasks, addTask, updateTask } = useData()
  const [modal, setModal] = useState(false)
  const [form, setForm]   = useState({title:'',assignedTo:'Abdullmhun',assignedToRole:'affairs',dueDate:'',priority:'medium',note:''})
  const TEAM = [{name:'Abdullmhun',role:'affairs'},{name:'Muflih',role:'affairs'},{name:'Asad',role:'training_ops'},{name:'Stuart',role:'training_ops'},{name:'Essam',role:'instructor'},{name:'Mohammed Khery',role:'instructor'}]
  const add = async ()=>{
    if(!form.title) return
    const t=TEAM.find(x=>x.name===form.assignedTo)
    await addTask({...form,assignedBy:user?.name,assignedToRole:t?.role||'affairs'})
    await pushNotif(t?.role||'affairs',`Task from ${user?.name}: "${form.title}"`, 'task')
    setModal(false); setForm({title:'',assignedTo:'Abdullmhun',assignedToRole:'affairs',dueDate:'',priority:'medium',note:''})
  }
  const update = async (id,status)=>{ await updateTask(id,status) }
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex justify-end"><button onClick={()=>setModal(true)} className="btn-primary text-xs"><Plus className="w-3.5 h-3.5"/>Assign Task</button></div>
      <Card>
        <div className="space-y-2">
          {mockTasks.map(t=>(
            <div key={t.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
              <div><p className="font-medium text-sm text-gray-900">{t.title}</p><p className="text-xs text-gray-400">→ {t.assignedTo} · Due: {t.dueDate}</p></div>
              <div className="flex gap-2 items-center"><Badge color={t.priority==='high'?'red':t.priority==='medium'?'amber':'green'}>{t.priority}</Badge><StatusBadge status={t.status}/></div>
            </div>
          ))}
        </div>
      </Card>
      <Modal open={modal} onClose={()=>setModal(false)} title="Assign Task">
        <div className="space-y-4">
          <div><label className="label">Task</label><input className="input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Task description…"/></div>
          <div><label className="label">Assign To</label><select className="input" value={form.assignedTo} onChange={e=>{const t=TEAM.find(x=>x.name===e.target.value);setForm({...form,assignedTo:e.target.value,assignedToRole:t?.role||''})}}>{TEAM.map(t=><option key={t.name}>{t.name}</option>)}</select></div>
          <div><label className="label">Due Date</label><input type="date" className="input" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})}/></div>
          <div><label className="label">Priority</label><select className="input" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
          <div><label className="label">Note</label><textarea className="input" rows={2} value={form.note} onChange={e=>setForm({...form,note:e.target.value})}/></div>
          <button onClick={add} className="btn-primary w-full">Assign & Notify</button>
        </div>
      </Modal>
    </div>
  )
}

function FLSurveys() {
  const { user, pushNotif } = useAuth()
  const { mockSurveys, mockStudents, addSurvey } = useData()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({title:'',deadline:'',questions:['','']})
  const create = async ()=>{
    const qs=form.questions.filter(q=>q.trim()).map((q,i)=>({id:i+1,text:q}))
    await addSurvey({title:form.title,createdBy:user?.name,deadline:form.deadline,status:'active',sentTo:'students',questions:qs,sent:mockStudents.length})
    await pushNotif('student',`New survey: "${form.title}"`, 'survey')
    setModal(false); setForm({title:'',deadline:'',questions:['','']})
  }
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex justify-end"><button onClick={()=>setModal(true)} className="btn-primary text-xs"><Plus className="w-3.5 h-3.5"/>Create Survey</button></div>
      {mockSurveys.map(s=>(
        <Card key={s.id}>
          <div className="flex justify-between mb-2"><div><p className="font-semibold">{s.title}</p><p className="text-xs text-gray-400">By {s.createdBy} · Due: {s.deadline}</p></div><StatusBadge status={s.status}/></div>
          <div className="flex items-center gap-3"><span className="text-sm font-bold text-teal-600">{s.responses.length}</span><span className="text-xs text-gray-400">/ {s.sent} responded</span><div className="flex-1"><ProgressBar value={(s.responses.length/s.sent)*100} color="teal" size="lg"/></div></div>
        </Card>
      ))}
      <Modal open={modal} onClose={()=>setModal(false)} title="Create Survey" wide>
        <div className="space-y-4">
          <div><label className="label">Title</label><input className="input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></div>
          <div><label className="label">Deadline</label><input type="date" className="input" value={form.deadline} onChange={e=>setForm({...form,deadline:e.target.value})}/></div>
          <div>
            <label className="label">Questions</label>
            {form.questions.map((q,i)=>(
              <div key={i} className="flex gap-2 mb-2"><span className="text-xs text-gray-400 mt-2.5 w-4">{i+1}.</span><input className="input flex-1" value={q} onChange={e=>{const qs=[...form.questions];qs[i]=e.target.value;setForm({...form,questions:qs})}} placeholder={`Question ${i+1}…`}/></div>
            ))}
            <button type="button" onClick={()=>setForm({...form,questions:[...form.questions,'']})} className="text-xs text-blue-600 hover:underline font-medium">+ Add Question</button>
          </div>
          <button onClick={create} className="btn-primary w-full">Create Survey & Notify</button>
        </div>
      </Modal>
    </div>
  )
}

function FLCertificates() {
  const { user, pushNotif } = useAuth()
  const { mockStudents, mockCourses, mockCertificates, issueCertificate } = useData()
  const [modal, setModal]   = useState(false)
  const [viewCert, setViewCert] = useState(null)
  const [form, setForm]     = useState({studentId:'',courseId:'',grade:'A'})
  const issue = async ()=>{
    const s=mockStudents.find(x=>x.id===parseInt(form.studentId))
    const c=mockCourses.find(x=>x.id===parseInt(form.courseId))
    if(!s||!c) return
    await issueCertificate({studentId:s.id,studentName:s.name,courseId:c.id,courseName:c.name,issuedBy:user?.name,grade:form.grade})
    await pushNotif('student',`Certificate issued: "${c.name}"`, 'certificate')
    setModal(false); setForm({studentId:'',courseId:'',grade:'A'})
  }
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex justify-end"><button onClick={()=>setModal(true)} className="btn-primary text-xs"><Award className="w-3.5 h-3.5"/>Issue Certificate</button></div>
      <Card>
        <Table columns={[{key:'studentName',label:'Student'},{key:'courseName',label:'Course'},{key:'grade',label:'Grade'},{key:'issuedBy',label:'Issued By'},{key:'issuedAt',label:'Date'},{key:'id',label:'',render:(_,row)=><button onClick={()=>setViewCert(row)} className="text-xs text-blue-600 hover:underline">View</button>}]} data={mockCertificates}/>
      </Card>
      <Modal open={modal} onClose={()=>setModal(false)} title="Issue Certificate">
        <div className="space-y-4">
          <div><label className="label">Student</label><select className="input" value={form.studentId} onChange={e=>setForm({...form,studentId:e.target.value})}><option value="">Select…</option>{mockStudents.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <div><label className="label">Course</label><select className="input" value={form.courseId} onChange={e=>setForm({...form,courseId:e.target.value})}><option value="">Select…</option>{mockCourses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div><label className="label">Grade</label><select className="input" value={form.grade} onChange={e=>setForm({...form,grade:e.target.value})}>{['A+','A','A-','B+','B','B-','C+','C','Pass'].map(g=><option key={g}>{g}</option>)}</select></div>
          <button onClick={issue} className="btn-primary w-full">Issue & Notify Student</button>
        </div>
      </Modal>
      {viewCert&&<CertificatePDF cert={viewCert} onClose={()=>setViewCert(null)}/>}
    </div>
  )
}

function FLMeetings() {
  const { user, pushNotif } = useAuth()
  const { mockMeetings, addMeeting } = useData()
  const [modal, setModal] = useState(false)
  const [form, setForm]   = useState({title:'',date:'',link:'',platform:'teams',invitees:[]})
  const ALLOWED = [
    {name:'Captain',role:'captain'},{name:'Principal',role:'principal'},
    {name:'Abdullmhun',role:'affairs'},{name:'Muflih',role:'affairs'},
    {name:'Asad',role:'training_ops'},{name:'Stuart',role:'training_ops'},
    {name:'Essam',role:'instructor'},{name:'Mohammed Khery',role:'instructor'},
    {name:'Mohammed Soliman',role:'instructor'},
  ]
  const toggle = (name,role)=>{const e=form.invitees.find(i=>i.name===name);setForm({...form,invitees:e?form.invitees.filter(i=>i.name!==name):[...form.invitees,{name,role}]})}
  const create = async ()=>{
    if(!form.title||!form.date) return
    await addMeeting({...form,createdBy:user?.name,createdByRole:'foundation_lead',participants:[user?.name,...form.invitees.map(i=>i.name)],participantRoles:['foundation_lead',...form.invitees.map(i=>i.role)],status:'upcoming'})
    for (const i of form.invitees) await pushNotif(i.role,`${user?.name} scheduled: "${form.title}"`, 'meeting')
    setModal(false); setForm({title:'',date:'',link:'',platform:'teams',invitees:[]})
  }
  const myMeetings = mockMeetings.filter(m=>m.participantRoles?.includes('foundation_lead')||m.createdByRole==='foundation_lead')
  return (
    <div className="space-y-3 animate-fadeIn">
      <div className="flex justify-end"><button onClick={()=>setModal(true)} className="btn-primary text-xs"><Plus className="w-3.5 h-3.5"/>Schedule Meeting</button></div>
      {myMeetings.map(m=>(
        <Card key={m.id} className="flex justify-between items-start">
          <div>
            <div className="flex gap-2 mb-1"><p className="font-semibold text-gray-900">{m.title}</p><StatusBadge status={m.status}/></div>
            <p className="text-xs text-gray-500">{m.date}</p>
            <p className="text-xs text-gray-400 mt-0.5">{m.participants?.join(', ')}</p>
          </div>
          {m.status==='upcoming'&&m.link&&<a href={m.link} target="_blank" rel="noreferrer" className="btn-primary text-xs py-1.5">Join<ExternalLink className="w-3 h-3"/></a>}
        </Card>
      ))}
      <Modal open={modal} onClose={()=>setModal(false)} title="Schedule Meeting" wide>
        <div className="space-y-4">
          <div><label className="label">Title</label><input className="input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></div>
          <div><label className="label">Date & Time</label><input type="datetime-local" className="input" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></div>
          <div><label className="label">Platform</label><select className="input" value={form.platform} onChange={e=>setForm({...form,platform:e.target.value})}><option value="teams">Microsoft Teams</option><option value="google">Google Meet</option><option value="zoom">Zoom</option></select></div>
          <div><label className="label">Link</label><input className="input" value={form.link} onChange={e=>setForm({...form,link:e.target.value})} placeholder="https://…"/></div>
          <div>
            <label className="label">Select Participants</label>
            <div className="grid grid-cols-2 gap-1.5">
              {ALLOWED.map(inv=>(
                <label key={inv.name} className="flex items-center gap-2 p-2 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" className="accent-blue-700" checked={!!form.invitees.find(i=>i.name===inv.name)} onChange={()=>toggle(inv.name,inv.role)}/>
                  <span className="text-xs text-gray-800">{inv.name}</span>
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

function FLMessages() {
  const { user, pushNotif } = useAuth()
  const { mockMessages, sendMessage } = useData()
  const [form, setForm] = useState({to:'captain',text:''})
  const msgs = mockMessages.filter(m=>m.fromRole==='foundation_lead'||m.toRole==='foundation_lead')
  const CONTACTS = [{role:'captain',name:'Captain'},{role:'principal',name:'Principal'},{role:'affairs',name:'Affairs Team'},{role:'training_ops',name:'Training Ops'},{role:'instructor',name:'Instructors'}]
  const send = async ()=>{
    if(!form.text.trim()) return
    const c=CONTACTS.find(x=>x.role===form.to)
    await sendMessage({fromRole:'foundation_lead',from:user?.name,toRole:form.to,to:c?.name,text:form.text})
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
          {msgs.length===0&&<p className="text-xs text-gray-400 text-center py-8">No messages</p>}
          {msgs.map(m=>(
            <div key={m.id} className={`p-3 rounded-xl text-xs ${m.fromRole==='foundation_lead'?'bg-blue-50 ml-4':'bg-gray-50 mr-4'}`}>
              <p className="font-semibold text-gray-700 mb-0.5">{m.fromRole==='foundation_lead'?'You → '+m.to:m.from}</p>
              <p className="text-gray-600">{m.text}</p>
              <p className="text-gray-400 mt-1">{m.time}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function FLReports() {
  const { user, pushNotif } = useAuth()
  const { mockReports, addReport } = useData()
  const [form, setForm] = useState({to:'captain',type:'Foundation Summary',period:'',content:''})
  const [file, setFile] = useState(null)
  const [sent, setSent] = useState(false)
  const send = async ()=>{
    if(!form.content.trim()) return
    await addReport({from:user?.name,fromRole:'foundation_lead',to:form.to==='captain'?'Captain':'Principal',type:form.type,period:form.period,content:form.content+(file?` [Attachment: ${file.name}]`:''),fileName:file?.name||null})
    await pushNotif(form.to,`Report from ${user?.name}: "${form.type}"`, 'report')
    setSent(true); setTimeout(()=>setSent(false),2500)
  }
  return (
    <div className="grid lg:grid-cols-2 gap-4 animate-fadeIn">
      <Card>
        <SectionHeader title="Submit Report"/>
        <div className="space-y-3">
          <div><label className="label">Send To</label><select className="input" value={form.to} onChange={e=>setForm({...form,to:e.target.value})}><option value="captain">Captain</option><option value="principal">Principal</option></select></div>
          <div><label className="label">Type</label><select className="input" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option>Foundation Summary</option><option>Student Performance</option><option>Complaint Report</option><option>Attendance Report</option></select></div>
          <div><label className="label">Content</label><textarea className="input" rows={4} value={form.content} onChange={e=>setForm({...form,content:e.target.value})} placeholder="Report content…"/></div>
          <FileUploadBox onFile={setFile} label="Attach File" hint="Upload PDF, DOCX, or image"/>
          {sent?<div className="p-2.5 bg-green-50 text-green-700 rounded-xl text-xs text-center font-medium">✓ Report sent!</div>:<button onClick={send} className="btn-primary w-full"><Send className="w-3.5 h-3.5"/>Send Report</button>}
        </div>
      </Card>
      <Card>
        <SectionHeader title="Sent Reports"/>
        {mockReports.filter(r=>r.fromRole==='foundation_lead').map(r=>(
          <div key={r.id} className="p-3 border border-gray-100 rounded-xl mb-2">
            <div className="flex justify-between mb-1"><p className="text-xs font-semibold text-gray-900">{r.type}</p><Badge color="blue">To: {r.to}</Badge></div>
            <p className="text-[10px] text-gray-400">{r.sentAt}</p>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{r.content}</p>
          </div>
        ))}
      </Card>
    </div>
  )
}
