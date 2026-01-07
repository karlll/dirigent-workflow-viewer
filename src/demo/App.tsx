/**
 * Demo application main component
 */

import { useState, useEffect } from 'react'
import { DemoLayout } from './components/DemoLayout'
import { SettingsPanel, loadApiUrl } from './components/SettingsPanel'
import { WorkflowBrowser } from '../components/WorkflowBrowser'
import { WorkflowDetailView } from './components/WorkflowDetailView'
import { EmptyState } from './components/EmptyState'
import { useWorkflows } from '../lib/hooks'
import { eventManager } from '../lib/eventManager'

export function App() {
  const [apiBaseUrl, setApiBaseUrl] = useState(() => loadApiUrl())
  const [activeView, setActiveView] = useState<'workflows' | 'instances'>(
    'workflows'
  )
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [sseConnected, setSseConnected] = useState(false)

  // Load workflows for counts
  const { workflows } = useWorkflows(apiBaseUrl)

  // Check API connection
  const [connected, setConnected] = useState(false)
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/health`)
        setConnected(response.ok)
      } catch {
        setConnected(false)
      }
    }
    checkConnection()
    const interval = setInterval(checkConnection, 5000)
    return () => clearInterval(interval)
  }, [apiBaseUrl])

  // Monitor SSE connection
  useEffect(() => {
    const updateSseStatus = () => {
      setSseConnected(eventManager.isEventSourceConnected())
    }
    
    // Check initial state
    updateSseStatus()
    
    // Set up periodic check
    const interval = setInterval(updateSseStatus, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleApiBaseUrlChange = (newUrl: string) => {
    setApiBaseUrl(newUrl)
    // Reset selections when API changes
    setSelectedWorkflow(null)
  }

  return (
    <>
      <DemoLayout
        activeView={activeView}
        onViewChange={setActiveView}
        onSettingsClick={() => setShowSettings(true)}
        connected={connected}
        sseConnected={sseConnected}
        workflowCount={workflows?.length || 0}
        runningInstances={0}
        totalInstances={0}
      >
        {activeView === 'workflows' && (
          <div
            style={{
              display: 'flex',
              height: '100%',
              overflow: 'hidden',
            }}
          >
            {/* Workflow Browser Panel */}
            <aside
              style={{
                width: '300px',
                borderRight: '1px solid #e5e7eb',
                overflow: 'auto',
                backgroundColor: '#f9fafb',
              }}
            >
              <WorkflowBrowser
                apiBaseUrl={apiBaseUrl}
                selectedWorkflow={selectedWorkflow || undefined}
                onSelect={setSelectedWorkflow}
                mode="list"
                showMetadata
              />
            </aside>

            {/* Workflow Detail Panel */}
            <main style={{ flex: 1, overflow: 'hidden' }}>
              {selectedWorkflow ? (
                <WorkflowDetailView
                  workflowName={selectedWorkflow}
                  apiBaseUrl={apiBaseUrl}
                />
              ) : (
                <EmptyState
                  message="Select a workflow from the list to view its details"
                  icon="📋"
                />
              )}
            </main>
          </div>
        )}

        {activeView === 'instances' && (
          <EmptyState
            message="Instances view - Coming soon!"
            icon="📊"
          />
        )}
      </DemoLayout>

      {/* Settings Panel */}
      {showSettings && (
        <SettingsPanel
          apiBaseUrl={apiBaseUrl}
          onApiBaseUrlChange={handleApiBaseUrlChange}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  )
}

export default App
