import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { useChat } from '../../hooks/useChat'

export function MessageInput() {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { sendMessage, isStreaming } = useChat()

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [input])

  const handleSubmit = () => {
    if (!input.trim() || isStreaming) return
    sendMessage(input)
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="p-4 border-t dark:border-dark-border light:border-gray-200 theme-transition dark:bg-dark-bg light:bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="input-glow flex items-end gap-3 dark:bg-dark-card light:bg-white rounded-2xl px-4 py-3 border dark:border-dark-border light:border-gray-200 transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你的问题..."
            className="flex-1 bg-transparent resize-none outline-none text-sm dark:text-gray-200 light:text-gray-800 dark:placeholder-gray-500 light:placeholder-gray-400 max-h-[120px] leading-relaxed"
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isStreaming}
            className="p-2 rounded-lg gradient-bg text-white hover:opacity-90 transition-opacity flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs dark:text-gray-600 light:text-gray-400 text-center mt-2">
          Enter 发送 / Shift + Enter 换行
        </p>
      </div>
    </div>
  )
}
