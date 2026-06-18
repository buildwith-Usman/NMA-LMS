import { useState } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import Header from '../../components/layout/Header'
import { StatCard, StatusBadge, Badge, Table, SectionHeader, Modal, MiniStat, SelectFilter, Card, FileUploadBox, ProgressBar } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { GraduationCap, Users, BookOpen, ClipboardList, FileText, CheckSquare, Star, Calendar, BarChart3, Plus, Send, Trash2 } from 'lucide-react'

const PAGES = { dashboard:'Academic Dashboard', students:'Students', instructors:'Instructors', courses:'Courses', attendance:'Attendance', assignments:'Assignments', quizzes:'Quizzes', quality:'Quality Assurance', meetings:'Meetings', tasks:'My Tasks', reports:'Reports' }

export default function AcademicPortal() {
  const [active, setActive] = useState('dashboard')
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar activeKey={active} onNavigate={setActive}/>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={PAGES[active]||active}/>
        <main className="flex-1 overflow-y-auto p-5">
          {active==='dashboard'   && <AcaDash onNavigate={setActive}/>}
          {active==='students'    && <AcaStudents/>}
          {active==='instructors' && <AcaInstructors/>}
          {active==='courses'     && <AcaCourses/>}
          {active==='attendance'  && <AcaAttendance/>}
          {active==='assignments' && <AcaAssignments/>}
          {active==='quizzes'     && <AcaQuizzes/>}
          {active==='quality'     && <AcaQuality/>}
          {active==='meetings'    && <AcaMeetings/>}
          {active==='tasks'       && <AcaTasks/>}
          {active==='reports'     && <AcaReports/>}
        </main>
      </div>
    </div>
  )
}

