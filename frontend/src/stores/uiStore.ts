import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  sidebarCollapsed: boolean
  sidebarMobileOpen: boolean
  searchQuery: string

  toggleSidebar: () => void
  setSidebarMobileOpen: (open: boolean) => void
  setSearchQuery: (q: string) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      sidebarMobileOpen: false,
      searchQuery: '',

      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarMobileOpen: (open) => set({ sidebarMobileOpen: open }),
      setSearchQuery: (q) => set({ searchQuery: q }),
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    }
  )
)
