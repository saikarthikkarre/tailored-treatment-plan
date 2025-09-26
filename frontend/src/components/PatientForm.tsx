import { useState, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, Plus, X, Pill, Heart, Activity, 
  Calendar, UserCheck, Stethoscope, Atom,
  Coffee, Trash2, Edit3, Save
} from 'lucide-react'
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
  const [comorbidityInput, setComorbidityInput] = useState('')
  const [loading, setLoading] = useState(false)

  function addComorbidity() {
    const value = comorbidityInput.trim()
    if (!value) return
    setPatient(p => ({ ...p, comorbidities: Array.from(new Set([...p.comorbidities, value])) }))
    setComorbidityInput('')
  }

  function removeComorbidity(index: number) {
    setPatient(p => ({ ...p, comorbidities: p.comorbidities.filter((_, i) => i !== index) }))
  }

  function addMarker() {
    if (!markerKey.trim()) return
    setPatient(p => ({ ...p, geneticMarkers: { ...p.geneticMarkers, [markerKey.trim()]: markerValue } }))
    setMarkerKey('')
    setMarkerValue('')
  }

  function removeMarker(key: string) {
    setPatient(p => {
      const { [key]: removed, ...rest } = p.geneticMarkers
      return { ...p, geneticMarkers: rest }
    })
  }

  function addLifestyle() {
    if (!lifeKey.trim()) return
    setPatient(p => ({ ...p, lifestyle: { ...p.lifestyle, [lifeKey.trim()]: lifeValue } }))
    setLifeKey('')
    setLifeValue('')
  }

  function removeLifestyle(key: string) {
    setPatient(p => {
      const { [key]: removed, ...rest } = p.lifestyle
      return { ...p, lifestyle: rest }
    })
  }

  function addMedication() {
    if (!med.name.trim()) return
    setPatient(p => ({ ...p, currentMedications: [...p.currentMedications, med] }))
    setMed({ name: '', dosage: '', adherence: '' })
  }

  function removeMedication(index: number) {
    setPatient(p => ({ ...p, currentMedications: p.currentMedications.filter((_, i) => i !== index) }))
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

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      action()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 px-8 py-6 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Patient</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Enter patient information to generate personalized treatment plans</p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Basic Information */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <UserCheck className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="patientId" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                Patient ID
              </label>
              <input 
                id="patientId" 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
                placeholder="Enter unique patient ID"
                value={patient.patientId} 
                onChange={e => setPatient({ ...patient, patientId: e.target.value })} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="age" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Age
              </label>
              <input 
                id="age" 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white" 
                type="number" 
                min={0} 
                max={150}
                placeholder="0"
                value={patient.age || ''} 
                onChange={e => setPatient({ ...patient, age: Number(e.target.value) })} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="gender" className="text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
              <select 
                id="gender"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
                value={patient.gender}
                onChange={e => setPatient({ ...patient, gender: e.target.value })}
                required
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="primaryCondition" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Stethoscope className="w-4 h-4" />
                Primary Condition
              </label>
              <input 
                id="primaryCondition" 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
                placeholder="Primary medical condition"
                value={patient.primaryCondition} 
                onChange={e => setPatient({ ...patient, primaryCondition: e.target.value })} 
                required 
              />
            </div>
          </div>
        </section>

        {/* Comorbidities */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Heart className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Comorbidities</h3>
          </div>
          
          <div className="flex gap-3 mb-4">
            <input 
              className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
              placeholder="Enter comorbidity"
              value={comorbidityInput}
              onChange={e => setComorbidityInput(e.target.value)}
              onKeyPress={e => handleKeyPress(e, addComorbidity)}
            />
            <motion.button 
              type="button" 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
              onClick={addComorbidity}
            >
              <Plus className="w-4 h-4" />
              Add
            </motion.button>
          </div>
          
          <AnimatePresence>
            {patient.comorbidities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2"
              >
                {patient.comorbidities.map((c, index) => (
                  <motion.span 
                    key={c}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm border border-red-200 dark:border-red-800"
                  >
                    <Heart className="w-3 h-3" />
                    {c}
                    <button
                      type="button"
                      onClick={() => removeComorbidity(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      aria-label={`Remove ${c} comorbidity`}
                      title={`Remove ${c} comorbidity`}>
                      <X className="w-3 h-3" />
                    </button>
                  </motion.span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Genetic Markers and Lifestyle */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Genetic Markers */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Atom className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Genetic Markers</h3>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input 
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
                  placeholder="Marker name"
                  value={markerKey} 
                  onChange={e => setMarkerKey(e.target.value)} 
                />
                <input 
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
                  placeholder="Value"
                  value={markerValue} 
                  onChange={e => setMarkerValue(e.target.value)}
                  onKeyPress={e => handleKeyPress(e, addMarker)}
                />
              </div>
              <motion.button 
                type="button" 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
                onClick={addMarker}
              >
                <Plus className="w-4 h-4" />
                Add Marker
              </motion.button>
            </div>
            
            <AnimatePresence>
              {Object.entries(patient.geneticMarkers).length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 space-y-2"
                >
                  {Object.entries(patient.geneticMarkers).map(([key, value]) => (
                    <motion.div 
                      key={key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
                    >
                      <span className="text-sm text-purple-700 dark:text-purple-300">
                        <strong>{key}:</strong> {String(value)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeMarker(key)}
                        className="text-purple-500 hover:text-purple-700 transition-colors"
                        aria-label={`Remove ${key} genetic marker`}
                        title={`Remove ${key} genetic marker`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Lifestyle */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Coffee className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Lifestyle Factors</h3>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input 
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
                  placeholder="Factor (e.g., smoking)"
                  value={lifeKey} 
                  onChange={e => setLifeKey(e.target.value)} 
                />
                <input 
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
                  placeholder="Details"
                  value={lifeValue} 
                  onChange={e => setLifeValue(e.target.value)}
                  onKeyPress={e => handleKeyPress(e, addLifestyle)}
                />
              </div>
              <motion.button 
                type="button" 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
                onClick={addLifestyle}
              >
                <Plus className="w-4 h-4" />
                Add Factor
              </motion.button>
            </div>
            
            <AnimatePresence>
              {Object.entries(patient.lifestyle).length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 space-y-2"
                >
                  {Object.entries(patient.lifestyle).map(([key, value]) => (
                    <motion.div 
                      key={key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                    >
                      <span className="text-sm text-green-700 dark:text-green-300">
                        <strong>{key}:</strong> {String(value)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeLifestyle(key)}
                        className="text-green-500 hover:text-green-700 transition-colors"
                        aria-label={`Remove ${key} lifestyle factor`}
                        title={`Remove ${key} lifestyle factor`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>

        {/* Medications */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Pill className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Current Medications</h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input 
                className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
                placeholder="Medication name"
                value={med.name} 
                onChange={e => setMed({ ...med, name: e.target.value })} 
              />
              <input 
                className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
                placeholder="Dosage"
                value={med.dosage} 
                onChange={e => setMed({ ...med, dosage: e.target.value })} 
              />
              <input 
                className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
                placeholder="Adherence"
                value={med.adherence} 
                onChange={e => setMed({ ...med, adherence: e.target.value })}
                onKeyPress={e => handleKeyPress(e, addMedication)}
              />
              <motion.button 
                type="button" 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
                onClick={addMedication}
              >
                <Plus className="w-4 h-4" />
                Add
              </motion.button>
            </div>
            
            <AnimatePresence>
              {patient.currentMedications.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  {patient.currentMedications.map((m, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800"
                    >
                      <div className="flex items-center gap-3">
                        <Pill className="w-4 h-4 text-orange-600" />
                        <span className="text-sm text-orange-700 dark:text-orange-300">
                          <strong>{m.name}</strong> • {m.dosage} • {m.adherence}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMedication(index)}
                        className="text-orange-500 hover:text-orange-700 transition-colors"
                        aria-label={`Remove ${m.name} medication`}
                        title={`Remove ${m.name} medication`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Submit Button */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <motion.button 
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full md:w-auto ml-auto flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            onClick={handleSubmit}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving Patient...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Patient
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}