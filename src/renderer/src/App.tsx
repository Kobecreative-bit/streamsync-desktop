import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import GoLive from './pages/GoLive'
import Products from './pages/Products'
import Analytics from './pages/Analytics'
import Replays from './pages/Replays'
import Settings from './pages/Settings'

function App(): JSX.Element {
  const [currentPage, setCurrentPage] = useState<string>('dashboard')
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    window.streamSync?.onNavigate((page: string) => {
      setCurrentPage(page)
    })
  }, [])

  const renderPage = (): JSX.Element => {
    switch (currentPage) {
      case 'golive':
        return <GoLive isLive={isLive} setIsLive={setIsLive} />
      case 'products':
        return <Products />
      case 'analytics':
        return <Analytics />
      case 'replays':
        return <Replays />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard onNavigate={setCurrentPage} />
    }
  }

  return (
    <div className="flex h-screen bg-bg-primary">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isLive={isLive}
      />
      <main className="flex-1 overflow-hidden">{renderPage()}</main>
    </div>
  )
}

export default App
