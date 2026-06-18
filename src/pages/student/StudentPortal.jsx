import { useState } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import Header from '../../components/layout/Header'
import { StatCard, StatusBadge, Badge, Table, SectionHeader, Modal, ProgressBar, MiniStat, Card, CertificatePDF } from '../../components/ui'
import { mockStudents, mockCourses, mockAssignments, mockQuizzes, mockAttendance, mockSurveys, mockComplaints, mockMeetings, mockCertificates, submitAssignment, submitQuiz, submitSurveyResponse, addComplaint } from '../../utils/mockData'
import { useAuth } from '../../context/AuthContext'
import { BookOpen, FileText, CheckSquare, Video, ClipboardList, BarChart3, Send, Award, AlertCircle, ExternalLink, Youtube, Timer } from 'lucide-react'

const PAGES = { dashboard:'Student Dashboard', courses:'My Courses', assignments:'Assignments', quizzes:'Quizzes', liveclass:'Live Class', attendance:'My Attendance', grades:'Grades & Progress', surveys:'Surveys', complaints:'Complaints', certificates:'Certificates' }

const MY_STUDENT_ID = 18 // Ahmed is logged in

export default function StudentPortal() {
  const [active, setActive] = useState('dashboard')
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar activeKey={active} onNavigate={setActive}/>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={PAGES[active]||active}/>
        <main className="flex-1 overflow-y-auto p-5">
          {active==='dashboard'   && <StDash onNavigate={setActive}/>}
          {active==='courses'     && <StCourses/>}
          {active==='assignments' && <StAssignments/>}
          {active==='quizzes'     && <StQuizzes/>}
          {active==='liveclass'   && <StLiveClass/>}
          {active==='attendance'  && <StAttendance/>}
          {active==='grades'      && <StGrades/>}
          {active==='surveys'     && <StSurveys/>}
          {active==='complaints'  && <StComplaints/>}
          {active==='certificates'&& <StCertificates/>}
        </main>
      </div>
    </div>
  )
}

function me() { return mockStudents.find(s=>s.id===MY_STUDENT_ID) }

function StDash({ onNavigate }) {
  const { user } = useAuth()
  const student = me()
  const myCourses = mockCourses.filter(c=>student?.courses?.includes(c.id))
  const myAsgn   = mockAssignments.filter(a=>student?.courses?.includes(a.courseId))
  const pending  = myAsgn.filter(a=>!a.submissions.find(s=>s.studentId===MY_STUDENT_ID))
  const myCerts  = mockCertificates.filter(c=>c.studentId===MY_STUDENT_ID)
  const unreadSurveys = mockSurveys.filter(s=>!s.responses.find(r=>r.studentId===MY_STUDENT_ID))
  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-700 p-5 text-white">
        <p className="text-white/60 text-xs">Student</p>
        <h2 className="font-bold text-2xl mt-0.5">{user?.name||student?.name} 🎓</h2>
        <p className="text-white/50 text-sm mt-1">Attendance: {student?.attendanceRate}% · GPA: {student?.gpa}</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="My Courses"     value={myCourses.length}    icon={BookOpen}   color="blue"   onClick={()=>onNavigate('courses')}     clickLabel="View courses"/>
        <StatCard label="Pending Tasks"  value={pending.length}      icon={FileText}   color="amber"  onClick={()=>onNavigate('assignments')} clickLabel="Submit assignments"/>
        <StatCard label="Surveys"        value={unreadSurveys.length}icon={Send}       color="teal"   onClick={()=>onNavigate('surveys')}    clickLabel="Fill surveys"/>
        <StatCard label="Certificates"   value={myCerts.length}      icon={Award}      color="sky"    onClick={()=>onNavigate('certificates')}clickLabel="View certificates"/>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <SectionHeader title="My Courses"/>
          {myCourses.map(c=>(
            <div key={c.id} className="mb-3">
              <div className="flex justify-between mb-1"><p className="text-sm font-semibold truncate pr-2">{c.name}</p><Badge color="sky">{c.progress}%</Badge></div>
              <ProgressBar value={c.progress} color="sky"/>
              <p className="text-xs text-gray-400 mt-1">Next: {c.nextClass}</p>
            </div>
          ))}
        </Card>
        <Card>
          <SectionHeader title="My Attendance"/>
          <div className="flex gap-3 mb-3">
            {mockCourses.filter(c=>student?.courses?.includes(c.id)).map(c=>{
              const recs=mockAttendance.filter(a=>a.courseId===c.id&&a.studentId===MY_STUDENT_ID)
              const rate=recs.length?Math.round(recs.filter(r=>r.status==='present').length/recs.length*100):0
              return <MiniStat key={c.id} label={c.name.split(' ')[0]} value={`${rate}%`} color={rate>=80?'green':rate>=60?'amber':'red'}/>
            })}
          </div>
          <div className="flex gap-2">
            <MiniStat label="Overall" value={`${student?.attendanceRate}%`} color={student?.attendanceRate>=80?'green':student?.attendanceRate>=60?'amber':'red'}/>
            <MiniStat label="GPA"     value={student?.gpa} color="blue"/>
            <MiniStat label="Status"  value={student?.status} color={student?.status==='active'?'green':'red'}/>
          </div>
        </Card>
      </div>
    </div>
  )
}

