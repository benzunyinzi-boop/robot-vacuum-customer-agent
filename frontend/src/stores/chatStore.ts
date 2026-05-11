import { create } from 'zustand'
import type { Conversation, Message } from '../types'

interface ChatState {
  conversations: Conversation[]
  activeConversationId: string | null
  isStreaming: boolean
  toolStatus: string | null

  createConversation: () => string
  deleteConversation: (id: string) => void
  setActiveConversation: (id: string) => void
  addMessage: (conversationId: string, message: Message) => void
  updateLastAssistantMessage: (conversationId: string, content: string) => void
  setStreaming: (streaming: boolean) => void
  setToolStatus: (status: string | null) => void
  getActiveConversation: () => Conversation | undefined
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  isStreaming: false,
  toolStatus: null,

  createConversation: () => {
    const id = crypto.randomUUID()
    const conversation: Conversation = {
      id,
      title: '新对话',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    set((state) => ({
      conversations: [conversation, ...state.conversations],
      activeConversationId: id,
    }))
    return id
  },

  deleteConversation: (id) => {
    set((state) => {
      const filtered = state.conversations.filter((c) => c.id !== id)
      const newActiveId =
        state.activeConversationId === id
          ? filtered[0]?.id ?? null
          : state.activeConversationId
      return { conversations: filtered, activeConversationId: newActiveId }
    })
  },

  setActiveConversation: (id) => {
    set({ activeConversationId: id })
  },

  addMessage: (conversationId, message) => {
    set((state) => ({
      conversations: state.conversations.map((c) => {
        if (c.id !== conversationId) return c
        const updated = {
          ...c,
          messages: [...c.messages, message],
          updatedAt: new Date(),
        }
        if (message.role === 'user' && c.messages.length === 0) {
          const cleaned = message.content.replace(/\s+/g, ' ').trim()
          updated.title = cleaned.length > 20 ? `${cleaned.slice(0, 20)}...` : cleaned || '新对话'
        }
        return updated
      }),
    }))
  },

  updateLastAssistantMessage: (conversationId, content) => {
    set((state) => ({
      conversations: state.conversations.map((c) => {
        if (c.id !== conversationId) return c
        const messages = [...c.messages]
        const lastIdx = messages.length - 1
        if (lastIdx >= 0 && messages[lastIdx].role === 'assistant') {
          messages[lastIdx] = { ...messages[lastIdx], content }
        }
        return { ...c, messages, updatedAt: new Date() }
      }),
    }))
  },

  setStreaming: (streaming) => {
    set({ isStreaming: streaming })
  },

  setToolStatus: (status) => {
    set({ toolStatus: status })
  },

  getActiveConversation: () => {
    const { conversations, activeConversationId } = get()
    return conversations.find((c) => c.id === activeConversationId)
  },
}))
