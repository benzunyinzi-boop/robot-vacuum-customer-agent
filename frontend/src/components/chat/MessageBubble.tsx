import { Copy, RefreshCw, Check } from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Message } from '../../types'
import { CodeBlock } from './CodeBlock'

interface Props {
  message: Message
  isStreaming?: boolean
}

export function MessageBubble({ message, isStreaming = false }: Props) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isUser) {
    return (
      <div className="flex justify-end fade-in">
        <div>
          <div className="user-bubble rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] ml-auto">
            <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
          <p className="text-xs dark:text-gray-600 light:text-gray-400 mt-1.5 text-right mr-1">
            {formatTime(message.createdAt)}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 fade-in">
      <div className="w-8 h-8 rounded-lg gradient-bg flex-shrink-0 flex items-center justify-center">
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <div className="flex-1">
        <div className="ai-bubble rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
          <div className="text-sm dark:text-gray-200 light:text-gray-700 leading-relaxed prose prose-sm dark:prose-invert light:prose max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code(props) {
                  const { children, className, node, ...rest } = props as any
                  const match = /language-(\w+)/.exec(className || '')
                  const isInline = !match && !String(children).includes('\n')

                  if (isInline) {
                    return (
                      <code
                        {...rest}
                        className="dark:bg-gray-800 light:bg-gray-100 dark:text-pink-300 light:text-pink-600 px-1.5 py-0.5 rounded text-[0.9em] font-mono"
                      >
                        {children}
                      </code>
                    )
                  }

                  return (
                    <CodeBlock
                      language={match ? match[1] : ''}
                      value={String(children).replace(/\n$/, '')}
                    />
                  )
                },
                pre({ children }) {
                  return <>{children}</>
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
            {isStreaming && <span className="typing-cursor" />}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2 ml-1">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md dark:hover:bg-dark-card light:hover:bg-gray-200 transition-colors group"
            title={copied ? '已复制' : '复制'}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-gray-500 dark:group-hover:text-gray-300 light:group-hover:text-gray-600" />
            )}
          </button>
          <button
            className="p-1.5 rounded-md dark:hover:bg-dark-card light:hover:bg-gray-200 transition-colors group"
            title="重新生成"
          >
            <RefreshCw className="w-3.5 h-3.5 text-gray-500 dark:group-hover:text-gray-300 light:group-hover:text-gray-600" />
          </button>
          <p className="text-xs dark:text-gray-600 light:text-gray-400 ml-2">{formatTime(message.createdAt)}</p>
        </div>
      </div>
    </div>
  )
}

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}
