import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, signUpNewUser } from '../utils/supabase'

// ── Normalizers: map Supabase snake_case rows to the camelCase shape the portals expect ──

const normStudent = s => ({
  id: s.id, authId: s.auth_id,
  name: s.name, email: s.email, phone: s.phone || '',
  avatar: s.avatar || (s.name || '').split(' ').map(w => w[0]).join('').slice(0, 2),
  admissionDate: s.admission_date || '', status: s.status || 'active',
  attendanceRate: s.attendance_rate || 0, gpa: parseFloat(s.gpa) || 0,
  courses: (s.enrollments || []).map(e => e.course_id),
})

const normInstructor = i => ({
  id: i.id, authId: i.auth_id,
  name: i.name, email: i.email, phone: i.phone || '',
  sub: i.sub || '', status: i.status || 'active',
  students: i.students || 0, joinDate: i.join_date || '',
  courses: [],
})

const normCourse = c => ({
  id: c.id, name: c.name,
  instructorId: c.instructor_id, instructor: c.instructor || '',
  progress: c.progress || 0, students: c.students || 0,
  nextClass: c.next_class || '', teamsLink: c.teams_link || '',
  classroomLink: c.classroom_link || '',
  youtubeLinks: (c.course_youtube_links || []).map(y => ({ id: y.id, title: y.title, url: y.url })),
  materials: (c.course_materials || []).map(m => ({ id: m.id, name: m.name, size: m.size || '', date: m.date || '' })),
  enrolledStudents: (c.enrollments || []).map(e => e.student_id),
})

const normAssignment = a => ({
  id: a.id, courseId: a.course_id, title: a.title,
  description: a.description || '',
  instructions: a.instructions || '',
  totalMarks: a.total_marks || a.max_grade || 100,
  maxGrade: a.max_grade || 100,
  dueDate: a.due_date || '',
  fileName: a.file_name || null,
  status: a.status || 'active',
  submissions: (a.assignment_submissions || []).map(s => ({
    studentId: s.student_id, studentName: s.student_name || '',
    file: s.file || '', text: s.text || '',
    submittedAt: s.submitted_at || '',
    grade: s.grade, feedback: s.feedback || '', status: s.status || 'submitted',
  })),
})

const normQuiz = q => ({
  id: q.id, courseId: q.course_id, title: q.title,
  assessmentType: q.assessment_type || 'quiz',
  duration: q.duration || 15, dueDate: q.due_date || '',
  totalMarks: q.total_marks || 100,
  passingMarks: q.passing_marks || 50,
  instructions: q.instructions || '',
  status: q.status || 'active',
  questions: (q.quiz_questions || []).sort((a, b) => (a.order_num || 0) - (b.order_num || 0)).map(qq => ({
    id: qq.id, text: qq.text,
    type: qq.question_type || 'mcq',
    options: qq.options || [], correct: qq.correct,
  })),
  submissions: (q.quiz_submissions || []).map(s => ({
    studentId: s.student_id, studentName: s.student_name || '',
    answers: s.answers || [], textAnswers: s.text_answers || {},
    score: s.score || 0, hasSubjective: s.has_subjective || false,
    submittedAt: s.submitted_at || '', overrideGrade: s.override_grade ?? null, feedback: s.feedback || '',
  })),
})

const normComplaint = c => ({
  id: c.id, fromId: c.from_id, from: c.from_name || '',
  fromRole: c.from_role || '', subject: c.subject, desc: c.description || '',
  assignedTo: c.assigned_to || '', priority: c.priority || 'medium',
  status: c.status || 'pending',
  date: c.created_at ? c.created_at.split('T')[0] : '',
  updates: (c.complaint_updates || []).map(u => ({ by: u.by, note: u.note, date: u.date || '' })),
})

const normSurvey = s => ({
  id: s.id, title: s.title, createdBy: s.created_by,
  deadline: s.deadline || '', status: s.status || 'active', sentTo: s.sent_to || 'students',
  questions: (s.survey_questions || []).sort((a, b) => (a.order_num || 0) - (b.order_num || 0)).map(q => ({ id: q.id, text: q.text })),
  sent: s.sent || 0,
  responses: (s.survey_responses || []).map(r => ({
    studentId: r.student_id, studentName: r.student_name || '',
    answers: r.answers || {}, comment: r.comment || '', submittedAt: r.submitted_at || '',
  })),
})

const normMeeting = m => ({
  id: m.id, title: m.title, createdBy: m.created_by || '',
  createdByRole: m.created_by_role || '', date: m.date || '',
  link: m.link || '', status: m.status || 'upcoming', platform: m.platform || 'teams',
  courseId: m.course_id,
  participants: (m.meeting_participants || []).map(p => p.name),
  participantRoles: (m.meeting_participants || []).map(p => p.role || ''),
})

