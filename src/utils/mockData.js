// ── NMA LMS — Single Source of Truth ──────────────────────────────────────

// ── USERS ─────────────────────────────────────────────────────────────────
export const USERS = {
  captain:         { id:1,  name:'Captain Turki',       role:'captain',         color:'#b45309', sub:null },
  principal:       { id:2,  name:'Principal',            role:'principal',       color:'#7c3aed', sub:null },
  foundation_lead: { id:3,  name:'Mohammad Abdullah',    role:'foundation_lead', color:'#1e40af', sub:null },
  affairs1:        { id:4,  name:'Abdullmhun',           role:'affairs',         color:'#0f766e', sub:'Student Affairs Assistant' },
  affairs2:        { id:5,  name:'Muflih',               role:'affairs',         color:'#0f766e', sub:'Trainee Affairs Specialist' },
  training_ops1:   { id:6,  name:'Asad',                 role:'training_ops',    color:'#b45309', sub:'Training Operations Manager' },
  training_ops2:   { id:7,  name:'Stuart',               role:'training_ops',    color:'#92400e', sub:'Training Operations Manager' },
  nida:            { id:8,  name:'Nida',                 role:'nida',            color:'#be185d', sub:'Student Services Coordinator' },
  academic1:       { id:9,  name:'Ali',                  role:'academic',        color:'#065f46', sub:'Academic Assistant' },
  academic2:       { id:10, name:'Mohammad (Academic)',  role:'academic',        color:'#065f46', sub:'Academic Administrator' },
  academic3:       { id:11, name:'Abdullah (Academic)',  role:'academic',        color:'#065f46', sub:'Academic Administrator' },
  academic4:       { id:12, name:'Abdulaziz',            role:'academic',        color:'#065f46', sub:'Quality Coordinator' },
  instructor1:     { id:13, name:'Essam',                role:'instructor',      color:'#4338ca', sub:'Support Instructor' },
  instructor2:     { id:14, name:'Mohammed Khery',       role:'instructor',      color:'#4338ca', sub:'Support Instructor' },
  instructor3:     { id:15, name:'Mohammed Soliman',     role:'instructor',      color:'#4338ca', sub:'Support Instructor' },
  instructor4:     { id:16, name:'English Instructor',   role:'instructor',      color:'#4338ca', sub:'English Instructor' },
  instructor5:     { id:17, name:'ESL Trainer',          role:'instructor',      color:'#4338ca', sub:'ESL Trainer' },
  student1:        { id:18, name:'Ahmed Al-Rashidi',     role:'student',         color:'#0369a1', gpa:3.7, attendanceRate:92, status:'active',   courses:[1,2,4] },
  student2:        { id:19, name:'Khalid Al-Mutairi',    role:'student',         color:'#0369a1', gpa:2.9, attendanceRate:78, status:'active',   courses:[1,2,4] },
  student3:        { id:20, name:'Omar Al-Harbi',        role:'student',         color:'#0369a1', gpa:2.1, attendanceRate:65, status:'at-risk',  courses:[1,3,4,5] },
}

export const ROLE_LABELS = {
  captain:'Captain / Owner', principal:'Principal', foundation_lead:'Foundation Lead',
  affairs:'Affairs', training_ops:'Training Operations Manager',
  nida:'Student Services Coordinator', academic:'Academic Team',
  instructor:'Instructor', student:'Student',
}

