import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  Loader, 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  User,
  Clock,
  Sparkles,
  Activity,
  Heart,
  Eye
} from 'lucide-react'
import { summarizePatient, getPatient } from '../lib/api'

interface SummaryData {
  summary: string
  riskFactors: string[]
  clinicalInsights: string[]
  urgencyLevel: 'Low' | 'Medium' | 'High' | 'Critical'
  similarCases: string[]
  timestamp: string
}

export default function SummaryPanel() {
  const [patientId, setPatientId] = useState('')
  const [loading, setLoading] = useState(false)
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'similar'>('overview')

  function normalizeSummaryData(data: any): SummaryData {
    return {
      summary: data.summary || '',
      riskFactors: data.riskFactors || [],
      clinicalInsights: data.clinicalInsights || [],
      urgencyLevel: data.urgencyLevel || 'Low',
      similarCases: data.similarCases || data.similarSymptoms || [],
      timestamp: data.timestamp || new Date().toISOString(),
    }
  }

  async function onSummarize() {
    if (!patientId.trim()) return
    
    setLoading(true)
    setError(null)
    setSummaryData(null)
    
    try {
      // First check if patient exists and has a summary
      const patientData = await getPatient(patientId)
      if (patientData.summaryData) {
        setSummaryData(normalizeSummaryData(patientData.summaryData))
        setLoading(false)
        return
      }
      
      // If no existing summary, generate a new one
      const res = await summarizePatient(patientId)
      console.log('Summary response:', res)
      
      if (res.data) {
        setSummaryData(normalizeSummaryData(res.data))
      }
    } catch (e: any) {
      console.error('Summary error:', e)
      setError(e?.response?.data?.detail || 'Failed to generate clinical summary. Please check patient ID and try again.')
    } finally {
      setLoading(false)
    }
  }

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'Critical': return 'from-red-500 to-red-600'
      case 'High': return 'from-orange-500 to-orange-600'
      case 'Medium': return 'from-yellow-500 to-yellow-600'
      case 'Low': return 'from-green-500 to-green-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getUrgencyIcon = (level: string) => {
    switch (level) {
      case 'Critical': return AlertTriangle
      case 'High': return AlertTriangle
      case 'Medium': return Clock
      case 'Low': return CheckCircle
      default: return Activity
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Clinical Summary</h2>
              <p className="text-blue-100 text-sm">Powered by advanced medical AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-white bg-opacity-20 rounded-full backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-white text-sm font-medium">Enhanced Analysis</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200" 
                placeholder="Enter Patient ID (e.g., P001)" 
                value={patientId} 
                onChange={e => setPatientId(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && onSummarize()}
              />
            </div>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed" 
              onClick={onSummarize} 
              disabled={!patientId.trim() || loading}
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Brain className="w-5 h-5" />
              )}
              {loading ? 'Analyzing...' : 'Generate Summary'}
            </motion.button>
          </div>
        </div>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <p className="text-red-700 dark:text-red-300 font-medium">Analysis Failed</p>
              </div>
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        <AnimatePresence>
          {loading && !summaryData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white animate-pulse" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200">AI Analysis in Progress</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Processing patient data with advanced algorithms...</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    Extracting clinical data...
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    Analyzing medical patterns...
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                    Generating insights...
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="h-4 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-700 dark:to-purple-700 rounded animate-pulse"></div>
                  <div className="h-4 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-700 dark:to-purple-700 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-700 dark:to-purple-700 rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {summaryData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-6"
            >
              {/* Urgency Level Banner */}
              <div className={`bg-gradient-to-r ${getUrgencyColor(summaryData.urgencyLevel)} rounded-xl p-4 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const IconComponent = getUrgencyIcon(summaryData.urgencyLevel)
                      return <IconComponent className="w-6 h-6" />
                    })()}
                    <div>
                      <div className="font-bold text-lg">Urgency Level: {summaryData.urgencyLevel}</div>
                      <div className="opacity-90 text-sm">
                        {summaryData.urgencyLevel === 'Critical' && 'Immediate attention required'}
                        {summaryData.urgencyLevel === 'High' && 'Requires prompt medical review'}
                        {summaryData.urgencyLevel === 'Medium' && 'Routine follow-up recommended'}
                        {summaryData.urgencyLevel === 'Low' && 'Stable condition, continue monitoring'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right opacity-75">
                    <div className="text-xs">Generated</div>
                    <div className="text-sm">{new Date(summaryData.timestamp).toLocaleTimeString()}</div>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                {[
                  { id: 'overview', label: 'Overview', icon: FileText },
                  { id: 'insights', label: 'Clinical Insights', icon: Eye },
                  { id: 'similar', label: 'Similar Cases', icon: TrendingUp }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-md'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="text-sm">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                      <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-blue-500" />
                        Clinical Assessment
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{summaryData.summary}</p>
                    </div>

                    {(summaryData.riskFactors?.length ?? 0) > 0 && (
                      <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                        <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-orange-500" />
                          Risk Factors
                        </h4>
                        <div className="grid gap-3">
                          {summaryData.riskFactors?.map((risk, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-start gap-3 p-3 bg-white dark:bg-gray-700/50 rounded-lg border border-orange-200 dark:border-orange-800/50"
                            >
                              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700 dark:text-gray-300 text-sm">{risk}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'insights' && (
                  <motion.div
                    key="insights"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {(summaryData.clinicalInsights?.length ?? 0) > 0 && (
                      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                        <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                          <Eye className="w-5 h-5 text-purple-500" />
                          AI-Generated Insights
                        </h4>
                        <div className="grid gap-3">
                          {summaryData.clinicalInsights?.map((insight, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-start gap-3 p-4 bg-white dark:bg-gray-700/50 rounded-lg border border-purple-200 dark:border-purple-800/50 hover:shadow-md transition-shadow duration-200"
                            >
                              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700 dark:text-gray-300">{insight}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'similar' && (
                  <motion.div
                    key="similar"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {(summaryData.similarCases?.length ?? 0) > 0 && (
                      <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                        <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-green-500" />
                          Similar Cases & References
                        </h4>
                        <div className="grid gap-3">
                          {summaryData.similarCases?.map((case_ref, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="p-4 bg-white dark:bg-gray-700/50 rounded-lg border border-green-200 dark:border-green-800/50 hover:shadow-md transition-all duration-200"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                  {i + 1}
                                </div>
                                <span className="text-gray-700 dark:text-gray-300 text-sm">{case_ref}</span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}