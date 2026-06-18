import { useState, useEffect } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import Header from '../../components/layout/Header'
import { StatCard, StatusBadge, Badge, Table, SectionHeader, Modal, ProgressBar, MiniStat, SelectFilter, Card, FileUploadBox } from '../../components/ui'
import { mockStudents, mockCourses, mockComplaints, mockMeetings, mockAssignments, mockQuizzes, mockAttendance, mockReports, addComplaint, addMeeting, addReport, addAssignment, gradeAssignment, addQuiz, overrideQuizGrade, markAttendance, submitQuiz } from '../../utils/mockData'
import { useAuth } from '../../context/AuthContext'
import { GraduationCap, BookOpen, ClipboardList, AlertCircle, Send, Plus, ExternalLink, Youtube, Video, FileText, CheckSquare, Timer, BarChart3, Calendar } from 'lucide-react'

const PAGES = { dashboard:'Instructor Dashboard', courses:'My Courses', students:'My Students', attendance:'Mark Attendance', assignments:'Assignments', quizzes:'Quizzes', liveclass:'Live Class', complaints:'Complaints', meetings:'Meetings', reports:'Reports' }

export default function InstructorPortal() {
  const [active, setActive] = useState('dashboard')
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar activeKey={active} onNavigate={setActive}/>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={PAGES[active] || active}/>
        <main className="flex-1 overflow-y-auto p-5">
          {active==='dashboard'   && <InsDash onNavigate={setActive}/>}
          {active==='courses'     && <InsCourses/>}
          {active==='students'    && <InsStudents/>}
          {active==='attendance'  && <InsAttendance/>}
          {active==='assignments' && <InsAssignments/>}
          {active==='quizzes'     && <InsQuizzes/>}
          {active==='liveclass'   && <InsLiveClass/>}
          {active==='complaints'  && <InsComplaints/>}
          {active==='meetings'    && <InsMeetings/>}
          {active==='reports'     && <InsReports/>}
        </main>
      </div>
    </div>
  )
}

// Get this instructor's courses (demo: Essam = instructorId 13)
const MY_INSTRUCTOR_ID = 13
const myCourses = () => mockCourses.filter(c => c.instructorId === MY_INSTRUCTOR_ID)
const myStudents = () => {
  const enrolled = new Set(myCourses().flatMap(c => c.enrolledStudents || []))
  return mockStudents.filter(s => enrolled.has(s.id))
}

