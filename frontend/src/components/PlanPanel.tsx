import { useState } from 'react'
import { generatePlan, getPlan, PlanItem } from '../lib/api'

export default function PlanPanel() {
  const [patientId, setPatientId] = useState('')
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<PlanItem[]>([])
  const [error, setError] = useState<string | null>(null)

  async function onGenerate() {
    setLoading(true); setError(null); setPlan([])
    try {
      // First try to get existing plan (returns [] if none)
      const existing = await getPlan(patientId)
      if (existing.plan && existing.plan.length > 0) {
        setPlan(existing.plan)
        setLoading(false)
        return
      }
      
      // If no existing plan, generate a new one
      const res = await generatePlan(patientId)
      setPlan(res.plan || [])
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to generate plan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card space-y-4">
      <h2 className="section-title">Generate Treatment Plan</h2>
      <div className="flex gap-2">
        <input className="input" placeholder="Patient ID" value={patientId} onChange={e => setPatientId(e.target.value)} />
        <button className="btn" onClick={onGenerate} disabled={!patientId || loading}>{loading ? 'Generating…' : 'Generate'}</button>
      </div>
      {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
      {plan.length > 0 && (
        <ol className="space-y-3 list-decimal list-inside">
          {plan.map((p, i) => (
            <li key={i} className="space-y-1">
              <div className="font-medium">{p.recommendation}</div>
              <div className="text-sm text-brand-700 dark:text-brand-300">{p.justification}</div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}