const normTask = t => ({
  id: t.id, title: t.title, assignedTo: t.assigned_to || '',
  assignedToRole: t.assigned_to_role || '', dueDate: t.due_date || '',
  priority: t.priority || 'medium', status: t.status || 'pending', note: t.note || '',
  createdBy: t.created_by || '', createdByRole: t.created_by_role || '',
})

const normCertificate = c => ({
  id: c.id, studentId: c.student_id, studentName: c.student_name || '',
  courseId: c.course_id, courseName: c.course_name || '',
  issuedBy: c.issued_by || '', issuedAt: c.issued_at || '', grade: c.grade || '',
})

const normReport = r => ({
  id: r.id, from: r.from_name || '', fromRole: r.from_role || '',
  to: r.to_name || '', toRole: r.to_role || '',
  type: r.type || '', period: r.period || '',
  content: r.content || '', sentAt: r.sent_at || '', fileName: r.file_name || null,
  status: r.status || 'received',
  feedback: r.feedback || '',
})

const normMessage = m => ({
  id: m.id, fromRole: m.from_role || '', from: m.from_name || '',
  toRole: m.to_role || '', to: m.to_name || '', text: m.text,
  time: m.created_at ? m.created_at.slice(0, 16).replace('T', ' ') : '',
  read: m.read || false,
})

const normAdmission = a => ({
  id: a.id, name: a.name, email: a.email || '', phone: a.phone || '',
  appliedDate: a.applied_date || '', program: a.program || '',
  status: a.status || 'pending', interviewDate: a.interview_date || '',
  docs: a.docs || [], notes: a.notes || '',
})

const normAttendance = a => ({
  id: a.id, studentId: a.student_id, studentName: a.student_name || '',
  courseId: a.course_id, date: a.date || '', status: a.status || 'present',
})

const normResult = r => ({
  id: r.id,
  studentId: r.student_id, studentName: r.student_name || '',
  courseId: r.course_id, courseName: r.course_name || '',
  instructorId: r.instructor_id || null,
  assignmentMarks: parseFloat(r.assignment_marks) || 0,
  quizMarks:       parseFloat(r.quiz_marks)       || 0,
  examMarks:       parseFloat(r.exam_marks)       || 0,
  examTotal:       parseFloat(r.exam_total)       || 100,
  totalMarks:      parseFloat(r.total_marks)      || 0,
  grandTotal:      parseFloat(r.grand_total)      || 300,
  percentage:      parseFloat(r.percentage)       || 0,
  grade: r.grade || '',
  createdAt: r.created_at ? r.created_at.split('T')[0] : '',
})

