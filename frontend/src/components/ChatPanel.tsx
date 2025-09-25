import { useState } from 'react'
import { chat } from '../lib/api'

export default function ChatPanel() {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState<string | null>(null)
  const [sources, setSources] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  async function onAsk() {
    setLoading(true); setError(null); setAnswer(null); setSources([])
    try {
      const res = await chat({ question })
      setAnswer(res.answer)
      setSources(res.sources || [])
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to get answer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card space-y-4">
      <h2 className="section-title">Knowledge Base Chat</h2>
      <div className="flex gap-2">
        <input className="input" placeholder="Ask a medical question" value={question} onChange={e => setQuestion(e.target.value)} />
        <button className="btn" onClick={onAsk} disabled={!question.trim() || loading}>{loading ? 'Asking…' : 'Ask'}</button>
      </div>
      {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
      {answer && (
        <div className="space-y-2">
          <p className="text-sm leading-6 whitespace-pre-wrap">{answer}</p>
          {sources.length > 0 && (
            <div>
              <div className="text-sm font-medium">Sources</div>
              <ul className="mt-1 space-y-1 text-sm">
                {sources.map(s => (
                  <li key={s}><a className="text-brand-700 dark:text-brand-300 underline" href={s} target="_blank" rel="noreferrer">{s}</a></li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


