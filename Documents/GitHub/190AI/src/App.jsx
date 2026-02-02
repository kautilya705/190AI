import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import StudentDashboard from './components/StudentDashboard'
import ProfessorOverview from './components/ProfessorOverview'
import AssignmentDetail from './components/AssignmentDetail'
import ProfessorAssignmentModal from './components/ProfessorAssignmentModal'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StudentDashboard />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/professor" element={<ProfessorOverview />} />
        <Route path="/assignment/:id" element={<AssignmentDetail />} />
      </Routes>
    </Router>
  )
}

export default App