// Login map: email → user key
export const EMAIL_TO_USER = {
  'captain@nma.sa':    'captain',
  'principal@nma.sa':  'principal',
  'lead@nma.sa':       'foundation_lead',
  'affairs1@nma.sa':   'affairs1',
  'affairs2@nma.sa':   'affairs2',
  'asad@nma.sa':       'training_ops1',
  'stuart@nma.sa':     'training_ops2',
  'nida@nma.sa':       'nida',
  'ali@nma.sa':        'academic1',
  'moh.acad@nma.sa':   'academic2',
  'abd.acad@nma.sa':   'academic3',
  'quality@nma.sa':    'academic4',
  'essam@nma.sa':      'instructor1',
  'khery@nma.sa':      'instructor2',
  'soliman@nma.sa':    'instructor3',
  'english@nma.sa':    'instructor4',
  'esl@nma.sa':        'instructor5',
  'ahmed@nma.sa':      'student1',
  'khalid@nma.sa':     'student2',
  'omar@nma.sa':       'student3',
}

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────
let _nid = 300
const _notifs = {
  captain:         [{id:1,text:'Monthly report available from Foundation Lead',time:'1h ago',unread:true,type:'report'}],
  principal:       [{id:2,text:'Foundation Lead submitted Q3 report',time:'30m ago',unread:true,type:'report'},{id:3,text:'Task completed by Asad',time:'2h ago',unread:false,type:'task'}],
  foundation_lead: [{id:4,text:'New complaint: Lab equipment shortage',time:'10m ago',unread:true,type:'complaint'},{id:5,text:'Survey results: Q3 ready',time:'2h ago',unread:false,type:'survey'}],
  affairs:         [{id:6,text:'New student complaint from Ahmed',time:'5m ago',unread:true,type:'complaint'},{id:7,text:'Task assigned by Foundation Lead',time:'1h ago',unread:true,type:'task'}],
  training_ops:    [{id:8,text:'Task assigned by Principal',time:'20m ago',unread:true,type:'task'},{id:9,text:'Meeting scheduled by Principal',time:'1h ago',unread:true,type:'meeting'}],
  nida:            [{id:10,text:'New admission: Faisal Al-Dosari',time:'1h ago',unread:true,type:'admission'}],
  academic:        [{id:11,text:'Meeting scheduled by Training Ops',time:'2h ago',unread:true,type:'meeting'}],
  instructor:      [{id:12,text:'Ahmed Al-Rashidi submitted Assignment 1',time:'5m ago',unread:true,type:'assignment'},{id:13,text:'Meeting invite: Student Progress Review',time:'1h ago',unread:false,type:'meeting'}],
  student:         [{id:14,text:'Assignment 1 graded — Grade: A',time:'1h ago',unread:true,type:'grade'},{id:15,text:'New survey: Course Satisfaction Q3',time:'2h ago',unread:true,type:'survey'},{id:16,text:'Certificate issued: Maritime Navigation',time:'3h ago',unread:true,type:'certificate'}],
}

export const getNotifications = role => [...(_notifs[role]||[])]
export function addNotification(role, text, type='info') {
  if(!_notifs[role]) _notifs[role]=[]
  _notifs[role].unshift({id:++_nid, text, time:'Just now', unread:true, type})
}
export function markAllRead(role) { (_notifs[role]||[]).forEach(n=>n.unread=false) }
export function markOneRead(role, id) {
  const n = (_notifs[role]||[]).find(x=>x.id===id)
  if(n) n.unread = false
}

// ── STUDENTS ──────────────────────────────────────────────────────────────
let _stid = 30
export let mockStudents = [
  {id:18,name:'Ahmed Al-Rashidi',  email:'ahmed@nma.sa',  phone:'+966501',avatar:'AR',courses:[1,2,4],attendanceRate:92,gpa:3.7,status:'active',  admissionDate:'2024-01-15'},
  {id:19,name:'Khalid Al-Mutairi', email:'khalid@nma.sa', phone:'+966502',avatar:'KM',courses:[1,2,4],attendanceRate:78,gpa:2.9,status:'active',  admissionDate:'2024-01-20'},
  {id:20,name:'Omar Al-Harbi',     email:'omar@nma.sa',   phone:'+966503',avatar:'OH',courses:[1,3,4,5],attendanceRate:65,gpa:2.1,status:'at-risk',admissionDate:'2024-02-01'},
]
export function addStudent(s){mockStudents.push({...s,id:++_stid,status:'active',attendanceRate:0,gpa:0,courses:[]})}
export function updateStudent(id,data){const i=mockStudents.findIndex(s=>s.id===id);if(i>=0)mockStudents[i]={...mockStudents[i],...data}}
export function deleteStudent(id){mockStudents=mockStudents.filter(s=>s.id!==id)}