function AcaDash({ onNavigate }) {
  const { user } = useAuth()
  const { getStats, mockStudents, mockInstructors, mockCourses, mockAttendance, mockTasks } = useData()
  const stats = getStats()
  const [drill, setDrill] = useState(null)
  const myTasks = mockTasks.filter(t=>t.assignedToRole==='academic')
  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-green-800 p-5 text-white">
        <p className="text-white/60 text-xs">Academic Team</p>
        <h2 className="font-bold text-2xl mt-0.5">{user?.name} 📐</h2>
        <p className="text-white/50 text-sm mt-1">Manage students, instructors and academic records · Click stats for details</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Students"   value={stats.totalStudents}    icon={GraduationCap} color="blue"   onClick={()=>setDrill('students')}    clickLabel="View all students"/>
        <StatCard label="Instructors"      value={stats.totalInstructors} icon={Users}         color="indigo" onClick={()=>setDrill('instructors')} clickLabel="View instructors"/>
        <StatCard label="Active Courses"   value={stats.activeCourses}    icon={BookOpen}      color="teal"   onClick={()=>setDrill('courses')}    clickLabel="View courses"/>
        <StatCard label="At-Risk Students" value={stats.atRisk}           icon={Star}          color="red"    onClick={()=>setDrill('atrisk')}     clickLabel="View at-risk"/>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Assignments" value={stats.totalAssignments} icon={FileText}    color="amber"  onClick={()=>onNavigate('assignments')} clickLabel="View assignments"/>
        <StatCard label="Quizzes"     value={stats.totalQuizzes}     icon={CheckSquare} color="purple" onClick={()=>onNavigate('quizzes')}    clickLabel="View quizzes"/>
        <StatCard label="Avg Attend." value={`${stats.avgAttendance}%`} icon={ClipboardList} color="green" onClick={()=>setDrill('attendance')} clickLabel="By course"/>
        <StatCard label="My Tasks"    value={myTasks.filter(t=>t.status!=='completed').length} icon={CheckSquare} color="orange" onClick={()=>onNavigate('tasks')} clickLabel="View tasks"/>
      </div>
      <Modal open={drill==='students'} onClose={()=>setDrill(null)} title="All Students" wide>
        <Table columns={[{key:'name',label:'Name',render:v=><span className="font-medium">{v}</span>},{key:'attendanceRate',label:'Att.',render:v=><span className={v>=80?'text-green-600':v>=60?'text-amber-500':'text-red-500'}>{v}%</span>},{key:'gpa',label:'GPA'},{key:'status',label:'Status',render:v=><StatusBadge status={v}/>}]} data={mockStudents}/>
      </Modal>
      <Modal open={drill==='atrisk'} onClose={()=>setDrill(null)} title="At-Risk Students" wide>
        {mockStudents.filter(s=>s.status==='at-risk').map(s=>(
          <div key={s.id} className="mb-3 p-3 border border-red-100 bg-red-50/30 rounded-xl">
            <div className="flex justify-between mb-2"><p className="font-semibold">{s.name}</p><StatusBadge status={s.status}/></div>
            <div className="flex gap-2"><MiniStat label="Att." value={`${s.attendanceRate}%`} color="red"/><MiniStat label="GPA" value={s.gpa} color="amber"/></div>
          </div>
        ))}
      </Modal>
      <Modal open={drill==='instructors'} onClose={()=>setDrill(null)} title="All Instructors" wide>
        <Table columns={[{key:'name',label:'Name',render:v=><span className="font-medium">{v}</span>},{key:'sub',label:'Role'},{key:'students',label:'Students',render:v=><Badge color="blue">{v}</Badge>}]} data={mockInstructors}/>
      </Modal>
      <Modal open={drill==='courses'} onClose={()=>setDrill(null)} title="All Courses" wide>
        {mockCourses.map(c=>(
          <div key={c.id} className="mb-3 p-3 border border-gray-100 rounded-xl">
            <div className="flex justify-between mb-1"><p className="font-semibold text-sm">{c.name}</p><Badge color="teal">{c.progress}%</Badge></div>
            <ProgressBar value={c.progress} color="teal"/>
          </div>
        ))}
      </Modal>
      <Modal open={drill==='attendance'} onClose={()=>setDrill(null)} title="Attendance by Course" wide>
        {mockCourses.map(c=>{const recs=mockAttendance.filter(a=>a.courseId===c.id);const rate=recs.length?Math.round(recs.filter(r=>r.status==='present').length/recs.length*100):0;return(
          <div key={c.id} className="mb-3 p-3 border border-gray-100 rounded-xl">
            <div className="flex justify-between mb-1"><p className="font-semibold text-sm">{c.name}</p><span className={`font-bold text-sm ${rate>=80?'text-green-600':rate>=60?'text-amber-500':'text-red-500'}`}>{rate}%</span></div>
            <ProgressBar value={rate} color={rate>=80?'green':rate>=60?'amber':'red'} size="lg"/>
          </div>
        )})}
      </Modal>
    </div>
  )
}

