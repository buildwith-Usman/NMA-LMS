import { useState } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import Header from '../../components/layout/Header'
import { StatCard, StatusBadge, Badge, Table, SectionHeader, Modal, MiniStat, FileUploadBox } from '../../components/ui'
import { mockMessages, mockReports, mockMeetings, mockTasks, sendMessage, addReport, addMeeting, updateTask } from '../../utils/mockData'
import { useAuth } from '../../context/AuthContext'
import { MessageSquare, BarChart3, Users, Send, Plus, Calendar, ExternalLink, CheckSquare } from 'lucide-react'

const PAGES = { dashboard:'Training Operations Dashboard', messages:'Messages', academic_team:'Academic Team', meetings:'Meetings', reports:'Reports', tasks:'My Tasks' }

export default function TrainingOpsPortal() {
  const [active, setActive] = useState('dashboard')
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar activeKey={active} onNavigate={setActive}/>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={PAGES[active]}/>
        <main className="flex-1 overflow-y-auto p-5">
          {active==='dashboard'    && <TOMDash onNavigate={setActive}/>}
          {active==='messages'     && <TOMMessages/>}
          {active==='academic_team'&& <TOMAcademic/>}
          {active==='meetings'     && <TOMMeetings/>}
          {active==='reports'      && <TOMReports/>}
          {active==='tasks'        && <TOMTasks/>}
        </main>
      </div>
    </div>
  )
}

