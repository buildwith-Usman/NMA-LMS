import { useState } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import Header from '../../components/layout/Header'
import { StatCard, StatusBadge, Badge, Table, SectionHeader, Modal, MiniStat, Card, FileUploadBox } from '../../components/ui'
import { getStats, mockStudents, mockComplaints, mockSurveys, mockMeetings, mockTasks, mockReports, addComplaint, addSurvey, addMeeting, addReport, updateComplaint, updateTask, submitSurveyResponse } from '../../utils/mockData'
import { useAuth } from '../../context/AuthContext'
import { AlertCircle, ClipboardList, Calendar, Send, Plus, ExternalLink, CheckSquare, BarChart3, GraduationCap } from 'lucide-react'

const PAGES = { dashboard:'Affairs Dashboard', students:'Students', complaints:'Complaints', surveys:'Create Surveys', meetings:'Meetings', tasks:'My Tasks', reports:'Reports' }

export default function AffairsPortal() {
  const [active, setActive] = useState('dashboard')
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar activeKey={active} onNavigate={setActive}/>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={PAGES[active]||active}/>
        <main className="flex-1 overflow-y-auto p-5">
          {active==='dashboard'  && <AffDash onNavigate={setActive}/>}
          {active==='students'   && <AffStudents/>}
          {active==='complaints' && <AffComplaints/>}
          {active==='surveys'    && <AffSurveys/>}
          {active==='meetings'   && <AffMeetings/>}
          {active==='tasks'      && <AffTasks/>}
          {active==='reports'    && <AffReports/>}
        </main>
      </div>
    </div>
  )
}

function AffDash({ onNavigate }) {
  const stats = getStats()
  const { user } = useAuth()
  const [drill, setDrill] = useState(null)
  const myTasks = mockTasks.filter(t=>t.assignedToRole==='affairs')
  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-700 p-5 text-white">
        <p className="text-white/60 text-xs">Student & Trainee Affairs</p>
        <h2 className="font-bold text-2xl mt-0.5">{user?.name} 📋</h2>
        <p className="text-white/50 text-sm mt-1">Manage complaints, surveys, and student welfare · Click stats for details</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Students"    value={stats.totalStudents}  icon={GraduationCap} color="blue"   onClick={()=>setDrill('students')}    clickLabel="View students"/>
        <StatCard label="Pending Complaints"value={stats.pendingComplaints} icon={AlertCircle} color="amber" onClick={()=>setDrill('complaints')}  clickLabel="View complaints"/>
        <StatCard label="Active Surveys"    value={stats.activeSurveys}  icon={ClipboardList} color="teal"  onClick={()=>setDrill('surveys')}     clickLabel="View surveys"/>
        <StatCard label="My Tasks"          value={myTasks.filter(t=>t.status!=='completed').length} icon={CheckSquare} color="orange" onClick={()=>onNavigate('tasks')} clickLabel="View tasks"/>
      </div>
      {/* Drills */}
      <Modal open={drill==='students'} onClose={()=>setDrill(null)} title="All Students" wide>
        <Table columns={[{key:'name',label:'Name',render:v=><span className="font-medium">{v}</span>},{key:'attendanceRate',label:'Att.',render:v=><span className={v>=80?'text-green-600':v>=60?'text-amber-500':'text-red-500'}>{v}%</span>},{key:'gpa',label:'GPA'},{key:'status',label:'Status',render:v=><StatusBadge status={v}/>}]} data={mockStudents}/>
      </Modal>
      <Modal open={drill==='complaints'} onClose={()=>setDrill(null)} title="Pending Complaints" wide>
        {mockComplaints.filter(c=>c.status==='pending').map(c=>(
          <div key={c.id} className="mb-3 p-3 border border-amber-100 bg-amber-50/30 rounded-xl">
            <div className="flex justify-between mb-1"><p className="font-semibold text-sm">{c.subject}</p><Badge color={c.priority==='high'?'red':c.priority==='medium'?'amber':'green'}>{c.priority}</Badge></div>
            <p className="text-xs text-gray-500">{c.desc}</p>
            <p className="text-[10px] text-gray-400 mt-1">From: {c.from} · {c.date}</p>
          </div>
        ))}
      </Modal>
      <Modal open={drill==='surveys'} onClose={()=>setDrill(null)} title="Active Surveys" wide>
        {mockSurveys.filter(s=>s.status==='active').map(s=>(
          <div key={s.id} className="mb-3 p-3 border border-teal-100 rounded-xl">
            <div className="flex justify-between mb-2"><p className="font-semibold text-sm">{s.title}</p><StatusBadge status={s.status}/></div>
            <p className="text-xs text-gray-400">{s.responses.length}/{s.sent} responded</p>
          </div>
        ))}
      </Modal>
    </div>
  )
}

