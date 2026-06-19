import { useState } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import Header from '../../components/layout/Header'
import { StatCard, StatusBadge, Badge, Table, SectionHeader, Modal, ProgressBar, MiniStat, SelectFilter, Card, FileUploadBox } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { GraduationCap, BookOpen, ClipboardList, AlertCircle, Send, Plus, ExternalLink, Youtube, Video, FileText, CheckSquare, Timer, BarChart3, Calendar, Trash2, Download, Trophy } from 'lucide-react'

const PAGES = { dashboard:'Instructor Dashboard', courses:'My Courses', students:'My Students', attendance:'Mark Attendance', assignments:'Assignments', quizzes:'Assessments', liveclass:'Live Class', results:'Results', complaints:'Complaints', meetings:'Meetings', reports:'Reports' }

export default function InstructorPortal() {
  const [active, setActive] = useState('dashboard')
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar activeKey={active} onNavigate={setActive}/>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={PAGES[active] || active} onNavigate={setActive}/>
        <main className="flex-1 overflow-y-auto p-5">
          {active==='dashboard'   && <InsDash onNavigate={setActive}/>}
          {active==='courses'     && <InsCourses/>}
          {active==='students'    && <InsStudents/>}
          {active==='attendance'  && <InsAttendance/>}
          {active==='assignments' && <InsAssignments/>}
          {active==='quizzes'     && <InsQuizzes/>}
          {active==='liveclass'   && <InsLiveClass/>}
          {active==='results'     && <InsResults/>}
          {active==='complaints'  && <InsComplaints/>}
          {active==='meetings'    && <InsMeetings/>}
          {active==='reports'     && <InsReports/>}
        </main>
      </div>
    </div>
  )
}

function useInstructor() {
  const { user } = useAuth()
  const { mockInstructors } = useData()
  return mockInstructors.find(i => i.authId === user?.id) || null
}

