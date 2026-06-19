import { useState } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import Header from '../../components/layout/Header'
import { StatCard, StatusBadge, Badge, Table, SectionHeader, Modal, MiniStat, SelectFilter, Card } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { UserPlus, GraduationCap, AlertCircle, CheckSquare, Plus, BarChart3 } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const PAGES = { dashboard:'Student Services Dashboard', admissions:'Admissions', students:'Students', instructors:'Instructors', attendance:'Attendance', assignments:'Assignments', quizzes:'Quizzes', complaints:'Complaints', tasks:'My Tasks', records:'Records' }

export default function NidaPortal() {
  const [active, setActive] = useState('dashboard')
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar activeKey={active} onNavigate={setActive}/>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={PAGES[active]||active}/>
        <main className="flex-1 overflow-y-auto p-5">
          {active==='dashboard'   && <NidaDash onNavigate={setActive}/>}
          {active==='admissions'  && <NidaAdmissions/>}
          {active==='students'    && <NidaStudents/>}
          {active==='instructors' && <NidaInstructors/>}
          {active==='attendance'  && <NidaAttendance/>}
          {active==='assignments' && <NidaAssignments/>}
          {active==='quizzes'     && <NidaQuizzes/>}
          {active==='complaints'  && <NidaComplaints/>}
          {active==='tasks'       && <NidaTasks/>}
          {active==='records'     && <NidaRecords/>}
        </main>
      </div>
    </div>
  )
}

function NidaDash({ onNavigate }) {
  const { user } = useAuth()
  const { getStats, mockStudents, mockComplaints, mockAdmissions, mockTasks } = useData()
  const stats = getStats()
  const [drill, setDrill] = useState(null)
  const myTasks = mockTasks.filter(t=>t.assignedToRole==='nida')
  const nidaEmails = new Set(mockAdmissions.map(a=>a.email))
  const nidaStudents = mockStudents.filter(s=>nidaEmails.has(s.email))
  const nidaComplaints = mockComplaints.filter(c=>
    c.fromRole==='nida'||
    c.assignedTo?.toLowerCase().includes('nida')||
    c.assignedTo?.toLowerCase().includes('student service')
  )
  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="rounded-2xl bg-gradient-to-r from-pink-500 to-rose-700 p-5 text-white">
        <p className="text-white/60 text-xs">Student Services Coordinator</p>
        <h2 className="font-bold text-2xl mt-0.5">{user?.name} 🌟</h2>
        <p className="text-white/50 text-sm mt-1">Manage admissions, student records and welfare · Click for details</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="New Admissions"  value={stats.pendingAdmissions}                           icon={UserPlus}      color="pink"   onClick={()=>setDrill('admissions')}  clickLabel="View admissions"/>
        <StatCard label="NIDA Students"   value={nidaStudents.length}                               icon={GraduationCap} color="blue"   onClick={()=>setDrill('students')}    clickLabel="View students"/>
        <StatCard label="My Complaints"   value={nidaComplaints.filter(c=>c.status==='pending').length} icon={AlertCircle}   color="amber"  onClick={()=>setDrill('complaints')}  clickLabel="View complaints"/>
        <StatCard label="My Tasks"        value={myTasks.filter(t=>t.status!=='completed').length}  icon={CheckSquare}   color="orange" onClick={()=>onNavigate('tasks')}     clickLabel="View tasks"/>
      </div>
      <Modal open={drill==='admissions'} onClose={()=>setDrill(null)} title="Pending Admissions" wide>
        {mockAdmissions.filter(a=>a.status==='pending').map(a=>(
          <div key={a.id} className="mb-3 p-3 border border-gray-100 rounded-xl">
            <div className="flex justify-between mb-1"><p className="font-semibold">{a.name}</p><StatusBadge status={a.status}/></div>
            <p className="text-xs text-gray-400">{a.program} · Applied: {a.appliedDate}</p>
          </div>
        ))}
        {mockAdmissions.filter(a=>a.status==='pending').length===0&&<p className="text-xs text-gray-400 text-center py-8">No pending admissions</p>}
      </Modal>
      <Modal open={drill==='students'} onClose={()=>setDrill(null)} title="NIDA Admitted Students" wide>
        <Table columns={[{key:'name',label:'Name',render:v=><span className="font-medium">{v}</span>},{key:'attendanceRate',label:'Att.',render:v=><span className={v>=80?'text-green-600':v>=60?'text-amber-500':'text-red-500'}>{v}%</span>},{key:'gpa',label:'GPA'},{key:'status',label:'Status',render:v=><StatusBadge status={v}/>}]} data={nidaStudents}/>
      </Modal>
      <Modal open={drill==='complaints'} onClose={()=>setDrill(null)} title="My Complaints" wide>
        <Table columns={[{key:'from',label:'From'},{key:'subject',label:'Subject'},{key:'priority',label:'Priority',render:v=><Badge color={v==='high'?'red':v==='medium'?'amber':'green'}>{v}</Badge>},{key:'status',label:'Status',render:v=><StatusBadge status={v}/>}]} data={nidaComplaints.filter(c=>c.status==='pending')}/>
      </Modal>
    </div>
  )
}

