import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Loader, ExternalLink, Send, Bot, User, Sparkles } from 'lucide-react'
import { chat } from '../lib/api'

export default function ChatPanel() {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState<string | null>(null)
  const [sources, setSources] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  async function onAsk() {
    if (!question.trim() || loading) return
    
    setLoading(true)
    setError(null)
    setAnswer(null)
    setSources([])
    
    try {
      const res = await chat({ question })
      setAnswer(res.answer)
      setSources(res.sources || [])
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to get answer. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onAsk()
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
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 px-8 py-6 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
            <MessageCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Medical Knowledge Assistant</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Ask questions about medical treatments, conditions, and research</p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Input Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ask Your Question</h3>
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <textarea
                className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none min-h-[100px]"
                placeholder="Enter your medical question here... (Press Enter to send, Shift+Enter for new line)"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
              <div className="absolute bottom-3 right-3">
                <Sparkles className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            
            <motion.button
              type="button"
              disabled={!question.trim() || loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-2"
              onClick={onAsk}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Ask Question
                </>
              )}
            </motion.button>
          </div>
        </section>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
            >
              <p className="text-red-700 dark:text-red-300 text-sm font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        <AnimatePresence>
          {loading && !answer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Bot className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Response</h3>
              </div>
              
              <div className="space-y-3">
                <div className="h-4 bg-gradient-to-r from-emerald-200 to-teal-200 dark:from-emerald-700 dark:to-teal-700 rounded-lg animate-pulse"></div>
                <div className="h-4 bg-gradient-to-r from-emerald-200 to-teal-200 dark:from-emerald-700 dark:to-teal-700 rounded-lg animate-pulse w-5/6"></div>
                <div className="h-4 bg-gradient-to-r from-emerald-200 to-teal-200 dark:from-emerald-700 dark:to-teal-700 rounded-lg animate-pulse w-3/4"></div>
                <div className="h-4 bg-gradient-to-r from-emerald-200 to-teal-200 dark:from-emerald-700 dark:to-teal-700 rounded-lg animate-pulse w-1/2"></div>
              </div>
              
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm">
                <Loader className="w-4 h-4 animate-spin" />
                Analyzing medical literature and generating response...
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Answer Section */}
        <AnimatePresence>
          {answer && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Bot className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Response</h3>
              </div>
              
              <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 border border-emerald-200/50 dark:border-emerald-700/50 rounded-xl">
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap text-sm">
                  {answer}
                </p>
              </div>

              {/* Sources Section */}
              {sources.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white">Referenced Sources</h4>
                  </div>
                  
                  <div className="space-y-2">
                    {sources.map((source, index) => (
                      <motion.div
                        key={source}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors duration-200"
                      >
                        <div className="p-1 bg-emerald-100 dark:bg-emerald-900/30 rounded">
                          <ExternalLink className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <a
                          href={source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-sm text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100 underline underline-offset-2 transition-colors duration-200 truncate"
                        >
                          {source}
                        </a>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!answer && !loading && !error && (
          <div className="text-center py-12">
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-fit mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Ready to help with your medical questions</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Ask about treatments, conditions, drug interactions, or research findings</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}