function InsDash({ onNavigate }) {
  const { user } = useAuth()
  const { mockCourses, mockStudents, mockAssignments, mockQuizzes } = useData()
  const instructor = useInstructor()
  const courses  = mockCourses.filter(c => c.instructorId === instructor?.id)
  const enrolled = new Set(courses.flatMap(c => c.enrolledStudents || []))
  const students = mockStudents.filter(s => enrolled.has(s.id))
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
        <StatCard label="My Courses"      value={courses.length}   icon={BookOpen}      color="blue"   onClick={()=>setDrill('courses')}    clickLabel="View courses"/>
        <StatCard label="My Students"     value={students.length}  icon={GraduationCap} color="purple" onClick={()=>setDrill('students')}   clickLabel="View students"/>
        <StatCard label="Pending Grading" value={pendingGrading}   icon={FileText}      color="amber"  onClick={()=>setDrill('grading')}    clickLabel="View submissions"/>
        <StatCard label="Quiz Submissions"value={totalQuizSubs}    icon={CheckSquare}   color="teal"   onClick={()=>setDrill('quiz_subs')}  clickLabel="View quiz results"/>
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
  const { mockCourses, mockStudents, addYoutubeLink, removeYoutubeLink, addCourseMaterial, removeCourseMaterial } = useData()
  const instructor = useInstructor()
  const courses    = mockCourses.filter(c => c.instructorId === instructor?.id)
  const [sel, setSel]           = useState(null)
  const [ytModal, setYtModal]   = useState(null)
  const [matModal, setMatModal] = useState(null)
  const [ytForm, setYtForm]     = useState({title:'',url:''})
  const [matFile, setMatFile]   = useState(null)
  const [saving, setSaving]     = useState(false)

  const saveYt = async () => {
    if(!ytForm.title||!ytForm.url) return
    setSaving(true)
    await addYoutubeLink(ytModal.id, ytForm.title, ytForm.url)
    setYtModal(null); setYtForm({title:'',url:''}); setSaving(false)
  }

  const saveMat = async () => {
    if(!matFile) return
    setSaving(true)
    const size = matFile.size ? `${Math.round(matFile.size/1024)} KB` : ''
    await addCourseMaterial(matModal.id, matFile.name, size)
    setMatModal(null); setMatFile(null); setSaving(false)
  }

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
            <button onClick={()=>{setYtModal(c);setYtForm({title:'',url:''})}} className="btn-secondary text-xs py-1.5"><Youtube className="w-3 h-3 text-red-500"/>Add YouTube</button>
            <button onClick={()=>{setMatModal(c);setMatFile(null)}} className="btn-secondary text-xs py-1.5"><FileText className="w-3 h-3"/>Upload Material</button>
            <button onClick={()=>setSel(c)} className="btn-primary text-xs py-1.5"><GraduationCap className="w-3 h-3"/>View Students</button>
          </div>
          {c.youtubeLinks?.length>0&&(
            <div className="mt-3 border-t border-gray-100 pt-2">
              <p className="label mb-1">Videos</p>
              {c.youtubeLinks.map(v=>(
                <div key={v.id} className="flex items-center justify-between mb-1">
                  <a href={v.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-red-600 hover:underline"><Youtube className="w-3 h-3"/>{v.title}</a>
                  <button onClick={()=>removeYoutubeLink(v.id,c.id)} className="text-gray-300 hover:text-red-400 p-0.5"><Trash2 className="w-3 h-3"/></button>
                </div>
              ))}
            </div>
          )}
          {c.materials?.length>0&&(
            <div className="mt-2">
              <p className="label mb-1">Materials</p>
              {c.materials.map(m=>(
                <div key={m.id} className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">📄 {m.name}{m.size&&` (${m.size})`}</p>
                  <button onClick={()=>removeCourseMaterial(m.id,c.id)} className="text-gray-300 hover:text-red-400 p-0.5"><Trash2 className="w-3 h-3"/></button>
                </div>
              ))}
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
          <button onClick={saveYt} disabled={saving} className="btn-primary w-full disabled:opacity-60">{saving?'Saving…':'Save Video Link'}</button>
        </div>
      </Modal>
      <Modal open={!!matModal} onClose={()=>setMatModal(null)} title="Upload Course Material">
        <div className="space-y-3">
          <FileUploadBox onFile={setMatFile} label="Select Material" hint="PDF, PPT, DOCX, images — max 50MB" accept=".pdf,.ppt,.pptx,.doc,.docx,.png,.jpg"/>
          {matFile&&<p className="text-xs text-gray-500 px-1">Selected: {matFile.name}</p>}
          <button onClick={saveMat} disabled={saving||!matFile} className="btn-primary w-full disabled:opacity-60">{saving?'Saving…':'Save Material'}</button>
        </div>
      </Modal>
    </div>
  )
}

function InsStudents() {
  const { mockCourses, mockStudents } = useData()
  const instructor = useInstructor()
  const courses = mockCourses.filter(c => c.instructorId === instructor?.id)
  const enrolled = new Set(courses.flatMap(c => c.enrolledStudents || []))
  const [cid, setCid] = useState('')
  const students = cid
    ? mockStudents.filter(s=>s.courses?.includes(parseInt(cid)))
    : mockStudents.filter(s => enrolled.has(s.id))
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
  const { mockCourses, mockStudents, mockAttendance, markAttendance } = useData()
  const instructor = useInstructor()
  const courses    = mockCourses.filter(c => c.instructorId === instructor?.id)
  const [cid,      setCid]      = useState(String(courses[0]?.id||''))
  const [date,     setDate]     = useState(new Date().toISOString().split('T')[0])
  const [marks,    setMarks]    = useState({})   // user-made overrides only
  const [saved,    setSaved]    = useState(false)
  const [histOpen, setHistOpen] = useState(null) // expanded date key in history

  const enrolled     = mockStudents.filter(s => s.courses?.includes(parseInt(cid)))
  const existingRecs = mockAttendance.filter(a => a.courseId === parseInt(cid) && a.date === date)
  const existingMap  = Object.fromEntries(existingRecs.map(r => [r.studentId, r.status]))
  // Existing DB values as baseline; user's button clicks override on top
  const effectiveMarks = { ...existingMap, ...marks }
  const isEditing    = existingRecs.length > 0

  const changeCourse = v => { setCid(v);   setMarks({}) }
  const changeDate   = v => { setDate(v);  setMarks({}) }
  const toggle       = (id, status) => setMarks(m => ({ ...m, [id]: status }))

  const save = async () => {
    const records = enrolled.map(s => ({
      studentId: s.id, studentName: s.name,
      courseId: parseInt(cid), date,
      status: effectiveMarks[s.id] || 'absent',
    }))
    await markAttendance(records)
    setSaved(true); setTimeout(() => setSaved(false), 2500)
    setMarks({})
  }

  // All unique dates with records for this course, newest first
  const historyDates = [...new Set(
    mockAttendance.filter(a => a.courseId === parseInt(cid)).map(a => a.date)
  )].sort((a, b) => b.localeCompare(a))

  return (
    <div className="space-y-4 animate-fadeIn">
      <Card>
        <div className="flex flex-wrap gap-3 mb-4">
          <SelectFilter label="Course" value={cid} onChange={changeCourse} options={courses.map(c=>({value:String(c.id),label:c.name}))} placeholder="Select Course"/>
          <div className="flex items-center gap-2">
            <span className="label mb-0">Date</span>
            <input type="date" className="input text-xs py-1.5" value={date} onChange={e=>changeDate(e.target.value)}/>
          </div>
          {isEditing && <Badge color="amber">Editing past record</Badge>}
        </div>
        <div className="space-y-2">
          {enrolled.map(s=>(
            <div key={s.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
              <div><p className="font-medium text-sm text-gray-900">{s.name}</p><p className="text-xs text-gray-400">Overall: {s.attendanceRate}%</p></div>
              <div className="flex gap-2">
                {['present','late','absent'].map(st=>(
                  <button key={st} onClick={()=>toggle(s.id,st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${effectiveMarks[s.id]===st?(st==='present'?'bg-green-500 text-white':st==='late'?'bg-amber-500 text-white':'bg-red-500 text-white'):'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
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
            ? <div className="p-2.5 bg-green-50 text-green-700 rounded-xl text-xs text-center font-medium">✓ Attendance {isEditing?'updated':'saved'}!</div>
            : <button onClick={save} className="btn-primary w-full">{isEditing?'Update Attendance':'Save Attendance'}</button>
          }
        </div>
      </Card>

      {cid && historyDates.length > 0 && (
        <Card>
          <SectionHeader title="Attendance History"/>
          <div className="space-y-2 mt-2">
            {historyDates.map(d => {
              const dayRecs    = mockAttendance.filter(a => a.courseId === parseInt(cid) && a.date === d)
              const presentCnt = dayRecs.filter(r => r.status === 'present').length
              const lateCnt    = dayRecs.filter(r => r.status === 'late').length
              const absentCnt  = dayRecs.filter(r => r.status === 'absent').length
              const isOpen     = histOpen === d
              return (
                <div key={d} className="border border-gray-100 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setHistOpen(isOpen ? null : d)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{d}</span>
                      {d === date && <Badge color="blue">Selected</Badge>}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge color="green">{presentCnt}P</Badge>
                      <Badge color="amber">{lateCnt}L</Badge>
                      <Badge color="red">{absentCnt}A</Badge>
                      <button
                        onClick={e => { e.stopPropagation(); changeDate(d) }}
                        className="text-xs px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium ml-1"
                      >
                        Edit
                      </button>
                    </div>
                  </button>
                  {isOpen && (
                    <div className="border-t border-gray-100 px-3 py-2 space-y-1.5">
                      {dayRecs.map((r, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-gray-700">{r.studentName}</span>
                          <StatusBadge status={r.status}/>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}

function InsAssignments() {
  const { pushNotif } = useAuth()
  const { mockCourses, mockAssignments, addAssignment, gradeAssignment } = useData()
  const instructor = useInstructor()
  const courses  = mockCourses.filter(c => c.instructorId === instructor?.id)
  const asgList  = mockAssignments.filter(a => courses.some(c => c.id === a.courseId))
  const blankForm = () => ({courseId:String(courses[0]?.id||''),title:'',description:'',instructions:'',totalMarks:100,dueDate:''})
  const [modal, setModal]     = useState(false)
  const [gradeM, setGradeM]   = useState(null) // {asgId, studentId, studentName, title, maxGrade, file, text}
  const [form, setForm]       = useState(blankForm())
  const [asgFile, setAsgFile] = useState(null)
  const [gradeF, setGradeF]   = useState({grade:'',feedback:''})

  const create = async () => {
    if (!form.title || !form.dueDate) return
    await addAssignment({
      ...form, courseId:parseInt(form.courseId),
      fileName: asgFile?.name || null,
    })
    await pushNotif('student', `New assignment: "${form.title}" — due ${form.dueDate}`, 'assignment', 'assignments')
    setModal(false); setForm(blankForm()); setAsgFile(null)
  }

  const grade = async () => {
    const g = parseInt(gradeF.grade)
    if (isNaN(g)) return
    await gradeAssignment(gradeM.asgId, gradeM.studentId, g, gradeF.feedback)
    await pushNotif('student', `Assignment "${gradeM.title}" graded — ${g}/${gradeM.maxGrade}`, 'grade', 'assignments')
    setGradeM(null); setGradeF({grade:'',feedback:''})
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex justify-end">
        <button onClick={()=>{setModal(true);setForm(blankForm());setAsgFile(null)}} className="btn-primary text-xs"><Plus className="w-3.5 h-3.5"/>Create Assignment</button>
      </div>
      {asgList.map(a=>(
        <Card key={a.id}>
          <div className="flex justify-between mb-1">
            <div>
              <p className="font-semibold text-gray-900">{a.title}</p>
              <p className="text-xs text-gray-400">{courses.find(c=>c.id===a.courseId)?.name} · Due: {a.dueDate} · {a.totalMarks} marks</p>
            </div>
            <Badge color="indigo">{a.submissions.length} submitted</Badge>
          </div>
          {a.description&&<p className="text-xs text-gray-500 mb-1">{a.description}</p>}
          {a.instructions&&<p className="text-xs text-gray-400 italic mb-2">📋 {a.instructions}</p>}
          {a.fileName&&<p className="text-xs text-indigo-500 mb-2">📎 {a.fileName}</p>}
          {a.submissions.length>0&&(
            <div className="mt-2 border-t border-gray-100 pt-2 space-y-1.5">
              {a.submissions.map((s,i)=>(
                <div key={i} className="p-2.5 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{s.studentName}</p>
                      <p className="text-[10px] text-gray-400">
                        {s.file?`📎 ${s.file}`:s.text?'✏️ Online submission':''} · {s.submittedAt}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {s.status==='graded'
                        ? <Badge color="green">{s.grade}/{a.totalMarks}</Badge>
                        : <button onClick={()=>setGradeM({asgId:a.id,studentId:s.studentId,studentName:s.studentName,title:a.title,maxGrade:a.totalMarks,file:s.file,text:s.text})} className="text-xs text-indigo-600 font-medium hover:underline">Grade</button>
                      }
                    </div>
                  </div>
                  {s.text&&<p className="text-xs text-gray-600 bg-white border border-gray-100 rounded-lg p-2 mt-1 line-clamp-3">{s.text}</p>}
                  {s.status==='graded'&&s.feedback&&<p className="text-[10px] text-green-600 mt-1">Feedback: {s.feedback}</p>}
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}

      <Modal open={modal} onClose={()=>setModal(false)} title="Create Assignment" wide>
        <div className="space-y-4">
          <div><label className="label">Course</label>
            <select className="input" value={form.courseId} onChange={e=>setForm({...form,courseId:e.target.value})}>
              {courses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label className="label">Title</label><input className="input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Assignment title"/></div>
          <div><label className="label">Description</label><textarea className="input" rows={2} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Brief overview…"/></div>
          <div><label className="label">Instructions</label><textarea className="input" rows={3} value={form.instructions} onChange={e=>setForm({...form,instructions:e.target.value})} placeholder="Detailed instructions for students…"/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Total Marks</label><input type="number" min="1" className="input" value={form.totalMarks} onChange={e=>setForm({...form,totalMarks:parseInt(e.target.value)||100})}/></div>
            <div><label className="label">Due Date</label><input type="date" className="input" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})}/></div>
          </div>
          <FileUploadBox onFile={setAsgFile} label="Supporting File (optional)" hint="PDF, DOCX, PPT, ZIP, images" accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.png,.jpg,.jpeg"/>
          {asgFile&&<p className="text-xs text-gray-500">📎 {asgFile.name}</p>}
          <button onClick={create} className="btn-primary w-full">Create & Notify Students</button>
        </div>
      </Modal>

      <Modal open={!!gradeM} onClose={()=>setGradeM(null)} title={`Grade — ${gradeM?.studentName}`} wide>
        <div className="space-y-4">
          {gradeM?.file&&<div className="p-2.5 bg-gray-50 rounded-xl text-xs text-gray-600">📎 Submitted file: <strong>{gradeM.file}</strong></div>}
          {gradeM?.text&&(
            <div>
              <label className="label">Online Submission</label>
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 max-h-48 overflow-y-auto">{gradeM.text}</div>
            </div>
          )}
          <div><label className="label">Grade (out of {gradeM?.maxGrade||100})</label><input type="number" min="0" max={gradeM?.maxGrade||100} className="input" value={gradeF.grade} onChange={e=>setGradeF({...gradeF,grade:e.target.value})} placeholder={`0–${gradeM?.maxGrade||100}`}/></div>
          <div><label className="label">Feedback</label><textarea className="input" rows={3} value={gradeF.feedback} onChange={e=>setGradeF({...gradeF,feedback:e.target.value})} placeholder="Feedback for student…"/></div>
          <button onClick={grade} className="btn-primary w-full">Save Grade & Notify Student</button>
        </div>
      </Modal>
    </div>
  )
}

const Q_TYPES = [
  { value:'mcq',          label:'MCQ — Multiple Choice' },
  { value:'true_false',   label:'True / False' },
  { value:'multi_select', label:'Multiple Select' },
  { value:'fill_blank',   label:'Fill in the Blank' },
  { value:'short_answer', label:'Short Answer' },
  { value:'long_answer',  label:'Long Answer' },
  { value:'essay',        label:'Essay' },
]
const AUTO_GRADE_TYPES = ['mcq','true_false']

function blankQuestion(type='mcq') {
  if (type==='mcq')          return {type,text:'',options:['','','',''],correct:0}
  if (type==='true_false')   return {type,text:'',options:['True','False'],correct:0}
  if (type==='multi_select') return {type,text:'',options:['','','',''],correct:[]}
  return {type,text:'',options:[],correct:null}
}

function InsQuizzes() {
  const { pushNotif } = useAuth()
  const { mockCourses, mockQuizzes, addQuiz, overrideQuizGrade } = useData()
  const instructor = useInstructor()
  const courses    = mockCourses.filter(c => c.instructorId === instructor?.id)
  const quizList   = mockQuizzes.filter(q => courses.some(c => c.id === q.courseId))
  const blankForm  = () => ({
    courseId:String(courses[0]?.id||''), assessmentType:'quiz', title:'',
    duration:30, totalMarks:100, passingMarks:50, instructions:'', dueDate:'',
    questions:[blankQuestion('mcq')],
  })
  const [createM, setCreateM]     = useState(false)
  const [overrideM, setOverrideM] = useState(null) // {qzId, studentId, studentName, sub}
  const [form, setForm]           = useState(blankForm())
  const [ovF, setOvF]             = useState({grade:'',feedback:''})

  const updQ  = (i,f,v) => { const qs=[...form.questions]; qs[i]={...qs[i],[f]:v}; setForm({...form,questions:qs}) }
  const updO  = (qi,oi,v)=> { const qs=[...form.questions]; qs[qi].options[oi]=v; setForm({...form,questions:qs}) }
  const addQ  = () => setForm({...form,questions:[...form.questions,blankQuestion('mcq')]})
  const changeQType = (i,t) => { const qs=[...form.questions]; qs[i]=blankQuestion(t); setForm({...form,questions:qs}) }
  const toggleMulti = (qi,oi) => {
    const qs=[...form.questions]
    const cur=qs[qi].correct||[]
    qs[qi]={...qs[qi],correct:cur.includes(oi)?cur.filter(x=>x!==oi):[...cur,oi]}
    setForm({...form,questions:qs})
  }

  const create = async () => {
    if(!form.title||!form.dueDate) return
    await addQuiz({...form,courseId:parseInt(form.courseId)})
    await pushNotif('student', `New ${form.assessmentType}: "${form.title}" — due ${form.dueDate}`, 'quiz', 'quizzes')
    setCreateM(false); setForm(blankForm())
  }
  const override = async () => {
    await overrideQuizGrade(overrideM.qzId, overrideM.studentId, parseInt(ovF.grade), ovF.feedback)
    await pushNotif('student', 'Assessment grade updated by instructor', 'grade', 'quizzes')
    setOverrideM(null); setOvF({grade:'',feedback:''})
  }

  const ATYPE_LABEL = {quiz:'Quiz',exam:'Exam',practice_test:'Practice Test'}

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex justify-end">
        <button onClick={()=>{setCreateM(true);setForm(blankForm())}} className="btn-primary text-xs"><Plus className="w-3.5 h-3.5"/>Create Assessment</button>
      </div>
      {quizList.map(q=>(
        <Card key={q.id}>
          <div className="flex justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-semibold text-gray-900">{q.title}</p>
                <Badge color="purple">{ATYPE_LABEL[q.assessmentType]||q.assessmentType}</Badge>
              </div>
              <p className="text-xs text-gray-400">
                {q.questions.length} questions · {q.duration} min · {q.totalMarks} marks · Pass: {q.passingMarks} · Due: {q.dueDate}
              </p>
            </div>
            <Badge color="indigo">{q.submissions.length} submitted</Badge>
          </div>
          {q.instructions&&<p className="text-xs text-gray-400 italic mb-2">📋 {q.instructions}</p>}
          {q.submissions.length>0&&(
            <div className="border-t border-gray-100 pt-2 mt-2 space-y-1.5">
              {q.submissions.map((s,i)=>{
                const hasAuto = q.questions.some(qq=>AUTO_GRADE_TYPES.includes(qq.type||'mcq'))
                const displayGrade = s.overrideGrade!==null?s.overrideGrade:s.score
                const passed = displayGrade >= (q.passingMarks||50)
                return (
                  <div key={i} className="p-2 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-gray-800">{s.studentName}</p>
                        <p className="text-[10px] text-gray-400">
                          {hasAuto?`Auto: ${s.score}% · `:''}
                          {s.overrideGrade!==null?`Override: ${s.overrideGrade}%`:''}
                          {s.hasSubjective&&s.overrideGrade===null?' Pending manual grade':''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge color={passed?'green':'red'}>{displayGrade}%</Badge>
                        <span className={`text-[10px] font-semibold ${passed?'text-green-600':'text-red-500'}`}>{passed?'Pass':'Fail'}</span>
                        <button onClick={()=>setOverrideM({qzId:q.id,studentId:s.studentId,studentName:s.studentName,sub:s})} className="text-xs text-indigo-600 hover:underline">
                          {s.hasSubjective&&s.overrideGrade===null?'Grade':'Override'}
                        </button>
                      </div>
                    </div>
                    {s.hasSubjective&&Object.keys(s.textAnswers||{}).length>0&&(
                      <div className="mt-2 space-y-1">
                        {q.questions.filter(qq=>!AUTO_GRADE_TYPES.includes(qq.type||'mcq')).map((qq,qi)=>(
                          <div key={qi} className="text-xs">
                            <span className="text-gray-400">Q: {qq.text}</span>
                            <div className="bg-white border border-gray-100 rounded-lg p-1.5 mt-0.5 text-gray-700">{s.textAnswers?.[qi]||<span className="text-gray-300 italic">No answer</span>}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      ))}

      <Modal open={createM} onClose={()=>setCreateM(false)} title="Create Assessment" wide>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Course</label>
              <select className="input" value={form.courseId} onChange={e=>setForm({...form,courseId:e.target.value})}>
                {courses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div><label className="label">Assessment Type</label>
              <select className="input" value={form.assessmentType} onChange={e=>setForm({...form,assessmentType:e.target.value})}>
                <option value="quiz">Quiz</option>
                <option value="exam">Exam</option>
                <option value="practice_test">Practice Test</option>
              </select>
            </div>
            <div><label className="label">Title</label><input className="input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Navigation Mid-term"/></div>
            <div><label className="label">Due Date</label><input type="date" className="input" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})}/></div>
            <div><label className="label">Duration (min)</label><input type="number" className="input" value={form.duration} onChange={e=>setForm({...form,duration:parseInt(e.target.value)||30})}/></div>
            <div><label className="label">Total Marks</label><input type="number" className="input" value={form.totalMarks} onChange={e=>setForm({...form,totalMarks:parseInt(e.target.value)||100})}/></div>
            <div><label className="label">Passing Marks</label><input type="number" className="input" value={form.passingMarks} onChange={e=>setForm({...form,passingMarks:parseInt(e.target.value)||50})}/></div>
          </div>
          <div><label className="label">Instructions</label><textarea className="input" rows={2} value={form.instructions} onChange={e=>setForm({...form,instructions:e.target.value})} placeholder="Instructions for students…"/></div>

          <div>
            <label className="label">Questions</label>
            {form.questions.map((q,qi)=>(
              <div key={qi} className="p-3 border border-gray-100 rounded-xl mb-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500 flex-shrink-0">Q{qi+1}</span>
                  <select className="input text-xs py-1 flex-shrink-0 w-44"
                    value={q.type||'mcq'} onChange={e=>changeQType(qi,e.target.value)}>
                    {Q_TYPES.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <input className="input text-xs" value={q.text} onChange={e=>updQ(qi,'text',e.target.value)} placeholder="Question text…"/>
                {(q.type==='mcq')&&(
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt,oi)=>(
                        <div key={oi} className="flex items-center gap-1.5">
                          <input type="radio" name={`ins_q${qi}`} checked={q.correct===oi} onChange={()=>updQ(qi,'correct',oi)} className="accent-indigo-600 flex-shrink-0"/>
                          <input className="input text-xs py-1 flex-1" value={opt} onChange={e=>updO(qi,oi,e.target.value)} placeholder={`Option ${oi+1}`}/>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-400">Radio = correct answer · Auto-graded</p>
                  </>
                )}
                {q.type==='true_false'&&(
                  <div className="flex gap-4">
                    {['True','False'].map((opt,oi)=>(
                      <label key={oi} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name={`ins_q${qi}`} checked={q.correct===oi} onChange={()=>updQ(qi,'correct',oi)} className="accent-indigo-600"/>
                        <span className="text-sm text-gray-700">{opt} = Correct</span>
                      </label>
                    ))}
                    <p className="text-[10px] text-gray-400 self-center">Auto-graded</p>
                  </div>
                )}
                {q.type==='multi_select'&&(
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt,oi)=>(
                        <div key={oi} className="flex items-center gap-1.5">
                          <input type="checkbox" checked={(q.correct||[]).includes(oi)} onChange={()=>toggleMulti(qi,oi)} className="accent-indigo-600 flex-shrink-0"/>
                          <input className="input text-xs py-1 flex-1" value={opt} onChange={e=>updO(qi,oi,e.target.value)} placeholder={`Option ${oi+1}`}/>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-400">Check = correct options · Manual graded</p>
                  </>
                )}
                {['fill_blank','short_answer','long_answer','essay'].includes(q.type)&&(
                  <p className="text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">✏️ Subjective — instructor grades manually after submission</p>
                )}
              </div>
            ))}
            <button type="button" onClick={addQ} className="text-xs text-indigo-600 hover:underline font-medium">+ Add Question</button>
          </div>
          <button onClick={create} className="btn-primary w-full">Create & Notify Students</button>
        </div>
      </Modal>

      <Modal open={!!overrideM} onClose={()=>setOverrideM(null)} title={`Grade — ${overrideM?.studentName}`} wide>
        <div className="space-y-4">
          {overrideM?.sub?.hasSubjective&&Object.keys(overrideM.sub.textAnswers||{}).length>0&&(
            <div>
              <label className="label">Subjective Answers</label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {quizList.find(q=>q.id===overrideM?.qzId)?.questions
                  .filter(qq=>!AUTO_GRADE_TYPES.includes(qq.type||'mcq'))
                  .map((qq,qi)=>(
                    <div key={qi} className="text-xs">
                      <p className="text-gray-500 font-medium">{qq.text}</p>
                      <div className="bg-gray-50 border border-gray-100 rounded-lg p-2 mt-0.5 text-gray-700">{overrideM.sub.textAnswers?.[qi]||<span className="text-gray-300 italic">No answer</span>}</div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
          <div><label className="label">Override Grade (%)</label><input type="number" min="0" max="100" className="input" value={ovF.grade} onChange={e=>setOvF({...ovF,grade:e.target.value})} placeholder="0–100"/></div>
          <div><label className="label">Feedback</label><textarea className="input" rows={3} value={ovF.feedback} onChange={e=>setOvF({...ovF,feedback:e.target.value})} placeholder="Feedback for student…"/></div>
          <button onClick={override} className="btn-primary w-full">Save Grade</button>
        </div>
      </Modal>
    </div>
  )
}

function InsLiveClass() {
  const { user, pushNotif } = useAuth()
  const { mockCourses, mockMeetings, addLiveClass } = useData()
  const instructor  = useInstructor()
  const courses     = mockCourses.filter(c => c.instructorId === instructor?.id)
  const liveclasses = mockMeetings.filter(m =>
    m.createdByRole === 'instructor' && m.courseId && courses.some(c => c.id === m.courseId)
  )
  const [modal, setModal] = useState(false)
  const [form, setForm]   = useState({courseId:String(courses[0]?.id||''),title:'',date:'',link:'',platform:'teams'})
  const [busy, setBusy]   = useState(false)

  const create = async () => {
    if(!form.title||!form.date||!form.courseId) return
    setBusy(true)
    await addLiveClass({ ...form, courseId:parseInt(form.courseId), createdBy:user?.name })
    await pushNotif('student', `Live class: "${form.title}" — join from your portal`, 'meeting')
    setModal(false)
    setForm({courseId:String(courses[0]?.id||''),title:'',date:'',link:'',platform:'teams'})
    setBusy(false)
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-sm text-indigo-800">
        <strong>Live Classes</strong> — Create a class for a course; enrolled students receive access automatically.
      </div> */}
      <div className="flex justify-end">
        <button onClick={()=>setModal(true)} className="btn-primary text-xs"><Plus className="w-3.5 h-3.5"/>Create Live Class</button>
      </div>
      {liveclasses.map(m=>(
        <Card key={m.id}>
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-gray-900 mb-0.5">{m.title}</p>
              <p className="text-xs text-gray-400">{courses.find(c=>c.id===m.courseId)?.name} · {m.date}</p>
            </div>
            <StatusBadge status={m.status}/>
          </div>
          {m.link&&<a href={m.link} target="_blank" rel="noreferrer" className="btn-primary text-xs py-2 mt-3 inline-flex items-center gap-1.5"><Video className="w-3.5 h-3.5"/>Join / Start Class</a>}
        </Card>
      ))}
      {courses.map(c=>(
        <Card key={c.id}>
          <p className="font-semibold text-gray-900 mb-1">{c.name}</p>
          <p className="text-xs text-gray-400 mb-3">Next scheduled: {c.nextClass||'—'}</p>
          <div className="flex flex-wrap gap-2">
            {c.teamsLink?<a href={c.teamsLink} target="_blank" rel="noreferrer" className="btn-primary text-xs py-2"><Video className="w-3.5 h-3.5"/>Start Teams Class</a>:<span className="btn-secondary text-xs py-2 opacity-50"><Video className="w-3.5 h-3.5"/>No Teams Link</span>}
            {c.classroomLink&&<a href={c.classroomLink} target="_blank" rel="noreferrer" className="text-xs py-2 px-3 bg-green-600 text-white rounded-xl font-semibold flex items-center gap-1 hover:bg-green-700"><ExternalLink className="w-3 h-3"/>Google Classroom</a>}
          </div>
          {c.youtubeLinks?.length>0&&(
            <div className="mt-3 border-t border-gray-100 pt-2">
              <p className="label mb-1">Recorded Lectures</p>
              {c.youtubeLinks.map(v=><a key={v.id} href={v.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-red-600 hover:underline mb-1"><Youtube className="w-3.5 h-3.5"/>{v.title}</a>)}
            </div>
          )}
        </Card>
      ))}
      <Modal open={modal} onClose={()=>setModal(false)} title="Create Live Class" wide>
        <div className="space-y-4">
          <div><label className="label">Course</label>
            <select className="input" value={form.courseId} onChange={e=>setForm({...form,courseId:e.target.value})}>
              {courses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label className="label">Title</label><input className="input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Navigation Live Lecture"/></div>
          <div><label className="label">Date & Time</label><input type="datetime-local" className="input" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></div>
          <div><label className="label">Platform</label>
            <select className="input" value={form.platform} onChange={e=>setForm({...form,platform:e.target.value})}>
              <option value="teams">Microsoft Teams</option>
              <option value="classroom">Google Classroom</option>
            </select>
          </div>
          <div><label className="label">Meeting Link</label><input className="input" value={form.link} onChange={e=>setForm({...form,link:e.target.value})} placeholder="https://…"/></div>
          <button onClick={create} disabled={busy} className="btn-primary w-full disabled:opacity-60">{busy?'Creating…':'Create & Notify Students'}</button>
        </div>
      </Modal>
    </div>
  )
}

function InsComplaints() {
  const { user, pushNotif } = useAuth()
  const { mockComplaints, addComplaint } = useData()
  const instructor = useInstructor()
  const [modal, setModal] = useState(false)
  const [form, setForm]   = useState({subject:'',desc:'',assignedTo:'Student Affairs Assistant',priority:'medium'})
  const mine = mockComplaints.filter(c=>c.fromRole==='instructor')
  const submit = async () => {
    await addComplaint({fromId:instructor?.id,from:user?.name,fromRole:'instructor',subject:form.subject,desc:form.desc,assignedTo:form.assignedTo,priority:form.priority,status:'pending'})
    await pushNotif('affairs', `New instructor complaint: "${form.subject}"`, 'complaint')
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
  const { mockMeetings } = useData()
  // Show only meetings created by management/admin that include instructor as a participant.
  // Instructor-created live classes appear in the Live Class module, not here.
  const invitedMeetings = mockMeetings.filter(m =>
    m.createdByRole !== 'instructor' && m.participantRoles?.includes('instructor')
  )
  const [response, setResponse] = useState({}) // meetingId -> 'accepted' | 'rejected'

  return (
    <div className="space-y-3 animate-fadeIn">
      {invitedMeetings.length===0&&(
        <Card className="text-center py-10 text-gray-400 text-sm">No meeting invitations from management</Card>
      )}
      {invitedMeetings.map(m=>(
        <Card key={m.id}>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex gap-2 mb-1"><p className="font-semibold text-gray-900">{m.title}</p><StatusBadge status={m.status}/><Badge color="blue">Invited</Badge></div>
              <p className="text-xs text-gray-500">{m.date}</p>
              <p className="text-xs text-gray-400 mt-0.5">By: {m.createdBy}</p>
              <p className="text-xs text-gray-400">{m.participants?.join(', ')}</p>
            </div>
            <div className="flex flex-col gap-2 items-end flex-shrink-0 ml-3">
              {m.status==='upcoming'&&m.link&&(
                <a href={m.link} target="_blank" rel="noreferrer" className="btn-primary text-xs py-1.5">Join <ExternalLink className="w-3 h-3"/></a>
              )}
              {response[m.id]?(
                <Badge color={response[m.id]==='accepted'?'green':'red'}>{response[m.id]}</Badge>
              ):(
                <div className="flex gap-1.5">
                  <button onClick={()=>setResponse(p=>({...p,[m.id]:'accepted'}))} className="text-xs px-2 py-1 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 font-medium">Accept</button>
                  <button onClick={()=>setResponse(p=>({...p,[m.id]:'rejected'}))} className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-medium">Reject</button>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

function InsResults() {
  const { mockCourses, mockStudents, mockAssignments, mockQuizzes, mockResults, addResult } = useData()
  const instructor = useInstructor()
  const courses = mockCourses.filter(c => c.instructorId === instructor?.id)

  const [cid,    setCid]    = useState(String(courses[0]?.id || ''))
  const [modal,  setModal]  = useState(false)
  const [form,   setForm]   = useState({})
  const [saving, setSaving] = useState(false)

  const courseId = parseInt(cid) || 0
  const course   = mockCourses.find(c => c.id === courseId)
  const courseStudents = cid ? mockStudents.filter(s => s.courses?.includes(courseId)) : []
  const courseResults  = mockResults.filter(r => r.courseId === courseId)

  const calcGrade  = p => p >= 90 ? 'A+' : p >= 80 ? 'A' : p >= 70 ? 'B' : p >= 60 ? 'C' : p >= 50 ? 'D' : 'F'
  const gradeColor = g => ['A+','A'].includes(g) ? 'green' : ['B','C'].includes(g) ? 'amber' : 'red'

  const getAssignmentAvg = (studentId) => {
    const graded = mockAssignments
      .filter(a => a.courseId === courseId)
      .flatMap(a => a.submissions.filter(s => s.studentId === studentId && s.status === 'graded')
        .map(s => ({ grade: s.grade || 0, max: a.totalMarks || 100 })))
    if (!graded.length) return 0
    const obtained = graded.reduce((sum, g) => sum + g.grade, 0)
    const total    = graded.reduce((sum, g) => sum + g.max, 0)
    return total > 0 ? Math.round(obtained / total * 100) : 0
  }

  const getQuizAvg = (studentId) => {
    const subs = mockQuizzes
      .filter(q => q.courseId === courseId)
      .flatMap(q => q.submissions.filter(s => s.studentId === studentId).map(s => s.overrideGrade ?? s.score))
    if (!subs.length) return 0
    return Math.round(subs.reduce((a, b) => a + b, 0) / subs.length)
  }

  const openForm = (student) => {
    const existing = mockResults.find(r => r.studentId === student.id && r.courseId === courseId)
    setForm({
      id:              existing?.id,
      studentId:       student.id,
      studentName:     student.name,
      courseId,
      courseName:      course?.name || '',
      assignmentMarks: existing?.assignmentMarks ?? getAssignmentAvg(student.id),
      quizMarks:       existing?.quizMarks       ?? getQuizAvg(student.id),
      examMarks:       existing?.examMarks !== undefined ? String(existing.examMarks) : '',
      examTotal:       existing?.examTotal ?? 100,
    })
    setModal(true)
  }

  const computeResult = (f) => {
    const asg      = parseFloat(f.assignmentMarks) || 0
    const quiz     = parseFloat(f.quizMarks)       || 0
    const exam     = parseFloat(f.examMarks)       || 0
    const examTot  = parseFloat(f.examTotal)       || 100
    const total    = asg + quiz + exam
    const grand    = 200 + examTot
    const pct      = grand > 0 ? Math.round(total / grand * 100) : 0
    return { total, grand, pct, grade: calcGrade(pct) }
  }

  const save = async () => {
    if (form.examMarks === '') return
    setSaving(true)
    const { total, grand, pct, grade } = computeResult(form)
    await addResult({
      ...form,
      examMarks:    parseFloat(form.examMarks),
      examTotal:    parseFloat(form.examTotal) || 100,
      totalMarks:   total,
      grandTotal:   grand,
      percentage:   pct,
      grade,
      instructorId: instructor?.id,
    })
    setSaving(false)
    setModal(false)
  }

  const downloadCSV = () => {
    const headers = ['Student','Course','Assignment (%)','Quiz (%)','Exam Marks','Exam Total','Total Marks','Grand Total','Percentage (%)','Grade']
    const rows    = courseResults.map(r => [
      r.studentName, r.courseName,
      r.assignmentMarks, r.quizMarks,
      r.examMarks, r.examTotal,
      r.totalMarks, r.grandTotal, r.percentage, r.grade,
    ])
    const csv = [headers, ...rows].map(row => row.map(c => `"${c ?? ''}"`).join(',')).join('\n')
    const a   = document.createElement('a')
    a.href    = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `results-${course?.name?.replace(/\s+/g, '-') || 'course'}.csv`
    a.click()
  }

  const preview = form.examMarks !== '' ? computeResult(form) : null

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SelectFilter label="Course" value={cid} onChange={setCid} options={courses.map(c => ({ value: String(c.id), label: c.name }))} placeholder="Select Course"/>
        {courseResults.length > 0 && (
          <button onClick={downloadCSV} className="btn-secondary text-xs"><Download className="w-3.5 h-3.5"/>Download CSV</button>
        )}
      </div>

      {!cid && (
        <Card className="text-center py-14 text-gray-400 text-sm">
          <Trophy className="w-10 h-10 mx-auto mb-3 text-gray-200"/>
          <p>Select a course to manage student results</p>
        </Card>
      )}

      {cid && (
        <Card>
          <SectionHeader title={`Students — ${course?.name || ''}`}/>
          {courseStudents.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">No students enrolled in this course</p>
          ) : (
            <div className="space-y-2">
              {courseStudents.map(s => {
                const res = courseResults.find(r => r.studentId === s.id)
                return (
                  <div key={s.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50/50 transition-colors">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{s.name}</p>
                      {res ? (
                        <div className="flex gap-3 mt-0.5">
                          <span className="text-[10px] text-gray-400">Asgn: {res.assignmentMarks}%</span>
                          <span className="text-[10px] text-gray-400">Quiz: {res.quizMarks}%</span>
                          <span className="text-[10px] text-gray-400">Exam: {res.examMarks}/{res.examTotal}</span>
                          <span className="text-[10px] font-semibold text-indigo-600">{res.percentage}% · {res.grade}</span>
                        </div>
                      ) : (
                        <p className="text-[10px] text-gray-400 mt-0.5">No result yet</p>
                      )}
                    </div>
                    <button onClick={() => openForm(s)} className="btn-primary text-xs py-1.5">
                      {res ? 'Edit Result' : 'Create Result'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      )}

      {courseResults.length > 0 && (
        <Card>
          <SectionHeader title="Results Summary"/>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Student','Assignment (%)','Quiz (%)','Exam','Total','Percentage','Grade'].map(h => (
                    <th key={h} className="text-left py-2.5 px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {courseResults.map(r => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-gray-900">{r.studentName}</td>
                    <td className="py-2.5 px-3 text-gray-700">{r.assignmentMarks}/100</td>
                    <td className="py-2.5 px-3 text-gray-700">{r.quizMarks}/100</td>
                    <td className="py-2.5 px-3 text-gray-700">{r.examMarks}/{r.examTotal}</td>
                    <td className="py-2.5 px-3 text-gray-700">{r.totalMarks}/{r.grandTotal}</td>
                    <td className="py-2.5 px-3"><Badge color={r.percentage >= 70 ? 'green' : r.percentage >= 50 ? 'amber' : 'red'}>{r.percentage}%</Badge></td>
                    <td className="py-2.5 px-3"><Badge color={gradeColor(r.grade)}>{r.grade}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={`${form.id ? 'Edit' : 'Create'} Result — ${form.studentName}`} wide>
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="label mb-2">Auto-computed from submissions · editable</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Assignment Marks (%)</label>
                <div className="flex items-center gap-2">
                  <input type="number" min="0" max="100" className="input flex-1"
                    value={form.assignmentMarks ?? ''} onChange={e => setForm({ ...form, assignmentMarks: e.target.value })}/>
                  <span className="text-xs text-gray-400 whitespace-nowrap">/ 100</span>
                </div>
              </div>
              <div>
                <label className="label">Quiz Marks (%)</label>
                <div className="flex items-center gap-2">
                  <input type="number" min="0" max="100" className="input flex-1"
                    value={form.quizMarks ?? ''} onChange={e => setForm({ ...form, quizMarks: e.target.value })}/>
                  <span className="text-xs text-gray-400 whitespace-nowrap">/ 100</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <label className="label">Exam Marks</label>
            <div className="flex items-center gap-2">
              <input type="number" min="0" max={form.examTotal} className="input flex-1"
                value={form.examMarks} onChange={e => setForm({ ...form, examMarks: e.target.value })} placeholder="Obtained marks"/>
              <span className="text-xs text-gray-500 whitespace-nowrap">out of</span>
              <input type="number" min="1" className="input w-24"
                value={form.examTotal} onChange={e => setForm({ ...form, examTotal: e.target.value })}/>
            </div>
          </div>
          {preview && (
            <div className="grid grid-cols-3 gap-3">
              <MiniStat label="Total" value={`${preview.total}/${preview.grand}`} color="blue"/>
              <MiniStat label="Percentage" value={`${preview.pct}%`} color={preview.pct >= 70 ? 'green' : preview.pct >= 50 ? 'amber' : 'red'}/>
              <MiniStat label="Grade" value={preview.grade} color={gradeColor(preview.grade)}/>
            </div>
          )}
          <button onClick={save} disabled={saving || form.examMarks === ''} className="btn-primary w-full disabled:opacity-60">
            {saving ? 'Saving…' : form.id ? 'Update Result' : 'Submit Result'}
          </button>
        </div>
      </Modal>
    </div>
  )
}

function InsReports() {
  const { user, pushNotif } = useAuth()
  const { mockReports, addReport } = useData()
  const [form, setForm] = useState({to:'affairs',type:'Student Progress',period:'',content:''})
  const [file, setFile] = useState(null)
  const [sent, setSent] = useState(false)
  const send = async () => {
    if(!form.content.trim()) return
    await addReport({from:user?.name,fromRole:'instructor',to:form.to==='affairs'?'Student Affairs Assistant':'Foundation Lead',type:form.type,period:form.period,content:form.content+(file?` [Attachment: ${file.name}]`:''),fileName:file?.name||null})
    await pushNotif(form.to, `Report from ${user?.name}: "${form.type}"`, 'report')
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
          <div><label className="label">Period</label><input className="input" value={form.period} onChange={e=>setForm({...form,period:e.target.value})} placeholder="e.g. July 2024"/></div>
          <div><label className="label">Content</label><textarea className="input" rows={4} value={form.content} onChange={e=>setForm({...form,content:e.target.value})} placeholder="Student performance summary…"/></div>
          <FileUploadBox onFile={setFile} label="Attach File (optional)" hint="Upload PDF, DOCX, or Excel report"/>
          {sent?<div className="p-2.5 bg-green-50 text-green-700 rounded-xl text-xs text-center font-medium">✓ Report sent!</div>:<button onClick={send} className="btn-primary w-full"><Send className="w-3.5 h-3.5"/>Send Report</button>}
        </div>
      </Card>
      <Card>
        <SectionHeader title="Sent Reports"/>
        {mine.length===0?<p className="text-xs text-gray-400 text-center py-8">No reports sent yet</p>:mine.map(r=>{
          const STATUS_COLOR = {received:'blue','under_review':'amber','in_progress':'indigo','awaiting_information':'orange',completed:'green',rejected:'red'}
          const STATUS_LABEL = {received:'Received','under_review':'Under Review','in_progress':'In Progress','awaiting_information':'Awaiting Info',completed:'Completed',rejected:'Rejected'}
          return (
            <div key={r.id} className="p-3 border border-gray-100 rounded-xl mb-2">
              <div className="flex justify-between items-start mb-1">
                <p className="text-xs font-semibold text-gray-900">{r.type}{r.period?` — ${r.period}`:''}</p>
                <Badge color={STATUS_COLOR[r.status]||'gray'}>{STATUS_LABEL[r.status]||r.status}</Badge>
              </div>
              <p className="text-[10px] text-gray-400">To: {r.to} · {r.sentAt}</p>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{r.content}</p>
              {r.feedback&&(
                <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-[10px] text-blue-500 font-semibold mb-0.5">Feedback from recipient</p>
                  <p className="text-xs text-blue-700">{r.feedback}</p>
                </div>
              )}
            </div>
          )
        })}
      </Card>
    </div>
  )
}