function InsDash({ onNavigate }) {
  const { user } = useAuth()
  const courses  = myCourses()
  const students = myStudents()
  const pendingGrading = mockAssignments.filter(a=>courses.some(c=>c.id===a.courseId)).reduce((acc,a)=>acc+a.submissions.filter(s=>s.status==='submitted').length, 0)
  const totalQuizSubs  = mockQuizzes.filter(q=>courses.some(c=>c.id===q.courseId)).reduce((acc,q)=>acc+q.submissions.length, 0)
  const [drill, setDrill] = useState(null)

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-700 p-5 text-white">
        <p className="text-white/60 text-xs">{user?.sub || 'Instructor'}</p>
        <h2 className="font-bold text-2xl mt-0.5">{user?.name} 📚</h2>
        <p className="text-white/50 text-sm mt-1">Manage courses, students, and assessments · Click cards for details</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="My Courses"     value={courses.length}   icon={BookOpen}      color="blue"   onClick={()=>setDrill('courses')}    clickLabel="View courses"/>
        <StatCard label="My Students"    value={students.length}  icon={GraduationCap} color="purple" onClick={()=>setDrill('students')}   clickLabel="View students"/>
        <StatCard label="Pending Grading"value={pendingGrading}   icon={FileText}      color="amber"  onClick={()=>setDrill('grading')}    clickLabel="View submissions"/>
        <StatCard label="Quiz Submissions"value={totalQuizSubs}   icon={CheckSquare}   color="teal"   onClick={()=>setDrill('quiz_subs')}  clickLabel="View quiz results"/>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <SectionHeader title="My Courses" action={<button onClick={()=>onNavigate('courses')} className="text-xs text-blue-600 hover:underline">View all →</button>}/>
          {courses.map(c=>(
            <div key={c.id} className="mb-3">
              <div className="flex justify-between mb-1"><p className="text-sm font-semibold text-gray-900 truncate pr-2">{c.name}</p><Badge color="indigo">{c.progress}%</Badge></div>
              <ProgressBar value={c.progress} color="indigo"/>
              <p className="text-xs text-gray-400 mt-1">Next: {c.nextClass} · {c.enrolledStudents?.length||0} students</p>
            </div>
          ))}
        </Card>
        <Card>
          <SectionHeader title="Pending Submissions" action={<button onClick={()=>onNavigate('assignments')} className="text-xs text-blue-600 hover:underline">View all →</button>}/>
          {mockAssignments.filter(a=>courses.some(c=>c.id===a.courseId)).flatMap(a=>a.submissions.filter(s=>s.status==='submitted').map(s=>({...s,asgTitle:a.title}))).slice(0,5).map((s,i)=>(
            <div key={i} className="flex items-center justify-between p-2.5 bg-amber-50 rounded-xl mb-2">
              <div><p className="text-sm font-medium text-gray-900">{s.studentName}</p><p className="text-xs text-gray-400">{s.asgTitle}</p></div>
              <Badge color="amber">To Grade</Badge>
            </div>
          ))}
          {mockAssignments.filter(a=>courses.some(c=>c.id===a.courseId)).flatMap(a=>a.submissions.filter(s=>s.status==='submitted')).length===0 && <p className="text-xs text-gray-400 text-center py-4">All caught up! ✓</p>}
        </Card>
      </div>

      {/* Drill-down modals */}
      <Modal open={drill==='courses'} onClose={()=>setDrill(null)} title="My Courses" wide>
        {courses.map(c=>(
          <div key={c.id} className="mb-3 p-3 border border-indigo-100 rounded-xl">
            <div className="flex justify-between mb-1"><p className="font-semibold text-sm">{c.name}</p><Badge color="indigo">{c.progress}%</Badge></div>
            <ProgressBar value={c.progress} color="indigo"/>
            <p className="text-xs text-gray-400 mt-1">Students: {c.enrolledStudents?.length||0} · Next: {c.nextClass}</p>
          </div>
        ))}
      </Modal>
      <Modal open={drill==='students'} onClose={()=>setDrill(null)} title="My Students" wide>
        <Table columns={[{key:'name',label:'Student',render:v=><span className="font-medium">{v}</span>},{key:'attendanceRate',label:'Attendance',render:v=><span className={v>=80?'text-green-600':v>=60?'text-amber-500':'text-red-500'}>{v}%</span>},{key:'gpa',label:'GPA'},{key:'status',label:'Status',render:v=><StatusBadge status={v}/>}]} data={students}/>
      </Modal>
      <Modal open={drill==='grading'} onClose={()=>setDrill(null)} title="Pending Grading" wide>
        {mockAssignments.filter(a=>courses.some(c=>c.id===a.courseId)).map(a=>(
          a.submissions.filter(s=>s.status==='submitted').map((s,i)=>(
            <div key={`${a.id}-${i}`} className="p-3 bg-amber-50 border border-amber-100 rounded-xl mb-2">
              <div className="flex justify-between"><p className="font-medium text-sm text-gray-900">{s.studentName}</p><Badge color="amber">Pending</Badge></div>
              <p className="text-xs text-gray-400">{a.title} · {s.file} · {s.submittedAt}</p>
            </div>
          ))
        ))}
      </Modal>
      <Modal open={drill==='quiz_subs'} onClose={()=>setDrill(null)} title="Quiz Results" wide>
        {mockQuizzes.filter(q=>courses.some(c=>c.id===q.courseId)).map(q=>(
          <div key={q.id} className="mb-3 p-3 border border-gray-100 rounded-xl">
            <p className="font-semibold text-sm mb-2">{q.title}</p>
            {q.submissions.length===0?<p className="text-xs text-gray-400">No submissions</p>:q.submissions.map((s,i)=>(
              <div key={i} className="flex justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
                <span>{s.studentName}</span>
                <Badge color={s.score>=70?'green':'red'}>{s.overrideGrade??s.score}%</Badge>
              </div>
            ))}
          </div>
        ))}
      </Modal>
    </div>
  )
}