// ── INSTRUCTORS ───────────────────────────────────────────────────────────
let _inid = 20
export let mockInstructors = [
  {id:13,name:'Essam',            email:'essam@nma.sa',   phone:'+966511',sub:'Support Instructor',  courses:[1],students:42,status:'active',joinDate:'2023-09-01'},
  {id:14,name:'Mohammed Khery',   email:'khery@nma.sa',   phone:'+966512',sub:'Support Instructor',  courses:[2],students:38,status:'active',joinDate:'2023-09-01'},
  {id:15,name:'Mohammed Soliman', email:'soliman@nma.sa', phone:'+966513',sub:'Support Instructor',  courses:[3],students:31,status:'active',joinDate:'2023-10-01'},
  {id:16,name:'English Instructor',email:'english@nma.sa',phone:'+966514',sub:'English Instructor', courses:[4],students:55,status:'active',joinDate:'2023-09-15'},
  {id:17,name:'ESL Trainer',      email:'esl@nma.sa',     phone:'+966515',sub:'ESL Trainer',         courses:[5],students:44,status:'active',joinDate:'2024-01-01'},
]
export function addInstructor(ins){mockInstructors.push({...ins,id:++_inid,status:'active',courses:[],students:0})}
export function updateInstructor(id,data){const i=mockInstructors.findIndex(x=>x.id===id);if(i>=0)mockInstructors[i]={...mockInstructors[i],...data}}
export function deleteInstructor(id){mockInstructors=mockInstructors.filter(x=>x.id!==id)}

// ── COURSES ───────────────────────────────────────────────────────────────
let _cid = 10
export let mockCourses = [
  {id:1,name:'Maritime Navigation Fundamentals',instructorId:13,instructor:'Essam',          progress:65,students:42,nextClass:'Mon 09:00',teamsLink:'https://teams.microsoft.com/meet/nav',  classroomLink:'https://classroom.google.com/c/nav001',youtubeLinks:[{id:1,title:'Navigation Intro',url:'https://youtube.com/watch?v=dQw4w9WgXcQ'}],materials:[{id:1,name:'Chapter 1.pdf',size:'2.3MB',date:'2024-07-01'}],enrolledStudents:[18,19,20]},
  {id:2,name:'Marine Engineering Principles',    instructorId:14,instructor:'Mohammed Khery',progress:45,students:38,nextClass:'Mon 11:00',teamsLink:'https://teams.microsoft.com/meet/eng',  classroomLink:'',youtubeLinks:[],materials:[{id:2,name:'Engine Systems.pdf',size:'3.8MB',date:'2024-07-03'}],enrolledStudents:[18,19]},
  {id:3,name:'Port Operations & Management',     instructorId:15,instructor:'Mohammed Soliman',progress:80,students:31,nextClass:'Tue 09:00',teamsLink:'https://teams.microsoft.com/meet/port',classroomLink:'',youtubeLinks:[],materials:[],enrolledStudents:[20]},
  {id:4,name:'English for Maritime',             instructorId:16,instructor:'English Instructor',progress:55,students:55,nextClass:'Mon 14:00',teamsLink:'',classroomLink:'https://classroom.google.com/c/eng001',youtubeLinks:[],materials:[],enrolledStudents:[18,19,20]},
  {id:5,name:'ESL Foundation Program',           instructorId:17,instructor:'ESL Trainer',    progress:30,students:44,nextClass:'Wed 10:00',teamsLink:'',classroomLink:'https://classroom.google.com/c/esl001',youtubeLinks:[],materials:[],enrolledStudents:[18,20]},
]
export function addCourse(c){mockCourses.push({...c,id:++_cid,enrolledStudents:[],youtubeLinks:[],materials:[]})}
export function updateCourse(id,data){const i=mockCourses.findIndex(c=>c.id===id);if(i>=0)mockCourses[i]={...mockCourses[i],...data}}
export function deleteCourse(id){mockCourses=mockCourses.filter(c=>c.id!==id)}

