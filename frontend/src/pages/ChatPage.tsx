import { Header } from '../components/layout/Header'
import { Sidebar } from '../components/sidebar/Sidebar'
import { ChatArea } from '../components/chat/ChatArea'

export function ChatPage() {
  return (
    <div className="flex h-screen theme-transition dark:bg-dark-bg light:bg-gray-50">
      <Sidebar />
      <div className="hidden md:block divider-glow" />
      <main className="flex-1 flex flex-col min-w-0">
        <Header />
        <ChatArea />
      </main>
    </div>
  )
}
