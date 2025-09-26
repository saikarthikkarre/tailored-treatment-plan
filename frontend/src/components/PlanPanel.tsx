import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ClipboardList, 
  Loader, 
  Search, 
  Target, 
  AlertCircle, 
  CheckCircle, 
  Lightbulb, 
  ArrowRight, 
  Download,
  RefreshCcw 
} from 'lucide-react'
import { generatePlan, getPlan, PlanItem } from '../lib/api'

export default function PlanPanel() {
  const [patientId, setPatientId] = useState('')
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<PlanItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  async function onGenerate() {
    if (!patientId.trim()) return
    
    setLoading(true)
    setError(null)
    setPlan([])
    setIsGenerating(false)
    
    try {
      // First try to get existing plan (returns [] if none)
      const existing = await getPlan(patientId)
      if (existing.plan && existing.plan.length > 0) {
        setPlan(existing.plan)
        setLoading(false)
        return
      }
      
      // Simulate AI planning process
      setIsGenerating(true)
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      // If no existing plan, generate a new one
      const res = await generatePlan(patientId)
      setPlan(res.plan || [])
      setIsGenerating(false)
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to generate treatment plan')
      setIsGenerating(false)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onGenerate()
    }
  }

  const handleRegenerate = () => {
    setPlan([])
    onGenerate()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden h-fit"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-xl">
            <ClipboardList className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Treatment Plan</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">AI-generated personalized recommendations</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Input Section */}
        <div className="space-y-3">
          <label htmlFor="patientIdPlan" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Search className="w-4 h-4" />
            Patient ID
          </label>
          <div className="flex gap-3">
            <input 
              id="patientIdPlan"
              className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
              placeholder="Enter patient ID for treatment plan"
              value={patientId} 
              onChange={e => setPatientId(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl transition-all duration-200 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl disabled:cursor-not-allowed" 
              onClick={onGenerate} 
              disabled={!patientId.trim() || loading}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4" />
                  Generate
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-800"
            >
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        <AnimatePresence>
          {(loading || isGenerating) && plan.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 p-4 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 rounded-xl border border-violet-200 dark:border-violet-800">
                <Lightbulb className="w-5 h-5 animate-pulse" />
                <span className="text-sm font-medium">
                  {isGenerating ? "AI is creating personalized treatment plan..." : "Loading patient data..."}
                </span>
              </div>
              
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div 
                      className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg animate-pulse" 
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                    <div 
                      className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg animate-pulse w-3/4" 
                      style={{ animationDelay: `${i * 0.2 + 0.1}s` }}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Treatment Plan Results */}
        <AnimatePresence>
          {plan.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              {/* Success indicator */}
              <div className="flex items-center justify-between p-3 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 rounded-xl border border-violet-200 dark:border-violet-800">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Treatment plan generated successfully</span>
                </div>
                <span className="text-xs bg-violet-100 dark:bg-violet-900/30 px-2 py-1 rounded-full font-medium">
                  {plan.length} recommendation{plan.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Treatment recommendations */}
              <div className="space-y-3">
                {plan.map((planItem, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group p-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-600 transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg flex items-center justify-center text-sm font-bold shadow-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start gap-2">
                          <Target className="w-4 h-4 text-violet-600 dark:text-violet-400 mt-0.5 flex-shrink-0" />
                          <h3 className="font-semibold text-gray-900 dark:text-white leading-relaxed">
                            {planItem.recommendation}
                          </h3>
                        </div>
                        <div className="flex items-start gap-2 pl-6">
                          <ArrowRight className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                            {planItem.justification}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  Export Plan
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium"
                  onClick={handleRegenerate}
                  disabled={loading}
                >
                  <RefreshCcw className="w-4 h-4" />
                  Regenerate
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}