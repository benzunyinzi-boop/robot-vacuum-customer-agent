import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Check, Copy } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'

interface Props {
  language: string
  value: string
}

export function CodeBlock({ language, value }: Props) {
  const { theme } = useTheme()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group my-3 rounded-lg overflow-hidden border dark:border-dark-border light:border-gray-200">
      <div className="flex items-center justify-between px-4 py-2 dark:bg-[#282c34] light:bg-gray-100 border-b dark:border-dark-border light:border-gray-200">
        <span className="text-xs font-mono dark:text-gray-400 light:text-gray-600">
          {language || 'text'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs dark:text-gray-400 light:text-gray-600 dark:hover:text-gray-200 light:hover:text-gray-900 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400">已复制</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>复制</span>
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={theme === 'dark' ? oneDark : oneLight}
        customStyle={{
          margin: 0,
          padding: '12px 16px',
          fontSize: '13px',
          background: theme === 'dark' ? '#1e1e1e' : '#fafafa',
        }}
        codeTagProps={{
          style: { fontFamily: 'JetBrains Mono, Menlo, monospace' },
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  )
}
