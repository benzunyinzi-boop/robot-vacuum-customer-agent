import { useChat } from '../../hooks/useChat'
import { Info, AlertTriangle, ShoppingCart, FileBarChart } from 'lucide-react'

const quickQuestions = [
  {
    icon: Info,
    iconBg: 'dark:bg-blue-500/10 light:bg-blue-50',
    iconColor: 'dark:text-blue-400 light:text-blue-500',
    title: '功能介绍',
    question: '扫地机器人有哪些主要功能？',
  },
  {
    icon: AlertTriangle,
    iconBg: 'dark:bg-amber-500/10 light:bg-amber-50',
    iconColor: 'dark:text-amber-400 light:text-amber-500',
    title: '故障排除',
    question: '机器人无法回充怎么办？',
  },
  {
    icon: ShoppingCart,
    iconBg: 'dark:bg-green-500/10 light:bg-green-50',
    iconColor: 'dark:text-green-400 light:text-green-500',
    title: '选购指南',
    question: '如何选购适合的扫地机器人？',
  },
  {
    icon: FileBarChart,
    iconBg: 'dark:bg-purple-500/10 light:bg-purple-50',
    iconColor: 'dark:text-purple-400 light:text-purple-500',
    title: '使用报告',
    question: '生成我的个性化使用报告',
  },
]

export function WelcomeScreen() {
  const { sendMessage } = useChat()

  return (
    <div className="flex-1 flex items-center justify-center overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-6 logo-pulse">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h2 className="text-2xl font-semibold dark:text-white light:text-gray-900 mb-2">
          你好，我是智扫通智能客服
        </h2>
        <p className="dark:text-gray-400 light:text-gray-500 mb-8">
          专注于扫地机器人和扫拖一体机器人的咨询服务，有什么可以帮你？
        </p>

        <div className="grid grid-cols-2 gap-3">
          {quickQuestions.map((item) => (
            <div
              key={item.title}
              onClick={() => sendMessage(item.question)}
              className="quick-card rounded-xl p-4 cursor-pointer text-left"
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg ${item.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <item.icon className={`w-4 h-4 ${item.iconColor}`} />
                </div>
                <div>
                  <p className="text-sm font-medium dark:text-gray-200 light:text-gray-800">{item.title}</p>
                  <p className="text-xs dark:text-gray-400 light:text-gray-500 mt-1">{item.question}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
