import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AuthScreen from './components/AuthScreen'
import StudentDashboard from './components/StudentDashboard'
import ProfessorOverview from './components/ProfessorOverview'
import AssignmentDetail from './components/AssignmentDetail'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthScreen />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/professor" element={<ProfessorOverview />} />
        <Route path="/assignment/:id" element={<AssignmentDetail />} />
      </Routes>
    </Router>
  )
}

export default App
