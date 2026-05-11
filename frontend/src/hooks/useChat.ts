import { useCallback, useRef } from 'react'
import { useChatStore } from '../stores/chatStore'
import { streamChat, mockStreamChat } from '../lib/api'
import { generateId } from '../lib/utils'
import type { Message } from '../types'

const TOOL_LABELS: Record<string, string> = {
  rag_summarize: '正在检索知识库...',
  get_weather: '正在查询天气...',
  get_user_location: '正在获取您的位置...',
  get_user_id: '正在获取用户身份...',
  get_current_month: '正在获取时间信息...',
  fetch_external_data: '正在调取使用记录...',
  fill_context_for_report: '正在准备报告上下文...',
}

export function useChat() {
  const {
    activeConversationId,
    isStreaming,
    createConversation,
    addMessage,
    updateLastAssistantMessage,
    setStreaming,
    setToolStatus,
  } = useChatStore()

  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(
    async (content: string) => {
      if (isStreaming || !content.trim()) return

      let convId = activeConversationId
      if (!convId) {
        convId = createConversation()
      }

      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content: content.trim(),
        createdAt: new Date(),
      }
      addMessage(convId, userMessage)

      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: '',
        createdAt: new Date(),
      }
      addMessage(convId, assistantMessage)

      setStreaming(true)
      setToolStatus(null)
      let accumulated = ''

      const controller = new AbortController()
      abortRef.current = controller

      try {
        for await (const chunk of streamChat(convId, content, controller.signal)) {
          if (chunk.type === 'token' && chunk.content) {
            accumulated += chunk.content
            updateLastAssistantMessage(convId, accumulated)
          } else if (chunk.type === 'tool') {
            if (chunk.toolPhase === 'start' && chunk.toolName) {
              const label = TOOL_LABELS[chunk.toolName] || `正在调用 ${chunk.toolName}...`
              setToolStatus(label)
            } else if (chunk.toolPhase === 'end') {
              setToolStatus(null)
            }
          } else if (chunk.type === 'error') {
            const errMsg = chunk.message || '服务异常'
            accumulated += `\n\n⚠️ ${errMsg}`
            updateLastAssistantMessage(convId, accumulated)
          } else if (chunk.type === 'done') {
            break
          }
        }
      } catch (err) {
        // 真实 API 失败时降级到 mock，确保用户体验
        console.error('[useChat] streaming error, falling back to mock:', err)
        if (!accumulated) {
          for await (const char of mockStreamChat(content)) {
            accumulated += char
            updateLastAssistantMessage(convId, accumulated)
          }
        }
      } finally {
        setStreaming(false)
        setToolStatus(null)
        abortRef.current = null
      }
    },
    [activeConversationId, isStreaming, createConversation, addMessage, updateLastAssistantMessage, setStreaming, setToolStatus]
  )

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort()
    setStreaming(false)
    setToolStatus(null)
  }, [setStreaming, setToolStatus])

  return { sendMessage, stopStreaming, isStreaming }
}
