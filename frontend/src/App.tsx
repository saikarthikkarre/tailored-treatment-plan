import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Moon, Sun, Heart, Sparkles, Shield, Zap, 
  Database, CheckCircle, AlertCircle, X,
  Stethoscope, Brain, Users
} from 'lucide-react'
import PatientForm from './components/PatientForm'
import SummaryPanel from './components/SummaryPanel'
import PlanPanel from './components/PlanPanel'
import ChatPanel from './components/ChatPanel'
import { createPatient, type Patient } from './lib/api'

export default function App() {
  const [toast, setToast] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    // Initialize with system preference or default to light mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setDarkMode(prefersDark)
    document.documentElement.classList.toggle('dark', prefersDark)
  }, [])

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    document.documentElement.classList.toggle('dark', newMode)
  }

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast(message)
    setToastType(type)
    setTimeout(() => setToast(null), type === 'success' ? 3000 : 4000)
  }

  async function handleCreate(patient: Patient) {
    try {
      const res = await createPatient(patient)
      showToast(`✨ Successfully saved patient: ${res.patientId}`, 'success')
    } catch (e: any) {
      showToast(e?.response?.data?.detail || 'Failed to save patient. Please try again.', 'error')
    }
  }

  const features = [
    { icon: Brain, label: 'AI-Powered', description: 'Advanced machine learning algorithms' },
    { icon: Shield, label: 'HIPAA Compliant', description: 'Enterprise-grade security' },
    { icon: Zap, label: 'Real-time Analysis', description: 'Instant treatment recommendations' },
    { icon: Database, label: 'Evidence-based', description: 'Latest medical research' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Enhanced Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  MediPlan AI
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Personalized Treatment Planner
                </p>
              </div>
            </motion.div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full border border-blue-200/50 dark:border-blue-700/50">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Powered by AI
                </span>
              </div>
              
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white"
      >
        {/* Background Pattern */}
        <div className='absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220%200%2060%2060%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] opacity-20'></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-4"
            >
              <h2 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                AI-Powered Medicine
              </h2>
              <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                Transform patient care with personalized treatment plans powered by advanced artificial intelligence and evidence-based medicine.
              </p>
            </motion.div>

            {/* Feature Pills */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-3"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  className="group flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full border border-white/20 hover:border-white/30 transition-all duration-300 cursor-pointer"
                >
                  <feature.icon className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" />
                  <span className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">
                    {feature.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto pt-8"
            >
              {[
                { icon: Stethoscope, value: '10,000+', label: 'Patients Treated' },
                { icon: Brain, value: '95%', label: 'Accuracy Rate' },
                { icon: Users, value: '500+', label: 'Healthcare Providers' }
              ].map((stat, index) => (
                <div key={stat.label} className="text-center space-y-2">
                  <div className="p-3 bg-white/10 rounded-xl w-fit mx-auto">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-blue-100">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="max-w-7xl mx-auto px-6 py-12 space-y-12"
      >
        {/* Patient Form */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <PatientForm onCreate={handleCreate} />
        </motion.div>

        {/* Analysis Panels */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-1 xl:grid-cols-2 gap-8"
        >
          <SummaryPanel />
          <PlanPanel />
        </motion.div>

        {/* Chat Panel */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <ChatPanel />
        </motion.div>
      </motion.main>

      {/* Enhanced Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div className={`
              flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border
              ${toastType === 'success' 
                ? 'bg-emerald-50/90 dark:bg-emerald-900/30 border-emerald-200/50 dark:border-emerald-700/50 text-emerald-800 dark:text-emerald-200' 
                : 'bg-red-50/90 dark:bg-red-900/30 border-red-200/50 dark:border-red-700/50 text-red-800 dark:text-red-200'
              }
            `}>
              {toastType === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              )}
              <span className="font-medium text-sm">{toast}</span>
              <button
                onClick={() => setToast(null)}
                aria-label="Close notification"
                className={`
                  p-1 rounded-lg transition-colors
                  ${toastType === 'success'
                    ? 'hover:bg-emerald-200/50 dark:hover:bg-emerald-800/50'
                    : 'hover:bg-red-200/50 dark:hover:bg-red-800/50'
                  }
                `}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/5 dark:bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/5 dark:bg-purple-400/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  )
}