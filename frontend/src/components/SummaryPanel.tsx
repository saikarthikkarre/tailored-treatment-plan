import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Loader, ExternalLink, Send, Brain, BookOpen, AlertCircle, CheckCircle } from 'lucide-react'
import { chat } from '../lib/api'

export default function ChatPanel() {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState<string | null>(null)
  const [sources, setSources] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isThinking, setIsThinking] = useState(false)

  async function onAsk() {
    if (!question.trim()) return
    
    setLoading(true)
    setError(null)
    setAnswer(null)
    setSources([])
    setIsThinking(false)
    
    try {
      // Simulate AI thinking
      setIsThinking(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const res = await chat({ question })
      setAnswer(res.answer)
      setSources(res.sources || [])
      setIsThinking(false)
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to get answer from knowledge base')
      setIsThinking(false)
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

  const suggestedQuestions = [
    "What are the latest treatment guidelines for diabetes?",
    "Side effects of common hypertension medications",
    "Drug interactions with warfarin",
    "Best practices for chronic pain management"
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl">
            <MessageCircle className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Knowledge Base Chat</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Ask medical questions and get evidence-based answers</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Question Input */}
        <div className="space-y-3">
          <label htmlFor="medicalQuestion" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Medical Question
          </label>
          <div className="relative">
            <textarea 
              id="medicalQuestion"
              className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none" 
              placeholder="Ask a medical question..."
              value={question} 
              onChange={e => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={3}
            />
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute bottom-3 right-3 p-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              onClick={onAsk} 
              disabled={!question.trim() || loading}
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Suggested Questions */}
        {!answer && !loading && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Suggested Questions</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {suggestedQuestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-3 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 transition-all duration-200"
                  onClick={() => setQuestion(suggestion)}
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </div>
        )}

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
          {(loading || isThinking) && !answer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 p-4 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 rounded-xl border border-cyan-200 dark:border-cyan-800">
                <Brain className="w-5 h-5 animate-pulse" />
                <span className="text-sm font-medium">
                  {isThinking ? "AI is searching the knowledge base..." : "Processing your question..."}
                </span>
              </div>
              
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={i} 
                    className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded animate-pulse"
                    style={{ 
                      width: `${Math.random() * 40 + 60}%`,
                      animationDelay: `${i * 0.2}s` 
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Answer Results */}
        <AnimatePresence>
          {answer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              {/* Success indicator */}
              <div className="flex items-center gap-3 p-3 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 rounded-xl border border-cyan-200 dark:border-cyan-800">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Answer found</span>
                {sources.length > 0 && (
                  <span className="ml-auto text-xs bg-cyan-100 dark:bg-cyan-900/30 px-2 py-1 rounded-full">
                    {sources.length} source{sources.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Answer content */}
              <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">AI Response</span>
                </div>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{answer}</p>
                </div>
              </div>

              {/* Sources */}
              {sources.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Reference Sources</span>
                  </div>
                  <div className="space-y-2">
                    {sources.map((source, index) => (
                      <motion.a 
                        key={source}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        href={source} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800 transition-all duration-200"
                      >
                        <ExternalLink className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                        <span className="text-sm text-blue-700 dark:text-blue-300 group-hover:underline truncate">
                          {source}
                        </span>
                      </motion.a>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-lg hover:bg-cyan-200 dark:hover:bg-cyan-900/50 transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
                  onClick={() => navigator.clipboard.writeText(answer)}
                >
                  <BookOpen className="w-4 h-4" />
                  Copy Answer
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
                  onClick={() => {
                    setAnswer(null)
                    setSources([])
                    setQuestion('')
                  }}
                >
                  <MessageCircle className="w-4 h-4" />
                  Ask Another
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}