function AffStudents() {
  return (
    <Card className="animate-fadeIn">
      <SectionHeader title="All Students"/>
      <Table columns={[{key:'name',label:'Name',render:v=><span className="font-medium">{v}</span>},{key:'email',label:'Email'},{key:'attendanceRate',label:'Att.',render:v=><span className={v>=80?'text-green-600':v>=60?'text-amber-500':'text-red-500'}>{v}%</span>},{key:'gpa',label:'GPA'},{key:'status',label:'Status',render:v=><StatusBadge status={v}/>}]} data={mockStudents}/>
    </Card>
  )
}

function AffComplaints() {
  const { user, pushNotif } = useAuth()
  const [priority, setPriority] = useState('')
  const [modal, setModal]   = useState(null)
  const [note, setNote]     = useState('')
  const filtered = mockComplaints.filter(c=>priority===''||c.priority===priority)
  const update = (id,st)=>{
    updateComplaint(id,st,note,user?.name||'Affairs')
    pushNotif('foundation_lead',`Complaint updated to: ${st}`, 'complaint')
    setModal(null); setNote('')
  }
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex gap-3 mb-2">
        <select className="input text-xs py-1.5 w-40" value={priority} onChange={e=>setPriority(e.target.value)}>
          <option value="">All Priorities</option>
          <option value="high">🔴 High</option><option value="medium">🟡 Medium</option><option value="low">🟢 Low</option>
        </select>
      </div>
      <div className="flex gap-2 mb-4">
        <MiniStat label="High"    value={mockComplaints.filter(c=>c.priority==='high').length}   color="red"/>
        <MiniStat label="Pending" value={mockComplaints.filter(c=>c.status==='pending').length}  color="amber"/>
        <MiniStat label="Resolved"value={mockComplaints.filter(c=>c.status==='resolved').length} color="green"/>
      </div>
      {filtered.map(c=>(
        <Card key={c.id}>
          <div className="flex justify-between mb-2">
            <div><p className="font-semibold text-gray-900">{c.subject}</p><p className="text-xs text-gray-400">{c.from} ({c.fromRole}) · {c.date}</p></div>
            <div className="flex gap-2"><Badge color={c.priority==='high'?'red':c.priority==='medium'?'amber':'green'}>{c.priority}</Badge><StatusBadge status={c.status}/></div>
          </div>
          <p className="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2 mb-2">{c.desc}</p>
          {c.updates?.length>0&&<div className="mb-2">{c.updates.map((u,i)=><p key={i} className="text-[10px] text-gray-400">↳ {u.by}: {u.note} ({u.date})</p>)}</div>}
          {c.status!=='resolved'&&<button onClick={()=>setModal(c)} className="text-xs text-blue-600 font-medium hover:underline">Update Status →</button>}
        </Card>
      ))}
      <Modal open={!!modal} onClose={()=>setModal(null)} title={`Update: ${modal?.subject||''}`}>
        <div className="space-y-3">
          <div><label className="label">Update Status To</label>
            <div className="flex gap-2">
              <button onClick={()=>update(modal?.id,'in-review')} className="flex-1 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-100">In Review</button>
              <button onClick={()=>update(modal?.id,'resolved')}  className="flex-1 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-semibold hover:bg-green-100">Resolved</button>
            </div>
          </div>
          <div><label className="label">Note</label><textarea className="input" rows={3} value={note} onChange={e=>setNote(e.target.value)} placeholder="Describe resolution…"/></div>
        </div>
      </Modal>
    </div>
  )
}