function StCourses() {
  const student = me()
  return (
    <div className="space-y-3 animate-fadeIn">
      {mockCourses.filter(c=>student?.courses?.includes(c.id)).map(c=>(
        <Card key={c.id}>
          <div className="flex justify-between mb-2"><div><p className="font-semibold text-gray-900">{c.name}</p><p className="text-xs text-gray-400">{c.instructor} · Next: {c.nextClass}</p></div><Badge color="sky">{c.progress}%</Badge></div>
          <ProgressBar value={c.progress} color="sky" size="lg"/>
          <div className="flex gap-2 mt-3 flex-wrap">
            {c.teamsLink&&<a href={c.teamsLink} target="_blank" rel="noreferrer" className="btn-secondary text-xs py-1.5"><ExternalLink className="w-3 h-3"/>Teams</a>}
            {c.classroomLink&&<a href={c.classroomLink} target="_blank" rel="noreferrer" className="btn-secondary text-xs py-1.5"><ExternalLink className="w-3 h-3"/>Classroom</a>}
          </div>
          {c.youtubeLinks?.length>0&&(
            <div className="mt-3 border-t border-gray-100 pt-2">
              <p className="label mb-1">Lecture Recordings</p>
              {c.youtubeLinks.map(v=><a key={v.id} href={v.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-red-600 hover:underline mb-1"><Youtube className="w-3 h-3"/>{v.title}</a>)}
            </div>
          )}
          {c.materials?.length>0&&(
            <div className="mt-2 border-t border-gray-100 pt-2">
              <p className="label mb-1">Materials</p>
              {c.materials.map(m=><p key={m.id} className="text-xs text-gray-500">📄 {m.name}</p>)}
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}

function StAssignments() {
  const { pushNotif } = useAuth()
  const student = me()
  const myAsgn  = mockAssignments.filter(a=>student?.courses?.includes(a.courseId))
  const [file, setFile] = useState({})
  const submit = (a)=>{
    submitAssignment(a.id, MY_STUDENT_ID, student?.name, file[a.id]?.name||'submission.pdf')
    pushNotif('instructor',`${student?.name} submitted "${a.title}"`, 'assignment')
    setFile({...file,[a.id]:null})
  }
  return (
    <div className="space-y-4 animate-fadeIn">
      {myAsgn.map(a=>{
        const mySub=a.submissions.find(s=>s.studentId===MY_STUDENT_ID)
        return (
          <Card key={a.id}>
            <div className="flex justify-between mb-2"><div><p className="font-semibold text-gray-900">{a.title}</p><p className="text-xs text-gray-400">{mockCourses.find(c=>c.id===a.courseId)?.name} · Due: {a.dueDate}</p></div><StatusBadge status={mySub?.status||'pending'}/></div>
            <p className="text-sm text-gray-600 mb-3">{a.description}</p>
            {mySub?.status==='graded'?(
              <div className="p-3 bg-green-50 border border-green-100 rounded-xl">
                <p className="text-sm font-bold text-green-700">Grade: {mySub.grade}/100</p>
                <p className="text-xs text-gray-500 mt-1">Feedback: {mySub.feedback||'—'}</p>
              </div>
            ):mySub?.status==='submitted'?(
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-700">Submitted on {mySub.submittedAt} — Awaiting grade</div>
            ):(
              <div className="space-y-3">
                <div>
                  <label className="label">Upload Your Work</label>
                  <input type="file" id={`f${a.id}`} className="hidden" onChange={e=>setFile({...file,[a.id]:e.target.files[0]})}/>
                  <label htmlFor={`f${a.id}`} className="flex items-center gap-2 p-2.5 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-sky-300 hover:bg-sky-50 transition-colors">
                    <FileText className="w-4 h-4 text-gray-400"/>
                    <span className="text-xs text-gray-500">{file[a.id]?.name||'Click to upload file…'}</span>
                  </label>
                </div>
                <button onClick={()=>submit(a)} className="btn-primary text-xs py-2"><Send className="w-3.5 h-3.5"/>Submit Assignment</button>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}

function StQuizzes() {
  const { pushNotif } = useAuth()
  const student = me()
  const myQuizzes = mockQuizzes.filter(q=>student?.courses?.includes(q.courseId))
  const [taking, setTaking] = useState(null)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const start = q=>{ setTaking(q); setAnswers({}); setResult(null) }
  const finish = ()=>{
    const ans = taking.questions.map((_,i)=>answers[i]??-1)
    const score = submitQuiz(taking.id, MY_STUDENT_ID, student?.name, ans)
    pushNotif('instructor',`${student?.name} completed quiz "${taking.title}" — Score: ${score}%`, 'quiz')
    setResult(score); setTaking(null)
  }
  return (
    <div className="space-y-4 animate-fadeIn">
      {myQuizzes.map(q=>{
        const mySub = q.submissions.find(s=>s.studentId===MY_STUDENT_ID)
        return (
          <Card key={q.id}>
            <div className="flex justify-between mb-2"><div><p className="font-semibold">{q.title}</p><p className="text-xs text-gray-400">{mockCourses.find(c=>c.id===q.courseId)?.name} · {q.questions.length} questions · {q.duration} min · Due: {q.dueDate}</p></div>
              {mySub?<Badge color={mySub.score>=70?'green':'red'}>{mySub.overrideGrade??mySub.score}%</Badge>:<Badge color="blue">Not taken</Badge>}
            </div>
            {mySub?<p className="text-sm text-green-700">✓ Completed on {mySub.submittedAt} · Score: {mySub.overrideGrade??mySub.score}%</p>:<button onClick={()=>start(q)} className="btn-primary text-xs py-2"><Timer className="w-3.5 h-3.5"/>Start Quiz</button>}
          </Card>
        )
      })}
      <Modal open={!!taking} onClose={()=>setTaking(null)} title={taking?.title||''} wide>
        {taking&&(
          <div className="space-y-5">
            <div className="flex justify-between text-xs text-gray-400"><span>{taking.questions.length} questions</span><span className="flex items-center gap-1"><Timer className="w-3 h-3"/>{taking.duration} min</span></div>
            {taking.questions.map((q,qi)=>(
              <div key={qi}>
                <p className="font-medium text-sm text-gray-900 mb-2">{qi+1}. {q.text}</p>
                {q.options.map((opt,oi)=>(
                  <label key={oi} className={`flex items-center gap-2 p-2.5 border rounded-xl cursor-pointer mb-1.5 transition-colors ${answers[qi]===oi?'border-sky-400 bg-sky-50':'border-gray-100 hover:bg-gray-50'}`}>
                    <input type="radio" name={`q${qi}`} checked={answers[qi]===oi} onChange={()=>setAnswers({...answers,[qi]:oi})} className="accent-sky-500"/>
                    <span className="text-sm text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
            ))}
            <button onClick={finish} className="btn-primary w-full">Submit Quiz</button>
          </div>
        )}
      </Modal>
      {result!==null&&(
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <Card className="max-w-sm w-full text-center p-8">
            <div className="text-5xl mb-3">{result>=70?'🎉':'📚'}</div>
            <h2 className="font-bold text-2xl mb-1">{result}%</h2>
            <p className="text-gray-500 text-sm mb-4">{result>=70?'Well done!':'Keep studying — you can retake later.'}</p>
            <button onClick={()=>setResult(null)} className="btn-primary w-full">Close</button>
          </Card>
        </div>
      )}
    </div>
  )
}

function StLiveClass() {
  const student = me()
  const myMeetings = mockMeetings.filter(m=>m.participantRoles?.includes('student')||m.courseId&&student?.courses?.includes(m.courseId))
  return (
    <div className="space-y-3 animate-fadeIn">
      {myMeetings.length===0&&<Card className="text-center py-10 text-gray-400 text-sm">No live classes scheduled yet</Card>}
      {myMeetings.map(m=>(
        <Card key={m.id} className="flex justify-between items-start">
          <div>
            <div className="flex gap-2 mb-1"><p className="font-semibold">{m.title}</p><StatusBadge status={m.status}/></div>
            <p className="text-xs text-gray-500">{m.date}</p>
            <p className="text-xs text-gray-400 mt-0.5">{m.participants?.join(', ')}</p>
          </div>
          {m.status==='upcoming'&&m.link&&<a href={m.link} target="_blank" rel="noreferrer" className="btn-primary text-xs py-1.5">Join <ExternalLink className="w-3 h-3"/></a>}
        </Card>
      ))}
    </div>
  )
}

function StAttendance() {
  const student = me()
  const recs = mockAttendance.filter(a=>a.studentId===MY_STUDENT_ID)
  const present = recs.filter(r=>r.status==='present').length
  const rate = recs.length?Math.round(present/recs.length*100):0
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex gap-3">
        <MiniStat label="Present" value={present} color="green"/>
        <MiniStat label="Absent"  value={recs.filter(r=>r.status==='absent').length} color="red"/>
        <MiniStat label="Late"    value={recs.filter(r=>r.status==='late').length} color="amber"/>
        <MiniStat label="Rate"    value={`${rate}%`} color="blue"/>
      </div>
      <Card><Table columns={[{key:'courseId',label:'Course',render:v=>mockCourses.find(c=>c.id===v)?.name?.split(' ')[0]||`#${v}`},{key:'date',label:'Date'},{key:'status',label:'Status',render:v=><StatusBadge status={v}/>}]} data={recs} emptyMsg="No attendance records."/></Card>
    </div>
  )
}

function StGrades() {
  const student = me()
  const myAsgn  = mockAssignments.filter(a=>student?.courses?.includes(a.courseId))
  const myQuizzes = mockQuizzes.filter(q=>student?.courses?.includes(q.courseId))
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex gap-3"><MiniStat label="Overall GPA" value={student?.gpa} color="blue"/><MiniStat label="Attendance" value={`${student?.attendanceRate}%`} color="green"/><MiniStat label="Status" value={student?.status} color={student?.status==='active'?'green':'red'}/></div>
      <Card>
        <SectionHeader title="Assignments"/>
        {myAsgn.map(a=>{const s=a.submissions.find(x=>x.studentId===MY_STUDENT_ID);return <div key={a.id} className="flex justify-between py-2 border-b border-gray-50 last:border-0 text-sm"><span className="text-gray-800">{a.title}</span><div className="flex gap-2">{s?s.status==='graded'?<Badge color="green">{s.grade}/100</Badge>:<Badge color="amber">Submitted</Badge>:<Badge color="gray">Not submitted</Badge>}</div></div>})}
      </Card>
      <Card>
        <SectionHeader title="Quizzes"/>
        {myQuizzes.map(q=>{const s=q.submissions.find(x=>x.studentId===MY_STUDENT_ID);return <div key={q.id} className="flex justify-between py-2 border-b border-gray-50 last:border-0 text-sm"><span className="text-gray-800">{q.title}</span>{s?<Badge color={s.score>=70?'green':'red'}>{s.overrideGrade??s.score}%</Badge>:<Badge color="gray">Not taken</Badge>}</div>})}
      </Card>
    </div>
  )
}

function StSurveys() {
  const { pushNotif } = useAuth()
  const student = me()
  const [answers, setAnswers] = useState({})
  const [comment, setComment] = useState({})
  const [submitted, setSubmitted] = useState({})
  const submit = (sv)=>{
    submitSurveyResponse(sv.id, MY_STUDENT_ID, student?.name, answers[sv.id]||{}, comment[sv.id]||'')
    setSubmitted({...submitted,[sv.id]:true})
  }
  return (
    <div className="space-y-4 animate-fadeIn">
      {mockSurveys.filter(s=>s.status==='active').map(sv=>{
        const already = sv.responses.find(r=>r.studentId===MY_STUDENT_ID) || submitted[sv.id]
        return (
          <Card key={sv.id}>
            <div className="flex justify-between mb-3"><div><p className="font-semibold">{sv.title}</p><p className="text-xs text-gray-400">By {sv.createdBy} · Due: {sv.deadline}</p></div>{already?<Badge color="green">Completed ✓</Badge>:<Badge color="amber">Pending</Badge>}</div>
            {!already?(
              <div className="space-y-3">
                {sv.questions.map(q=>(
                  <div key={q.id}>
                    <p className="text-sm font-medium text-gray-800 mb-2">{q.text}</p>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(star=>(
                        <button key={star} onClick={()=>setAnswers(a=>({...a,[sv.id]:{...(a[sv.id]||{}),[q.id]:star}}))}
                          className={`w-9 h-9 rounded-xl text-lg transition-colors ${(answers[sv.id]?.[q.id]||0)>=star?'text-amber-500':'text-gray-200 hover:text-amber-300'}`}>★</button>
                      ))}
                    </div>
                  </div>
                ))}
                <div><label className="label">Comment (optional)</label><textarea className="input" rows={2} value={comment[sv.id]||''} onChange={e=>setComment({...comment,[sv.id]:e.target.value})}/></div>
                <button onClick={()=>submit(sv)} className="btn-primary text-xs py-2"><Send className="w-3.5 h-3.5"/>Submit Survey</button>
              </div>
            ):<p className="text-sm text-green-700 text-center py-4">Thank you for your response! ✓</p>}
          </Card>
        )
      })}
    </div>
  )
}

function StComplaints() {
  const { pushNotif } = useAuth()
  const student = me()
  const [modal, setModal] = useState(false)
  const [form, setForm]   = useState({subject:'',desc:'',priority:'medium'})
  const mine = mockComplaints.filter(c=>c.fromId===MY_STUDENT_ID)
  const submit = ()=>{
    addComplaint({fromId:MY_STUDENT_ID,from:student?.name,fromRole:'student',subject:form.subject,desc:form.desc,assignedTo:'Student Affairs Assistant',priority:form.priority,status:'pending',date:new Date().toISOString().split('T')[0]})
    pushNotif('affairs',`Student complaint: "${form.subject}"`, 'complaint')
    setModal(false); setForm({subject:'',desc:'',priority:'medium'})
  }
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex justify-end"><button onClick={()=>setModal(true)} className="btn-primary text-xs"><AlertCircle className="w-3.5 h-3.5"/>Submit Complaint</button></div>
      <Card><SectionHeader title="My Complaints"/><Table columns={[{key:'subject',label:'Subject'},{key:'priority',label:'Priority',render:v=><Badge color={v==='high'?'red':v==='medium'?'amber':'green'}>{v}</Badge>},{key:'status',label:'Status',render:v=><StatusBadge status={v}/>},{key:'date',label:'Date'}]} data={mine} emptyMsg="No complaints submitted."/></Card>
      <Modal open={modal} onClose={()=>setModal(false)} title="Submit Complaint">
        <div className="space-y-4">
          <div><label className="label">Subject</label><input className="input" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} placeholder="Brief subject…"/></div>
          <div><label className="label">Description</label><textarea className="input" rows={4} value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})} placeholder="Describe the issue…"/></div>
          <div><label className="label">Priority</label><select className="input" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
          <button onClick={submit} className="btn-primary w-full">Submit Complaint</button>
        </div>
      </Modal>
    </div>
  )
}

function StCertificates() {
  const [viewCert, setViewCert] = useState(null)
  const myCerts = mockCertificates.filter(c=>c.studentId===MY_STUDENT_ID)
  return (
    <div className="space-y-4 animate-fadeIn">
      {myCerts.length===0&&<Card className="text-center py-10 text-gray-400 text-sm">No certificates yet. Complete a course to earn one!</Card>}
      {myCerts.map(c=>(
        <Card key={c.id} className="cursor-pointer hover:shadow-md transition-all" onClick={()=>setViewCert(c)}>
          <div className="flex justify-between items-center">
            <div><p className="font-semibold text-gray-900">{c.courseName}</p><p className="text-xs text-gray-400">Issued by {c.issuedBy} on {c.issuedAt}</p></div>
            <div className="flex gap-2"><Badge color="sky">{c.grade}</Badge><Award className="w-5 h-5 text-amber-400"/></div>
          </div>
          <p className="text-[10px] text-blue-500 mt-2">↗ Click to view certificate</p>
        </Card>
      ))}
      {viewCert&&<CertificatePDF cert={viewCert} onClose={()=>setViewCert(null)}/>}
    </div>
  )
}
