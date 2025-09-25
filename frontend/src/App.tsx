import { useState } from 'react'
import PatientForm from './components/PatientForm'
import SummaryPanel from './components/SummaryPanel'
import PlanPanel from './components/PlanPanel'
import ChatPanel from './components/ChatPanel'
import { createPatient, type Patient } from './lib/api'

export default function App() {
  const [toast, setToast] = useState<string | null>(null)

  async function handleCreate(patient: Patient) {
    try {
      const res = await createPatient(patient)
      setToast(`Saved ${res.patientId}`)
      setTimeout(() => setToast(null), 2500)
    } catch (e: any) {
      setToast(e?.response?.data?.detail || 'Failed to save patient')
      setTimeout(() => setToast(null), 3000)
    }
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 dark:bg-brand-900/60 border-b border-brand-200/50 dark:border-brand-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Personalized Treatment Planner</h1>
          <span className="text-sm text-brand-600 dark:text-brand-300">FastAPI + React</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <PatientForm onCreate={handleCreate} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SummaryPanel />
          <PlanPanel />
        </div>
        <ChatPanel />
      </main>

      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 card">
          <div className="text-sm">{toast}</div>
        </div>
      )}
    </div>
  )}


