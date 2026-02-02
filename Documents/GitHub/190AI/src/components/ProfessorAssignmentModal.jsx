import { useState } from 'react'

function ProfessorAssignmentModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    deadline: '',
    allowLateSubmission: true
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-navy/10 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-lg shadow-2xl border border-light-grey">
        <div className="p-12">
          <header className="mb-10">
            <h1 className="text-[10px] uppercase tracking-[0.4em] font-bold text-navy/40 mb-2">Management</h1>
            <h2 className="text-3xl font-light tracking-tight text-navy">Assignment Settings</h2>
          </header>
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest text-navy/40 font-bold block">Assignment Title</label>
              <input 
                className="w-full bg-light-grey/30 border-light-grey px-0 py-3 text-lg font-normal text-navy border-t-0 border-l-0 border-r-0 border-b-2 placeholder:text-navy/20 focus:border-navy transition-colors" 
                placeholder="e.g. Linear Algebra Midterm" 
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest text-navy/40 font-bold block">Due Date & Time</label>
              <input 
                className="w-full bg-light-grey/30 border-light-grey px-0 py-3 text-lg font-normal text-navy border-t-0 border-l-0 border-r-0 border-b-2 focus:border-navy transition-colors" 
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                required
              />
            </div>
            <div className="flex items-center justify-between py-4 border-b border-light-grey">
              <div className="space-y-1">
                <p className="text-sm font-medium text-navy">Allow Late Submission</p>
                <p className="text-[10px] text-navy/40 uppercase tracking-widest font-semibold">Flags late uploads in the dashboard</p>
              </div>
              <div className="relative inline-block w-12 h-6 align-middle select-none transition duration-200 ease-in">
                <input 
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer z-10 border-light-grey outline-none" 
                  id="toggle" 
                  name="toggle" 
                  type="checkbox"
                  checked={formData.allowLateSubmission}
                  onChange={(e) => setFormData({ ...formData, allowLateSubmission: e.target.checked })}
                />
                <label className="toggle-label block overflow-hidden h-6 rounded-full bg-light-grey cursor-pointer transition-colors duration-200" htmlFor="toggle">
                  <span className="toggle-dot block h-6 w-6 rounded-full bg-white shadow-sm"></span>
                </label>
              </div>
            </div>
            <div className="flex items-center space-x-4 pt-4">
              <button 
                className="flex-1 bg-navy hover:bg-navy/90 text-white px-8 py-5 text-[11px] uppercase tracking-widest font-bold transition-all" 
                type="submit"
              >
                Save Changes
              </button>
              <button 
                className="px-8 py-5 text-[11px] uppercase tracking-widest font-bold text-navy/40 hover:text-navy transition-colors" 
                type="button"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProfessorAssignmentModal
