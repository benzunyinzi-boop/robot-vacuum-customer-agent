import { useChatStore } from '../../stores/chatStore'

export function TypingIndicator() {
  const toolStatus = useChatStore((s) => s.toolStatus)

  return (
    <div className="flex gap-3 fade-in">
      <div className="w-8 h-8 rounded-lg gradient-bg flex-shrink-0 flex items-center justify-center">
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <div className="ai-bubble rounded-2xl rounded-tl-sm px-4 py-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full gradient-bg typing-dot"></div>
          <div className="w-2 h-2 rounded-full gradient-bg typing-dot"></div>
          <div className="w-2 h-2 rounded-full gradient-bg typing-dot"></div>
          <span className="text-xs dark:text-gray-400 light:text-gray-500 ml-2">
            {toolStatus || '正在思考...'}
          </span>
        </div>
      </div>
    </div>
  )
}
