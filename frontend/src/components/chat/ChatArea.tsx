import { useEffect, useRef, useState } from 'react'
import { ArrowDown } from 'lucide-react'
import { useChatStore } from '../../stores/chatStore'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { WelcomeScreen } from './WelcomeScreen'
import { TypingIndicator } from './TypingIndicator'

export function ChatArea() {
  const { getActiveConversation, isStreaming, toolStatus } = useChatStore()
  const conversation = getActiveConversation()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  const messages = conversation?.messages ?? []
  const showWelcome = messages.length === 0
  const lastMessage = messages[messages.length - 1]

  // 显示打字指示器：流式中 且 (最后消息为空 或 正在调用工具)
  const showTyping = isStreaming && lastMessage?.role === 'assistant' &&
    (lastMessage.content === '' || toolStatus !== null)

  // 监听滚动，判断是否在底部
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight
      const isAtBottom = distanceFromBottom < 80
      setAutoScroll(isAtBottom)
      setShowScrollBtn(!isAtBottom && messages.length > 0)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [messages.length])

  // 仅在 autoScroll 为 true 时滚动到底部
  useEffect(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, autoScroll])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    setAutoScroll(true)
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      {showWelcome ? (
        <WelcomeScreen />
      ) : (
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
            {messages.map((msg, idx) => {
              const isLast = idx === messages.length - 1
              const isAiStreaming = isStreaming && isLast && msg.role === 'assistant' && msg.content !== ''
              return <MessageBubble key={msg.id} message={msg} isStreaming={isAiStreaming} />
            })}
            {showTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-6 p-2.5 rounded-full dark:bg-dark-card light:bg-white border dark:border-dark-border light:border-gray-200 shadow-lg hover:opacity-80 transition-opacity fade-in"
          title="回到底部"
        >
          <ArrowDown className="w-4 h-4 dark:text-gray-300 light:text-gray-700" />
        </button>
      )}

      <MessageInput />
    </div>
  )
}
