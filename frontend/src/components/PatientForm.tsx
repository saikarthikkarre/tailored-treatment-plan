import { useState, type FormEvent } from 'react'
import type { Patient, Medication } from '../lib/api'

type Props = { onCreate: (patient: Patient) => Promise<void> }

export default function PatientForm({ onCreate }: Props) {
  const [patient, setPatient] = useState<Patient>({
    patientId: '',
    age: 0,
    gender: '',
    primaryCondition: '',
    comorbidities: [],
    geneticMarkers: {},
    lifestyle: {},
    currentMedications: [],
  })

  const [markerKey, setMarkerKey] = useState('')
  const [markerValue, setMarkerValue] = useState('')
  const [lifeKey, setLifeKey] = useState('')
  const [lifeValue, setLifeValue] = useState('')
  const [med, setMed] = useState<Medication>({ name: '', dosage: '', adherence: '' })
  const [loading, setLoading] = useState(false)

  function addComorbidity(value: string) {
    const v = value.trim()
    if (!v) return
    setPatient(p => ({ ...p, comorbidities: Array.from(new Set([...p.comorbidities, v])) }))
  }

  function addMarker() {
    if (!markerKey.trim()) return
    setPatient(p => ({ ...p, geneticMarkers: { ...p.geneticMarkers, [markerKey.trim()]: markerValue } }))
    setMarkerKey(''); setMarkerValue('')
  }

  function addLifestyle() {
    if (!lifeKey.trim()) return
    setPatient(p => ({ ...p, lifestyle: { ...p.lifestyle, [lifeKey.trim()]: lifeValue } }))
    setLifeKey(''); setLifeValue('')
  }

  function addMedication() {
    if (!med.name.trim()) return
    setPatient(p => ({ ...p, currentMedications: [...p.currentMedications, med] }))
    setMed({ name: '', dosage: '', adherence: '' })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await onCreate(patient)
      setPatient({
        patientId: '', age: 0, gender: '', primaryCondition: '',
        comorbidities: [], geneticMarkers: {}, lifestyle: {}, currentMedications: []
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="card space-y-4" onSubmit={handleSubmit}>
      <h2 className="section-title">Create Patient</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="patientId" className="block text-sm mb-1">Patient ID</label>
          <input id="patientId" className="input" aria-label="Patient ID" value={patient.patientId} onChange={e => setPatient({ ...patient, patientId: e.target.value })} required />
        </div>
        <div>
          <label htmlFor="age" className="block text-sm mb-1">Age</label>
          <input id="age" className="input" aria-label="Age" type="number" min={0} value={patient.age} onChange={e => setPatient({ ...patient, age: Number(e.target.value) })} required />
        </div>
        <div>
          <label htmlFor="gender" className="block text-sm mb-1">Gender</label>
          <input id="gender" className="input" aria-label="Gender" value={patient.gender} onChange={e => setPatient({ ...patient, gender: e.target.value })} required />
        </div>
        <div>
          <label htmlFor="primaryCondition" className="block text-sm mb-1">Primary Condition</label>
          <input id="primaryCondition" className="input" aria-label="Primary Condition" value={patient.primaryCondition} onChange={e => setPatient({ ...patient, primaryCondition: e.target.value })} required />
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1">Comorbidities</label>
        <div className="flex gap-2">
          <input className="input" aria-label="Comorbidity" placeholder="Add comorbidity and press +" onKeyDown={e => {
            if (e.key === 'Enter') { e.preventDefault(); addComorbidity((e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = '' }
          }} />
          <button type="button" className="btn" onClick={() => {
            const el = document.querySelector<HTMLInputElement>('input[placeholder^="Add comorbidity"]')
            if (el) { addComorbidity(el.value); el.value = '' }
          }}>+</button>
        </div>
        {patient.comorbidities.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {patient.comorbidities.map(c => (
              <span key={c} className="px-2 py-1 rounded-lg bg-brand-200 dark:bg-brand-700 text-sm">{c}</span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Genetic Marker</label>
          <div className="flex gap-2">
            <input className="input" aria-label="Genetic marker key" placeholder="Key" value={markerKey} onChange={e => setMarkerKey(e.target.value)} />
            <input className="input" aria-label="Genetic marker value" placeholder="Value" value={markerValue} onChange={e => setMarkerValue(e.target.value)} />
            <button type="button" className="btn" onClick={addMarker}>Add</button>
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Lifestyle</label>
          <div className="flex gap-2">
            <input className="input" aria-label="Lifestyle key" placeholder="Key" value={lifeKey} onChange={e => setLifeKey(e.target.value)} />
            <input className="input" aria-label="Lifestyle value" placeholder="Value" value={lifeValue} onChange={e => setLifeValue(e.target.value)} />
            <button type="button" className="btn" onClick={addLifestyle}>Add</button>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1">Medication</label>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input className="input" aria-label="Medication name" placeholder="Name" value={med.name} onChange={e => setMed({ ...med, name: e.target.value })} />
          <input className="input" aria-label="Medication dosage" placeholder="Dosage" value={med.dosage} onChange={e => setMed({ ...med, dosage: e.target.value })} />
          <input className="input" aria-label="Medication adherence" placeholder="Adherence" value={med.adherence} onChange={e => setMed({ ...med, adherence: e.target.value })} />
          <button type="button" className="btn" onClick={addMedication}>Add</button>
        </div>
        {patient.currentMedications.length > 0 && (
          <ul className="mt-2 list-disc list-inside text-sm">
            {patient.currentMedications.map((m, idx) => (
              <li key={idx}>{m.name} — {m.dosage} — {m.adherence}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex justify-end">
        <button className="btn" disabled={loading}>
          {loading ? 'Saving…' : 'Save Patient'}
        </button>
      </div>
    </form>
  )
}