// ── ASSIGNMENTS ───────────────────────────────────────────────────────────
let _asgId = 10
export let mockAssignments = [
  {id:1,courseId:1,title:'Navigation Chart Analysis',description:'Analyse nautical chart, identify 5 waypoints.',dueDate:'2024-07-20',maxGrade:100,status:'active',submissions:[
    {studentId:18,studentName:'Ahmed Al-Rashidi', file:'chart.pdf',  submittedAt:'2024-07-18',grade:88,feedback:'Good work',status:'graded'},
    {studentId:19,studentName:'Khalid Al-Mutairi',file:'khalid.pptx',submittedAt:'2024-07-19',grade:null,feedback:'',status:'submitted'},
  ]},
  {id:2,courseId:1,title:'Voyage Planning Report',description:'Full voyage plan Jeddah to Dubai.',dueDate:'2024-07-28',maxGrade:100,status:'active',submissions:[]},
  {id:3,courseId:2,title:'Engine Room Diagram',description:'Draw and label main engine room systems.',dueDate:'2024-07-22',maxGrade:50,status:'active',submissions:[
    {studentId:18,studentName:'Ahmed Al-Rashidi',file:'engine.png',submittedAt:'2024-07-21',grade:null,feedback:'',status:'submitted'},
  ]},
]
export function addAssignment(a){mockAssignments.push({...a,id:++_asgId,submissions:[]})}
export function submitAssignment(asgId,studentId,studentName,file){
  const a=mockAssignments.find(x=>x.id===asgId);if(!a)return
  const ei=a.submissions.findIndex(s=>s.studentId===studentId)
  const sub={studentId,studentName,file,submittedAt:new Date().toISOString().split('T')[0],grade:null,feedback:'',status:'submitted'}
  if(ei>=0)a.submissions[ei]=sub;else a.submissions.push(sub)
}
export function gradeAssignment(asgId,studentId,grade,feedback){
  const a=mockAssignments.find(x=>x.id===asgId);if(!a)return
  const sub=a.submissions.find(s=>s.studentId===studentId)
  if(sub){sub.grade=grade;sub.feedback=feedback;sub.status='graded'}
}

// ── QUIZZES ───────────────────────────────────────────────────────────────
let _qzId = 10
export let mockQuizzes = [
  {id:1,courseId:1,title:'Navigation Basics Quiz',duration:20,dueDate:'2024-07-21',status:'active',questions:[
    {id:1,text:'What does GPS stand for?',options:['Global Positioning System','General Position Satellite','Ground Proximity Sensor','Global Patrol System'],correct:0},
    {id:2,text:'Which instrument measures water depth?',options:['Barometer','Echo sounder','Gyrocompass','Anemometer'],correct:1},
    {id:3,text:'Unit of speed at sea?',options:['MPH','Km/h','Knots','Mach'],correct:2},
  ],submissions:[{studentId:18,studentName:'Ahmed Al-Rashidi',answers:[0,1,2],score:100,submittedAt:'2024-07-20',overrideGrade:null,feedback:''}]},
  {id:2,courseId:2,title:'Engine Systems Quiz',duration:15,dueDate:'2024-07-23',status:'active',questions:[
    {id:1,text:'What powers a diesel engine?',options:['Petrol','Diesel fuel','Natural gas','Steam'],correct:1},
    {id:2,text:'Bilge pump is used for?',options:['Fuel transfer','Removing water','Air circulation','Cooling'],correct:1},
  ],submissions:[]},
]
export function addQuiz(q){mockQuizzes.push({...q,id:++_qzId,submissions:[]})}
export function submitQuiz(qzId,studentId,studentName,answers){
  const q=mockQuizzes.find(x=>x.id===qzId);if(!q)return 0
  const score=Math.round(answers.reduce((acc,a,i)=>acc+(a===q.questions[i]?.correct?1:0),0)/q.questions.length*100)
  const ei=q.submissions.findIndex(s=>s.studentId===studentId)
  const sub={studentId,studentName,answers,score,submittedAt:new Date().toISOString().split('T')[0],overrideGrade:null,feedback:''}
  if(ei>=0)q.submissions[ei]=sub;else q.submissions.push(sub)
  return score
}
export function overrideQuizGrade(qzId,studentId,grade,feedback){
  const q=mockQuizzes.find(x=>x.id===qzId);if(!q)return
  const sub=q.submissions.find(s=>s.studentId===studentId)
  if(sub){sub.overrideGrade=grade;sub.feedback=feedback}
}

