import { useEffect } from 'react'
import Sidebar from './components/Sidebar'
import AuthGuard from './components/AuthGuard'
import Dashboard from './pages/Dashboard'
import GoLive from './pages/GoLive'
import Products from './pages/Products'
import Analytics from './pages/Analytics'
import Replays from './pages/Replays'
import Settings from './pages/Settings'
import Billing from './pages/Billing'
import TeamManagement from './pages/TeamManagement'
import ShopifyConnect from './pages/ShopifyConnect'
import ComplianceReporting from './pages/ComplianceReporting'
import WhiteLabel from './pages/WhiteLabel'
import { useAppStore } from './stores/appStore'

function AppContent(): JSX.Element {
  const { currentPage, setCurrentPage, isLive, setIsLive } = useAppStore()

  useEffect(() => {
    window.streamSync?.onNavigate((page: string) => {
      setCurrentPage(page)
    })
  }, [setCurrentPage])

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
      case 'billing':
        return <Billing />
      case 'team':
        return <TeamManagement />
      case 'shopify':
        return <ShopifyConnect />
      case 'compliance':
        return <ComplianceReporting />
      case 'whitelabel':
        return <WhiteLabel />
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

function App(): JSX.Element {
  return (
    <AuthGuard>
      <AppContent />
    </AuthGuard>
  )
}

export default App
