import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getAssignments } from '../services/api'

function ProfessorOverview() {
  const [assignments, setAssignments] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadAssignments()
  }, [])

  const loadAssignments = async () => {
    try {
      const data = await getAssignments()
      setAssignments(data.assignments || [])
    } catch (error) {
      console.error('Error loading assignments:', error)
      // Fallback to mock data
      setAssignments([
        {
          id: '1',
          title: 'Homework 1: Basic Formatting',
          subtitle: 'Latex Foundations',
          deadline: '2023-10-12',
          submissions: { submitted: 28, total: 30 }
        },
        {
          id: '2',
          title: 'Lab 2: Complex Equations',
          subtitle: 'Mathematical Symbols',
          deadline: '2023-10-20',
          submissions: { submitted: 15, total: 30 }
        },
        {
          id: '3',
          title: 'Midterm: Tabular & Graphics',
          subtitle: 'Core Examination',
          deadline: '2023-11-05',
          submissions: { submitted: 30, total: 30 }
        },
        {
          id: '4',
          title: 'Final Project: Dissertation Layout',
          subtitle: 'Comprehensive Thesis',
          deadline: '2023-12-15',
          submissions: { submitted: 0, total: 30 }
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getSubmissionPercentage = (submitted, total) => {
    return total > 0 ? (submitted / total) * 100 : 0
  }

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'bg-emerald-500'
    if (percentage >= 50) return 'bg-amber-500'
    return 'bg-slate-200'
  }

  const handleViewTracker = (assignmentId) => {
    navigate(`/assignment/${assignmentId}`)
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      <header className="border-b border-border-light px-12 h-20 flex items-center justify-between bg-white">
        <div className="flex items-center gap-16">
          <Link to="/professor" className="flex items-center gap-2">
            <div className="bg-primary-navy text-white p-1 rounded-md flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">terminal</span>
            </div>
            <span className="font-bold tracking-tight text-lg">Scholar</span>
          </Link>
          <nav className="hidden md:flex items-center gap-10">
            <span className="text-sm text-slate-400 hover:text-primary-navy transition-colors font-medium cursor-default">Dashboard</span>
            <Link to="/professor" className="text-sm text-primary-navy font-semibold relative after:content-[''] after:absolute after:-bottom-[27px] after:left-0 after:w-full after:h-[2px] after:bg-primary-navy">Assignments</Link>
            <span className="text-sm text-slate-400 hover:text-primary-navy transition-colors font-medium cursor-default">Grades</span>
            <span className="text-sm text-slate-400 hover:text-primary-navy transition-colors font-medium cursor-default">Students</span>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 pr-6 border-r border-border-light">
            <div className="text-right">
              <p className="text-xs font-semibold text-primary-navy">Dr. Julian Vance</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">Professor</p>
            </div>
            <div className="size-10 rounded-full bg-slate-100 border border-border-light overflow-hidden">
              <div className="w-full h-full bg-slate-200"></div>
            </div>
          </div>
          <button className="text-slate-400 hover:text-primary-navy transition-colors">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-12 py-16">
        <div className="flex items-center justify-between mb-16">
          <div>
            <h1 className="text-2xl font-semibold text-primary-navy tracking-tight mb-1">Unified Professor Overview</h1>
            <p className="text-slate-400 text-sm font-medium">MATH-202 • Advanced Mathematical Typesetting</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-primary-navy text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            New Assignment
          </button>
        </div>

        <div className="w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-light">
                <th className="pb-4 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 w-[45%]">Assignment</th>
                <th className="pb-4 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 w-[20%]">Due Date</th>
                <th className="pb-4 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 w-[20%] text-center">Submissions</th>
                <th className="pb-4 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 w-[15%] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {assignments.map((assignment) => {
                const percentage = getSubmissionPercentage(assignment.submissions.submitted, assignment.submissions.total)
                return (
                  <tr key={assignment.id} className="group hover:bg-soft-gray/50 transition-colors">
                    <td className="py-6">
                      <div className="flex flex-col">
                        <span className="text-[15px] font-semibold text-primary-navy">{assignment.title}</span>
                        <span className="text-xs text-slate-400 mt-0.5">{assignment.subtitle}</span>
                      </div>
                    </td>
                    <td className="py-6">
                      <span className={`text-sm text-slate-600 font-medium ${assignment.deadline === '2023-11-05' ? 'text-red-500' : ''}`}>
                        {formatDate(assignment.deadline)}
                      </span>
                    </td>
                    <td className="py-6 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`text-sm font-bold ${assignment.submissions.submitted === 0 ? 'text-slate-300' : 'text-primary-navy'}`}>
                          {assignment.submissions.submitted}/{assignment.submissions.total}
                        </span>
                        <div className="w-16 h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                          <div className={`${getProgressColor(percentage)} h-full`} style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 text-right">
                      <button 
                        onClick={() => handleViewTracker(assignment.id)}
                        className="bg-primary-navy text-white px-5 py-2 rounded-full text-xs font-semibold hover:bg-slate-800 transition-all"
                      >
                        View Tracker
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <footer className="mt-32 pb-12 flex flex-col items-center gap-6">
          <div className="h-px w-16 bg-border-light"></div>
          <div className="flex items-center gap-2 opacity-20 grayscale">
            <div className="bg-primary-navy text-white p-1 rounded flex items-center justify-center">
              <span className="material-symbols-outlined text-[10px]">terminal</span>
            </div>
            <span className="font-bold tracking-tight text-[10px] uppercase">Scholar</span>
          </div>
          <p className="text-[9px] font-bold tracking-[0.5em] text-slate-300 uppercase">Mirrored Academic Experience</p>
          <Link to="/" className="text-[10px] text-slate-400 hover:text-primary-navy transition-colors mt-2">← Student view</Link>
        </footer>
      </main>

      {showModal && (
        <ProfessorAssignmentModal 
          onClose={() => setShowModal(false)}
          onSave={async (assignmentData) => {
            // Handle save - will integrate with API later
            console.log('Saving assignment:', assignmentData)
            setShowModal(false)
            loadAssignments()
          }}
        />
      )}
    </div>
  )
}

export default ProfessorOverview
