import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAssignmentDetail, submitAssignment, getAssignmentSubmissions } from '../services/api'

function AssignmentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [assignment, setAssignment] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [showDrawer, setShowDrawer] = useState(false)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAssignmentData()
  }, [id])

  const loadAssignmentData = async () => {
    try {
      const [assignmentData, submissionsData] = await Promise.all([
        getAssignmentDetail(id),
        getAssignmentSubmissions(id)
      ])
      setAssignment(assignmentData)
      setSubmissions(submissionsData.submissions || [])
    } catch (error) {
      console.error('Error loading assignment:', error)
      // Fallback to mock data
      setAssignment({
        id,
        title: 'Problem Set 4: Quantum Mechanics',
        course: 'Quantum Mechanics II',
        semester: 'Spring 2024',
        deadline: '2024-10-24T23:59:00',
        instructions: 'Complete all equations in Section 4.2 using the provided template.',
        status: 'active'
      })
      setSubmissions([
        { studentName: 'Adrianne Sterling', status: 'submitted' },
        { studentName: 'Julian Vance', status: 'submitted' },
        { studentName: 'Elara Quinn', status: 'missing' }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        return
      }
      setFile(selectedFile)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      if (droppedFile.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        return
      }
      setFile(droppedFile)
    }
  }

  const handleSubmit = async () => {
    if (!file) {
      alert('Please select a file to upload')
      return
    }

    setUploading(true)
    try {
      await submitAssignment(id, file)
      alert('Assignment submitted successfully!')
      setFile(null)
      loadAssignmentData()
    } catch (error) {
      console.error('Error submitting assignment:', error)
      alert('Failed to submit assignment. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const formatDeadline = (deadline) => {
    const date = new Date(deadline)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + 
           ' • ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!assignment) {
    return <div className="min-h-screen flex items-center justify-center">Assignment not found</div>
  }

  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden bg-bg-pure">
      <header className="w-full border-b border-slate-100 py-10 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-8 flex justify-between items-center">
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">{assignment.course}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">{assignment.semester}</span>
            </div>
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold tracking-tight text-primary">{assignment.title}</h1>
              <label 
                className="cursor-pointer p-1.5 hover:bg-slate-50 rounded-md transition-colors text-slate-400 hover:text-primary" 
                htmlFor="drawer-toggle"
                onClick={() => setShowDrawer(true)}
              >
                <span className="material-symbols-outlined text-[20px]">settings</span>
              </label>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Accepting Submissions</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="mb-10">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Registry</h2>
                  <p className="text-[12px] text-slate-400">Manage student uploads and archival records</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all">
                  <span className="material-symbols-outlined text-base">folder_zip</span>
                  Download All
                </button>
              </div>
              <div className="w-full overflow-hidden border border-slate-100 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Student</th>
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 text-center">Status</th>
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {submissions.map((submission, index) => (
                      <tr key={index} className="table-row-hover transition-colors">
                        <td className="py-4 px-6 text-[13px] font-medium text-slate-700">{submission.studentName}</td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            submission.status === 'submitted' 
                              ? 'bg-emerald-50 text-emerald-600' 
                              : 'bg-slate-50 text-slate-400'
                          }`}>
                            {submission.status === 'submitted' ? 'Submitted' : 'Missing'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {submission.status === 'submitted' ? (
                            <a className="text-accent-blue hover:text-blue-800 transition-colors" href="#">
                              <span className="material-symbols-outlined text-[18px]">download</span>
                            </a>
                          ) : (
                            <span className="text-[14px] text-slate-200">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-xs font-bold text-primary uppercase tracking-widest mb-4">Submission Zone</h2>
              <div 
                className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50/30 hover:bg-slate-50 hover:border-accent-blue/30 transition-all cursor-pointer group"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById('file-input').click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".tex,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="material-symbols-outlined text-3xl text-slate-300 group-hover:text-accent-blue mb-3 transition-colors">upload_file</span>
                {file ? (
                  <div>
                    <p className="text-[12px] font-medium text-slate-600 mb-1">{file.name}</p>
                    <p className="text-[10px] text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <>
                    <p className="text-[12px] font-medium text-slate-600 mb-1">Drag and drop your LaTeX PDF</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Max file size 10MB</p>
                  </>
                )}
              </div>
              {file && (
                <button
                  onClick={handleSubmit}
                  disabled={uploading}
                  className="mt-4 w-full bg-primary text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Submit Assignment'}
                </button>
              )}
            </div>

            <div className="bg-slate-50/50 rounded-xl p-6 border border-slate-100">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Assignment Brief</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-slate-400 text-[18px]">calendar_today</span>
                  <div>
                    <p className="text-[11px] font-bold text-primary uppercase tracking-tight">Deadline</p>
                    <p className="text-[12px] text-slate-500">{formatDeadline(assignment.deadline)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-slate-400 text-[18px]">description</span>
                  <div>
                    <p className="text-[11px] font-bold text-primary uppercase tracking-tight">Instructions</p>
                    <p className="text-[12px] text-slate-500 leading-relaxed">{assignment.instructions}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <input className="hidden peer" id="drawer-toggle" type="checkbox" checked={showDrawer} onChange={(e) => setShowDrawer(e.target.checked)} />
      <div 
        className="drawer-overlay fixed inset-0 bg-primary/20 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity z-40"
        style={{ opacity: showDrawer ? 1 : 0, pointerEvents: showDrawer ? 'auto' : 'none' }}
        onClick={() => setShowDrawer(false)}
      ></div>
      <div className={`side-drawer fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 p-10 flex flex-col ${showDrawer ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-lg font-semibold tracking-tight text-primary">Assignment Settings</h2>
          <label className="cursor-pointer text-slate-400 hover:text-primary transition-colors" onClick={() => setShowDrawer(false)}>
            <span className="material-symbols-outlined">close</span>
          </label>
        </div>
        <form className="space-y-8 flex-1 overflow-y-auto pr-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Title</label>
            <input className="w-full border-slate-200 rounded text-sm focus:ring-0 focus:border-primary transition-colors" type="text" defaultValue={assignment.title} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Due Date</label>
              <input className="w-full border-slate-200 rounded text-sm focus:ring-0 focus:border-primary" type="date" defaultValue={assignment.deadline.split('T')[0]} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Max Score</label>
              <input className="w-full border-slate-200 rounded text-sm focus:ring-0 focus:border-primary" type="number" defaultValue="100" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Submission Template (URL)</label>
            <div className="flex gap-2">
              <input className="flex-1 border-slate-200 rounded text-sm focus:ring-0 focus:border-primary" placeholder="Overleaf Link or PDF URL" type="text" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visibility</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input defaultChecked className="text-primary focus:ring-0" name="visibility" type="radio" />
                <span className="text-sm text-slate-600">Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input className="text-primary focus:ring-0" name="visibility" type="radio" />
                <span className="text-sm text-slate-600">Draft</span>
              </label>
            </div>
          </div>
        </form>
        <div className="pt-8 mt-auto border-t border-slate-100 flex gap-4">
          <button className="flex-1 py-3 bg-primary text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded hover:bg-slate-800 transition-colors">
            Save Changes
          </button>
          <button className="px-6 py-3 border border-slate-200 text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em] rounded hover:bg-slate-50 transition-colors">
            Delete
          </button>
        </div>
      </div>

      <footer className="py-8 text-center border-t border-slate-50 bg-white">
        <div className="inline-flex items-center gap-6">
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-medium">
            Core Academic Portal • Unified View v3.0
          </p>
        </div>
      </footer>
    </div>
  )
}

export default AssignmentDetail