function NidaAdmissions() {
  const { pushNotif } = useAuth()
  const { mockAdmissions, mockCourses, addAdmission, updateAdmission } = useData()
  const [modal, setModal]     = useState(false)
  const [detModal, setDetModal] = useState(null)
  const [form, setForm]       = useState({name:'',email:'',phone:'',program:'Maritime Navigation',notes:''})
  const add = async ()=>{
    if(!form.name||!form.email) return
    await addAdmission({...form,appliedDate:new Date().toISOString().split('T')[0]})
    setModal(false); setForm({name:'',email:'',phone:'',program:'Maritime Navigation',notes:''})
  }
  const updateStatus = async (id,status)=>{
    await updateAdmission(id,{status})
    if(status==='accepted') await pushNotif('student','Your admission has been accepted! Welcome to NMA.', 'admission')
    setDetModal(null)
  }
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div className="flex gap-2"><MiniStat label="Pending" value={mockAdmissions.filter(a=>a.status==='pending').length} color="amber"/><MiniStat label="Interview" value={mockAdmissions.filter(a=>a.status==='interview').length} color="purple"/><MiniStat label="Accepted" value={mockAdmissions.filter(a=>a.status==='accepted').length} color="green"/></div>
        <button onClick={()=>setModal(true)} className="btn-primary text-xs"><Plus className="w-3.5 h-3.5"/>Add Applicant</button>
      </div>
      {mockAdmissions.map(a=>(
        <Card key={a.id} className="cursor-pointer hover:shadow-md transition-all" onClick={()=>setDetModal(a)}>
          <div className="flex justify-between mb-1"><div><p className="font-semibold">{a.name}</p><p className="text-xs text-gray-400">{a.program} · Applied: {a.appliedDate}</p></div><StatusBadge status={a.status}/></div>
          <p className="text-xs text-gray-400">{a.email} · {a.phone}</p>
          {a.notes&&<p className="text-xs text-gray-500 mt-1 italic">"{a.notes}"</p>}
          <p className="text-[10px] text-blue-500 mt-2">↗ Click to update status</p>
        </Card>
      ))}
      <Modal open={modal} onClose={()=>setModal(false)} title="Add Applicant">
        <div className="space-y-4">
          <div><label className="label">Full Name</label><input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
          <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div>
          <div><label className="label">Program</label><select className="input" value={form.program} onChange={e=>setForm({...form,program:e.target.value})}>{mockCourses.map(c=><option key={c.id}>{c.name}</option>)}</select></div>
          <div><label className="label">Notes</label><textarea className="input" rows={2} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></div>
          <button onClick={add} className="btn-primary w-full">Add Applicant</button>
        </div>
      </Modal>
      <Modal open={!!detModal} onClose={()=>setDetModal(null)} title={`Admission: ${detModal?.name||''}`} wide>
        {detModal&&(
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3"><MiniStat label="Status" value={detModal.status} color="blue"/><MiniStat label="Program" value={detModal.program?.split(' ')[0]} color="teal"/><MiniStat label="Applied" value={detModal.appliedDate} color="gray"/></div>
            <p className="text-sm text-gray-600"><strong>Email:</strong> {detModal.email} · <strong>Phone:</strong> {detModal.phone}</p>
            {detModal.notes&&<p className="text-sm text-gray-600 italic">Notes: "{detModal.notes}"</p>}
            <div className="label mb-2">Update Status</div>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={()=>updateStatus(detModal.id,'interview')} className="py-2 bg-purple-50 text-purple-700 rounded-xl text-sm font-semibold hover:bg-purple-100">Schedule Interview</button>
              <button onClick={()=>updateStatus(detModal.id,'accepted')}  className="py-2 bg-green-50 text-green-700 rounded-xl text-sm font-semibold hover:bg-green-100">Accept</button>
              <button onClick={()=>updateStatus(detModal.id,'rejected')}  className="py-2 bg-red-50 text-red-700 rounded-xl text-sm font-semibold hover:bg-red-100">Reject</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function NidaStudents() {
  const { mockStudents, mockAdmissions } = useData()
  const nidaEmails = new Set(mockAdmissions.map(a=>a.email))
  const nidaStudents = mockStudents.filter(s=>nidaEmails.has(s.email))
  return (
    <Card className="animate-fadeIn">
      <SectionHeader title="NIDA Admitted Students"/>
      <div className="flex gap-2 mb-4">
        <MiniStat label="Active"  value={nidaStudents.filter(s=>s.status==='active').length}  color="green"/>
        <MiniStat label="At-Risk" value={nidaStudents.filter(s=>s.status==='at-risk').length} color="red"/>
        <MiniStat label="Total"   value={nidaStudents.length}                                 color="blue"/>
      </div>
      <Table columns={[{key:'name',label:'Name',render:v=><span className="font-medium">{v}</span>},{key:'email',label:'Email'},{key:'phone',label:'Phone'},{key:'attendanceRate',label:'Att.',render:v=><span className={v>=80?'text-green-600':v>=60?'text-amber-500':'text-red-500'}>{v}%</span>},{key:'gpa',label:'GPA'},{key:'status',label:'Status',render:v=><StatusBadge status={v}/>},{key:'admissionDate',label:'Admitted'}]} data={nidaStudents} emptyMsg="No students admitted through NIDA yet."/>
    </Card>
  )
}

function NidaInstructors() {
  const { mockInstructors } = useData()
  return (
    <Card className="animate-fadeIn">
      <SectionHeader title="All Instructors"/>
      <Table columns={[{key:'name',label:'Name',render:v=><span className="font-medium">{v}</span>},{key:'sub',label:'Role'},{key:'email',label:'Email'},{key:'students',label:'Students',render:v=><Badge color="blue">{v}</Badge>},{key:'status',label:'Status',render:v=><StatusBadge status={v}/>}]} data={mockInstructors}/>
    </Card>
  )
}

function NidaAttendance() {
  const { mockAttendance, mockCourses, mockStudents, mockAdmissions } = useData()
  const [cid, setCid] = useState('')
  const nidaEmails = new Set(mockAdmissions.map(a=>a.email))
  const nidaStudentIds = new Set(mockStudents.filter(s=>nidaEmails.has(s.email)).map(s=>s.id))
  const nidaRecs = mockAttendance.filter(a=>nidaStudentIds.has(a.studentId))
  const recs = nidaRecs.filter(a=>cid===''||a.courseId===parseInt(cid))
  const rate = recs.length?Math.round(recs.filter(r=>r.status==='present').length/recs.length*100):0
  const atRisk = [...nidaStudentIds].filter(sid=>{
    const sRecs=nidaRecs.filter(a=>a.studentId===sid)
    return sRecs.length>0&&Math.round(sRecs.filter(r=>r.status==='present').length/sRecs.length*100)<70
  }).length
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex gap-2">
        <MiniStat label="Present"    value={recs.filter(r=>r.status==='present').length}  color="green"/>
        <MiniStat label="Absent"     value={recs.filter(r=>r.status==='absent').length}   color="red"/>
        <MiniStat label="Avg Rate"   value={`${rate}%`}                                   color={rate>=80?'green':rate>=60?'amber':'red'}/>
        <MiniStat label="Below 70%"  value={atRisk}                                       color="red"/>
      </div>
      <Card>
        <div className="flex gap-3 mb-4">
          <SelectFilter label="Course" value={cid} onChange={setCid} options={mockCourses.map(c=>({value:String(c.id),label:c.name}))} placeholder="All Courses"/>
        </div>
        <Table columns={[{key:'studentName',label:'Student'},{key:'courseId',label:'Course',render:v=>mockCourses.find(c=>c.id===v)?.name?.split(' ')[0]||`#${v}`},{key:'date',label:'Date'},{key:'status',label:'Status',render:v=><StatusBadge status={v}/>}]} data={recs} emptyMsg="No attendance records."/>
      </Card>
    </div>
  )
}

function NidaAssignments() {
  const { mockAssignments, mockCourses } = useData()
  return (
    <Card className="animate-fadeIn">
      <SectionHeader title="All Assignments"/>
      {mockAssignments.map(a=>(
        <div key={a.id} className="mb-3 p-3 border border-gray-100 rounded-xl">
          <div className="flex justify-between mb-1"><p className="font-semibold text-sm">{a.title}</p><Badge color="amber">{a.submissions.length} submissions</Badge></div>
          <p className="text-xs text-gray-400">{mockCourses.find(c=>c.id===a.courseId)?.name} · Due: {a.dueDate}</p>
        </div>
      ))}
    </Card>
  )
}

function NidaQuizzes() {
  const { mockQuizzes, mockCourses } = useData()
  const allSubs = mockQuizzes.flatMap(q=>q.submissions.map(s=>({...s,courseId:q.courseId,passingMarks:q.passingMarks||50})))
  const passed  = allSubs.filter(s=>(s.overrideGrade??s.score)>=s.passingMarks).length
  const failed  = allSubs.length - passed
  const avgScore = allSubs.length?Math.round(allSubs.reduce((sum,s)=>sum+(s.overrideGrade??s.score),0)/allSubs.length):0
  const passRate  = allSubs.length?Math.round(passed/allSubs.length*100):0
  const COLORS = ['#22c55e','#ef4444']
  const pieData = [{name:'Pass',value:passed},{name:'Fail',value:failed}]
  const courseAvgs = mockCourses.map(c=>{
    const subs=allSubs.filter(s=>s.courseId===c.id)
    return {name:c.name.split(' ').slice(0,2).join(' '),avg:subs.length?Math.round(subs.reduce((sum,s)=>sum+(s.overrideGrade??s.score),0)/subs.length):0}
  }).filter(c=>c.avg>0)
  return (
    <div className="space-y-4 animate-fadeIn">
      <Card>
        <SectionHeader title="All Quizzes"/>
        {mockQuizzes.map(q=>(
          <div key={q.id} className="mb-3 p-3 border border-gray-100 rounded-xl">
            <div className="flex justify-between mb-1"><p className="font-semibold text-sm">{q.title}</p><Badge color="purple">{q.submissions.length} submitted</Badge></div>
            <p className="text-xs text-gray-400">{mockCourses.find(c=>c.id===q.courseId)?.name} · {q.questions.length} questions</p>
          </div>
        ))}
      </Card>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <SectionHeader title="Performance Analytics"/>
          <div className="flex gap-2 mb-4">
            <MiniStat label="Total Submissions" value={allSubs.length} color="blue"/>
            <MiniStat label="Avg Score"         value={`${avgScore}%`} color="purple"/>
            <MiniStat label="Pass Rate"         value={`${passRate}%`} color={passRate>=70?'green':'amber'}/>
          </div>
          {allSubs.length>0&&(
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={50} label={({name,value})=>`${name}: ${value}`}>
                  {pieData.map((_,i)=><Cell key={i} fill={COLORS[i]}/>)}
                </Pie>
                <Tooltip/>
                <Legend iconSize={10} wrapperStyle={{fontSize:'11px'}}/>
              </PieChart>
            </ResponsiveContainer>
          )}
          {allSubs.length===0&&<p className="text-xs text-gray-400 text-center py-4">No quiz submissions yet</p>}
        </Card>
        <Card>
          <SectionHeader title="Avg Score by Course"/>
          {courseAvgs.length>0&&(
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={courseAvgs} margin={{top:4,right:8,left:-20,bottom:4}}>
                <XAxis dataKey="name" tick={{fontSize:9}}/>
                <YAxis domain={[0,100]} tick={{fontSize:9}}/>
                <Tooltip formatter={v=>`${v}%`}/>
                <Bar dataKey="avg" fill="#8b5cf6" radius={[3,3,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          )}
          {courseAvgs.length===0&&<p className="text-xs text-gray-400 text-center py-8">No data yet</p>}
        </Card>
      </div>
    </div>
  )
}

function NidaComplaints() {
  const { user } = useAuth()
  const { mockComplaints, updateComplaint } = useData()
  const [modal, setModal] = useState(null)
  const [note, setNote]   = useState('')
  const nidaComplaints = mockComplaints.filter(c=>
    c.fromRole==='nida'||
    c.assignedTo?.toLowerCase().includes('nida')||
    c.assignedTo?.toLowerCase().includes('student service')
  )
  const update = async (id,status)=>{
    await updateComplaint(id, status, note, user?.name)
    setModal(null); setNote('')
  }
  return (
    <div className="space-y-4 animate-fadeIn">
      <Card>
        <div className="flex gap-2 mb-4">
          <MiniStat label="Pending"  value={nidaComplaints.filter(c=>c.status==='pending').length}   color="amber"/>
          <MiniStat label="Resolved" value={nidaComplaints.filter(c=>c.status==='resolved').length}  color="green"/>
          <MiniStat label="Total"    value={nidaComplaints.length}                                   color="blue"/>
        </div>
        {nidaComplaints.length===0&&<p className="text-xs text-gray-400 text-center py-6">No complaints assigned to NIDA</p>}
        <div className="space-y-2">
          {nidaComplaints.map(c=>(
            <div key={c.id} className="p-3 border border-gray-100 rounded-xl">
              <div className="flex justify-between mb-1">
                <div><p className="font-medium text-sm text-gray-900">{c.subject}</p><p className="text-xs text-gray-400">{c.from} · {c.date}</p></div>
                <div className="flex gap-2 items-start">
                  <Badge color={c.priority==='high'?'red':c.priority==='medium'?'amber':'green'}>{c.priority}</Badge>
                  <StatusBadge status={c.status}/>
                </div>
              </div>
              {c.desc&&<p className="text-xs text-gray-500 mb-2">{c.desc}</p>}
              {c.updates?.length>0&&<div className="space-y-0.5 mb-2">{c.updates.map((u,i)=><p key={i} className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded">{u.by}: {u.note}</p>)}</div>}
              {c.status!=='resolved'&&<button onClick={()=>{setModal(c);setNote('')}} className="text-xs text-blue-600 font-medium hover:underline">Update Status →</button>}
            </div>
          ))}
        </div>
      </Card>
      <Modal open={!!modal} onClose={()=>setModal(null)} title={`Update: ${modal?.subject||''}`}>
        <div className="space-y-4">
          <div><label className="label">New Status</label>
            <div className="flex gap-2">
              {['in-review','resolved'].map(s=>(
                <button key={s} onClick={()=>update(modal?.id,s)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-medium capitalize hover:bg-gray-50">{s.replace('-',' ')}</button>
              ))}
            </div>
          </div>
          <div><label className="label">Response / Note</label><textarea className="input" rows={3} value={note} onChange={e=>setNote(e.target.value)} placeholder="Add your response…"/></div>
        </div>
      </Modal>
    </div>
  )
}

function NidaTasks() {
  const { mockTasks, updateTask } = useData()
  const myTasks = mockTasks.filter(t=>t.assignedToRole==='nida')
  const update = async (id, status) => { await updateTask(id, status) }
  return (
    <div className="space-y-3 animate-fadeIn">
      {myTasks.length===0&&<Card className="text-center py-8 text-gray-400 text-sm">No tasks assigned</Card>}
      {myTasks.map(t=>(
        <Card key={t.id}>
          <div className="flex justify-between mb-2"><p className="font-semibold">{t.title}</p><div className="flex gap-2"><Badge color={t.priority==='high'?'red':t.priority==='medium'?'amber':'green'}>{t.priority}</Badge><StatusBadge status={t.status}/></div></div>
          {t.note&&<p className="text-xs text-gray-400 italic mb-1">"{t.note}"</p>}
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

function NidaRecords() {
  const { getStats, mockStudents, mockAdmissions } = useData()
  const stats = getStats()
  const nidaEmails = new Set(mockAdmissions.map(a=>a.email))
  const nidaStudents = mockStudents.filter(s=>nidaEmails.has(s.email))
  const avgGpa = nidaStudents.length?(nidaStudents.reduce((a,s)=>a+(s.gpa||0),0)/nidaStudents.length).toFixed(1):'0.0'
  const avgAtt = nidaStudents.length?Math.round(nidaStudents.reduce((a,s)=>a+s.attendanceRate,0)/nidaStudents.length):0
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MiniStat label="NIDA Students" value={nidaStudents.length}                                    color="blue"/>
        <MiniStat label="At-Risk"       value={nidaStudents.filter(s=>s.status==='at-risk').length}    color="red"/>
        <MiniStat label="Avg GPA"       value={avgGpa}                                                 color="green"/>
        <MiniStat label="Avg Attendance" value={`${avgAtt}%`}                                         color={avgAtt>=80?'green':avgAtt>=60?'amber':'red'}/>
      </div>
      <Card>
        <SectionHeader title="NIDA Student Records"/>
        <Table columns={[{key:'name',label:'Name',render:v=><span className="font-medium">{v}</span>},{key:'email',label:'Email'},{key:'attendanceRate',label:'Att.',render:v=><span className={v>=80?'text-green-600':v>=60?'text-amber-500':'text-red-500'}>{v}%</span>},{key:'gpa',label:'GPA'},{key:'courses',label:'Courses',render:v=><Badge color="blue">{v?.length||0}</Badge>},{key:'status',label:'Status',render:v=><StatusBadge status={v}/>}]} data={nidaStudents} emptyMsg="No NIDA students yet."/>
      </Card>
    </div>
  )
}