function AcaStudents() {
  const { mockStudents, createStudentWithAuth, updateStudent, deleteStudent } = useData()
  const [modal, setModal] = useState(false)
  const [form, setForm]   = useState({name:'',email:'',password:'',phone:'',admissionDate:''})
  const [err, setErr]     = useState('')
  const [busy, setBusy]   = useState(false)
  const add = async ()=>{
    if(!form.name||!form.email||!form.password) return setErr('Name, email and password are required.')
    if(form.password.length < 6) return setErr('Password must be at least 6 characters.')
    setBusy(true); setErr('')
    try {
      const result = await createStudentWithAuth(form)
      if(result?.error) { setErr(result.error); return }
      setModal(false); setForm({name:'',email:'',password:'',phone:'',admissionDate:''})
    } catch(e) {
      setErr(e.message || 'Unexpected error')
    } finally {
      setBusy(false)
    }
  }
  const del = async id=>{ if(window.confirm('Delete this student?')) await deleteStudent(id) }
  const toggle = async (id, current)=>{ await updateStudent(id, { status: current==='active'?'inactive':'active' }) }
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex justify-end"><button onClick={()=>{setModal(true);setErr('')}} className="btn-primary text-xs"><Plus className="w-3.5 h-3.5"/>Add Student</button></div>
      <Card>
        <Table columns={[
          {key:'name',label:'Name',render:v=><span className="font-medium">{v}</span>},
          {key:'email',label:'Email'},{key:'phone',label:'Phone'},
          {key:'attendanceRate',label:'Att.',render:v=><span className={v>=80?'text-green-600':v>=60?'text-amber-500':'text-red-500'}>{v}%</span>},
          {key:'gpa',label:'GPA'},
          {key:'status',label:'Status',render:v=><StatusBadge status={v}/>},
          {key:'id',label:'',render:(_,row)=>(
            <div className="flex gap-1.5 justify-end">
              <button onClick={()=>toggle(row.id,row.status)} className={`text-xs px-2 py-1 rounded-lg font-medium ${row.status==='active'?'bg-amber-50 text-amber-700 hover:bg-amber-100':'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                {row.status==='active'?'Deactivate':'Activate'}
              </button>
              <button onClick={()=>del(row.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-3.5 h-3.5"/></button>
            </div>
          )}
        ]} data={mockStudents}/>
      </Card>
      <Modal open={modal} onClose={()=>setModal(false)} title="Add Student & Create Login">
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-xl text-xs text-blue-700 font-medium">Student will be able to login with these credentials immediately.</div>
          <div><label className="label">Full Name</label><input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Student full name"/></div>
          <div><label className="label">Email (Login username)</label><input type="email" className="input" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
          <div><label className="label">Password</label><input type="password" className="input" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Min 6 characters"/></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div>
          <div><label className="label">Admission Date</label><input type="date" className="input" value={form.admissionDate} onChange={e=>setForm({...form,admissionDate:e.target.value})}/></div>
          {err&&<div className="p-2.5 bg-red-50 text-red-700 rounded-xl text-xs font-medium">{err}</div>}
          <button onClick={add} disabled={busy} className="btn-primary w-full disabled:opacity-60">{busy?'Creating account…':'Add Student & Create Login'}</button>
        </div>
      </Modal>
    </div>
  )
}

function AcaInstructors() {
  const { mockInstructors, createInstructorWithAuth, updateInstructor } = useData()
  const [modal, setModal]       = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm]         = useState({name:'',email:'',password:'',phone:'',sub:''})
  const [editForm, setEditForm] = useState({name:'',email:'',phone:'',sub:''})
  const [err, setErr]           = useState('')
  const [busy, setBusy]         = useState(false)
  const add = async ()=>{
    if(!form.name||!form.email||!form.password) return setErr('Name, email and password are required.')
    if(form.password.length < 6) return setErr('Password must be at least 6 characters.')
    setBusy(true); setErr('')
    try {
      const result = await createInstructorWithAuth(form)
      if(result?.error) { setErr(result.error); return }
      setModal(false); setForm({name:'',email:'',password:'',phone:'',sub:''})
    } catch(e) {
      setErr(e.message || 'Unexpected error')
    } finally {
      setBusy(false)
    }
  }
  const openEdit = ins=>{ setEditForm({name:ins.name,email:ins.email,phone:ins.phone,sub:ins.sub}); setEditTarget(ins) }
  const saveEdit = async ()=>{
    if(!editForm.name) return
    await updateInstructor(editTarget.id, editForm)
    setEditTarget(null)
  }
  const toggle = async (id, current)=>{ await updateInstructor(id, { status: current==='active'?'inactive':'active' }) }
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex justify-end"><button onClick={()=>{setModal(true);setErr('')}} className="btn-primary text-xs"><Plus className="w-3.5 h-3.5"/>Add Instructor</button></div>
      <Card>
        <Table columns={[
          {key:'name',label:'Name',render:v=><span className="font-medium">{v}</span>},
          {key:'sub',label:'Role'},{key:'email',label:'Email'},
          {key:'students',label:'Students',render:v=><Badge color="blue">{v}</Badge>},
          {key:'status',label:'Status',render:v=><StatusBadge status={v}/>},
          {key:'id',label:'',render:(_,row)=>(
            <div className="flex gap-1.5 justify-end">
              <button onClick={()=>openEdit(row)} className="text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium">Edit</button>
              <button onClick={()=>toggle(row.id,row.status)} className={`text-xs px-2 py-1 rounded-lg font-medium ${row.status==='active'?'bg-amber-50 text-amber-700 hover:bg-amber-100':'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                {row.status==='active'?'Deactivate':'Activate'}
              </button>
            </div>
          )}
        ]} data={mockInstructors}/>
      </Card>
      <Modal open={modal} onClose={()=>setModal(false)} title="Add Instructor & Create Login">
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-xl text-xs text-blue-700 font-medium">Instructor will be able to login with these credentials immediately.</div>
          <div><label className="label">Full Name</label><input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
          <div><label className="label">Email (Login username)</label><input type="email" className="input" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
          <div><label className="label">Password</label><input type="password" className="input" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Min 6 characters"/></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div>
          <div><label className="label">Role / Specialization</label><input className="input" value={form.sub} onChange={e=>setForm({...form,sub:e.target.value})} placeholder="e.g. Support Instructor"/></div>
          {err&&<div className="p-2.5 bg-red-50 text-red-700 rounded-xl text-xs font-medium">{err}</div>}
          <button onClick={add} disabled={busy} className="btn-primary w-full disabled:opacity-60">{busy?'Creating account…':'Add Instructor & Create Login'}</button>
        </div>
      </Modal>
      <Modal open={!!editTarget} onClose={()=>setEditTarget(null)} title={`Edit: ${editTarget?.name||''}`}>
        <div className="space-y-4">
          <div><label className="label">Full Name</label><input className="input" value={editForm.name} onChange={e=>setEditForm({...editForm,name:e.target.value})}/></div>
          <div><label className="label">Email</label><input type="email" className="input" value={editForm.email} onChange={e=>setEditForm({...editForm,email:e.target.value})}/></div>
          <div><label className="label">Phone</label><input className="input" value={editForm.phone} onChange={e=>setEditForm({...editForm,phone:e.target.value})}/></div>
          <div><label className="label">Role / Specialization</label><input className="input" value={editForm.sub} onChange={e=>setEditForm({...editForm,sub:e.target.value})}/></div>
          <button onClick={saveEdit} className="btn-primary w-full">Save Changes</button>
        </div>
      </Modal>
    </div>
  )
}

function AcaCourses() {
  const { mockCourses, mockInstructors, mockStudents, addCourse, updateCourse, deleteCourse } = useData()
  const [sel, setSel]             = useState(null)
  const [addModal, setAddModal]   = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [delTarget, setDelTarget] = useState(null)
  const [form, setForm]           = useState({name:'',instructorId:'',instructor:'',nextClass:''})
  const [editForm, setEditForm]   = useState({name:'',instructorId:'',instructor:'',nextClass:'',teamsLink:'',classroomLink:''})
  const add = async ()=>{
    if(!form.name) return
    const ins=mockInstructors.find(i=>i.id===parseInt(form.instructorId))
    await addCourse({...form,instructorId:parseInt(form.instructorId),instructor:ins?.name||form.instructor,progress:0})
    setAddModal(false); setForm({name:'',instructorId:'',instructor:'',nextClass:''})
  }
  const openEdit = c=>{ setEditForm({name:c.name,instructorId:String(c.instructorId||''),instructor:c.instructor,nextClass:c.nextClass,teamsLink:c.teamsLink||'',classroomLink:c.classroomLink||''}); setEditTarget(c) }
  const saveEdit = async ()=>{
    const ins=mockInstructors.find(i=>i.id===parseInt(editForm.instructorId))
    await updateCourse(editTarget.id,{...editForm,instructorId:parseInt(editForm.instructorId)||editTarget.instructorId,instructor:ins?.name||editForm.instructor})
    setEditTarget(null)
  }
  const confirmDel = async ()=>{ await deleteCourse(delTarget.id); setDelTarget(null) }
  return (
    <div className="space-y-3 animate-fadeIn">
      <div className="flex justify-end"><button onClick={()=>setAddModal(true)} className="btn-primary text-xs"><Plus className="w-3.5 h-3.5"/>Add Course</button></div>
      {mockCourses.map(c=>(
        <Card key={c.id}>
          <div className="flex justify-between mb-2">
            <div><p className="font-semibold">{c.name}</p><p className="text-xs text-gray-400">{c.instructor}</p></div>
            <div className="flex items-start gap-3">
              <div className="text-center"><p className="text-xl font-bold text-teal-600 leading-tight">{c.enrolledStudents?.length||0}</p><p className="text-[10px] text-gray-400">enrolled</p></div>
              <Badge color="teal">{c.progress}%</Badge>
            </div>
          </div>
          <ProgressBar value={c.progress} color="teal" size="lg"/>
          <div className="flex gap-2 mt-3">
            <button onClick={()=>setSel(c)} className="btn-secondary text-xs py-1.5 flex-1">View Students</button>
            <button onClick={()=>openEdit(c)} className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium">Edit</button>
            <button onClick={()=>setDelTarget(c)} className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-medium">Delete</button>
          </div>
        </Card>
      ))}
      <Modal open={!!sel} onClose={()=>setSel(null)} title={`${sel?.name||''} — Enrolled Students (${sel?mockStudents.filter(s=>s.courses?.includes(sel.id)).length:0})`} wide>
        {sel&&<Table columns={[{key:'name',label:'Student',render:v=><span className="font-medium">{v}</span>},{key:'attendanceRate',label:'Att.',render:v=><span className={v>=80?'text-green-600':v>=60?'text-amber-500':'text-red-500'}>{v}%</span>},{key:'gpa',label:'GPA'},{key:'status',label:'Status',render:v=><StatusBadge status={v}/>}]} data={mockStudents.filter(s=>s.courses?.includes(sel.id))} emptyMsg="No students enrolled yet."/>}
      </Modal>
      <Modal open={addModal} onClose={()=>setAddModal(false)} title="Add Course">
        <div className="space-y-4">
          <div><label className="label">Course Name</label><input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
          <div><label className="label">Instructor</label><select className="input" value={form.instructorId} onChange={e=>{const ins=mockInstructors.find(i=>i.id===parseInt(e.target.value));setForm({...form,instructorId:e.target.value,instructor:ins?.name||''})}}><option value="">Select instructor…</option>{mockInstructors.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}</select></div>
          <div><label className="label">Next Class</label><input className="input" value={form.nextClass} onChange={e=>setForm({...form,nextClass:e.target.value})} placeholder="e.g. Mon 09:00"/></div>
          <button onClick={add} className="btn-primary w-full">Add Course</button>
        </div>
      </Modal>
      <Modal open={!!editTarget} onClose={()=>setEditTarget(null)} title={`Edit: ${editTarget?.name||''}`}>
        <div className="space-y-4">
          <div><label className="label">Course Name</label><input className="input" value={editForm.name} onChange={e=>setEditForm({...editForm,name:e.target.value})}/></div>
          <div><label className="label">Instructor</label><select className="input" value={editForm.instructorId} onChange={e=>{const ins=mockInstructors.find(i=>i.id===parseInt(e.target.value));setEditForm({...editForm,instructorId:e.target.value,instructor:ins?.name||''})}}><option value="">Select instructor…</option>{mockInstructors.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}</select></div>
          <div><label className="label">Next Class</label><input className="input" value={editForm.nextClass} onChange={e=>setEditForm({...editForm,nextClass:e.target.value})} placeholder="e.g. Mon 09:00"/></div>
          <div><label className="label">Teams Link</label><input className="input" value={editForm.teamsLink} onChange={e=>setEditForm({...editForm,teamsLink:e.target.value})} placeholder="https://…"/></div>
          <div><label className="label">Classroom Link</label><input className="input" value={editForm.classroomLink} onChange={e=>setEditForm({...editForm,classroomLink:e.target.value})} placeholder="https://…"/></div>
          <button onClick={saveEdit} className="btn-primary w-full">Save Changes</button>
        </div>
      </Modal>
      <Modal open={!!delTarget} onClose={()=>setDelTarget(null)} title="Confirm Delete">
        <div className="space-y-4">
          <p className="text-sm text-gray-700">Delete <strong>{delTarget?.name}</strong>? This action cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={()=>setDelTarget(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={confirmDel} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700">Delete Course</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function AcaAttendance() {
  const { mockAttendance, mockCourses } = useData()
  const [cid, setCid] = useState('')
  const recs = mockAttendance.filter(a=>cid===''||a.courseId===parseInt(cid))
  const rate = recs.length?Math.round(recs.filter(r=>r.status==='present').length/recs.length*100):0
  return (
    <Card className="animate-fadeIn">
      <div className="flex gap-3 mb-4"><SelectFilter label="Course" value={cid} onChange={setCid} options={mockCourses.map(c=>({value:String(c.id),label:c.name}))} placeholder="All Courses"/></div>
      {cid&&<div className="flex gap-2 mb-4"><MiniStat label="Present" value={recs.filter(r=>r.status==='present').length} color="green"/><MiniStat label="Absent" value={recs.filter(r=>r.status==='absent').length} color="red"/><MiniStat label="Late" value={recs.filter(r=>r.status==='late').length} color="amber"/><MiniStat label="Rate" value={`${rate}%`} color="blue"/></div>}
      <Table columns={[{key:'studentName',label:'Student'},{key:'courseId',label:'Course',render:v=>mockCourses.find(c=>c.id===v)?.name?.split(' ')[0]||`#${v}`},{key:'date',label:'Date'},{key:'status',label:'Status',render:v=><StatusBadge status={v}/>}]} data={recs} emptyMsg="Select a course."/>
    </Card>
  )
}

function AcaAssignments() {
  const { mockAssignments, mockCourses } = useData()
  const [cid, setCid] = useState('')
  const asgList = mockAssignments.filter(a=>cid===''||a.courseId===parseInt(cid))
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex gap-3"><SelectFilter label="Course" value={cid} onChange={setCid} options={mockCourses.map(c=>({value:String(c.id),label:c.name}))} placeholder="All Courses"/></div>
      {asgList.map(a=>(
        <Card key={a.id}>
          <div className="flex justify-between mb-2"><div><p className="font-semibold">{a.title}</p><p className="text-xs text-gray-400">{mockCourses.find(c=>c.id===a.courseId)?.name} · Due: {a.dueDate}</p></div><Badge color="amber">{a.submissions.length} subs</Badge></div>
          {a.submissions.map((s,i)=>(
            <div key={i} className="flex justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
              <span>{s.studentName}</span>
              <div className="flex gap-2"><StatusBadge status={s.status}/>{s.grade!==null&&<Badge color="green">Grade: {s.grade}</Badge>}</div>
            </div>
          ))}
        </Card>
      ))}
    </div>
  )
}

function AcaQuizzes() {
  const { mockQuizzes, mockCourses } = useData()
  const [cid, setCid] = useState('')
  const qzList = mockQuizzes.filter(q=>cid===''||q.courseId===parseInt(cid))
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex gap-3"><SelectFilter label="Course" value={cid} onChange={setCid} options={mockCourses.map(c=>({value:String(c.id),label:c.name}))} placeholder="All Courses"/></div>
      {qzList.map(q=>(
        <Card key={q.id}>
          <div className="flex justify-between mb-2"><div><p className="font-semibold">{q.title}</p><p className="text-xs text-gray-400">{q.questions.length} questions · {q.duration} min</p></div><Badge color="purple">{q.submissions.length} submitted</Badge></div>
          {q.submissions.map((s,i)=>(
            <div key={i} className="flex justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
              <span>{s.studentName}</span><Badge color={s.score>=70?'green':'red'}>{s.overrideGrade??s.score}%</Badge>
            </div>
          ))}
        </Card>
      ))}
    </div>
  )
}

function AcaQuality() {
  const CHECKS = ['Learning objectives posted for all courses','Attendance tracked weekly','Assessments completed and graded','Student feedback collected','At-risk students identified and flagged','Course materials uploaded and up-to-date','Instructor observations completed','Grade distribution reviewed']
  const [checked, setChecked] = useState({})
  const toggle = k => setChecked(p=>({...p,[k]:!p[k]}))
  const done = Object.values(checked).filter(Boolean).length
  return (
    <div className="space-y-4 animate-fadeIn">
      <Card>
        <SectionHeader title="Quality Assurance Checklist"/>
        <div className="mb-4"><p className="text-sm text-gray-600 font-medium">{done}/{CHECKS.length} items complete</p><ProgressBar value={(done/CHECKS.length)*100} color="emerald" size="lg"/></div>
        <div className="space-y-2">
          {CHECKS.map((item,i)=>(
            <label key={i} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${checked[i]?'border-green-200 bg-green-50':'border-gray-100 hover:bg-gray-50'}`}>
              <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 ${checked[i]?'bg-green-500 border-green-500':'border-gray-300'}`}>
                {checked[i]&&<svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
              </div>
              <input type="checkbox" className="hidden" checked={!!checked[i]} onChange={()=>toggle(i)}/>
              <span className={`text-sm ${checked[i]?'text-green-700 line-through':'text-gray-700'}`}>{item}</span>
            </label>
          ))}
        </div>
      </Card>
    </div>
  )
}

function AcaMeetings() {
  const { user, pushNotif } = useAuth()
  const { mockMeetings, addMeeting } = useData()
  const [modal, setModal] = useState(false)
  const [form, setForm]   = useState({title:'',date:'',link:'',platform:'teams',invitees:[]})
  const ALLOWED = [
    {name:'Asad (Training Ops)',role:'training_ops'},{name:'Stuart (Training Ops)',role:'training_ops'},
    {name:'Principal',role:'principal'},{name:'Ali',role:'academic'},
    {name:'Mohammad (Academic)',role:'academic'},{name:'Abdullah (Academic)',role:'academic'},
    {name:'Abdulaziz',role:'academic'},
  ]
  const toggle = (name,role)=>{const e=form.invitees.find(i=>i.name===name);setForm({...form,invitees:e?form.invitees.filter(i=>i.name!==name):[...form.invitees,{name,role}]})}
  const create = async ()=>{
    if(!form.title||!form.date) return
    await addMeeting({...form,createdBy:user?.name,createdByRole:'academic',participants:[user?.name,...form.invitees.map(i=>i.name)],participantRoles:['academic',...form.invitees.map(i=>i.role)],status:'upcoming'})
    for (const i of form.invitees) await pushNotif(i.role,`Academic Team meeting: "${form.title}"`, 'meeting')
    setModal(false); setForm({title:'',date:'',link:'',platform:'teams',invitees:[]})
  }
  const myMeetings = mockMeetings.filter(m=>m.participantRoles?.includes('academic')||m.createdByRole==='academic')
  return (
    <div className="space-y-3 animate-fadeIn">
      <div className="flex justify-end"><button onClick={()=>setModal(true)} className="btn-primary text-xs"><Plus className="w-3.5 h-3.5"/>Schedule Meeting</button></div>
      {myMeetings.map(m=>(
        <Card key={m.id} className="flex justify-between items-start">
          <div>
            <div className="flex gap-2 mb-1"><p className="font-semibold">{m.title}</p><StatusBadge status={m.status}/>{m.createdByRole!=='academic'&&<Badge color="emerald">Invited</Badge>}</div>
            <p className="text-xs text-gray-500">{m.date}</p>
            <p className="text-xs text-gray-400 mt-0.5">{m.participants?.join(', ')}</p>
          </div>
          {m.status==='upcoming'&&m.link&&<a href={m.link} target="_blank" rel="noreferrer" className="btn-primary text-xs py-1.5">Join</a>}
        </Card>
      ))}
      <Modal open={modal} onClose={()=>setModal(false)} title="Schedule Meeting" wide>
        <div className="space-y-4">
          <div><label className="label">Title</label><input className="input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></div>
          <div><label className="label">Date & Time</label><input type="datetime-local" className="input" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></div>
          <div><label className="label">Link</label><input className="input" value={form.link} onChange={e=>setForm({...form,link:e.target.value})} placeholder="https://…"/></div>
          <div>
            <label className="label">Invite</label>
            <div className="grid grid-cols-2 gap-1.5">
              {ALLOWED.map(inv=>(
                <label key={inv.name} className="flex items-center gap-2 p-2 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" className="accent-emerald-600" checked={!!form.invitees.find(i=>i.name===inv.name)} onChange={()=>toggle(inv.name,inv.role)}/>
                  <span className="text-xs text-gray-800">{inv.name}</span>
                </label>
              ))}
            </div>
          </div>
          <button onClick={create} className="btn-primary w-full">Create Meeting & Notify</button>
        </div>
      </Modal>
    </div>
  )
}

function AcaTasks() {
  const { mockTasks, updateTask } = useData()
  const myTasks = mockTasks.filter(t=>t.assignedToRole==='academic')
  const update = async (id,status)=>{ await updateTask(id,status) }
  return (
    <div className="space-y-3 animate-fadeIn">
      {myTasks.length===0&&<Card className="text-center py-8 text-gray-400 text-sm">No tasks assigned</Card>}
      {myTasks.map(t=>(
        <Card key={t.id}>
          <div className="flex justify-between mb-2"><div><p className="font-semibold">{t.title}</p>{t.note&&<p className="text-xs text-gray-400 italic">"{t.note}"</p>}</div><div className="flex gap-2"><Badge color={t.priority==='high'?'red':t.priority==='medium'?'amber':'green'}>{t.priority}</Badge><StatusBadge status={t.status}/></div></div>
          <p className="text-xs text-gray-400 mb-2">Due: {t.dueDate}</p>
          {t.status!=='completed'&&(
            <div className="flex gap-2">
              {t.status==='pending'&&<button onClick={()=>update(t.id,'in-progress')} className="btn-secondary text-xs py-1.5">Start</button>}
              {t.status==='in-progress'&&<button onClick={()=>update(t.id,'completed')} className="btn-primary text-xs py-1.5">Mark Complete</button>}
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}

function AcaReports() {
  const { user, pushNotif } = useAuth()
  const { mockReports, addReport } = useData()
  const [form, setForm] = useState({to:'training_ops',type:'Academic Progress',period:'',content:''})
  const [file, setFile] = useState(null)
  const [sent, setSent] = useState(false)
  const send = async ()=>{
    if(!form.content.trim()) return
    await addReport({from:user?.name,fromRole:'academic',to:form.to==='training_ops'?'Training Operations':'Foundation Lead',type:form.type,period:form.period,content:form.content+(file?` [File: ${file.name}]`:''),fileName:file?.name||null})
    await pushNotif(form.to,`Academic report: "${form.type}"`, 'report')
    setSent(true); setTimeout(()=>setSent(false),2500)
  }
  return (
    <div className="grid lg:grid-cols-2 gap-4 animate-fadeIn">
      <Card>
        <SectionHeader title="Submit Report"/>
        <div className="space-y-3">
          <div><label className="label">Send To</label><select className="input" value={form.to} onChange={e=>setForm({...form,to:e.target.value})}><option value="training_ops">Training Operations</option><option value="foundation_lead">Foundation Lead</option><option value="principal">Principal</option></select></div>
          <div><label className="label">Type</label><select className="input" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option>Academic Progress</option><option>Grade Report</option><option>Attendance Summary</option><option>Quality Assurance</option></select></div>
          <div><label className="label">Period</label><input className="input" value={form.period} onChange={e=>setForm({...form,period:e.target.value})} placeholder="e.g. July 2024"/></div>
          <div><label className="label">Content</label><textarea className="input" rows={4} value={form.content} onChange={e=>setForm({...form,content:e.target.value})} placeholder="Report details…"/></div>
          <FileUploadBox onFile={setFile} label="Attach File (optional)" hint="Upload PDF, DOCX, or Excel"/>
          {sent?<div className="p-2.5 bg-green-50 text-green-700 rounded-xl text-xs text-center font-medium">✓ Report sent!</div>:<button onClick={send} className="btn-primary w-full"><Send className="w-3.5 h-3.5"/>Send Report</button>}
        </div>
      </Card>
      <Card>
        <SectionHeader title="Sent Reports"/>
        {mockReports.filter(r=>r.fromRole==='academic').map(r=>(
          <div key={r.id} className="p-3 border border-gray-100 rounded-xl mb-2">
            <p className="text-xs font-semibold">{r.type}</p><p className="text-[10px] text-gray-400">{r.sentAt}</p><p className="text-xs text-gray-500 mt-1 line-clamp-2">{r.content}</p>
          </div>
        ))}
        {mockReports.filter(r=>r.fromRole==='academic').length===0&&<p className="text-xs text-gray-400 text-center py-8">No reports sent</p>}
      </Card>
    </div>
  )
}
