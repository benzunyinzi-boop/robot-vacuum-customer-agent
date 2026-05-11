import { Plus, Trash2, Search, PanelLeftClose, PanelLeftOpen, MessageSquare, X } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { useChatStore } from '../../stores/chatStore'
import { useUIStore } from '../../stores/uiStore'
import type { Conversation } from '../../types'

export function Sidebar() {
  const { conversations, activeConversationId, createConversation, setActiveConversation, deleteConversation } =
    useChatStore()
  const {
    sidebarCollapsed,
    sidebarMobileOpen,
    searchQuery,
    toggleSidebar,
    setSidebarMobileOpen,
    setSearchQuery,
  } = useUIStore()
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Cmd+K / Ctrl+K 聚焦搜索框
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return conversations
    const q = searchQuery.toLowerCase()
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.messages.some((m) => m.content.toLowerCase().includes(q))
    )
  }, [conversations, searchQuery])

  const grouped = groupByDate(filtered)

  // 折叠态：只显示图标
  if (sidebarCollapsed) {
    return (
      <aside className="hidden md:flex w-[60px] flex-col items-center py-4 theme-transition dark:bg-dark-sidebar light:bg-white border-r dark:border-dark-border light:border-gray-200">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg dark:hover:bg-dark-card light:hover:bg-gray-100 transition-colors mb-3"
          title="展开侧边栏"
        >
          <PanelLeftOpen className="w-5 h-5 dark:text-gray-400 light:text-gray-600" />
        </button>
        <button
          onClick={() => createConversation()}
          className="p-2 rounded-lg gradient-bg text-white hover:opacity-90 transition-opacity mb-3"
          title="新建对话"
        >
          <Plus className="w-5 h-5" />
        </button>
        <div className="flex-1 overflow-y-auto scrollbar-thin w-full flex flex-col items-center gap-1 px-2">
          {conversations.slice(0, 8).map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveConversation(conv.id)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                conv.id === activeConversationId
                  ? 'dark:bg-dark-card light:bg-gray-100'
                  : 'dark:hover:bg-dark-card light:hover:bg-gray-100'
              }`}
              title={conv.title}
            >
              <MessageSquare className="w-4 h-4 dark:text-gray-400 light:text-gray-600" />
            </button>
          ))}
        </div>
      </aside>
    )
  }

  const sidebarContent = (
    <>
      <div className="p-4 border-b dark:border-dark-border light:border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => createConversation()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg gradient-bg text-white font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            新建对话
          </button>
          <button
            onClick={toggleSidebar}
            className="hidden md:flex p-2 rounded-lg dark:hover:bg-dark-card light:hover:bg-gray-100 transition-colors"
            title="折叠侧边栏"
          >
            <PanelLeftClose className="w-5 h-5 dark:text-gray-400 light:text-gray-600" />
          </button>
          <button
            onClick={() => setSidebarMobileOpen(false)}
            className="md:hidden p-2 rounded-lg dark:hover:bg-dark-card light:hover:bg-gray-100 transition-colors"
            title="关闭"
          >
            <X className="w-5 h-5 dark:text-gray-400 light:text-gray-600" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 dark:text-gray-500 light:text-gray-400 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索对话..."
            className="w-full pl-9 pr-9 py-2 text-sm rounded-lg dark:bg-dark-card light:bg-gray-100 dark:text-gray-200 light:text-gray-800 dark:placeholder-gray-500 light:placeholder-gray-400 outline-none border border-transparent focus:border-accent-blue/50"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded dark:hover:bg-dark-bg light:hover:bg-gray-200"
            >
              <X className="w-3 h-3 dark:text-gray-400 light:text-gray-500" />
            </button>
          ) : (
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono dark:text-gray-500 light:text-gray-400 dark:bg-dark-bg light:bg-white px-1.5 py-0.5 rounded border dark:border-dark-border light:border-gray-200">
              ⌘K
            </kbd>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-1">
        {grouped.map(({ label, items }) => (
          <div key={label}>
            <p className="text-xs font-medium dark:text-gray-500 light:text-gray-400 px-3 py-2 uppercase tracking-wider">
              {label}
            </p>
            {items.map((conv) => (
              <div
                key={conv.id}
                onClick={() => {
                  setActiveConversation(conv.id)
                  setSidebarMobileOpen(false)
                }}
                className={`group rounded-lg px-3 py-2.5 cursor-pointer flex items-center justify-between ${
                  conv.id === activeConversationId
                    ? 'sidebar-item-active'
                    : 'dark:hover:bg-dark-card light:hover:bg-gray-100 transition-colors border-l-[3px] border-transparent'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm truncate ${
                      conv.id === activeConversationId
                        ? 'dark:text-gray-200 light:text-gray-800 font-medium'
                        : 'dark:text-gray-300 light:text-gray-700'
                    }`}
                  >
                    {conv.title}
                  </p>
                  <p className="text-xs dark:text-gray-500 light:text-gray-400 mt-0.5">
                    {formatTime(conv.updatedAt)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteConversation(conv.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5 text-gray-500 hover:text-red-400" />
                </button>
              </div>
            ))}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm dark:text-gray-500 light:text-gray-400">
              {searchQuery ? '未找到匹配的对话' : '暂无对话记录'}
            </p>
          </div>
        )}
      </div>
    </>
  )

  return (
    <>
      {/* 桌面端侧边栏 */}
      <aside className="hidden md:flex w-[280px] flex-col theme-transition dark:bg-dark-sidebar light:bg-white border-r dark:border-dark-border light:border-gray-200">
        {sidebarContent}
      </aside>

      {/* 移动端抽屉 */}
      {sidebarMobileOpen && (
        <>
          <div
            onClick={() => setSidebarMobileOpen(false)}
            className="md:hidden fixed inset-0 bg-black/50 z-40 fade-in"
          />
          <aside className="md:hidden fixed top-0 left-0 bottom-0 w-[280px] flex flex-col theme-transition dark:bg-dark-sidebar light:bg-white border-r dark:border-dark-border light:border-gray-200 z-50 slide-in-left">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  )
}

function groupByDate(conversations: Conversation[]) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)

  const groups: { label: string; items: Conversation[] }[] = [
    { label: '今天', items: [] },
    { label: '昨天', items: [] },
    { label: '更早', items: [] },
  ]

  for (const conv of conversations) {
    const d = new Date(conv.updatedAt)
    if (d >= today) groups[0].items.push(conv)
    else if (d >= yesterday) groups[1].items.push(conv)
    else groups[2].items.push(conv)
  }

  return groups.filter((g) => g.items.length > 0)
}

function formatTime(date: Date) {
  const now = new Date()
  const d = new Date(date)
  const diff = now.getTime() - d.getTime()

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}
