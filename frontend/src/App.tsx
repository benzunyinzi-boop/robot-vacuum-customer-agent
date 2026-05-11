import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ChatPage } from './pages/ChatPage'
import { KnowledgePage } from './pages/KnowledgePage'
import { getStoredTheme } from './lib/api'

function App() {
  const initialTheme = getStoredTheme()

  return (
    <div id="app-root" className={initialTheme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/knowledge" element={<KnowledgePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
