import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AuthScreen() {
  const [email, setEmail] = useState('')
  const [remember, setRemember] = useState(false)
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    if (email.trim()) {
      if (remember) {
        try {
          localStorage.setItem('latex_portal_email', email)
        } catch (_) {}
      }
      navigate('/student')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-primary-navy font-display">
      <header className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-[0.2em] uppercase">
            Math 190AI
          </span>
        </div>
        <div>
          <a
            className="text-xs font-medium text-gray-400 hover:text-primary-navy uppercase tracking-wider transition-colors"
            href="#"
          >
            Support
          </a>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-[400px]">
          <div className="bg-white border border-gray-100 rounded-lg p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="mb-10">
              <h1 className="text-2xl font-semibold tracking-tight text-primary-navy mb-2">
                Sign in
              </h1>
              <p className="text-sm text-gray-500 leading-relaxed">
                Enter your university credentials to continue to your dashboard.
              </p>
            </div>

            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="space-y-3">
                <label
                  className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]"
                  htmlFor="email"
                >
                  University Email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@university.edu"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-none border-0 border-b border-gray-200 bg-transparent px-0 py-3 text-sm focus:border-primary-navy focus:ring-0 transition-all placeholder:text-gray-300 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded-none border-gray-300 text-primary-navy focus:ring-0 bg-transparent transition-colors checked:bg-primary-navy checked:border-primary-navy"
                  />
                  <span className="ml-3 text-xs font-medium text-gray-500 group-hover:text-primary-navy transition-colors">
                    Remember this device
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-primary-navy hover:bg-black text-white text-xs font-bold uppercase tracking-[0.2em] py-5 rounded-none transition-all flex items-center justify-center gap-3"
              >
                <span>Continue</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-gray-50 text-center">
              <p className="text-xs text-gray-400">
                New to the portal?{' '}
                <a
                  className="text-primary-navy font-semibold hover:underline underline-offset-4"
                  href="#"
                >
                  Request Access
                </a>
              </p>
            </div>
          </div>

          <div className="mt-12 flex justify-center gap-8 text-[10px] text-gray-300 uppercase tracking-[0.2em] font-bold">
            <a className="hover:text-primary-navy transition-colors" href="#">
              Privacy
            </a>
            <a className="hover:text-primary-navy transition-colors" href="#">
              Terms
            </a>
            <a className="hover:text-primary-navy transition-colors" href="#">
              Cookies
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