// ── Context ──────────────────────────────────────────────────────────────────

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [mockStudents,    setMockStudents]    = useState([])
  const [mockInstructors, setMockInstructors] = useState([])
  const [mockCourses,     setMockCourses]     = useState([])
  const [mockAssignments, setMockAssignments] = useState([])
  const [mockQuizzes,     setMockQuizzes]     = useState([])
  const [mockComplaints,  setMockComplaints]  = useState([])
  const [mockSurveys,     setMockSurveys]     = useState([])
  const [mockMeetings,    setMockMeetings]    = useState([])
  const [mockTasks,       setMockTasks]       = useState([])
  const [mockCertificates,setMockCertificates]= useState([])
  const [mockReports,     setMockReports]     = useState([])
  const [mockMessages,    setMockMessages]    = useState([])
  const [mockAdmissions,  setMockAdmissions]  = useState([])
  const [mockAttendance,  setMockAttendance]  = useState([])
  const [mockResults,     setMockResults]     = useState([])
  const [dataLoading,     setDataLoading]     = useState(true)

  useEffect(() => {
    loadAll()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') loadAll()
    })
    return () => subscription.unsubscribe()
  }, [])

  async function loadAll() {
    setDataLoading(true)
    const [studRes, insRes, courseRes, asgRes, qzRes, cmpRes, svRes, mtRes,
           tskRes, certRes, rptRes, msgRes, admRes, attRes, resRes] = await Promise.all([
      supabase.from('students').select('*, enrollments(course_id)'),
      supabase.from('instructors').select('*'),
      supabase.from('courses').select('*, course_youtube_links(*), course_materials(*), enrollments(student_id)'),
      supabase.from('assignments').select('*, assignment_submissions(*)'),
      supabase.from('quizzes').select('*, quiz_questions(*), quiz_submissions(*)'),
      supabase.from('complaints').select('*, complaint_updates(*)'),
      supabase.from('surveys').select('*, survey_questions(*), survey_responses(*)'),
      supabase.from('meetings').select('*, meeting_participants(*)'),
      supabase.from('tasks').select('*'),
      supabase.from('certificates').select('*'),
      supabase.from('reports').select('*'),
      supabase.from('messages').select('*').order('created_at', { ascending: true }),
      supabase.from('admissions').select('*'),
      supabase.from('attendance').select('*'),
      supabase.from('results').select('*'),
    ])
    setMockStudents((studRes.data || []).map(normStudent))
    setMockInstructors((insRes.data || []).map(normInstructor))
    setMockCourses((courseRes.data || []).map(normCourse))
    setMockAssignments((asgRes.data || []).map(normAssignment))
    setMockQuizzes((qzRes.data || []).map(normQuiz))
    setMockComplaints((cmpRes.data || []).map(normComplaint))
    setMockSurveys((svRes.data || []).map(normSurvey))
    setMockMeetings((mtRes.data || []).map(normMeeting))
    setMockTasks((tskRes.data || []).map(normTask))
    setMockCertificates((certRes.data || []).map(normCertificate))
    setMockReports((rptRes.data || []).map(normReport))
    setMockMessages((msgRes.data || []).map(normMessage))
    setMockAdmissions((admRes.data || []).map(normAdmission))
    setMockAttendance((attRes.data || []).map(normAttendance))
    setMockResults((resRes.data || []).map(normResult))
    setDataLoading(false)
  }

  // ── Computed stats ────────────────────────────────────────────────────────
  function getStats() {
    const pendingGrading = mockAssignments.reduce((a, x) => a + x.submissions.filter(s => s.status === 'submitted').length, 0)
    const avgAtt = mockStudents.length ? Math.round(mockStudents.reduce((a, s) => a + s.attendanceRate, 0) / mockStudents.length) : 0
    const avgGpa = mockStudents.length ? (mockStudents.reduce((a, s) => a + (s.gpa || 0), 0) / mockStudents.length).toFixed(1) : '0.0'
    return {
      totalStudents:     mockStudents.length,
      atRisk:            mockStudents.filter(s => s.status === 'at-risk').length,
      activeStudents:    mockStudents.filter(s => s.status === 'active').length,
      totalInstructors:  mockInstructors.length,
      activeCourses:     mockCourses.length,
      pendingComplaints: mockComplaints.filter(c => c.status === 'pending').length,
      highComplaints:    mockComplaints.filter(c => c.priority === 'high').length,
      resolvedComplaints:mockComplaints.filter(c => c.status === 'resolved').length,
      pendingGrading,
      upcomingMeetings:  mockMeetings.filter(m => m.status === 'upcoming').length,
      avgAttendance:     avgAtt,
      totalCertificates: mockCertificates.length,
      activeSurveys:     mockSurveys.filter(s => s.status === 'active').length,
      pendingAdmissions: mockAdmissions.filter(a => a.status === 'pending').length,
      pendingTasks:      mockTasks.filter(t => t.status !== 'completed').length,
      totalAssignments:  mockAssignments.length,
      totalQuizzes:      mockQuizzes.length,
      avgGpa,
    }
  }

  // Attendance trend chart (last 6 data slices)
  const attendanceChart = (() => {
    const weeks = ['Wk 1','Wk 2','Wk 3','Wk 4','Wk 5','Wk 6']
    if (!mockAttendance.length) return weeks.map(w => ({ week: w, rate: 0 }))
    const sorted = [...mockAttendance].sort((a, b) => new Date(a.date) - new Date(b.date))
    const size = Math.ceil(sorted.length / 6)
    return weeks.map((w, i) => {
      const slice = sorted.slice(i * size, (i + 1) * size)
      const rate = slice.length ? Math.round(slice.filter(r => r.status === 'present').length / slice.length * 100) : 0
      return { week: w, rate }
    })
  })()

  // ── Mutations ─────────────────────────────────────────────────────────────

  async function addStudent(s) {
    const { data, error } = await supabase.from('students').insert({
      name: s.name, email: s.email, phone: s.phone || '',
      admission_date: s.admissionDate || new Date().toISOString().split('T')[0],
      status: 'active', attendance_rate: 0, gpa: 0,
    }).select('*, enrollments(course_id)').single()
    if (!error && data) setMockStudents(p => [...p, normStudent(data)])
  }

  async function updateStudent(id, data) {
    const row = {}
    if (data.name !== undefined)           row.name = data.name
    if (data.email !== undefined)          row.email = data.email
    if (data.phone !== undefined)          row.phone = data.phone
    if (data.status !== undefined)         row.status = data.status
    if (data.attendanceRate !== undefined) row.attendance_rate = data.attendanceRate
    if (data.gpa !== undefined)            row.gpa = data.gpa
    const { error } = await supabase.from('students').update(row).eq('id', id)
    if (!error) setMockStudents(p => p.map(s => s.id === id ? { ...s, ...data } : s))
  }

  async function deleteStudent(id) {
    const { error } = await supabase.from('students').delete().eq('id', id)
    if (!error) setMockStudents(p => p.filter(s => s.id !== id))
  }

  async function createStudentWithAuth(s) {
    try {
      const { userId, error: authErr } = await signUpNewUser(s.email, s.password)
      if (authErr) return { error: authErr }
      if (!userId) return { error: 'Could not create account. Email may already be registered.' }
      await supabase.from('profiles').insert({ id: userId, name: s.name, email: s.email, role: 'student', color: '#6366f1', sub: '' })
      const { data, error } = await supabase.from('students').insert({
        auth_id: userId, name: s.name, email: s.email, phone: s.phone || '',
        admission_date: s.admissionDate || new Date().toISOString().split('T')[0],
        status: 'active', attendance_rate: 0, gpa: 0,
      }).select('*, enrollments(course_id)').single()
      if (!error && data) setMockStudents(p => [...p, normStudent(data)])
      return { error: error?.message || null }
    } catch (e) {
      return { error: e.message || 'Unexpected error creating student.' }
    }
  }

  async function addInstructor(ins) {
    const { data, error } = await supabase.from('instructors').insert({
      name: ins.name, email: ins.email, phone: ins.phone || '',
      sub: ins.sub || '', status: 'active', students: 0,
    }).select('*').single()
    if (!error && data) setMockInstructors(p => [...p, normInstructor(data)])
  }

  async function updateInstructor(id, data) {
    const row = {}
    if (data.name !== undefined)   row.name = data.name
    if (data.email !== undefined)  row.email = data.email
    if (data.phone !== undefined)  row.phone = data.phone
    if (data.sub !== undefined)    row.sub = data.sub
    if (data.status !== undefined) row.status = data.status
    const { error } = await supabase.from('instructors').update(row).eq('id', id)
    if (!error) setMockInstructors(p => p.map(i => i.id === id ? { ...i, ...data } : i))
  }

  async function createInstructorWithAuth(ins) {
    try {
      const { userId, error: authErr } = await signUpNewUser(ins.email, ins.password)
      if (authErr) return { error: authErr }
      if (!userId) return { error: 'Could not create account. Email may already be registered.' }
      await supabase.from('profiles').insert({ id: userId, name: ins.name, email: ins.email, role: 'instructor', color: '#8b5cf6', sub: ins.sub || '' })
      const { data, error } = await supabase.from('instructors').insert({
        auth_id: userId, name: ins.name, email: ins.email, phone: ins.phone || '',
        sub: ins.sub || '', status: 'active', students: 0,
      }).select('*').single()
      if (!error && data) setMockInstructors(p => [...p, normInstructor(data)])
      return { error: error?.message || null }
    } catch (e) {
      return { error: e.message || 'Unexpected error creating instructor.' }
    }
  }

  async function addCourse(c) {
    const { data, error } = await supabase.from('courses').insert({
      name: c.name, instructor_id: c.instructorId, instructor: c.instructor || '',
      progress: 0, students: 0, next_class: c.nextClass || '',
      teams_link: c.teamsLink || '', classroom_link: c.classroomLink || '',
    }).select('*, course_youtube_links(*), course_materials(*), enrollments(student_id)').single()
    if (!error && data) setMockCourses(p => [...p, normCourse(data)])
  }

  async function updateCourse(id, data) {
    const row = {}
    if (data.name !== undefined)          row.name = data.name
    if (data.instructorId !== undefined)  row.instructor_id = data.instructorId
    if (data.instructor !== undefined)    row.instructor = data.instructor
    if (data.progress !== undefined)      row.progress = data.progress
    if (data.teamsLink !== undefined)     row.teams_link = data.teamsLink
    if (data.classroomLink !== undefined) row.classroom_link = data.classroomLink
    if (data.nextClass !== undefined)     row.next_class = data.nextClass
    const { error } = await supabase.from('courses').update(row).eq('id', id)
    if (!error) setMockCourses(p => p.map(c => c.id === id ? { ...c, ...data } : c))
  }

  async function deleteCourse(id) {
    const { error } = await supabase.from('courses').delete().eq('id', id)
    if (!error) setMockCourses(p => p.filter(c => c.id !== id))
  }

  async function deleteInstructor(id) {
    const { error } = await supabase.from('instructors').delete().eq('id', id)
    if (!error) setMockInstructors(p => p.filter(i => i.id !== id))
  }

  async function enrollStudent(studentId, courseId) {
    const { error } = await supabase.from('enrollments').insert({ student_id: studentId, course_id: courseId })
    if (!error) {
      setMockStudents(p => p.map(s => s.id === studentId ? { ...s, courses: [...s.courses, courseId] } : s))
      setMockCourses(p => p.map(c => c.id === courseId ? { ...c, enrolledStudents: [...c.enrolledStudents, studentId] } : c))
    }
  }

  async function unenrollStudent(studentId, courseId) {
    const { error } = await supabase.from('enrollments').delete().eq('student_id', studentId).eq('course_id', courseId)
    if (!error) {
      setMockStudents(p => p.map(s => s.id === studentId ? { ...s, courses: s.courses.filter(id => id !== courseId) } : s))
      setMockCourses(p => p.map(c => c.id === courseId ? { ...c, enrolledStudents: c.enrolledStudents.filter(id => id !== studentId) } : c))
    }
  }

  async function addAssignment(a) {
    const { data, error } = await supabase.from('assignments').insert({
      course_id: a.courseId, title: a.title,
      description: a.description || '',
      instructions: a.instructions || '',
      due_date: a.dueDate,
      max_grade: a.totalMarks || a.maxGrade || 100,
      total_marks: a.totalMarks || 100,
      file_name: a.fileName || null,
      status: 'active',
    }).select('*, assignment_submissions(*)').single()
    if (!error && data) setMockAssignments(p => [...p, normAssignment(data)])
  }

  async function submitAssignment(asgId, studentId, studentName, file, text = '') {
    const { data, error } = await supabase.from('assignment_submissions').upsert({
      assignment_id: asgId, student_id: studentId, student_name: studentName,
      file: file || '', text: text || '',
      submitted_at: new Date().toISOString().split('T')[0], status: 'submitted',
    }, { onConflict: 'assignment_id,student_id' }).select('*').single()
    if (!error && data) {
      setMockAssignments(p => p.map(a => {
        if (a.id !== asgId) return a
        const sub = { studentId, studentName, file: file || '', text: text || '', submittedAt: data.submitted_at, grade: null, feedback: '', status: 'submitted' }
        const idx = a.submissions.findIndex(s => s.studentId === studentId)
        const subs = [...a.submissions]
        if (idx >= 0) subs[idx] = sub; else subs.push(sub)
        return { ...a, submissions: subs }
      }))
    }
  }

  async function gradeAssignment(asgId, studentId, grade, feedback) {
    const { error } = await supabase.from('assignment_submissions')
      .update({ grade, feedback, status: 'graded' })
      .eq('assignment_id', asgId).eq('student_id', studentId)
    if (!error) setMockAssignments(p => p.map(a => {
      if (a.id !== asgId) return a
      return { ...a, submissions: a.submissions.map(s => s.studentId === studentId ? { ...s, grade, feedback, status: 'graded' } : s) }
    }))
  }

  async function addQuiz(q) {
    const { data, error } = await supabase.from('quizzes').insert({
      course_id: q.courseId, title: q.title,
      assessment_type: q.assessmentType || 'quiz',
      duration: q.duration || 15, due_date: q.dueDate,
      total_marks: q.totalMarks || 100,
      passing_marks: q.passingMarks || 50,
      instructions: q.instructions || '',
      status: 'active',
    }).select('*').single()
    if (!error && data) {
      if (q.questions?.length) {
        await supabase.from('quiz_questions').insert(
          q.questions.map((qq, i) => ({
            quiz_id: data.id, text: qq.text,
            question_type: qq.type || 'mcq',
            options: qq.options || [],
            correct: ['mcq','true_false'].includes(qq.type||'mcq') ? qq.correct : null,
            order_num: i,
          }))
        )
      }
      setMockQuizzes(p => [...p, normQuiz({
        ...data,
        quiz_questions: q.questions.map((qq, i) => ({ ...qq, question_type: qq.type || 'mcq', order_num: i })),
        quiz_submissions: [],
      })])
    }
  }

  async function submitQuiz(qzId, studentId, studentName, answers, textAnswers = {}) {
    const quiz = mockQuizzes.find(q => q.id === qzId)
    if (!quiz) return 0
    const autoQs = quiz.questions.filter(q => ['mcq','true_false'].includes(q.type || 'mcq'))
    const correct = answers.filter((a, i) => {
      const q = quiz.questions[i]
      return ['mcq','true_false'].includes(q?.type||'mcq') && a === q.correct
    }).length
    const score = autoQs.length > 0 ? Math.round(correct / autoQs.length * 100) : 0
    const hasSubjective = quiz.questions.some(q => !['mcq','true_false'].includes(q.type||'mcq'))
    const { data, error } = await supabase.from('quiz_submissions').upsert({
      quiz_id: qzId, student_id: studentId, student_name: studentName,
      answers, text_answers: textAnswers, score,
      has_subjective: hasSubjective,
      submitted_at: new Date().toISOString().split('T')[0],
    }, { onConflict: 'quiz_id,student_id' }).select('*').single()
    if (!error) {
      setMockQuizzes(p => p.map(q => {
        if (q.id !== qzId) return q
        const sub = { studentId, studentName, answers, textAnswers, score, hasSubjective, submittedAt: data?.submitted_at || '', overrideGrade: null, feedback: '' }
        const idx = q.submissions.findIndex(s => s.studentId === studentId)
        const subs = [...q.submissions]
        if (idx >= 0) subs[idx] = sub; else subs.push(sub)
        return { ...q, submissions: subs }
      }))
    }
    return score
  }

  async function overrideQuizGrade(qzId, studentId, grade, feedback) {
    const { error } = await supabase.from('quiz_submissions')
      .update({ override_grade: grade, feedback })
      .eq('quiz_id', qzId).eq('student_id', studentId)
    if (!error) setMockQuizzes(p => p.map(q => {
      if (q.id !== qzId) return q
      return { ...q, submissions: q.submissions.map(s => s.studentId === studentId ? { ...s, overrideGrade: grade, feedback } : s) }
    }))
  }

  async function addComplaint(c) {
    const { data, error } = await supabase.from('complaints').insert({
      from_id: c.fromId, from_name: c.from, from_role: c.fromRole,
      subject: c.subject, description: c.desc, assigned_to: c.assignedTo,
      priority: c.priority || 'medium', status: 'pending',
    }).select('*, complaint_updates(*)').single()
    if (!error && data) setMockComplaints(p => [...p, normComplaint(data)])
  }

  async function updateComplaint(id, status, note, by) {
    const { error } = await supabase.from('complaints')
      .update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) return
    if (note) await supabase.from('complaint_updates').insert({ complaint_id: id, by, note, date: new Date().toISOString().split('T')[0] })
    setMockComplaints(p => p.map(c => {
      if (c.id !== id) return c
      const updates = note ? [...c.updates, { by, note, date: new Date().toISOString().split('T')[0] }] : c.updates
      return { ...c, status, updates }
    }))
  }

  async function addSurvey(s) {
    const { data, error } = await supabase.from('surveys').insert({
      title: s.title, created_by: s.createdBy, deadline: s.deadline,
      status: 'active', sent_to: s.sentTo || 'students',
    }).select('*').single()
    if (!error && data) {
      const qs = s.questions || []
      if (qs.length) {
        await supabase.from('survey_questions').insert(
          qs.map((q, i) => ({ survey_id: data.id, text: q.text, order_num: i }))
        )
      }
      setMockSurveys(p => [...p, normSurvey({ ...data, survey_questions: qs, survey_responses: [] })])
    }
  }

  async function submitSurveyResponse(svId, studentId, studentName, answers, comment) {
    const { error } = await supabase.from('survey_responses').upsert({
      survey_id: svId, student_id: studentId, student_name: studentName,
      answers, comment, submitted_at: new Date().toISOString().split('T')[0],
    }, { onConflict: 'survey_id,student_id' })
    if (!error) {
      const resp = { studentId, studentName, answers, comment, submittedAt: new Date().toISOString().split('T')[0] }
      setMockSurveys(p => p.map(s => {
        if (s.id !== svId) return s
        const idx = s.responses.findIndex(r => r.studentId === studentId)
        const responses = [...s.responses]
        if (idx >= 0) responses[idx] = resp; else responses.push(resp)
        return { ...s, responses }
      }))
    }
  }

  async function addYoutubeLink(courseId, title, url) {
    const { data, error } = await supabase.from('course_youtube_links')
      .insert({ course_id: courseId, title, url })
      .select('*').single()
    if (!error && data) {
      setMockCourses(p => p.map(c => c.id === courseId
        ? { ...c, youtubeLinks: [...(c.youtubeLinks || []), { id: data.id, title: data.title, url: data.url }] }
        : c
      ))
    }
  }

  async function removeYoutubeLink(linkId, courseId) {
    const { error } = await supabase.from('course_youtube_links').delete().eq('id', linkId)
    if (!error) {
      setMockCourses(p => p.map(c => c.id === courseId
        ? { ...c, youtubeLinks: c.youtubeLinks.filter(l => l.id !== linkId) }
        : c
      ))
    }
  }

  async function addCourseMaterial(courseId, name, size) {
    const { data, error } = await supabase.from('course_materials')
      .insert({ course_id: courseId, name, size: size || '', date: new Date().toISOString().split('T')[0] })
      .select('*').single()
    if (!error && data) {
      setMockCourses(p => p.map(c => c.id === courseId
        ? { ...c, materials: [...(c.materials || []), { id: data.id, name: data.name, size: data.size, date: data.date }] }
        : c
      ))
    }
  }

  async function removeCourseMaterial(materialId, courseId) {
    const { error } = await supabase.from('course_materials').delete().eq('id', materialId)
    if (!error) {
      setMockCourses(p => p.map(c => c.id === courseId
        ? { ...c, materials: c.materials.filter(m => m.id !== materialId) }
        : c
      ))
    }
  }

  async function addLiveClass(lc) {
    const course = mockCourses.find(c => c.id === lc.courseId)
    const enrolledStudents = mockStudents.filter(s => course?.enrolledStudents?.includes(s.id))
    const { data, error } = await supabase.from('meetings').insert({
      title: lc.title, created_by: lc.createdBy, created_by_role: 'instructor',
      date: lc.date, link: lc.link || '', status: 'upcoming',
      platform: lc.platform || 'teams', course_id: lc.courseId,
    }).select('*').single()
    if (!error && data) {
      const participants = [
        { name: lc.createdBy, role: 'instructor' },
        ...enrolledStudents.map(s => ({ name: s.name, role: 'student' })),
      ]
      if (participants.length) {
        await supabase.from('meeting_participants').insert(
          participants.map(p => ({ meeting_id: data.id, name: p.name, role: p.role }))
        )
      }
      setMockMeetings(prev => [...prev, normMeeting({ ...data, meeting_participants: participants })])
    }
  }

  async function addMeeting(m) {
    const { data, error } = await supabase.from('meetings').insert({
      title: m.title, created_by: m.createdBy, created_by_role: m.createdByRole,
      date: m.date, link: m.link || '', status: 'upcoming',
      platform: m.platform || 'teams', course_id: m.courseId || null,
    }).select('*').single()
    if (!error && data) {
      const participants = m.participants || []
      const roles = m.participantRoles || []
      if (participants.length) {
        await supabase.from('meeting_participants').insert(
          participants.map((name, i) => ({ meeting_id: data.id, name, role: roles[i] || '' }))
        )
      }
      setMockMeetings(p => [...p, normMeeting({ ...data, meeting_participants: participants.map((name, i) => ({ name, role: roles[i] || '' })) })])
    }
  }

  async function updateMeeting(id, updates) {
    const row = {}
    if (updates.title    !== undefined) row.title    = updates.title
    if (updates.date     !== undefined) row.date     = updates.date
    if (updates.link     !== undefined) row.link     = updates.link
    if (updates.platform !== undefined) row.platform = updates.platform
    if (updates.status   !== undefined) row.status   = updates.status
    const { error } = await supabase.from('meetings').update(row).eq('id', id)
    if (!error) setMockMeetings(p => p.map(m => m.id === id ? { ...m, ...updates } : m))
  }

  async function deleteMeeting(id) {
    const { error } = await supabase.from('meetings').delete().eq('id', id)
    if (!error) setMockMeetings(p => p.filter(m => m.id !== id))
  }

  async function sendMessage(m) {
    const { data, error } = await supabase.from('messages').insert({
      from_id: m.fromId || null, from_role: m.fromRole, from_name: m.from,
      to_id: m.toId || null, to_role: m.toRole, to_name: m.to,
      text: m.text, read: false,
    }).select('*').single()
    if (!error && data) setMockMessages(p => [...p, normMessage(data)])
  }

  async function markAttendance(records) {
    for (const r of records) {
      const { error } = await supabase.from('attendance').upsert({
        student_id: r.studentId, student_name: r.studentName,
        course_id: r.courseId, date: r.date, status: r.status,
      }, { onConflict: 'student_id,course_id,date' })
      if (!error) {
        setMockAttendance(p => {
          const idx = p.findIndex(a => a.studentId === r.studentId && a.courseId === r.courseId && a.date === r.date)
          if (idx >= 0) { const n = [...p]; n[idx] = { ...n[idx], status: r.status }; return n }
          return [...p, { ...r, id: `${r.studentId}-${r.courseId}-${r.date}` }]
        })
      }
    }
  }

  async function notifyRole(role, text, type = 'info', module = null) {
    let userIds = []
    if (role === 'student') {
      const { data } = await supabase.from('students').select('auth_id').not('auth_id', 'is', null)
      userIds = (data || []).map(s => s.auth_id).filter(Boolean)
    } else if (role === 'instructor') {
      const { data } = await supabase.from('instructors').select('auth_id').not('auth_id', 'is', null)
      userIds = (data || []).map(i => i.auth_id).filter(Boolean)
    } else {
      const { data } = await supabase.from('profiles').select('id').eq('role', role)
      userIds = (data || []).map(p => p.id)
    }
    if (userIds.length) {
      await supabase.from('notifications').insert(
        userIds.map(uid => ({ user_id: uid, text, type, unread: true, ...(module && { module }) }))
      )
    }
  }

  async function addTask(t) {
    const { data, error } = await supabase.from('tasks').insert({
      title: t.title, assigned_to: t.assignedTo, assigned_to_role: t.assignedToRole,
      due_date: t.dueDate, priority: t.priority || 'medium', status: 'pending', note: t.note || '',
      created_by: t.createdBy || '', created_by_role: t.createdByRole || '',
    }).select('*').single()
    if (!error && data) setMockTasks(p => [...p, normTask(data)])
  }

  async function updateTask(id, status) {
    const task = mockTasks.find(t => t.id === id)
    const { error } = await supabase.from('tasks').update({ status }).eq('id', id)
    if (!error) {
      setMockTasks(p => p.map(t => t.id === id ? { ...t, status } : t))
      if (task?.createdByRole) {
        await notifyRole(task.createdByRole, `Task "${task.title}" was marked "${status}" by ${task.assignedTo}`, 'task')
      }
    }
  }

  async function issueCertificate(c) {
    const { data, error } = await supabase.from('certificates').insert({
      student_id: c.studentId, student_name: c.studentName,
      course_id: c.courseId, course_name: c.courseName,
      issued_by: c.issuedBy, grade: c.grade,
      issued_at: new Date().toISOString().split('T')[0],
    }).select('*').single()
    if (!error && data) setMockCertificates(p => [...p, normCertificate(data)])
  }

  async function addReport(r) {
    const { data, error } = await supabase.from('reports').insert({
      from_name: r.from, from_role: r.fromRole,
      to_name: r.to, to_role: r.toRole || '',
      type: r.type, period: r.period, content: r.content,
      file_name: r.fileName || null,
      status: 'received', feedback: '',
    }).select('*').single()
    if (!error && data) {
      setMockReports(p => [...p, normReport(data)])
      if (r.toRole) {
        await notifyRole(r.toRole, `New report from ${r.from}: "${r.type} — ${r.period}"`, 'report')
      }
    }
  }

  async function updateReport(id, { status, feedback }) {
    const updates = {}
    if (status   !== undefined) updates.status   = status
    if (feedback !== undefined) updates.feedback = feedback
    const { error } = await supabase.from('reports').update(updates).eq('id', id)
    if (!error) setMockReports(p => p.map(r => r.id === id ? { ...r, ...updates } : r))
  }

  async function addAdmission(a) {
    const { data, error } = await supabase.from('admissions').insert({
      name: a.name, email: a.email || '', phone: a.phone || '',
      program: a.program || '', applied_date: a.appliedDate || new Date().toISOString().split('T')[0],
      status: 'pending', docs: [],
    }).select('*').single()
    if (!error && data) setMockAdmissions(p => [...p, normAdmission(data)])
  }

  async function addResult(r) {
    const { data, error } = await supabase.from('results').upsert({
      student_id:       r.studentId,
      student_name:     r.studentName,
      course_id:        r.courseId,
      course_name:      r.courseName,
      instructor_id:    r.instructorId || null,
      assignment_marks: r.assignmentMarks || 0,
      quiz_marks:       r.quizMarks       || 0,
      exam_marks:       r.examMarks       || 0,
      exam_total:       r.examTotal       || 100,
      total_marks:      r.totalMarks      || 0,
      grand_total:      r.grandTotal      || 300,
      percentage:       r.percentage      || 0,
      grade:            r.grade           || '',
      updated_at:       new Date().toISOString(),
    }, { onConflict: 'student_id,course_id' }).select('*').single()
    if (!error && data) {
      const norm = normResult(data)
      setMockResults(p => {
        const idx = p.findIndex(x => x.studentId === r.studentId && x.courseId === r.courseId)
        if (idx >= 0) { const n = [...p]; n[idx] = norm; return n }
        return [...p, norm]
      })
    }
  }

  async function updateAdmission(id, data) {
    const row = {}
    if (data.status !== undefined)        row.status = data.status
    if (data.interviewDate !== undefined) row.interview_date = data.interviewDate
    if (data.notes !== undefined)         row.notes = data.notes
    if (data.docs !== undefined)          row.docs = data.docs
    const { error } = await supabase.from('admissions').update(row).eq('id', id)
    if (!error) {
      setMockAdmissions(p => p.map(a => a.id === id ? { ...a, ...data } : a))
      if (data.status === 'accepted') {
        const admission = mockAdmissions.find(a => a.id === id)
        if (admission && !mockStudents.find(s => s.email === admission.email)) {
          const { data: sd, error: se } = await supabase.from('students').insert({
            name: admission.name, email: admission.email, phone: admission.phone || '',
            admission_date: admission.appliedDate || new Date().toISOString().split('T')[0],
            status: 'active', attendance_rate: 0, gpa: 0,
          }).select('*, enrollments(course_id)').single()
          if (!se && sd) {
            const ns = normStudent(sd)
            const course = mockCourses.find(c => c.name === admission.program)
            if (course) {
              await supabase.from('enrollments').insert({ student_id: ns.id, course_id: course.id })
              ns.courses = [course.id]
              setMockCourses(p => p.map(c => c.id === course.id
                ? { ...c, enrolledStudents: [...c.enrolledStudents, ns.id] } : c))
            }
            setMockStudents(p => [...p, ns])
          }
        }
      }
    }
  }

  return (
    <DataContext.Provider value={{
      mockStudents, mockInstructors, mockCourses, mockAssignments, mockQuizzes,
      mockComplaints, mockSurveys, mockMeetings, mockTasks, mockCertificates,
      mockReports, mockMessages, mockAdmissions, mockAttendance,
      attendanceChart, getStats, dataLoading,
      addStudent, updateStudent, deleteStudent, createStudentWithAuth,
      addInstructor, updateInstructor, deleteInstructor, createInstructorWithAuth,
      addCourse, updateCourse, deleteCourse,
      enrollStudent, unenrollStudent,
      addAssignment, submitAssignment, gradeAssignment,
      addQuiz, submitQuiz, overrideQuizGrade,
      addComplaint, updateComplaint,
      addSurvey, submitSurveyResponse,
      addYoutubeLink, removeYoutubeLink, addCourseMaterial, removeCourseMaterial, addLiveClass,
      addMeeting, updateMeeting, deleteMeeting, sendMessage, markAttendance,
      addTask, updateTask,
      issueCertificate, addReport, updateReport,
      addAdmission, updateAdmission,
      mockResults, addResult,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)