// ── COMPLAINTS ────────────────────────────────────────────────────────────
let _cmpId = 10
export let mockComplaints = [
  {id:1,fromId:18,from:'Ahmed Al-Rashidi', fromRole:'student',   subject:'Course material not accessible',desc:'Cannot download Chapter 2.',      assignedTo:'Student Affairs Assistant', priority:'medium',status:'in-review',date:'2024-07-10',updates:[{by:'Abdullmhun',note:'Looking into it.',date:'2024-07-11'}]},
  {id:2,fromId:13,from:'Essam',            fromRole:'instructor',subject:'Lab equipment shortage',         desc:'Navigation lab missing GPS units.',assignedTo:'Trainee Affairs Specialist', priority:'high',  status:'pending',  date:'2024-07-08',updates:[]},
  {id:3,fromId:19,from:'Khalid Al-Mutairi',fromRole:'student',   subject:'Schedule conflict Week 4',       desc:'Two classes overlap Mon 11:00.',   assignedTo:'Student Affairs Assistant', priority:'low',   status:'pending',  date:'2024-07-11',updates:[]},
  {id:4,fromId:14,from:'Mohammed Khery',   fromRole:'instructor',subject:'Attendance system error',        desc:'Attendance not saving for Course 2.',assignedTo:'Trainee Affairs Specialist',priority:'high', status:'resolved', date:'2024-07-09',updates:[{by:'Muflih',note:'System bug fixed.',date:'2024-07-10'}]},
]
export function addComplaint(c){mockComplaints.push({...c,id:++_cmpId,updates:[]})}
export function updateComplaint(id,status,note,by){
  const c=mockComplaints.find(x=>x.id===id);if(!c)return
  c.status=status
  if(note)c.updates.push({by,note,date:new Date().toISOString().split('T')[0]})
}

// ── SURVEYS ───────────────────────────────────────────────────────────────
let _svId = 10
export let mockSurveys = [
  {id:1,title:'Course Satisfaction Q3 2024',createdBy:'Abdullmhun',deadline:'2024-07-20',status:'active',sentTo:'students',questions:[{id:1,text:'Rate course content quality.'},{id:2,text:'Rate instructor communication.'},{id:3,text:'Rate teaching materials.'}],sent:42,responses:[{studentId:18,studentName:'Ahmed',answers:{1:4,2:5,3:4},comment:'Great course!',submittedAt:'2024-07-15'}]},
  {id:2,title:'Instructor Feedback Survey',  createdBy:'Muflih',     deadline:'2024-07-25',status:'active',sentTo:'students',questions:[{id:1,text:'Rate your instructor overall.'}],sent:42,responses:[]},
]
export function addSurvey(s){mockSurveys.push({...s,id:++_svId,responses:[]})}
export function submitSurveyResponse(svId,studentId,studentName,answers,comment){
  const s=mockSurveys.find(x=>x.id===svId);if(!s)return
  const ei=s.responses.findIndex(r=>r.studentId===studentId)
  const resp={studentId,studentName,answers,comment,submittedAt:new Date().toISOString().split('T')[0]}
  if(ei>=0)s.responses[ei]=resp;else s.responses.push(resp)
}

// ── MEETINGS ──────────────────────────────────────────────────────────────
let _mId = 10
export let mockMeetings = [
  {id:1,title:'Weekly Foundation Sync',     createdBy:'Mohammad Abdullah',createdByRole:'foundation_lead',date:'2024-07-15 10:00',participants:['Mohammad Abdullah','Abdullmhun','Muflih'],      participantRoles:['foundation_lead','affairs','affairs'],  link:'https://teams.microsoft.com/meet/weekly', status:'upcoming',platform:'teams'},
  {id:2,title:'Student Progress Review',    createdBy:'Mohammad Abdullah',createdByRole:'foundation_lead',date:'2024-07-17 14:00',participants:['Mohammad Abdullah','Essam'],                    participantRoles:['foundation_lead','instructor'],          link:'https://teams.microsoft.com/meet/progress',status:'upcoming',platform:'teams'},
  {id:3,title:'Q2 Performance Debrief',     createdBy:'Mohammad Abdullah',createdByRole:'foundation_lead',date:'2024-07-05 10:00',participants:['Captain Turki','Mohammad Abdullah'],            participantRoles:['captain','foundation_lead'],             link:'https://teams.microsoft.com/meet/q2',     status:'completed',platform:'teams'},
  {id:4,title:'Navigation Live Class',      createdBy:'Essam',            createdByRole:'instructor',     date:'2024-07-14 09:00',participants:['Essam','Students - Nav'],                       participantRoles:['instructor','student'],                  link:'https://teams.microsoft.com/meet/nav-live',status:'upcoming',platform:'teams',courseId:1},
]
export function addMeeting(m){mockMeetings.push({...m,id:++_mId})}