function InsCourses() {
  const [sel, setSel] = useState(null)
  const [ytModal, setYtModal] = useState(null)
  const [matModal, setMatModal] = useState(null)
  const [ytForm, setYtForm] = useState({title:'',url:''})
  const courses = myCourses()
  return (
    <div className="space-y-3 animate-fadeIn">
      {courses.map(c=>(
        <Card key={c.id}>
          <div className="flex justify-between mb-2">
            <div><p className="font-semibold text-gray-900">{c.name}</p><p className="text-xs text-gray-400">{c.enrolledStudents?.length||0} students · Next: {c.nextClass}</p></div>
            <Badge color="indigo">{c.progress}%</Badge>
          </div>
          <ProgressBar value={c.progress} color="indigo" size="lg"/>
          <div className="flex flex-wrap gap-2 mt-3">
            {c.teamsLink&&<a href={c.teamsLink} target="_blank" rel="noreferrer" className="btn-secondary text-xs py-1.5"><ExternalLink className="w-3 h-3"/>Teams</a>}
            {c.classroomLink&&<a href={c.classroomLink} target="_blank" rel="noreferrer" className="btn-secondary text-xs py-1.5"><ExternalLink className="w-3 h-3"/>Classroom</a>}
            <button onClick={()=>setYtModal(c)} className="btn-secondary text-xs py-1.5"><Youtube className="w-3 h-3 text-red-500"/>Add YouTube</button>
            <button onClick={()=>setMatModal(c)} className="btn-secondary text-xs py-1.5"><FileText className="w-3 h-3"/>Upload Material</button>
            <button onClick={()=>setSel(c)} className="btn-primary text-xs py-1.5"><GraduationCap className="w-3 h-3"/>View Students</button>
          </div>
          {c.youtubeLinks?.length>0&&(
            <div className="mt-3 border-t border-gray-100 pt-2">
              <p className="label mb-1">Videos</p>
              {c.youtubeLinks.map(v=><a key={v.id} href={v.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-red-600 hover:underline mb-1"><Youtube className="w-3 h-3"/>{v.title}</a>)}
            </div>
          )}
          {c.materials?.length>0&&(
            <div className="mt-2">
              <p className="label mb-1">Materials</p>
              {c.materials.map(m=><p key={m.id} className="text-xs text-gray-500">📄 {m.name} ({m.size})</p>)}
            </div>
          )}
        </Card>
      ))}
      <Modal open={!!sel} onClose={()=>setSel(null)} title={`Students — ${sel?.name||''}`} wide>
        {sel&&<Table columns={[{key:'name',label:'Student',render:v=><span className="font-medium">{v}</span>},{key:'attendanceRate',label:'Attendance',render:v=><div className="flex items-center gap-2 min-w-20"><ProgressBar value={v} color={v>=80?'green':v>=60?'amber':'red'}/><span className="text-xs">{v}%</span></div>},{key:'gpa',label:'GPA'},{key:'status',label:'Status',render:v=><StatusBadge status={v}/>}]} data={mockStudents.filter(s=>s.courses?.includes(sel.id))} emptyMsg="No students enrolled."/>}
      </Modal>
      <Modal open={!!ytModal} onClose={()=>setYtModal(null)} title="Add YouTube Video">
        <div className="space-y-3">
          <div><label className="label">Video Title</label><input className="input" value={ytForm.title} onChange={e=>setYtForm({...ytForm,title:e.target.value})} placeholder="e.g. Navigation Basics"/></div>
          <div><label className="label">YouTube URL</label><input className="input" value={ytForm.url} onChange={e=>setYtForm({...ytForm,url:e.target.value})} placeholder="https://youtube.com/watch?v=…"/></div>
          <button onClick={()=>setYtModal(null)} className="btn-primary w-full">Add Link</button>
        </div>
      </Modal>
      <Modal open={!!matModal} onClose={()=>setMatModal(null)} title="Upload Course Material">
        <div className="space-y-3">
          <FileUploadBox label="Select Material" hint="PDF, PPT, DOCX, images — max 50MB" accept=".pdf,.ppt,.pptx,.doc,.docx,.png,.jpg"/>
          <button onClick={()=>setMatModal(null)} className="btn-primary w-full">Upload Material</button>
        </div>
      </Modal>
    </div>
  )
}

function InsStudents() {
  const [cid, setCid] = useState('')
  const courses = myCourses()
  const students = cid
    ? mockStudents.filter(s=>s.courses?.includes(parseInt(cid)))
    : myStudents()
  return (
    <div className="space-y-4 animate-fadeIn">
      <Card>
        <div className="flex gap-3 mb-4">
          <SelectFilter label="Course" value={cid} onChange={setCid} options={courses.map(c=>({value:String(c.id),label:c.name}))} placeholder="All My Courses"/>
        </div>
        <Table columns={[{key:'name',label:'Student',render:v=><span className="font-medium">{v}</span>},{key:'attendanceRate',label:'Attendance',render:v=><div className="flex items-center gap-2 min-w-24"><ProgressBar value={v} color={v>=80?'green':v>=60?'amber':'red'}/><span className="text-xs">{v}%</span></div>},{key:'gpa',label:'GPA',render:v=><span className={`font-bold text-sm ${v>=3.5?'text-green-600':v>=2.5?'text-amber-500':'text-red-500'}`}>{v}</span>},{key:'status',label:'Status',render:v=><StatusBadge status={v}/>}]} data={students} emptyMsg="No students found."/>
      </Card>
    </div>
  )
}

function InsAttendance() {
  const { pushNotif } = useAuth()
  const courses = myCourses()
  const [cid,  setCid]     = useState(String(courses[0]?.id||1))
  const [date, setDate]    = useState(new Date().toISOString().split('T')[0])
  const [marks, setMarks]  = useState({})
  const [saved, setSaved]  = useState(false)
  const enrolled = mockStudents.filter(s=>s.courses?.includes(parseInt(cid)))
  const toggle = (id, status) => setMarks(m=>({...m,[id]:status}))
  const save = ()=>{
    const records = enrolled.map(s=>({studentId:s.id,studentName:s.name,courseId:parseInt(cid),date,status:marks[s.id]||'absent'}))
    markAttendance(records)
    setSaved(true); setTimeout(()=>setSaved(false),2500)
  }
  return (
    <div className="space-y-4 animate-fadeIn">
      <Card>
        <div className="flex flex-wrap gap-3 mb-4">
          <SelectFilter label="Course" value={cid} onChange={v=>{setCid(v);setMarks({})}} options={courses.map(c=>({value:String(c.id),label:c.name}))} placeholder="Select Course"/>
          <div className="flex items-center gap-2"><span className="label mb-0">Date</span><input type="date" className="input text-xs py-1.5" value={date} onChange={e=>setDate(e.target.value)}/></div>
        </div>
        <div className="space-y-2">
          {enrolled.map(s=>(
            <div key={s.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
              <div><p className="font-medium text-sm text-gray-900">{s.name}</p><p className="text-xs text-gray-400">Overall: {s.attendanceRate}%</p></div>
              <div className="flex gap-2">
                {['present','late','absent'].map(st=>(
                  <button key={st} onClick={()=>toggle(s.id,st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${marks[s.id]===st?(st==='present'?'bg-green-500 text-white':st==='late'?'bg-amber-500 text-white':'bg-red-500 text-white'):'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {st}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        {enrolled.length===0&&<p className="text-xs text-gray-400 text-center py-6">Select a course to mark attendance</p>}
        <div className="mt-4">
          {saved
            ? <div className="p-2.5 bg-green-50 text-green-700 rounded-xl text-xs text-center font-medium">✓ Attendance saved!</div>
            : <button onClick={save} className="btn-primary w-full">Save Attendance</button>
          }
        </div>
      </Card>
    </div>
  )
}

function InsAssignments() {
  const { pushNotif } = useAuth()
  const courses = myCourses()
  const [modal, setModal]   = useState(false)
  const [gradeM, setGradeM] = useState(null)
  const [asgList, setAsgList] = useState(mockAssignments.filter(a=>courses.some(c=>c.id===a.courseId)))
  const [form, setForm]     = useState({courseId:String(courses[0]?.id||1),title:'',description:'',dueDate:''})
  const [gradeF,setGradeF]  = useState({grade:'',feedback:''})

  const create = ()=>{
    addAssignment({...form,courseId:parseInt(form.courseId),maxGrade:100,status:'active'})
    pushNotif('student',`New assignment: "${form.title}"`, 'assignment')
    setAsgList(mockAssignments.filter(a=>courses.some(c=>c.id===a.courseId)))
    setModal(false); setForm({courseId:String(courses[0]?.id||1),title:'',description:'',dueDate:''})
  }
  const grade = ()=>{
    gradeAssignment(gradeM.asgId, gradeM.studentId, parseInt(gradeF.grade), gradeF.feedback)
    pushNotif('student',`Assignment "${gradeM.title}" graded — ${gradeF.grade}/100`, 'grade')
    setAsgList(mockAssignments.filter(a=>courses.some(c=>c.id===a.courseId)))
    setGradeM(null); setGradeF({grade:'',feedback:''})
  }
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex justify-end"><button onClick={()=>setModal(true)} className="btn-primary text-xs"><Plus className="w-3.5 h-3.5"/>Create Assignment</button></div>
      {asgList.map(a=>(
        <Card key={a.id}>
          <div className="flex justify-between mb-2">
            <div><p className="font-semibold text-gray-900">{a.title}</p><p className="text-xs text-gray-400">{a.description} · Due: {a.dueDate}</p></div>
            <Badge color="indigo">{a.submissions.length} submissions</Badge>
          </div>
          {a.submissions.length>0&&(
            <div className="mt-2 border-t border-gray-100 pt-2 space-y-1.5">
              {a.submissions.map((s,i)=>(
                <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div><p className="text-xs font-medium text-gray-800">{s.studentName}</p><p className="text-[10px] text-gray-400">{s.file} · {s.submittedAt}</p></div>
                  <div className="flex items-center gap-2">
                    {s.status==='graded'?<Badge color="green">Grade: {s.grade}</Badge>:<button onClick={()=>setGradeM({asgId:a.id,studentId:s.studentId,studentName:s.studentName,title:a.title})} className="text-xs text-indigo-600 font-medium hover:underline">Grade</button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}
      <Modal open={modal} onClose={()=>setModal(false)} title="Create Assignment">
        <div className="space-y-4">
          <div><label className="label">Course</label><select className="input" value={form.courseId} onChange={e=>setForm({...form,courseId:e.target.value})}>{courses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div><label className="label">Title</label><input className="input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Assignment title"/></div>
          <div><label className="label">Description</label><textarea className="input" rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Instructions…"/></div>
          <div><label className="label">Due Date</label><input type="date" className="input" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})}/></div>
          <button onClick={create} className="btn-primary w-full">Create & Notify Students</button>
        </div>
      </Modal>
      <Modal open={!!gradeM} onClose={()=>setGradeM(null)} title={`Grade — ${gradeM?.studentName}`}>
        <div className="space-y-4">
          <div><label className="label">Grade (out of 100)</label><input type="number" min="0" max="100" className="input" value={gradeF.grade} onChange={e=>setGradeF({...gradeF,grade:e.target.value})} placeholder="e.g. 88"/></div>
          <div><label className="label">Feedback</label><textarea className="input" rows={3} value={gradeF.feedback} onChange={e=>setGradeF({...gradeF,feedback:e.target.value})} placeholder="Feedback for student…"/></div>
          <button onClick={grade} className="btn-primary w-full">Save Grade & Notify Student</button>
        </div>
      </Modal>
    </div>
  )
}

function InsQuizzes() {
  const { pushNotif } = useAuth()
  const courses = myCourses()
  const [createM, setCreateM] = useState(false)
  const [overrideM, setOverrideM] = useState(null)
  const [quizList, setQuizList] = useState(mockQuizzes.filter(q=>courses.some(c=>c.id===q.courseId)))
  const [form, setForm] = useState({courseId:String(courses[0]?.id||1),title:'',duration:15,dueDate:'',questions:[{text:'',options:['','','',''],correct:0}]})
  const [ovF, setOvF] = useState({grade:'',feedback:''})
  const addQ = ()=>setForm({...form,questions:[...form.questions,{text:'',options:['','','',''],correct:0}]})
  const updQ = (i,f,v)=>{const qs=[...form.questions];qs[i]={...qs[i],[f]:v};setForm({...form,questions:qs})}
  const updO = (qi,oi,v)=>{const qs=[...form.questions];qs[qi].options[oi]=v;setForm({...form,questions:qs})}
  const create = ()=>{
    addQuiz({...form,courseId:parseInt(form.courseId),status:'active'})
    pushNotif('student',`New quiz: "${form.title}" — due ${form.dueDate}`, 'quiz')
    setQuizList(mockQuizzes.filter(q=>courses.some(c=>c.id===q.courseId)))
    setCreateM(false)
  }
  const override = ()=>{
    overrideQuizGrade(overrideM.qzId,overrideM.studentId,parseInt(ovF.grade),ovF.feedback)
    pushNotif('student','Quiz grade updated by instructor', 'grade')
    setQuizList(mockQuizzes.filter(q=>courses.some(c=>c.id===q.courseId)))
    setOverrideM(null); setOvF({grade:'',feedback:''})
  }
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex justify-end"><button onClick={()=>setCreateM(true)} className="btn-primary text-xs"><Plus className="w-3.5 h-3.5"/>Create Quiz</button></div>
      {quizList.map(q=>(
        <Card key={q.id}>
          <div className="flex justify-between mb-2">
            <div><p className="font-semibold text-gray-900">{q.title}</p><p className="text-xs text-gray-400">{q.questions.length} questions · {q.duration} min · Due: {q.dueDate}</p></div>
            <Badge color="purple">{q.submissions.length} submitted</Badge>
          </div>
          {q.submissions.length>0&&(
            <div className="border-t border-gray-100 pt-2 mt-2 space-y-1.5">
              {q.submissions.map((s,i)=>(
                <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div><p className="text-xs font-medium text-gray-800">{s.studentName}</p><p className="text-[10px] text-gray-400">Auto: {s.score}%{s.overrideGrade!==null?` | Override: ${s.overrideGrade}%`:''}</p></div>
                  <div className="flex gap-2">
                    <Badge color={s.score>=70?'green':'red'}>{s.overrideGrade??s.score}%</Badge>
                    <button onClick={()=>setOverrideM({qzId:q.id,studentId:s.studentId,studentName:s.studentName})} className="text-xs text-indigo-600 hover:underline">Override</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}
      <Modal open={createM} onClose={()=>setCreateM(false)} title="Create Quiz" wide>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Course</label><select className="input" value={form.courseId} onChange={e=>setForm({...form,courseId:e.target.value})}>{courses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label className="label">Title</label><input className="input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></div>
            <div><label className="label">Duration (min)</label><input type="number" className="input" value={form.duration} onChange={e=>setForm({...form,duration:parseInt(e.target.value)})}/></div>
            <div><label className="label">Due Date</label><input type="date" className="input" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})}/></div>
          </div>
          <div>
            <label className="label">Questions (MCQ)</label>
            {form.questions.map((q,qi)=>(
              <div key={qi} className="p-3 border border-gray-100 rounded-xl mb-2 space-y-2">
                <input className="input text-xs" value={q.text} onChange={e=>updQ(qi,'text',e.target.value)} placeholder={`Question ${qi+1}…`}/>
                <div className="grid grid-cols-2 gap-2">
                  {q.options.map((opt,oi)=>(
                    <div key={oi} className="flex items-center gap-1.5">
                      <input type="radio" name={`q${qi}`} checked={q.correct===oi} onChange={()=>updQ(qi,'correct',oi)} className="accent-indigo-600"/>
                      <input className="input text-xs py-1.5 flex-1" value={opt} onChange={e=>updO(qi,oi,e.target.value)} placeholder={`Option ${oi+1}`}/>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400">Radio = correct answer</p>
              </div>
            ))}
            <button type="button" onClick={addQ} className="text-xs text-indigo-600 hover:underline font-medium">+ Add Question</button>
          </div>
          <button onClick={create} className="btn-primary w-full">Create & Notify Students</button>
        </div>
      </Modal>
      <Modal open={!!overrideM} onClose={()=>setOverrideM(null)} title={`Override — ${overrideM?.studentName}`}>
        <div className="space-y-4">
          <div><label className="label">New Grade (%)</label><input type="number" min="0" max="100" className="input" value={ovF.grade} onChange={e=>setOvF({...ovF,grade:e.target.value})}/></div>
          <div><label className="label">Reason</label><textarea className="input" rows={2} value={ovF.feedback} onChange={e=>setOvF({...ovF,feedback:e.target.value})}/></div>
          <button onClick={override} className="btn-primary w-full">Save Override</button>
        </div>
      </Modal>
    </div>
  )
}

function InsLiveClass() {
  const courses = myCourses()
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-sm text-indigo-800">
        <strong>Live Classes</strong> — Students only. Foundation Lead or Affairs cannot join instructor-student sessions.
      </div>
      {courses.map(c=>(
        <Card key={c.id}>
          <p className="font-semibold text-gray-900 mb-1">{c.name}</p>
          <p className="text-xs text-gray-400 mb-3">Next: {c.nextClass}</p>
          <div className="flex flex-wrap gap-2">
            {c.teamsLink?<a href={c.teamsLink} target="_blank" rel="noreferrer" className="btn-primary text-xs py-2"><Video className="w-3.5 h-3.5"/>Start Teams Class</a>:<button className="btn-secondary text-xs py-2"><Video className="w-3.5 h-3.5"/>Setup Teams Link</button>}
            {c.classroomLink?<a href={c.classroomLink} target="_blank" rel="noreferrer" className="text-xs py-2 px-3 bg-green-600 text-white rounded-xl font-semibold flex items-center gap-1 hover:bg-green-700"><ExternalLink className="w-3 h-3"/>Google Classroom</a>:<button className="btn-secondary text-xs py-2"><ExternalLink className="w-3 h-3"/>Setup Classroom</button>}
          </div>
          {c.youtubeLinks?.length>0&&(
            <div className="mt-3 border-t border-gray-100 pt-2">
              <p className="label mb-1">Recorded Lectures</p>
              {c.youtubeLinks.map(v=><a key={v.id} href={v.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-red-600 hover:underline mb-1"><Youtube className="w-3.5 h-3.5"/>{v.title}</a>)}
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}

function InsComplaints() {
  const { user, pushNotif } = useAuth()
  const [modal, setModal] = useState(false)
  const [form, setForm]   = useState({subject:'',desc:'',assignedTo:'Student Affairs Assistant',priority:'medium'})
  const mine = mockComplaints.filter(c=>c.fromRole==='instructor')
  const submit = ()=>{
    addComplaint({fromId:13,from:user?.name||'Essam',fromRole:'instructor',subject:form.subject,desc:form.desc,assignedTo:form.assignedTo,priority:form.priority,status:'pending',date:new Date().toISOString().split('T')[0]})
    pushNotif('affairs',`New instructor complaint: "${form.subject}"`, 'complaint')
    setModal(false); setForm({subject:'',desc:'',assignedTo:'Student Affairs Assistant',priority:'medium'})
  }
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex justify-end"><button onClick={()=>setModal(true)} className="btn-primary text-xs"><AlertCircle className="w-3.5 h-3.5"/>Submit Complaint</button></div>
      <Card>
        <SectionHeader title="My Complaints"/>
        <Table columns={[{key:'subject',label:'Subject'},{key:'assignedTo',label:'Sent To'},{key:'priority',label:'Priority',render:v=><Badge color={v==='high'?'red':v==='medium'?'amber':'green'}>{v}</Badge>},{key:'status',label:'Status',render:v=><StatusBadge status={v}/>},{key:'date',label:'Date'}]} data={mine} emptyMsg="No complaints submitted."/>
      </Card>
      <Modal open={modal} onClose={()=>setModal(false)} title="Submit Complaint">
        <div className="space-y-4">
          <div><label className="label">Subject</label><input className="input" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} placeholder="Brief subject…"/></div>
          <div><label className="label">Description</label><textarea className="input" rows={4} value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})} placeholder="Describe the issue…"/></div>
          <div><label className="label">Send To</label><select className="input" value={form.assignedTo} onChange={e=>setForm({...form,assignedTo:e.target.value})}><option>Student Affairs Assistant</option><option>Trainee Affairs Specialist</option></select></div>
          <div><label className="label">Priority</label><select className="input" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
          <button onClick={submit} className="btn-primary w-full">Submit Complaint</button>
        </div>
      </Modal>
    </div>
  )
}

function InsMeetings() {
  const { user, pushNotif } = useAuth()
  const [modal, setModal]   = useState(false)
  const [meetings, setMeets] = useState(mockMeetings)
  const [form, setForm]      = useState({title:'',date:'',link:'',platform:'teams',invitees:[]})
  // Instructors can create live class meetings with students, or join meetings from Foundation Lead/Affairs
  const myMeetings = meetings.filter(m=>m.participantRoles?.includes('instructor')||m.createdByRole==='instructor')
  const ALLOWED    = [{name:'All My Students',role:'student'}]
  const toggle = (name,role)=>{const e=form.invitees.find(i=>i.name===name);setForm({...form,invitees:e?form.invitees.filter(i=>i.name!==name):[...form.invitees,{name,role}]})}
  const create = ()=>{
    if(!form.title||!form.date) return
    addMeeting({...form,createdBy:user?.name||'Essam',createdByRole:'instructor',participants:[user?.name||'Essam',...form.invitees.map(i=>i.name)],participantRoles:['instructor',...form.invitees.map(i=>i.role)],status:'upcoming'})
    form.invitees.forEach(i=>pushNotif(i.role,`Live class scheduled by ${user?.name}: "${form.title}"`, 'meeting'))
    setMeets([...mockMeetings]); setModal(false)
    setForm({title:'',date:'',link:'',platform:'teams',invitees:[]})
  }
  return (
    <div className="space-y-3 animate-fadeIn">
      <div className="flex justify-end"><button onClick={()=>setModal(true)} className="btn-primary text-xs"><Plus className="w-3.5 h-3.5"/>Create Live Class</button></div>
      {myMeetings.map(m=>(
        <Card key={m.id} className="flex justify-between items-start">
          <div>
            <div className="flex gap-2 mb-1"><p className="font-semibold text-gray-900">{m.title}</p><StatusBadge status={m.status}/>{m.createdByRole!=='instructor'&&<Badge color="blue">Invited</Badge>}</div>
            <p className="text-xs text-gray-500">{m.date}</p>
            <p className="text-xs text-gray-400 mt-0.5">{m.participants?.join(', ')}</p>
          </div>
          {m.status==='upcoming'&&m.link&&<a href={m.link} target="_blank" rel="noreferrer" className="btn-primary text-xs py-1.5">Join <ExternalLink className="w-3 h-3"/></a>}
        </Card>
      ))}
      <Modal open={modal} onClose={()=>setModal(false)} title="Create Live Class" wide>
        <div className="space-y-4">
          <div><label className="label">Title</label><input className="input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Navigation Live Lecture"/></div>
          <div><label className="label">Date & Time</label><input type="datetime-local" className="input" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></div>
          <div><label className="label">Platform</label><select className="input" value={form.platform} onChange={e=>setForm({...form,platform:e.target.value})}><option value="teams">Microsoft Teams</option><option value="classroom">Google Classroom</option></select></div>
          <div><label className="label">Meeting Link</label><input className="input" value={form.link} onChange={e=>setForm({...form,link:e.target.value})} placeholder="https://…"/></div>
          <div>
            <label className="label">Invite</label>
            {ALLOWED.map(inv=>(
              <label key={inv.name} className="flex items-center gap-2 p-2.5 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 mb-1.5">
                <input type="checkbox" className="accent-indigo-600" checked={!!form.invitees.find(i=>i.name===inv.name)} onChange={()=>toggle(inv.name,inv.role)}/>
                <span className="text-sm text-gray-800">{inv.name}</span>
              </label>
            ))}
          </div>
          <button onClick={create} className="btn-primary w-full">Create & Notify Students</button>
        </div>
      </Modal>
    </div>
  )
}

function InsReports() {
  const { user, pushNotif } = useAuth()
  const [form,  setForm]  = useState({to:'affairs',type:'Student Progress',period:'July 2024',content:''})
  const [file,  setFile]  = useState(null)
  const [sent,  setSent]  = useState(false)
  const send = ()=>{
    if(!form.content.trim()) return
    addReport({from:user?.name||'Essam',fromRole:'instructor',to:form.to==='affairs'?'Student Affairs Assistant':'Foundation Lead',type:form.type,period:form.period,content:form.content+(file?` [Attachment: ${file.name}]`:''),fileName:file?.name||null})
    pushNotif(form.to,`Report from ${user?.name}: "${form.type}"`, 'report')
    setSent(true); setTimeout(()=>setSent(false),2500)
  }
  const mine = mockReports.filter(r=>r.fromRole==='instructor')
  return (
    <div className="grid lg:grid-cols-2 gap-4 animate-fadeIn">
      <Card>
        <SectionHeader title="Submit Report"/>
        <div className="space-y-3">
          <div><label className="label">Send To</label><select className="input" value={form.to} onChange={e=>setForm({...form,to:e.target.value})}><option value="affairs">Student Affairs Assistant</option><option value="foundation_lead">Foundation Lead</option></select></div>
          <div><label className="label">Report Type</label><select className="input" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option>Student Progress</option><option>Attendance Summary</option><option>Grade Report</option><option>At-Risk Students</option><option>Complaint Report</option></select></div>
          <div><label className="label">Period</label><select className="input" value={form.period} onChange={e=>setForm({...form,period:e.target.value})}><option>July 2024</option><option>June 2024</option><option>Q3 2024</option></select></div>
          <div><label className="label">Content</label><textarea className="input" rows={4} value={form.content} onChange={e=>setForm({...form,content:e.target.value})} placeholder="Student performance summary…"/></div>
          <FileUploadBox onFile={setFile} label="Attach File (optional)" hint="Upload PDF, DOCX, or Excel report"/>
          {sent?<div className="p-2.5 bg-green-50 text-green-700 rounded-xl text-xs text-center font-medium">✓ Report sent!</div>:<button onClick={send} className="btn-primary w-full"><Send className="w-3.5 h-3.5"/>Send Report</button>}
        </div>
      </Card>
      <Card>
        <SectionHeader title="Sent Reports"/>
        {mine.length===0?<p className="text-xs text-gray-400 text-center py-8">No reports sent yet</p>:mine.map(r=>(
          <div key={r.id} className="p-3 border border-gray-100 rounded-xl mb-2">
            <p className="text-xs font-semibold text-gray-900">{r.type} — {r.period}</p>
            <p className="text-[10px] text-gray-400">To: {r.to} · {r.sentAt}</p>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{r.content}</p>
          </div>
        ))}
      </Card>
    </div>
  )
}
