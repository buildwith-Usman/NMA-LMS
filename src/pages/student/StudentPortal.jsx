import { useState } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import Header from '../../components/layout/Header'
import { StatCard, StatusBadge, Badge, Table, SectionHeader, Modal, ProgressBar, MiniStat, Card, CertificatePDF, SelectFilter } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { BookOpen, FileText, CheckSquare, Video, ClipboardList, BarChart3, Send, Award, AlertCircle, ExternalLink, Youtube, Timer, Download, Trophy } from 'lucide-react'

const PAGES = { dashboard:'Student Dashboard', courses:'My Courses', assignments:'Assignments', quizzes:'Quizzes', liveclass:'Live Class', attendance:'My Attendance', grades:'Grades & Progress', results:'My Results', surveys:'Surveys', complaints:'Complaints', certificates:'Certificates' }

export default function StudentPortal() {
  const [active, setActive] = useState('dashboard')
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar activeKey={active} onNavigate={setActive}/>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={PAGES[active]||active} onNavigate={setActive}/>
        <main className="flex-1 overflow-y-auto p-5">
          {active==='dashboard'   && <StDash onNavigate={setActive}/>}
          {active==='courses'     && <StCourses/>}
          {active==='assignments' && <StAssignments/>}
          {active==='quizzes'     && <StQuizzes/>}
          {active==='liveclass'   && <StLiveClass/>}
          {active==='attendance'  && <StAttendance/>}
          {active==='grades'      && <StGrades/>}
          {active==='results'     && <StResults/>}
          {active==='surveys'     && <StSurveys/>}
          {active==='complaints'  && <StComplaints/>}
          {active==='certificates'&& <StCertificates/>}
        </main>
      </div>
    </div>
  )
}

function useStudent() {
  const { user } = useAuth()
  const { mockStudents } = useData()
  return mockStudents.find(s => s.authId === user?.id) || null
}