// ── MESSAGES ──────────────────────────────────────────────────────────────
let _msgId = 10
export let mockMessages = [
  {id:1,fromRole:'principal',    from:'Principal',        toRole:'foundation_lead',to:'Mohammad Abdullah',text:'Please send the Q3 student performance report by Friday.',time:'2024-07-12 09:00',read:false},
  {id:2,fromRole:'foundation_lead',from:'Mohammad Abdullah',toRole:'principal',   to:'Principal',         text:'Understood. Will prepare by Thursday EOD.',              time:'2024-07-12 09:30',read:true},
  {id:3,fromRole:'principal',    from:'Principal',        toRole:'captain',        to:'Captain Turki',     text:'Academy operations running smoothly this quarter.',       time:'2024-07-11 14:00',read:true},
]
export function sendMessage(m){mockMessages.push({...m,id:++_msgId,time:new Date().toISOString().slice(0,16).replace('T',' '),read:false})}

// ── ATTENDANCE ────────────────────────────────────────────────────────────
let _attId = 30
export let mockAttendance = [
  {id:1, studentId:18,studentName:'Ahmed Al-Rashidi', courseId:1,date:'2024-07-08',status:'present'},
  {id:2, studentId:19,studentName:'Khalid Al-Mutairi',courseId:1,date:'2024-07-08',status:'present'},
  {id:3, studentId:20,studentName:'Omar Al-Harbi',    courseId:1,date:'2024-07-08',status:'absent'},
  {id:4, studentId:18,studentName:'Ahmed Al-Rashidi', courseId:1,date:'2024-07-09',status:'present'},
  {id:5, studentId:19,studentName:'Khalid Al-Mutairi',courseId:1,date:'2024-07-09',status:'late'},
  {id:6, studentId:20,studentName:'Omar Al-Harbi',    courseId:1,date:'2024-07-09',status:'absent'},
  {id:7, studentId:18,studentName:'Ahmed Al-Rashidi', courseId:2,date:'2024-07-08',status:'present'},
  {id:8, studentId:19,studentName:'Khalid Al-Mutairi',courseId:2,date:'2024-07-08',status:'absent'},
  {id:9, studentId:18,studentName:'Ahmed Al-Rashidi', courseId:4,date:'2024-07-08',status:'present'},
  {id:10,studentId:19,studentName:'Khalid Al-Mutairi',courseId:4,date:'2024-07-08',status:'present'},
  {id:11,studentId:20,studentName:'Omar Al-Harbi',    courseId:4,date:'2024-07-08',status:'late'},
]
export function markAttendance(records){
  for(const r of records){
    const ex=mockAttendance.findIndex(a=>a.studentId===r.studentId&&a.courseId===r.courseId&&a.date===r.date)
    if(ex>=0)mockAttendance[ex].status=r.status
    else mockAttendance.push({...r,id:++_attId})
  }
}

// ── TASKS ─────────────────────────────────────────────────────────────────
let _tskId = 10
export let mockTasks = [
  {id:1,title:'Send Q3 student progress reports', assignedTo:'Abdullmhun',assignedToRole:'affairs',       dueDate:'2024-07-20',priority:'high',  status:'pending',    note:'Include at-risk students.'},
  {id:2,title:'Compile trainee attendance data',   assignedTo:'Muflih',    assignedToRole:'affairs',       dueDate:'2024-07-18',priority:'medium',status:'in-progress',note:'Focus on July.'},
  {id:3,title:'Coordinate academic schedule',      assignedTo:'Asad',      assignedToRole:'training_ops',  dueDate:'2024-07-22',priority:'high',  status:'pending',    note:'For next semester.'},
  {id:4,title:'Prepare quality assurance report',  assignedTo:'Abdulaziz', assignedToRole:'academic',      dueDate:'2024-07-25',priority:'medium',status:'pending',    note:''},
  {id:5,title:'Update student admission records',  assignedTo:'Nida',      assignedToRole:'nida',          dueDate:'2024-07-19',priority:'low',   status:'completed',  note:''},
]
export function addTask(t){mockTasks.push({...t,id:++_tskId})}
export function updateTask(id,status){const t=mockTasks.find(x=>x.id===id);if(t)t.status=status}

// ── CERTIFICATES ──────────────────────────────────────────────────────────
let _certId = 10
export let mockCertificates = [
  {id:1,studentId:18,studentName:'Ahmed Al-Rashidi',courseId:3,courseName:'Port Operations & Management',issuedBy:'Mohammad Abdullah',issuedAt:'2024-07-01',grade:'A'},
]
export function issueCertificate(c){mockCertificates.push({...c,id:++_certId,issuedAt:new Date().toISOString().split('T')[0]})}