function TOMDash({ onNavigate }) {
  const { user } = useAuth()
  const myTasks = mockTasks.filter(t=>t.assignedToRole==='training_ops')
  const unreadMsgs = mockMessages.filter(m=>!m.read&&m.toRole==='training_ops')
  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="rounded-2xl bg-gradient-to-r from-amber-600 to-yellow-700 p-5 text-white">
        <p className="text-white/60 text-xs">Training Operations Manager</p>
        <h2 className="font-bold text-2xl mt-0.5">{user?.name} 🎯</h2>
        <p className="text-white/50 text-sm mt-1">Coordinate operations, team, and reporting.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Unread Messages" value={unreadMsgs.length}   icon={MessageSquare} color="amber"  onClick={()=>onNavigate('messages')}  clickLabel="View messages"/>
        <StatCard label="Pending Tasks"   value={myTasks.filter(t=>t.status!=='completed').length} icon={CheckSquare} color="blue" onClick={()=>onNavigate('tasks')} clickLabel="View tasks"/>
        <StatCard label="Meetings"        value={mockMeetings.filter(m=>m.participantRoles?.includes('training_ops')).length} icon={Calendar} color="purple" onClick={()=>onNavigate('meetings')} clickLabel="View meetings"/>
        <StatCard label="Reports Sent"    value={mockReports.filter(r=>r.fromRole==='training_ops').length} icon={BarChart3} color="green" onClick={()=>onNavigate('reports')} clickLabel="View reports"/>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <SectionHeader title="Recent Messages"/>
          <div className="space-y-2">
            {mockMessages.filter(m=>m.fromRole==='principal'||m.toRole==='training_ops').slice(0,3).map(m=>(
              <div key={m.id} className="p-2.5 bg-gray-50 rounded-xl text-xs">
                <p className="font-medium text-gray-800">{m.from}</p>
                <p className="text-gray-500 mt-0.5">{m.text}</p>
                <p className="text-gray-400 mt-0.5">{m.time}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <SectionHeader title="My Tasks"/>
          <div className="space-y-2">
            {myTasks.slice(0,3).map(t=>(
              <div key={t.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-800">{t.title}</p>
                <StatusBadge status={t.status}/>
              </div>
            ))}
            {myTasks.length===0&&<p className="text-xs text-gray-400 text-center py-4">No tasks assigned yet</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

function TOMMessages() {
  const { user, pushNotif } = useAuth()
  const [form, setForm] = useState({to:'principal',text:''})
  const msgs = mockMessages.filter(m=>m.fromRole==='training_ops'||m.toRole==='training_ops'||m.fromRole==='principal')
  const CONTACTS = [
    {role:'principal',name:'Principal'},
    {role:'academic',name:'Academic Team (Ali/Mohammad/Abdullah/Abdulaziz)'},
  ]
  const send = () => {
    if(!form.text.trim()) return
    const c=CONTACTS.find(x=>x.role===form.to)
    sendMessage({fromRole:'training_ops',from:user?.name,toRole:form.to,to:c?.name,text:form.text})
    pushNotif(form.to, `Message from ${user?.name}: "${form.text.slice(0,40)}"`, 'message')
    setForm({...form,text:''})
  }
  return (
    <div className="grid lg:grid-cols-2 gap-4 animate-fadeIn">
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <SectionHeader title="Send Message"/>
        <div className="space-y-3">
          <div><label className="label">To</label>
            <select className="input" value={form.to} onChange={e=>setForm({...form,to:e.target.value})}>
              {CONTACTS.map(c=><option key={c.role} value={c.role}>{c.name}</option>)}
            </select>
          </div>
          <div><label className="label">Message</label><textarea className="input" rows={5} value={form.text} onChange={e=>setForm({...form,text:e.target.value})} placeholder="Type message…"/></div>
          <button onClick={send} className="btn-primary w-full flex items-center justify-center gap-1.5 text-sm"><Send className="w-3.5 h-3.5"/>Send</button>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <SectionHeader title="Conversation"/>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {msgs.length===0&&<p className="text-xs text-gray-400 text-center py-6">No messages yet</p>}
          {msgs.map(m=>(
            <div key={m.id} className={`p-3 rounded-xl text-xs ${m.fromRole==='training_ops'?'bg-amber-50 ml-4':'bg-gray-50 mr-4'}`}>
              <p className="font-semibold text-gray-700 mb-0.5">{m.fromRole==='training_ops'?'You → '+m.to:m.from}</p>
              <p className="text-gray-600">{m.text}</p>
              <p className="text-gray-400 mt-1">{m.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TOMAcademic() {
  const { user, pushNotif } = useAuth()
  const team = [{id:1,name:'Ali',role:'Academic Assistant'},{id:2,name:'Mohammad (Academic)',role:'Academic Administrator'},{id:3,name:'Abdullah (Academic)',role:'Academic Administrator'},{id:4,name:'Abdulaziz',role:'Quality Coordinator'}]
  const [msg, setMsg] = useState('')
  const sendToAcademic = () => {
    if(!msg.trim()) return
    sendMessage({fromRole:'training_ops',from:user?.name,toRole:'academic',to:'Academic Team',text:msg})
    pushNotif('academic', `Message from ${user?.name}: "${msg.slice(0,40)}"`, 'message')
    setMsg('')
  }
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <SectionHeader title="Academic Team"/>
        <Table columns={[{key:'name',label:'Name',render:v=><span className="font-medium">{v}</span>},{key:'role',label:'Role'}]} data={team}/>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm max-w-lg">
        <SectionHeader title="Message Academic Team"/>
        <div className="space-y-3">
          <textarea className="input" rows={3} value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Send a message to the whole academic team…"/>
          <button onClick={sendToAcademic} className="btn-primary text-sm flex items-center gap-1.5"><Send className="w-3.5 h-3.5"/>Send to Academic Team</button>
        </div>
      </div>
    </div>
  )
}

function TOMMeetings() {
  const { user, pushNotif } = useAuth()
  const [meetings, setMeetings] = useState(mockMeetings)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({title:'',date:'',link:'',platform:'teams',invitees:[]})
  const ALLOWED = [
    {name:'Principal',role:'principal'},
    {name:'Ali (Academic)',role:'academic'},
    {name:'Mohammad (Academic)',role:'academic'},
    {name:'Abdullah (Academic)',role:'academic'},
    {name:'Abdulaziz (Quality)',role:'academic'},
  ]
  const toggle=(name,role)=>{const e=form.invitees.find(i=>i.name===name);setForm({...form,invitees:e?form.invitees.filter(i=>i.name!==name):[...form.invitees,{name,role}]})}
  const create=()=>{
    addMeeting({...form,createdBy:user?.name,createdByRole:'training_ops',participants:[user?.name,...form.invitees.map(i=>i.name)],participantRoles:['training_ops',...form.invitees.map(i=>i.role)],status:'upcoming'})
    form.invitees.forEach(i=>pushNotif(i.role,`Meeting from ${user?.name}: "${form.title}"`, 'meeting'))
    setMeetings([...mockMeetings]); setModal(false)
  }
  const myMeetings = meetings.filter(m=>m.participantRoles?.includes('training_ops')||m.createdByRole==='training_ops')
  return (
    <div className="space-y-3 animate-fadeIn">
      <div className="flex justify-end"><button onClick={()=>setModal(true)} className="btn-primary flex items-center gap-1.5 text-xs"><Plus className="w-3.5 h-3.5"/>Schedule Meeting</button></div>
      {myMeetings.map(m=>(
        <div key={m.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex justify-between items-start">
          <div><div className="flex gap-2 mb-1"><h3 className="font-semibold text-sm text-gray-900">{m.title}</h3><StatusBadge status={m.status}/></div>
            <p className="text-xs text-gray-500">{m.date}</p><p className="text-xs text-gray-400 mt-0.5">{m.participants?.join(', ')}</p>
          </div>
          {m.status==='upcoming'&&m.link&&<a href={m.link} target="_blank" rel="noreferrer" className="btn-primary text-xs py-1.5 flex items-center gap-1">Join<ExternalLink className="w-3 h-3"/></a>}
        </div>
      ))}
      <Modal open={modal} onClose={()=>setModal(false)} title="Schedule Meeting" wide>
        <div className="space-y-4">
          <div><label className="label">Title</label><input className="input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></div>
          <div><label className="label">Date & Time</label><input type="datetime-local" className="input" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></div>
          <div><label className="label">Link</label><input className="input" value={form.link} onChange={e=>setForm({...form,link:e.target.value})}/></div>
          <div>
            <label className="label">Invite (Principal or Academic Team)</label>
            {ALLOWED.map(inv=>(
              <label key={inv.name} className="flex items-center gap-2 p-2.5 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 mb-1.5">
                <input type="checkbox" className="accent-amber-600" checked={!!form.invitees.find(i=>i.name===inv.name)} onChange={()=>toggle(inv.name,inv.role)}/>
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

function TOMReports() {
  const { user, pushNotif } = useAuth()
  const [form, setForm] = useState({type:'Operations Summary',period:'July 2024',content:''})
  const [file, setFile] = useState(null)
  const [sent, setSent] = useState(false)
  const send = () => {
    addReport({from:user?.name,fromRole:'training_ops',to:'Principal',type:form.type,period:form.period,content:form.content+(file?` [File: ${file.name}]`:'')})
    pushNotif('principal', `Report from ${user?.name}: "${form.type}"`, 'report')
    setSent(true); setTimeout(()=>setSent(false),2500)
  }
  return (
    <div className="grid lg:grid-cols-2 gap-4 animate-fadeIn">
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <SectionHeader title="Send Report to Principal"/>
        <div className="space-y-3">
          <div><label className="label">Type</label>
            <select className="input" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
              <option>Operations Summary</option><option>Training Progress</option><option>Academic Coordination</option><option>Team Performance</option>
            </select>
          </div>
          <div><label className="label">Period</label>
            <select className="input" value={form.period} onChange={e=>setForm({...form,period:e.target.value})}>
              <option>July 2024</option><option>June 2024</option><option>Q3 2024</option><option>Q2 2024</option>
            </select>
          </div>
          <div><label className="label">Content</label><textarea className="input" rows={4} value={form.content} onChange={e=>setForm({...form,content:e.target.value})} placeholder="Report content…"/></div>
          <FileUploadBox onFile={setFile} label="Attach File" hint="Upload PDF, DOCX, or image report"/>
          {sent
            ? <div className="p-2 bg-green-50 text-green-700 rounded-xl text-xs text-center">✓ Report sent to Principal!</div>
            : <button onClick={send} className="btn-primary w-full flex items-center justify-center gap-1.5 text-sm"><Send className="w-3.5 h-3.5"/>Send Report</button>
          }
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <SectionHeader title="Sent Reports"/>
        {mockReports.filter(r=>r.fromRole==='training_ops').length===0
          ? <p className="text-xs text-gray-400 text-center py-8">No reports sent yet</p>
          : mockReports.filter(r=>r.fromRole==='training_ops').map(r=>(
            <div key={r.id} className="p-3 border border-gray-100 rounded-xl mb-2">
              <p className="text-xs font-semibold text-gray-900">{r.type}—{r.period}</p>
              <p className="text-xs text-gray-400">To: {r.to}·{r.sentAt}</p>
              <p className="text-xs text-gray-500 mt-1">{r.content}</p>
            </div>
          ))
        }
      </div>
    </div>
  )
}

function TOMTasks() {
  const [tasks, setTasks] = useState(mockTasks)
  const update = (id,status) => { updateTask(id,status); setTasks([...mockTasks]) }
  const myTasks = tasks.filter(t=>t.assignedToRole==='training_ops')
  return (
    <div className="space-y-3 animate-fadeIn">
      {myTasks.length===0 && <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm text-center text-sm text-gray-400">No tasks assigned yet</div>}
      {myTasks.map(t=>(
        <div key={t.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex justify-between mb-2">
            <div><p className="font-semibold text-gray-900">{t.title}</p>{t.note&&<p className="text-xs text-gray-400 italic mt-0.5">"{t.note}"</p>}</div>
            <div className="flex gap-2"><Badge color={t.priority==='high'?'red':t.priority==='medium'?'amber':'green'}>{t.priority}</Badge><StatusBadge status={t.status}/></div>
          </div>
          <p className="text-xs text-gray-400">Due: {t.dueDate}</p>
          {t.status!=='completed'&&(
            <div className="flex gap-2 mt-3">
              {t.status==='pending'&&<button onClick={()=>update(t.id,'in-progress')} className="btn-secondary text-xs py-1.5">Start</button>}
              {t.status==='in-progress'&&<button onClick={()=>update(t.id,'completed')} className="btn-primary text-xs py-1.5">Mark Complete</button>}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

