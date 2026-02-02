import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getAssignments } from '../services/api'

function StudentDashboard() {
  const [assignments, setAssignments] = useState([])
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
      // Fallback to mock data for development
      setAssignments([
        {
          id: '1',
          courseCode: 'MATH301',
          title: 'Advanced Calculus - Problem Set 4',
          deadline: '2024-10-12T23:59:00',
          status: 'pending'
        },
        {
          id: '2',
          courseCode: 'PHYS402',
          title: 'Quantum Mechanics - Lab Report',
          deadline: '2024-10-15T12:00:00',
          status: 'pending'
        },
        {
          id: '3',
          courseCode: 'MATH405',
          title: 'Numerical Methods - Project',
          deadline: '2024-10-20T09:00:00',
          status: 'pending'
        },
        {
          id: '4',
          courseCode: 'STAT201',
          title: 'Statistical Inference - Homework',
          deadline: '2024-10-22T23:59:00',
          status: 'pending'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const formatDeadline = (deadline) => {
    const date = new Date(deadline)
    const month = date.toLocaleString('default', { month: 'short' })
    const day = date.getDate()
    const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    return `${month} ${day}, ${time}`
  }

  const getTimeRemaining = (deadline) => {
    const now = new Date()
    const due = new Date(deadline)
    const diff = due - now
    
    if (diff < 0) return 'Overdue'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} remaining`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} remaining`
    return 'Less than 1 hour remaining'
  }

  const handleSubmit = (assignmentId) => {
    navigate(`/assignment/${assignmentId}`)
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="bg-white text-navy min-h-screen">
      <nav className="border-b border-light-grey sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-4xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-12">
            <Link to="/" className="text-[10px] uppercase tracking-[0.3em] font-bold text-navy">Platform</Link>
            <div className="flex space-x-8">
              <Link to="/" className="text-xs uppercase tracking-widest font-semibold border-b border-navy pb-1">Assignments</Link>
              <Link to="/professor" className="text-xs uppercase tracking-widest font-medium text-navy/60 hover:text-navy transition-colors">Professor</Link>
            </div>
          </div>
          <div>
            <span className="text-xs uppercase tracking-widest font-medium text-navy/60 hover:text-navy transition-colors cursor-pointer">Log out</span>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-8 py-24">
        <header className="mb-20">
          <h1 className="text-xs uppercase tracking-[0.4em] font-semibold text-navy/40 mb-3">Student Portal</h1>
          <h2 className="text-5xl font-light tracking-tight text-navy">Unified Assignment List</h2>
        </header>

        <div className="space-y-6">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="assignment-card border border-light-grey p-10 rounded-none bg-white flex items-center justify-between">
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest text-navy/50 font-bold">{assignment.courseCode}</span>
                  <h3 className="text-2xl font-normal text-navy tracking-tight">{assignment.title}</h3>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-widest text-navy/40 font-bold">Deadline</span>
                    <p className="text-sm font-medium">{formatDeadline(assignment.deadline)}</p>
                  </div>
                  <div className="h-8 w-[1px] bg-light-grey"></div>
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-widest text-navy/40 font-bold">Status</span>
                    <p className={`text-sm font-medium ${getTimeRemaining(assignment.deadline).includes('hour') ? 'text-navy' : 'text-navy/40'}`}>
                      {getTimeRemaining(assignment.deadline)}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <button 
                  onClick={() => handleSubmit(assignment.id)}
                  className="bg-navy hover:bg-navy/90 text-white px-10 py-4 text-[11px] uppercase tracking-widest font-semibold transition-all"
                >
                  Submit .tex
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="max-w-3xl mx-auto px-8 py-32 border-t border-light-grey mt-20">
        <div className="flex justify-between items-center opacity-30">
          <p className="text-[10px] font-bold tracking-[0.5em] uppercase">Academic Core v1.0</p>
          <p className="text-[10px] font-medium tracking-widest">© 2024 LaTeX Submission Platform</p>
        </div>
      </footer>
    </div>
  )
}

export default StudentDashboard
