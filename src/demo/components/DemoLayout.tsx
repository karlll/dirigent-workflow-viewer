/**
 * Main layout component for demo application
 */

import { Header } from './Header'
import { Sidebar } from './Sidebar'

interface DemoLayoutProps {
  apiBaseUrl: string
  onApiBaseUrlChange: (url: string) => void
  activeView: 'workflows' | 'instances'
  onViewChange: (view: 'workflows' | 'instances') => void
  children: React.ReactNode
  onSettingsClick: () => void
  connected: boolean
  sseConnected: boolean
  workflowCount: number
  runningInstances: number
  totalInstances: number
}

export function DemoLayout({
  apiBaseUrl,
  onApiBaseUrlChange,
  activeView,
  onViewChange,
  children,
  onSettingsClick,
  connected,
  sseConnected,
  workflowCount,
  runningInstances,
  totalInstances,
}: DemoLayoutProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Header
        apiBaseUrl={apiBaseUrl}
        onSettingsClick={onSettingsClick}
        connected={connected}
        sseConnected={sseConnected}
      />

      {/* Main Content Area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <Sidebar
          activeView={activeView}
          onViewChange={onViewChange}
          workflowCount={workflowCount}
          runningInstances={runningInstances}
          totalInstances={totalInstances}
        />

        {/* Content */}
        <main
          style={{
            flex: 1,
            overflow: 'auto',
            backgroundColor: 'white',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