function AffSurveys() {
  const { pushNotif } = useAuth()
  const [modal, setModal]   = useState(false)
  const [surveys, setSurveys] = useState(mockSurveys)
  const [form, setForm]     = useState({title:'',deadline:'',questions:['','']})
  const create = ()=>{
    const qs=form.questions.filter(q=>q.trim()).map((q,i)=>({id:i+1,text:q}))
    addSurvey({title:form.title,createdBy:'Abdullmhun',deadline:form.deadline,status:'active',sentTo:'students',questions:qs,sent:mockStudents.length})
    pushNotif('student',`New survey: "${form.title}"`, 'survey')
    setSurveys([...mockSurveys]); setModal(false)
  }
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex justify-end"><button onClick={()=>setModal(true)} className="btn-primary text-xs"><Plus className="w-3.5 h-3.5"/>Create Survey</button></div>
      {surveys.map(s=>(
        <Card key={s.id}>
          <div className="flex justify-between mb-2"><div><p className="font-semibold">{s.title}</p><p className="text-xs text-gray-400">By {s.createdBy} · Due: {s.deadline}</p></div><StatusBadge status={s.status}/></div>
          <p className="text-xs text-gray-400 mb-2">{s.responses.length}/{s.sent} responses</p>
          <div className="space-y-1">{s.questions?.map(q=><p key={q.id} className="text-xs text-gray-600">• {q.text}</p>)}</div>
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
            <button type="button" onClick={()=>setForm({...form,questions:[...form.questions,'']})} className="text-xs text-teal-600 hover:underline font-medium">+ Add Question</button>
          </div>
          <button onClick={create} className="btn-primary w-full">Create & Notify Students</button>
        </div>
      </Modal>
    </div>
  )
}

function AffMeetings() {
  const { user, pushNotif } = useAuth()
  const [meetings, setMeets] = useState(mockMeetings)
  const [modal, setModal]    = useState(false)
  const [form, setForm]      = useState({title:'',date:'',link:'',platform:'teams',invitees:[]})
  const ALLOWED = [{name:'Mohammad Abdullah (Foundation Lead)',role:'foundation_lead'},{name:'Essam',role:'instructor'},{name:'Mohammed Khery',role:'instructor'},{name:'Mohammed Soliman',role:'instructor'}]
  const toggle = (name,role)=>{const e=form.invitees.find(i=>i.name===name);setForm({...form,invitees:e?form.invitees.filter(i=>i.name!==name):[...form.invitees,{name,role}]})}
  const create = ()=>{
    if(!form.title||!form.date) return
    addMeeting({...form,createdBy:user?.name,createdByRole:'affairs',participants:[user?.name,...form.invitees.map(i=>i.name)],participantRoles:['affairs',...form.invitees.map(i=>i.role)],status:'upcoming'})
    form.invitees.forEach(i=>pushNotif(i.role,`Meeting from ${user?.name}: "${form.title}"`, 'meeting'))
    setMeets([...mockMeetings]); setModal(false)
  }
  const myMeetings = meetings.filter(m=>m.participantRoles?.includes('affairs')||m.createdByRole==='affairs')
  return (
    <div className="space-y-3 animate-fadeIn">
      <div className="flex justify-end"><button onClick={()=>setModal(true)} className="btn-primary text-xs"><Plus className="w-3.5 h-3.5"/>Schedule Meeting</button></div>
      {myMeetings.map(m=>(
        <Card key={m.id} className="flex justify-between items-start">
          <div>
            <div className="flex gap-2 mb-1"><p className="font-semibold">{m.title}</p><StatusBadge status={m.status}/>{m.createdByRole!=='affairs'&&<Badge color="teal">Invited</Badge>}</div>
            <p className="text-xs text-gray-500">{m.date} · {m.participants?.join(', ')}</p>
          </div>
          {m.status==='upcoming'&&m.link&&<a href={m.link} target="_blank" rel="noreferrer" className="btn-primary text-xs py-1.5">Join<ExternalLink className="w-3 h-3"/></a>}
        </Card>
      ))}
      <Modal open={modal} onClose={()=>setModal(false)} title="Schedule Meeting" wide>
        <div className="space-y-4">
          <div><label className="label">Title</label><input className="input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></div>
          <div><label className="label">Date & Time</label><input type="datetime-local" className="input" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></div>
          <div><label className="label">Link</label><input className="input" value={form.link} onChange={e=>setForm({...form,link:e.target.value})} placeholder="https://…"/></div>
          <div>
            <label className="label">Invite</label>
            {ALLOWED.map(inv=>(
              <label key={inv.name} className="flex items-center gap-2 p-2.5 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 mb-1.5">
                <input type="checkbox" className="accent-teal-600" checked={!!form.invitees.find(i=>i.name===inv.name)} onChange={()=>toggle(inv.name,inv.role)}/>
                <span className="text-sm text-gray-800">{inv.name}</span>
              </label>
            ))}
          </div>
          <button onClick={create} className="btn-primary w-full">Create Meeting</button>
        </div>
      </Modal>
    </div>
  )
}

function AffTasks() {
  const [tasks, setTasks] = useState(mockTasks)
  const update = (id,status)=>{ updateTask(id,status); setTasks([...mockTasks]) }
  const myTasks = tasks.filter(t=>t.assignedToRole==='affairs')
  return (
    <div className="space-y-3 animate-fadeIn">
      {myTasks.length===0&&<Card className="text-center py-8 text-gray-400 text-sm">No tasks assigned yet</Card>}
      {myTasks.map(t=>(
        <Card key={t.id}>
          <div className="flex justify-between mb-2">
            <div><p className="font-semibold text-gray-900">{t.title}</p>{t.note&&<p className="text-xs text-gray-400 italic">"{t.note}"</p>}</div>
            <div className="flex gap-2"><Badge color={t.priority==='high'?'red':t.priority==='medium'?'amber':'green'}>{t.priority}</Badge><StatusBadge status={t.status}/></div>
          </div>
          <p className="text-xs text-gray-400 mb-2">From: {t.assignedBy||'Foundation Lead'} · Due: {t.dueDate}</p>
          {t.status!=='completed'&&(
            <div className="flex gap-2">
              {t.status==='pending'&&<button onClick={()=>update(t.id,'in-progress')} className="btn-secondary text-xs py-1.5">Start Task</button>}
              {t.status==='in-progress'&&<button onClick={()=>update(t.id,'completed')} className="btn-primary text-xs py-1.5">Mark Complete</button>}
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}

function AffReports() {
  const { user, pushNotif } = useAuth()
  const [form, setForm] = useState({to:'foundation_lead',type:'Complaint Report',period:'July 2024',content:''})
  const [file, setFile] = useState(null)
  const [sent, setSent] = useState(false)
  const send = ()=>{
    if(!form.content.trim()) return
    addReport({from:user?.name,fromRole:'affairs',to:form.to==='foundation_lead'?'Foundation Lead':'Principal',type:form.type,period:form.period,content:form.content+(file?` [File: ${file.name}]`:''),fileName:file?.name||null})
    pushNotif(form.to,`Report from ${user?.name}: "${form.type}"`, 'report')
    setSent(true); setTimeout(()=>setSent(false),2500)
  }
  return (
    <div className="grid lg:grid-cols-2 gap-4 animate-fadeIn">
      <Card>
        <SectionHeader title="Submit Report"/>
        <div className="space-y-3">
          <div><label className="label">Send To</label><select className="input" value={form.to} onChange={e=>setForm({...form,to:e.target.value})}><option value="foundation_lead">Foundation Lead</option><option value="principal">Principal</option></select></div>
          <div><label className="label">Report Type</label><select className="input" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option>Complaint Report</option><option>Student Welfare Report</option><option>Survey Results</option><option>Attendance Summary</option></select></div>
          <div><label className="label">Period</label><select className="input" value={form.period} onChange={e=>setForm({...form,period:e.target.value})}><option>July 2024</option><option>June 2024</option><option>Q3 2024</option></select></div>
          <div><label className="label">Content</label><textarea className="input" rows={4} value={form.content} onChange={e=>setForm({...form,content:e.target.value})} placeholder="Report details…"/></div>
          <FileUploadBox onFile={setFile} label="Attach File (optional)" hint="Upload PDF, DOCX, or image"/>
          {sent?<div className="p-2.5 bg-green-50 text-green-700 rounded-xl text-xs text-center font-medium">✓ Report sent!</div>:<button onClick={send} className="btn-primary w-full"><Send className="w-3.5 h-3.5"/>Send Report</button>}
        </div>
      </Card>
      <Card>
        <SectionHeader title="Sent Reports"/>
        {mockReports.filter(r=>r.fromRole==='affairs').length===0?<p className="text-xs text-gray-400 text-center py-8">No reports sent yet</p>:mockReports.filter(r=>r.fromRole==='affairs').map(r=>(
          <div key={r.id} className="p-3 border border-gray-100 rounded-xl mb-2">
            <div className="flex justify-between mb-1"><p className="text-xs font-semibold">{r.type}</p><Badge color="teal">To: {r.to}</Badge></div>
            <p className="text-[10px] text-gray-400">{r.sentAt}</p>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{r.content}</p>
          </div>
        ))}
      </Card>
    </div>
  )
}
