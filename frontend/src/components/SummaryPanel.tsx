import { useState } from 'react'
import { summarizePatient, getPatient } from '../lib/api'

export default function SummaryPanel() {
  const [patientId, setPatientId] = useState('')
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  async function onSummarize() {
    setLoading(true); setError(null); setSummary(null); setSymptoms([])
    try {
      // First check if patient exists and has a summary
      const patientData = await getPatient(patientId)
      if (patientData.summary && patientData.similarSymptoms) {
        setSummary(patientData.summary)
        setSymptoms(patientData.similarSymptoms)
        setLoading(false)
        return
      }
      
      // If no existing summary, generate a new one
      const res = await summarizePatient(patientId)
      console.log('Summary response:', res) // Debug log
      setSummary(res.data?.summary ?? null)
      setSymptoms(res.data?.similarSymptoms ?? [])
    } catch (e: any) {
      console.error('Summary error:', e) // Debug log
      setError(e?.response?.data?.detail || 'Failed to summarize')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card space-y-4">
      <h2 className="section-title">Generate Clinical Summary</h2>
      <div className="flex gap-2">
        <input className="input" placeholder="Patient ID" value={patientId} onChange={e => setPatientId(e.target.value)} />
        <button className="btn" onClick={onSummarize} disabled={!patientId || loading}>{loading ? 'Generating…' : 'Summarize'}</button>
      </div>
      {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
      {summary && (
        <div className="space-y-2">
          <p className="text-sm leading-6">{summary}</p>
          {symptoms.length > 0 && (
            <div>
              <div className="text-sm font-medium">Similar symptoms</div>
              <div className="mt-1 flex flex-wrap gap-2">
                {symptoms.map(s => <span key={s} className="px-2 py-1 rounded-lg bg-brand-200 dark:bg-brand-700 text-sm">{s}</span>)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