// ── REPORTS ───────────────────────────────────────────────────────────────
let _rId = 10
export let mockReports = [
  {id:1,from:'Abdullmhun',     fromRole:'affairs',         to:'Foundation Lead',type:'Complaint Summary',  period:'July 2024',content:'Total: 5. Pending:3, Resolved:1, In Review:1.',sentAt:'2024-07-12',fileName:null},
  {id:2,from:'Essam',          fromRole:'instructor',       to:'Affairs',        type:'Student Progress',   period:'July 2024',content:'Ahmed: A-, Khalid: B+, Omar: C (at-risk).',    sentAt:'2024-07-11',fileName:null},
  {id:3,from:'Mohammad Abdullah',fromRole:'foundation_lead',to:'Principal',      type:'Foundation Summary', period:'July 2024',content:'5 courses active. 3 at-risk students.',         sentAt:'2024-07-10',fileName:null},
]
export function addReport(r){mockReports.push({...r,id:++_rId,sentAt:new Date().toISOString().split('T')[0]})}

// ── ADMISSIONS ────────────────────────────────────────────────────────────
let _admId = 10
export let mockAdmissions = [
  {id:1,name:'Faisal Al-Dosari', email:'faisal@mail.com',phone:'+966511',appliedDate:'2024-07-01',program:'Maritime Navigation',status:'interview',interviewDate:'2024-07-20',docs:['ID','Certificate'],notes:'Strong candidate'},
  {id:2,name:'Turki Al-Ghamdi',  email:'turki@mail.com', phone:'+966522',appliedDate:'2024-07-03',program:'Marine Engineering', status:'pending',  interviewDate:'',           docs:['ID'],              notes:''},
  {id:3,name:'Saleh Al-Zahrani', email:'saleh@mail.com', phone:'+966533',appliedDate:'2024-07-05',program:'Port Operations',    status:'accepted', interviewDate:'2024-07-12', docs:['ID','Medical'],    notes:'Admitted. Orientation: July 25'},
]
export function addAdmission(a){mockAdmissions.push({...a,id:++_admId,status:'pending',docs:[]})}
export function updateAdmission(id,data){const i=mockAdmissions.findIndex(a=>a.id===id);if(i>=0)mockAdmissions[i]={...mockAdmissions[i],...data}}

// ── STATS ─────────────────────────────────────────────────────────────────
export function getStats(){
  const pendingGrading = mockAssignments.reduce((a,asg)=>a+asg.submissions.filter(s=>s.status==='submitted').length,0)
  return {
    totalStudents:    mockStudents.length,
    atRisk:           mockStudents.filter(s=>s.status==='at-risk').length,
    activeStudents:   mockStudents.filter(s=>s.status==='active').length,
    totalInstructors: mockInstructors.length,
    activeCourses:    mockCourses.length,
    pendingComplaints:mockComplaints.filter(c=>c.status==='pending').length,
    highComplaints:   mockComplaints.filter(c=>c.priority==='high').length,
    resolvedComplaints:mockComplaints.filter(c=>c.status==='resolved').length,
    pendingGrading,
    upcomingMeetings: mockMeetings.filter(m=>m.status==='upcoming').length,
    avgAttendance:    Math.round(mockStudents.reduce((a,s)=>a+s.attendanceRate,0)/mockStudents.length),
    totalCertificates:mockCertificates.length,
    activeSurveys:    mockSurveys.filter(s=>s.status==='active').length,
    pendingAdmissions:mockAdmissions.filter(a=>a.status==='pending').length,
    pendingTasks:     mockTasks.filter(t=>t.status!=='completed').length,
    totalAssignments: mockAssignments.length,
    totalQuizzes:     mockQuizzes.length,
    avgGpa:           (mockStudents.reduce((a,s)=>a+s.gpa,0)/mockStudents.length).toFixed(1),
  }
}

export const attendanceChart = [
  {week:'Wk 1',rate:95},{week:'Wk 2',rate:91},{week:'Wk 3',rate:87},
  {week:'Wk 4',rate:83},{week:'Wk 5',rate:89},{week:'Wk 6',rate:87},
]