function StDash({ onNavigate }) {
  const { user } = useAuth()
  const { mockCourses, mockAssignments, mockCertificates, mockSurveys, mockAttendance } = useData()
  const student = useStudent()
  const myCourses = mockCourses.filter(c => student?.courses?.includes(c.id))
  const myAsgn    = mockAssignments.filter(a => student?.courses?.includes(a.courseId))
  const pending   = myAsgn.filter(a => !a.submissions.find(s => s.studentId === student?.id))
  const myCerts   = mockCertificates.filter(c => c.studentId === student?.id)
  const unreadSurveys = mockSurveys.filter(s => !s.responses.find(r => r.studentId === student?.id))
  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-700 p-5 text-white">
        <p className="text-white/60 text-xs">Student</p>
        <h2 className="font-bold text-2xl mt-0.5">{user?.name||student?.name} 🎓</h2>
        <p className="text-white/50 text-sm mt-1">Attendance: {student?.attendanceRate}% · GPA: {student?.gpa}</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="My Courses"     value={myCourses.length}     icon={BookOpen} color="blue"  onClick={()=>onNavigate('courses')}     clickLabel="View courses"/>
        <StatCard label="Pending Tasks"  value={pending.length}       icon={FileText} color="amber" onClick={()=>onNavigate('assignments')} clickLabel="Submit assignments"/>
        <StatCard label="Surveys"        value={unreadSurveys.length} icon={Send}     color="teal"  onClick={()=>onNavigate('surveys')}    clickLabel="Fill surveys"/>
        <StatCard label="Certificates"   value={myCerts.length}       icon={Award}    color="sky"   onClick={()=>onNavigate('certificates')}clickLabel="View certificates"/>
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
            {myCourses.map(c=>{
              const recs = mockAttendance.filter(a=>a.courseId===c.id&&a.studentId===student?.id)
              const rate = recs.length?Math.round(recs.filter(r=>r.status==='present').length/recs.length*100):0
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
  const { mockCourses } = useData()
  const student = useStudent()
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
              {c.materials.map(m=>(
                <div key={m.id} className="flex items-center justify-between py-0.5">
                  <p className="text-xs text-gray-500">📄 {m.name}{m.size&&` — ${m.size}`}</p>
                  {m.date&&<span className="text-[10px] text-gray-300">{m.date}</span>}
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}

function StAssignments() {
  const { pushNotif } = useAuth()
  const { mockAssignments, mockCourses, submitAssignment } = useData()
  const student = useStudent()
  const myAsgn  = mockAssignments.filter(a => student?.courses?.includes(a.courseId))
  const [file,    setFile]    = useState({})   // asgId -> File
  const [text,    setText]    = useState({})   // asgId -> string
  const [mode,    setMode]    = useState({})   // asgId -> 'file'|'online'

  const submit = async (a) => {
    const m = mode[a.id] || 'file'
    const f = m === 'file'   ? (file[a.id]?.name || '') : ''
    const t = m === 'online' ? (text[a.id] || '')        : ''
    if (!f && !t) return
    await submitAssignment(a.id, student?.id, student?.name, f, t)
    await pushNotif('instructor', `${student?.name} submitted "${a.title}"`, 'assignment', 'assignments')
    setFile(p=>({...p,[a.id]:null})); setText(p=>({...p,[a.id]:''}))
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      {myAsgn.length===0&&<Card className="text-center py-10 text-gray-400 text-sm">No assignments yet</Card>}
      {myAsgn.map(a=>{
        const mySub = a.submissions.find(s => s.studentId === student?.id)
        const m     = mode[a.id] || 'file'
        return (
          <Card key={a.id}>
            <div className="flex justify-between mb-1">
              <div>
                <p className="font-semibold text-gray-900">{a.title}</p>
                <p className="text-xs text-gray-400">{mockCourses.find(c=>c.id===a.courseId)?.name} · Due: {a.dueDate} · {a.totalMarks||100} marks</p>
              </div>
              <StatusBadge status={mySub?.status||'pending'}/>
            </div>
            {a.description&&<p className="text-sm text-gray-600 mb-1">{a.description}</p>}
            {a.instructions&&(
              <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-800 mb-2">
                📋 <strong>Instructions:</strong> {a.instructions}
              </div>
            )}
            {a.fileName&&<p className="text-xs text-indigo-500 mb-2">📎 Supporting file: {a.fileName}</p>}

            {mySub?.status==='graded'?(
              <div className="p-3 bg-green-50 border border-green-100 rounded-xl space-y-1">
                <p className="text-sm font-bold text-green-700">Grade: {mySub.grade}/{a.totalMarks||100}</p>
                <p className="text-xs text-gray-500">Submitted: {mySub.submittedAt}</p>
                {mySub.file&&<p className="text-xs text-gray-400">📎 {mySub.file}</p>}
                {mySub.text&&<p className="text-xs text-gray-400">✏️ Online submission</p>}
                <p className="text-xs text-gray-600 mt-1">Feedback: {mySub.feedback||'—'}</p>
              </div>
            ):mySub?.status==='submitted'?(
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-700">
                Submitted on {mySub.submittedAt} — Awaiting grade
                {mySub.file&&<p className="text-xs text-amber-600 mt-0.5">📎 {mySub.file}</p>}
                {mySub.text&&<p className="text-xs text-amber-600 mt-0.5">✏️ Online text submitted</p>}
              </div>
            ):(
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button onClick={()=>setMode(p=>({...p,[a.id]:'file'}))} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${m==='file'?'bg-sky-100 text-sky-700':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>📎 Upload File</button>
                  <button onClick={()=>setMode(p=>({...p,[a.id]:'online'}))} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${m==='online'?'bg-indigo-100 text-indigo-700':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>✏️ Write Online</button>
                </div>
                {m==='file'&&(
                  <div>
                    <input type="file" id={`f${a.id}`} className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.png,.jpg" onChange={e=>setFile(p=>({...p,[a.id]:e.target.files[0]}))}/>
                    <label htmlFor={`f${a.id}`} className="flex items-center gap-2 p-2.5 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-sky-300 hover:bg-sky-50 transition-colors">
                      <FileText className="w-4 h-4 text-gray-400"/>
                      <span className="text-xs text-gray-500">{file[a.id]?.name||'Click to upload (PDF, DOCX, PPT, ZIP, images)…'}</span>
                    </label>
                  </div>
                )}
                {m==='online'&&(
                  <textarea className="input" rows={5} value={text[a.id]||''} onChange={e=>setText(p=>({...p,[a.id]:e.target.value}))} placeholder="Write your answer here…"/>
                )}
                <button onClick={()=>submit(a)} className="btn-primary text-xs py-2"><Send className="w-3.5 h-3.5"/>Submit Assignment</button>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}

const ST_AUTO_TYPES = ['mcq','true_false']
const ATYPE_LABEL_ST = {quiz:'Quiz',exam:'Exam',practice_test:'Practice Test'}

function StQuizzes() {
  const { pushNotif } = useAuth()
  const { mockQuizzes, mockCourses, submitQuiz } = useData()
  const student   = useStudent()
  const myQuizzes = mockQuizzes.filter(q => student?.courses?.includes(q.courseId))
  const [taking,   setTaking]   = useState(null)
  const [answers,  setAnswers]  = useState({})   // qi -> option index (for MCQ/TF/multi)
  const [textAns,  setTextAns]  = useState({})   // qi -> string (for subjective)
  const [result,   setResult]   = useState(null) // {score, passed, hasSubjective}

  const start = q => { setTaking(q); setAnswers({}); setTextAns({}); setResult(null) }

  const finish = async () => {
    const ans  = taking.questions.map((_, i) => answers[i] ?? -1)
    const txts = textAns
    const score = await submitQuiz(taking.id, student?.id, student?.name, ans, txts)
    const hasSubjective = taking.questions.some(q => !ST_AUTO_TYPES.includes(q.type||'mcq'))
    await pushNotif('instructor', `${student?.name} submitted "${taking.title}" — Auto score: ${score}%`, 'quiz', 'quizzes')
    setResult({ score, passed: score >= (taking.passingMarks||50), hasSubjective })
    setTaking(null)
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      {myQuizzes.length===0&&<Card className="text-center py-10 text-gray-400 text-sm">No assessments assigned yet</Card>}
      {myQuizzes.map(q=>{
        const mySub     = q.submissions.find(s => s.studentId === student?.id)
        const display   = mySub?.overrideGrade ?? mySub?.score ?? null
        const passed    = display !== null && display >= (q.passingMarks||50)
        const pending   = mySub?.hasSubjective && mySub?.overrideGrade === null
        return (
          <Card key={q.id}>
            <div className="flex justify-between mb-1">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold">{q.title}</p>
                  <Badge color="purple">{ATYPE_LABEL_ST[q.assessmentType]||q.assessmentType}</Badge>
                </div>
                <p className="text-xs text-gray-400">{mockCourses.find(c=>c.id===q.courseId)?.name} · {q.questions.length} q · {q.duration} min · Pass: {q.passingMarks}% · Due: {q.dueDate}</p>
              </div>
              {mySub
                ? pending
                  ? <Badge color="amber">Pending Grade</Badge>
                  : <Badge color={passed?'green':'red'}>{display}%</Badge>
                : <Badge color="blue">Not taken</Badge>
              }
            </div>
            {q.instructions&&<p className="text-xs text-gray-400 italic mb-2">📋 {q.instructions}</p>}
            {mySub ? (
              <div className={`p-3 rounded-xl border text-sm ${passed?'bg-green-50 border-green-100':'bg-red-50 border-red-100'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{pending?'⏳':passed?'🎉':'📚'}</span>
                  <div>
                    {pending
                      ? <p className="font-semibold text-amber-700">Awaiting instructor grade for subjective answers</p>
                      : <><p className={`font-bold text-lg ${passed?'text-green-700':'text-red-600'}`}>{display}% — {passed?'Pass':'Fail'}</p>
                          <p className="text-xs text-gray-500">Submitted: {mySub.submittedAt}</p></>
                    }
                    {mySub.feedback&&<p className="text-xs text-gray-600 mt-1">Feedback: {mySub.feedback}</p>}
                  </div>
                </div>
              </div>
            ):(
              <button onClick={()=>start(q)} className="btn-primary text-xs py-2"><Timer className="w-3.5 h-3.5"/>Start {ATYPE_LABEL_ST[q.assessmentType]||'Assessment'}</button>
            )}
          </Card>
        )
      })}

      <Modal open={!!taking} onClose={()=>setTaking(null)} title={taking?.title||''} wide>
        {taking&&(
          <div className="space-y-5">
            <div className="flex justify-between text-xs text-gray-400 bg-gray-50 p-2.5 rounded-xl">
              <span>{taking.questions.length} questions · {taking.duration} min</span>
              <span>Pass: {taking.passingMarks}% · Total: {taking.totalMarks} marks</span>
            </div>
            {taking.instructions&&<p className="text-xs text-indigo-700 bg-indigo-50 p-2.5 rounded-xl">{taking.instructions}</p>}
            {taking.questions.map((q,qi)=>(
              <div key={qi} className="border border-gray-100 rounded-xl p-3">
                <p className="font-medium text-sm text-gray-900 mb-3">{qi+1}. {q.text}</p>
                {(q.type==='mcq')&&q.options.map((opt,oi)=>(
                  <label key={oi} className={`flex items-center gap-2 p-2.5 border rounded-xl cursor-pointer mb-1.5 transition-colors ${answers[qi]===oi?'border-sky-400 bg-sky-50':'border-gray-100 hover:bg-gray-50'}`}>
                    <input type="radio" name={`st_q${qi}`} checked={answers[qi]===oi} onChange={()=>setAnswers(p=>({...p,[qi]:oi}))} className="accent-sky-500"/>
                    <span className="text-sm text-gray-700">{opt}</span>
                  </label>
                ))}
                {q.type==='true_false'&&['True','False'].map((opt,oi)=>(
                  <label key={oi} className={`flex items-center gap-2 p-2.5 border rounded-xl cursor-pointer mb-1.5 transition-colors ${answers[qi]===oi?'border-sky-400 bg-sky-50':'border-gray-100 hover:bg-gray-50'}`}>
                    <input type="radio" name={`st_q${qi}`} checked={answers[qi]===oi} onChange={()=>setAnswers(p=>({...p,[qi]:oi}))} className="accent-sky-500"/>
                    <span className="text-sm text-gray-700">{opt}</span>
                  </label>
                ))}
                {q.type==='multi_select'&&q.options.map((opt,oi)=>(
                  <label key={oi} className={`flex items-center gap-2 p-2.5 border rounded-xl cursor-pointer mb-1.5 transition-colors ${(answers[qi]||[]).includes(oi)?'border-sky-400 bg-sky-50':'border-gray-100 hover:bg-gray-50'}`}>
                    <input type="checkbox" checked={(answers[qi]||[]).includes(oi)} onChange={()=>{const cur=answers[qi]||[];setAnswers(p=>({...p,[qi]:cur.includes(oi)?cur.filter(x=>x!==oi):[...cur,oi]}))}} className="accent-sky-500"/>
                    <span className="text-sm text-gray-700">{opt}</span>
                  </label>
                ))}
                {['fill_blank','short_answer'].includes(q.type)&&(
                  <input className="input text-sm" value={textAns[qi]||''} onChange={e=>setTextAns(p=>({...p,[qi]:e.target.value}))} placeholder="Your answer…"/>
                )}
                {['long_answer','essay'].includes(q.type)&&(
                  <textarea className="input text-sm" rows={4} value={textAns[qi]||''} onChange={e=>setTextAns(p=>({...p,[qi]:e.target.value}))} placeholder="Write your answer…"/>
                )}
              </div>
            ))}
            <button onClick={finish} className="btn-primary w-full">Submit Assessment</button>
          </div>
        )}
      </Modal>

      {result!==null&&(
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <Card className="max-w-sm w-full text-center p-8">
            <div className="text-5xl mb-3">{result.hasSubjective?'⏳':result.passed?'🎉':'📚'}</div>
            {result.hasSubjective
              ? <><h2 className="font-bold text-xl mb-1 text-amber-600">Submitted!</h2>
                  <p className="text-gray-500 text-sm mb-4">Auto-graded questions are scored. Subjective answers are awaiting instructor review.</p></>
              : <><h2 className="font-bold text-2xl mb-1">{result.score}%</h2>
                  <p className={`font-bold mb-1 ${result.passed?'text-green-600':'text-red-500'}`}>{result.passed?'PASS':'FAIL'}</p>
                  <p className="text-gray-500 text-sm mb-4">{result.passed?'Well done!':'Keep studying — check with your instructor.'}</p></>
            }
            <button onClick={()=>setResult(null)} className="btn-primary w-full">Close</button>
          </Card>
        </div>
      )}
    </div>
  )
}

function StLiveClass() {
  const { mockMeetings } = useData()
  const student = useStudent()
  // Show live classes for enrolled courses (instructor-created with courseId) OR meetings where student is explicitly a participant
  const myMeetings = mockMeetings.filter(m =>
    (m.courseId && student?.courses?.includes(m.courseId)) ||
    m.participantRoles?.includes('student')
  )
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
  const { mockAttendance, mockCourses } = useData()
  const student   = useStudent()
  const [cid, setCid] = useState('')

  const allRecs = mockAttendance.filter(a => a.studentId === student?.id)
  const recs    = cid ? allRecs.filter(r => r.courseId === parseInt(cid)) : allRecs
  const sorted  = [...recs].sort((a, b) => b.date.localeCompare(a.date))

  const present = recs.filter(r => r.status === 'present').length
  const absent  = recs.filter(r => r.status === 'absent').length
  const late    = recs.filter(r => r.status === 'late').length
  const rate    = recs.length ? Math.round(present / recs.length * 100) : 0

  const myCourses = mockCourses.filter(c => student?.courses?.includes(c.id))

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex gap-3 flex-wrap">
        <MiniStat label="Present" value={present} color="green"/>
        <MiniStat label="Absent"  value={absent}  color="red"/>
        <MiniStat label="Late"    value={late}    color="amber"/>
        <MiniStat label="Rate"    value={`${rate}%`} color="blue"/>
      </div>
      <SelectFilter label="Course" value={cid} onChange={setCid} options={myCourses.map(c=>({value:String(c.id),label:c.name}))} placeholder="All Courses"/>
      <Card>
        <Table
          columns={[
            {key:'date',    label:'Date'},
            {key:'courseId',label:'Course', render:v=>mockCourses.find(c=>c.id===v)?.name?.split(' ')[0]||`#${v}`},
            {key:'status',  label:'Status', render:v=><StatusBadge status={v}/>},
          ]}
          data={sorted}
          emptyMsg="No attendance records."
        />
      </Card>
      {myCourses.length > 0 && !cid && (
        <Card>
          <SectionHeader title="Attendance by Course"/>
          <div className="space-y-4 mt-2">
            {myCourses.map(c => {
              const cr     = allRecs.filter(r => r.courseId === c.id)
              const p      = cr.filter(r => r.status === 'present').length
              const l      = cr.filter(r => r.status === 'late').length
              const a      = cr.filter(r => r.status === 'absent').length
              const pct    = cr.length ? Math.round(p / cr.length * 100) : 0
              const col    = pct >= 80 ? 'green' : pct >= 60 ? 'amber' : 'red'
              const txtCol = pct >= 80 ? 'text-green-600' : pct >= 60 ? 'text-amber-500' : 'text-red-500'
              return (
                <div key={c.id}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{c.name}</span>
                    <span className={`text-sm font-bold ${txtCol}`}>{pct}%</span>
                  </div>
                  <ProgressBar value={pct} color={col}/>
                  <div className="flex gap-3 mt-1">
                    <span className="text-[10px] text-gray-400">Present: {p}</span>
                    <span className="text-[10px] text-gray-400">Late: {l}</span>
                    <span className="text-[10px] text-gray-400">Absent: {a}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}

function StGrades() {
  const { mockAssignments, mockQuizzes } = useData()
  const student   = useStudent()
  const myAsgn    = mockAssignments.filter(a=>student?.courses?.includes(a.courseId))
  const myQuizzes = mockQuizzes.filter(q=>student?.courses?.includes(q.courseId))
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex gap-3"><MiniStat label="Overall GPA" value={student?.gpa} color="blue"/><MiniStat label="Attendance" value={`${student?.attendanceRate}%`} color="green"/><MiniStat label="Status" value={student?.status} color={student?.status==='active'?'green':'red'}/></div>
      <Card>
        <SectionHeader title="Assignments"/>
        {myAsgn.map(a=>{const s=a.submissions.find(x=>x.studentId===student?.id);return <div key={a.id} className="flex justify-between py-2 border-b border-gray-50 last:border-0 text-sm"><span className="text-gray-800">{a.title}</span><div className="flex gap-2">{s?s.status==='graded'?<Badge color="green">{s.grade}/100</Badge>:<Badge color="amber">Submitted</Badge>:<Badge color="gray">Not submitted</Badge>}</div></div>})}
      </Card>
      <Card>
        <SectionHeader title="Quizzes"/>
        {myQuizzes.map(q=>{const s=q.submissions.find(x=>x.studentId===student?.id);return <div key={q.id} className="flex justify-between py-2 border-b border-gray-50 last:border-0 text-sm"><span className="text-gray-800">{q.title}</span>{s?<Badge color={s.score>=70?'green':'red'}>{s.overrideGrade??s.score}%</Badge>:<Badge color="gray">Not taken</Badge>}</div>})}
      </Card>
    </div>
  )
}

function StSurveys() {
  const { pushNotif } = useAuth()
  const { mockSurveys, submitSurveyResponse } = useData()
  const student   = useStudent()
  const [answers, setAnswers]   = useState({})
  const [comment, setComment]   = useState({})
  const [submitted, setSubmitted] = useState({})
  const submit = async (sv) => {
    await submitSurveyResponse(sv.id, student?.id, student?.name, answers[sv.id]||{}, comment[sv.id]||'')
    setSubmitted({...submitted,[sv.id]:true})
  }
  return (
    <div className="space-y-4 animate-fadeIn">
      {mockSurveys.filter(s=>s.status==='active').map(sv=>{
        const already = sv.responses.find(r=>r.studentId===student?.id)||submitted[sv.id]
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
  const { mockComplaints, addComplaint } = useData()
  const student = useStudent()
  const [modal, setModal] = useState(false)
  const [form, setForm]   = useState({subject:'',desc:'',priority:'medium'})
  const mine = mockComplaints.filter(c=>c.fromId===student?.id)
  const submit = async () => {
    await addComplaint({fromId:student?.id,from:student?.name,fromRole:'student',subject:form.subject,desc:form.desc,assignedTo:'Student Affairs Assistant',priority:form.priority,status:'pending'})
    await pushNotif('affairs', `Student complaint: "${form.subject}"`, 'complaint')
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

function StResults() {
  const { mockResults, mockCourses } = useData()
  const student    = useStudent()
  const [pdfOpen, setPdfOpen] = useState(false)

  const myResults  = mockResults.filter(r => r.studentId === student?.id)
  const myCourses  = mockCourses.filter(c => student?.courses?.includes(c.id))

  const gradeColor = g => ['A+','A'].includes(g) ? 'green' : ['B','C'].includes(g) ? 'amber' : 'red'

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex justify-end">
        {myResults.length > 0 && (
          <button onClick={() => setPdfOpen(true)} className="btn-secondary text-xs">
            <Download className="w-3.5 h-3.5"/>Download PDF
          </button>
        )}
      </div>

      {myResults.length === 0 ? (
        <Card className="text-center py-14">
          <Trophy className="w-10 h-10 mx-auto mb-3 text-gray-200"/>
          <p className="font-medium text-gray-500 text-sm">No results published yet</p>
          <p className="text-xs text-gray-400 mt-1">Your instructor will publish results once exams are marked</p>
        </Card>
      ) : (
        <Card>
          <SectionHeader title="Academic Results"/>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Course','Assignment (%)','Quiz (%)','Exam','Total','%','Grade'].map(h => (
                    <th key={h} className="text-left py-2.5 px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {myCourses.map((c, i) => {
                  const res = myResults.find(r => r.courseId === c.id)
                  if (!res) return (
                    <tr key={c.id} className="border-b border-gray-50">
                      <td className="py-2.5 px-3 font-medium text-gray-700">{c.name}</td>
                      {Array(6).fill(0).map((_, j) => <td key={j} className="py-2.5 px-3 text-gray-300 text-xs">—</td>)}
                    </tr>
                  )
                  return (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-gray-900">{c.name}</td>
                      <td className="py-2.5 px-3 text-gray-700">{res.assignmentMarks}/100</td>
                      <td className="py-2.5 px-3 text-gray-700">{res.quizMarks}/100</td>
                      <td className="py-2.5 px-3 text-gray-700">{res.examMarks}/{res.examTotal}</td>
                      <td className="py-2.5 px-3 font-semibold text-gray-800">{res.totalMarks}/{res.grandTotal}</td>
                      <td className="py-2.5 px-3"><Badge color={res.percentage >= 70 ? 'green' : res.percentage >= 50 ? 'amber' : 'red'}>{res.percentage}%</Badge></td>
                      <td className="py-2.5 px-3"><Badge color={gradeColor(res.grade)}>{res.grade}</Badge></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {pdfOpen && <ResultPDF student={student} results={myResults} courses={myCourses} onClose={() => setPdfOpen(false)}/>}
    </div>
  )
}

function ResultPDF({ student, results, courses, onClose }) {
  const today = new Date().toLocaleDateString('en-GB', { year:'numeric', month:'long', day:'numeric' })
  const gradeColor = g => ['A+','A'].includes(g) ? '#16a34a' : ['B','C'].includes(g) ? '#d97706' : '#dc2626'

  const printPDF = () => {
    const w = window.open('', '_blank', 'width=900,height=700')
    w.document.write(`<!DOCTYPE html><html><head>
      <title>Academic Result — ${student?.name || ''}</title>
      <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:Arial,sans-serif;padding:48px;color:#111}
        .hdr{text-align:center;border-bottom:3px double #1e3a6e;padding-bottom:18px;margin-bottom:18px}
        .anchor{font-size:38px;color:#1e3a6e;opacity:.15;position:absolute}
        .anchor.l{left:32px;top:32px} .anchor.r{right:32px;top:32px}
        h1{color:#1e3a6e;font-size:22px;margin:8px 0 4px}
        .sub{font-size:10px;color:#888;letter-spacing:2px;text-transform:uppercase}
        .date{font-size:11px;color:#666;margin-top:4px}
        .student{text-align:center;margin:20px 0}
        .sname{font-size:20px;font-weight:bold;color:#1e3a6e}
        .sid{font-size:11px;color:#999;margin-top:2px}
        table{width:100%;border-collapse:collapse;margin:20px 0;font-size:12px}
        th{background:#1e3a6e;color:#fff;padding:9px 12px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.5px}
        td{padding:9px 12px;border-bottom:1px solid #e5e7eb}
        tr:nth-child(even) td{background:#f9fafb}
        .footer{margin-top:48px;display:flex;justify-content:space-between;align-items:flex-end}
        .sig{text-align:center;width:180px}
        .sig-line{border-top:1px solid #aaa;padding-top:6px;font-size:10px;color:#666;margin-top:48px}
        .stamp{width:72px;height:72px;border:2px solid #1e3a6e;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:30px;color:#1e3a6e;margin:0 auto}
        .stamp-lbl{font-size:9px;color:#999;margin-top:4px;text-align:center}
        .note{text-align:center;margin-top:24px;font-size:9px;color:#ccc}
      </style>
    </head><body>
      <span class="anchor l">⚓</span><span class="anchor r">⚓</span>
      <div class="hdr">
        <h1>National Maritime Academy</h1>
        <div class="sub">Official Academic Result Sheet</div>
        <div class="date">Date Issued: ${today}</div>
      </div>
      <div class="student">
        <div style="font-size:12px;color:#666">This document certifies the academic result of</div>
        <div class="sname">${student?.name || ''}</div>
        <div class="sid">NMA Student ID: ${student?.id || '—'}</div>
      </div>
      <table>
        <thead><tr>
          <th>Course</th><th>Assignment (%)</th><th>Quiz (%)</th>
          <th>Exam</th><th>Total Marks</th><th>Percentage</th><th>Grade</th>
        </tr></thead>
        <tbody>
          ${courses.map(c => {
            const r = results.find(x => x.courseId === c.id)
            if (!r) return `<tr><td>${c.name}</td>${Array(6).fill('<td style="color:#ccc">—</td>').join('')}</tr>`
            const gc = gradeColor(r.grade)
            return `<tr>
              <td>${c.name}</td>
              <td>${r.assignmentMarks}/100</td>
              <td>${r.quizMarks}/100</td>
              <td>${r.examMarks}/${r.examTotal}</td>
              <td><strong>${r.totalMarks}/${r.grandTotal}</strong></td>
              <td><strong style="color:${gradeColor ? gc : '#111'}">${r.percentage}%</strong></td>
              <td><strong style="color:${gc}">${r.grade}</strong></td>
            </tr>`
          }).join('')}
        </tbody>
      </table>
      <div class="footer">
        <div class="sig"><div class="sig-line">Instructor Signature</div></div>
        <div><div class="stamp">⚓</div><div class="stamp-lbl">Official Stamp</div></div>
        <div class="sig"><div class="sig-line">Principal / Commandant</div></div>
      </div>
      <div class="note">NMA Academic Records · Verified Document · ${today}</div>
    </body></html>`)
    w.document.close()
    setTimeout(() => w.print(), 400)
  }

  const gradeColorCss = g => ['A+','A'].includes(g) ? 'text-green-700' : ['B','C'].includes(g) ? 'text-amber-600' : 'text-red-600'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-slideUp" onClick={e => e.stopPropagation()}>
        {/* Preview */}
        <div className="p-8 relative">
          <div className="text-[#1e3a6e] text-5xl opacity-10 absolute top-6 left-6 select-none">⚓</div>
          <div className="text-[#1e3a6e] text-5xl opacity-10 absolute top-6 right-6 select-none">⚓</div>

          <div className="text-center border-b-2 border-double border-[#1e3a6e] pb-5 mb-5">
            <p className="font-bold text-[#1e3a6e] text-xl">National Maritime Academy</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Official Academic Result Sheet</p>
            <p className="text-xs text-gray-500 mt-1">Date Issued: {today}</p>
          </div>

          <div className="text-center mb-5">
            <p className="text-xs text-gray-500">This document certifies the academic result of</p>
            <p className="font-bold text-2xl text-[#1e3a6e] mt-1">{student?.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">NMA Student ID: {student?.id}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse mb-5">
              <thead>
                <tr className="bg-[#1e3a6e] text-white">
                  {['Course','Assignment (%)','Quiz (%)','Exam','Total','%','Grade'].map(h => (
                    <th key={h} className="py-2.5 px-3 text-left font-bold uppercase tracking-wide text-[9px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {courses.map((c, i) => {
                  const r = results.find(x => x.courseId === c.id)
                  return (
                    <tr key={c.id} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="py-2 px-3 font-medium text-gray-800">{c.name}</td>
                      {r ? (
                        <>
                          <td className="py-2 px-3">{r.assignmentMarks}/100</td>
                          <td className="py-2 px-3">{r.quizMarks}/100</td>
                          <td className="py-2 px-3">{r.examMarks}/{r.examTotal}</td>
                          <td className="py-2 px-3 font-semibold">{r.totalMarks}/{r.grandTotal}</td>
                          <td className={`py-2 px-3 font-bold ${gradeColorCss(r.grade)}`}>{r.percentage}%</td>
                          <td className={`py-2 px-3 font-bold ${gradeColorCss(r.grade)}`}>{r.grade}</td>
                        </>
                      ) : (
                        Array(6).fill(0).map((_, j) => <td key={j} className="py-2 px-3 text-gray-300">—</td>)
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-end mt-10">
            <div className="text-center w-40">
              <div className="border-t border-gray-400 pt-2 mt-12"><p className="text-[10px] text-gray-500">Instructor Signature</p></div>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 border-2 border-[#1e3a6e] rounded-full flex items-center justify-center text-[#1e3a6e] text-2xl mx-auto">⚓</div>
              <p className="text-[9px] text-gray-400 mt-1">Official Stamp</p>
            </div>
            <div className="text-center w-40">
              <div className="border-t border-gray-400 pt-2 mt-12"><p className="text-[10px] text-gray-500">Principal / Commandant</p></div>
            </div>
          </div>

          <p className="text-center text-[9px] text-gray-300 mt-4">NMA Academic Records · Verified Document · {today}</p>
        </div>

        <div className="flex gap-3 px-6 pb-5">
          <button onClick={printPDF} className="flex-1 py-2.5 bg-[#1e3a6e] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#16305a] transition-colors">
            <Download className="w-4 h-4"/>Print / Download PDF
          </button>
          <button onClick={onClose} className="px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200">Close</button>
        </div>
      </div>
    </div>
  )
}

function StCertificates() {
  const { mockCertificates } = useData()
  const student = useStudent()
  const [viewCert, setViewCert] = useState(null)
  const myCerts = mockCertificates.filter(c=>c.studentId===student?.id)
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
