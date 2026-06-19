import { useState } from 'react'
import clsx from 'clsx'
import { Download, X, Upload, FileText, Check } from 'lucide-react'

// ── StatCard — always clickable, shows drill-down ─────────────────────────
export function StatCard({ label, value, icon: Icon, color = 'blue', sub, onClick, clickLabel, highlight }) {
  const bg  = { blue:'bg-blue-50', green:'bg-green-50', amber:'bg-amber-50', red:'bg-red-50', purple:'bg-purple-50', teal:'bg-teal-50', indigo:'bg-indigo-50', sky:'bg-sky-50', pink:'bg-pink-50', orange:'bg-orange-50', gray:'bg-gray-50' }
  const txt = { blue:'text-blue-600',green:'text-green-600',amber:'text-amber-600',red:'text-red-600',purple:'text-purple-600',teal:'text-teal-600',indigo:'text-indigo-600',sky:'text-sky-600',pink:'text-pink-600',orange:'text-orange-600',gray:'text-gray-600' }
  const brd = { blue:'border-blue-200',green:'border-green-200',amber:'border-amber-200',red:'border-red-200',purple:'border-purple-200',teal:'border-teal-200',indigo:'border-indigo-200',sky:'border-sky-200',pink:'border-pink-200',orange:'border-orange-200',gray:'border-gray-200' }
  return (
    <div onClick={onClick} className={clsx(
      'bg-white rounded-2xl border p-4 shadow-sm transition-all select-none',
      brd[color], onClick && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97]',
      highlight && 'ring-2 ring-offset-1 ring-blue-400'
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
          {sub && <p className="text-[10px] text-gray-400 mt-1">{sub}</p>}
          {onClick && <p className="text-[10px] text-blue-500 font-medium mt-1.5">↗ {clickLabel || 'Click to view'}</p>}
        </div>
        {Icon && (
          <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', bg[color])}>
            <Icon className={clsx('w-4.5 h-4.5', txt[color])} style={{width:18,height:18}}/>
          </div>
        )}
      </div>
    </div>
  )
}

export function MiniStat({ label, value, color = 'gray' }) {
  const c = { gray:'text-gray-700 bg-gray-50', blue:'text-blue-700 bg-blue-50', red:'text-red-700 bg-red-50', green:'text-green-700 bg-green-50', amber:'text-amber-700 bg-amber-50', purple:'text-purple-700 bg-purple-50', teal:'text-teal-700 bg-teal-50' }
  return (
    <div className={clsx('rounded-xl px-3 py-2 text-center flex-1', c[color])}>
      <p className="font-bold text-lg leading-none">{value}</p>
      <p className="text-[10px] mt-1 font-medium">{label}</p>
    </div>
  )
}

export function Badge({ children, color = 'gray' }) {
  const map = { green:'bg-green-100 text-green-700', red:'bg-red-100 text-red-700', amber:'bg-amber-100 text-amber-700', blue:'bg-blue-100 text-blue-700', gray:'bg-gray-100 text-gray-600', teal:'bg-teal-100 text-teal-700', purple:'bg-purple-100 text-purple-700', indigo:'bg-indigo-100 text-indigo-700', sky:'bg-sky-100 text-sky-700', orange:'bg-orange-100 text-orange-700', pink:'bg-pink-100 text-pink-700' }
  return <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap', map[color] || map.gray)}>{children}</span>
}

export function StatusBadge({ status }) {
  const map = {
    pending:     { color:'amber',  label:'Pending' },
    'in-review': { color:'blue',   label:'In Review' },
    resolved:    { color:'green',  label:'Resolved' },
    active:      { color:'green',  label:'Active' },
    'at-risk':   { color:'red',    label:'At Risk' },
    closed:      { color:'gray',   label:'Closed' },
    upcoming:    { color:'blue',   label:'Upcoming' },
    completed:   { color:'green',  label:'Completed' },
    submitted:   { color:'amber',  label:'Submitted' },
    graded:      { color:'green',  label:'Graded' },
    'in-progress':{ color:'blue',  label:'In Progress' },
    late:        { color:'orange', label:'Late' },
    absent:      { color:'red',    label:'Absent' },
    present:     { color:'green',  label:'Present' },
    interview:   { color:'purple', label:'Interview' },
    accepted:    { color:'green',  label:'Accepted' },
    rejected:    { color:'red',    label:'Rejected' },
  }
  const { color, label } = map[status] || { color:'gray', label: status }
  return <Badge color={color}>{label}</Badge>
}

export function Table({ columns, data, emptyMsg = 'No records found.' }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {columns.map(col => (
              <th key={col.key} className="text-left py-2.5 px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0
            ? <tr><td colSpan={columns.length} className="py-10 text-center text-sm text-gray-400">{emptyMsg}</td></tr>
            : data.map((row, i) => (
              <tr key={row.id ?? i} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                {columns.map(col => (
                  <td key={col.key} className="py-2.5 px-3 text-gray-700">
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  )
}

export function Modal({ open, onClose, title, children, wide, fullscreen }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className={clsx('bg-white rounded-2xl shadow-2xl w-full animate-slideUp max-h-[90vh] overflow-y-auto', fullscreen ? 'max-w-4xl' : wide ? 'max-w-2xl' : 'max-w-lg')}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
          <h2 className="font-bold text-gray-900 text-sm">{title}</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4"/>
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  )
}

export function ProgressBar({ value, color = 'blue', size = 'sm' }) {
  const colors = { blue:'bg-blue-500', green:'bg-green-500', amber:'bg-amber-500', red:'bg-red-500', teal:'bg-teal-500', indigo:'bg-indigo-500', sky:'bg-sky-500', purple:'bg-purple-500', pink:'bg-pink-500', emerald:'bg-emerald-500' }
  return (
    <div className={clsx('w-full bg-gray-100 rounded-full overflow-hidden', size === 'lg' ? 'h-2' : 'h-1.5')}>
      <div className={clsx('h-full rounded-full transition-all duration-300', colors[color] || 'bg-blue-500')} style={{ width: `${Math.min(100, Math.max(0, value || 0))}%` }}/>
    </div>
  )
}

export function SectionHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-bold text-gray-900 text-sm">{title}</h2>
      {action}
    </div>
  )
}

export function SelectFilter({ label, value, onChange, options, placeholder = 'All' }) {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">{label}</span>}
      <select value={value} onChange={e => onChange(e.target.value)} className="input text-xs py-1.5 min-w-36">
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
    </div>
  )
}

export function FileUploadBox({ onFile, accept = '*', label = 'Attach File', required = false }) {
  const [file, setFile] = useState(null)
  const id = Math.random().toString(36).slice(2)
  const handle = e => { const f = e.target.files[0]; if (!f) return; setFile(f); onFile?.(f) }
  return (
    <div>
      {label && <p className="label">{label}{required && <span className="text-red-500 ml-1">*</span>}</p>}
      <label htmlFor={id} className="flex items-center gap-3 p-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-colors">
        <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', file ? 'bg-green-100' : 'bg-gray-100')}>
          {file ? <Check className="w-4 h-4 text-green-600"/> : <Upload className="w-4 h-4 text-gray-400"/>}
        </div>
        <div className="min-w-0">
          {file
            ? <p className="text-xs font-semibold text-green-700 truncate">{file.name}</p>
            : <><p className="text-xs font-medium text-gray-600">Click to upload file</p>
               <p className="text-[10px] text-gray-400">PDF, DOCX, PPTX, PNG, JPG</p></>
          }
        </div>
        <input id={id} type="file" className="hidden" accept={accept} onChange={handle}/>
      </label>
    </div>
  )
}

export function Card({ children, className, ...props }) {
  return <div {...props} className={clsx('bg-white rounded-2xl border border-gray-100 p-4 shadow-sm', className)}>{children}</div>
}

export function CertificatePDF({ cert, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full animate-slideUp" onClick={e => e.stopPropagation()}>
        <div className="relative p-10 text-center border-8 border-double border-[#1e3a6e] m-4 rounded-xl bg-gradient-to-br from-white to-blue-50">
          <div className="absolute top-3 left-3 text-3xl opacity-10">⚓</div>
          <div className="absolute top-3 right-3 text-3xl opacity-10">⚓</div>
          <p className="text-xs font-bold text-[#1e3a6e] uppercase tracking-widest mb-1">National Maritime Academy</p>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-6">Certificate of Completion</p>
          <p className="text-sm text-gray-500 mb-1">This certifies that</p>
          <h1 className="font-bold text-3xl text-[#1e3a6e] mb-1">{cert.studentName}</h1>
          <p className="text-sm text-gray-500 mb-1">has successfully completed</p>
          <h2 className="font-semibold text-xl text-gray-800 mb-6">"{cert.courseName}"</h2>
          <div className="flex items-center justify-center gap-6 text-sm">
            <div><p className="font-bold text-gray-700">{cert.grade}</p><p className="text-gray-400 text-[10px]">Grade</p></div>
            <div className="w-px h-8 bg-gray-200"/>
            <div><p className="font-bold text-gray-700">{cert.issuedAt}</p><p className="text-gray-400 text-[10px]">Date</p></div>
            <div className="w-px h-8 bg-gray-200"/>
            <div><p className="font-bold text-gray-700">{cert.issuedBy}</p><p className="text-gray-400 text-[10px]">Issued By</p></div>
          </div>
          <div className="mt-6 pt-3 border-t border-gray-200">
            <p className="text-[10px] text-gray-300">NMA-CERT-{String(cert.id).padStart(4,'0')} · Verified</p>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-5">
          <button className="flex-1 py-2.5 bg-[#1e3a6e] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#16305a]" onClick={() => window.print()}>
            <Download className="w-4 h-4"/>Download
          </button>
          <button className="px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      {Icon && <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-3"><Icon className="w-6 h-6 text-gray-300"/></div>}
      <h3 className="font-semibold text-gray-600 text-sm mb-1">{title}</h3>
      {description && <p className="text-xs text-gray-400 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
