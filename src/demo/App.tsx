/**
 * Demo application main component
 */

import { useState, useEffect } from 'react'
import { DemoLayout } from './components/DemoLayout'
import { SettingsPanel, loadApiUrl } from './components/SettingsPanel'
import { WorkflowBrowser } from '../components/WorkflowBrowser'
import { WorkflowDetailView } from './components/WorkflowDetailView'
import { InstanceDetailView } from './components/InstanceDetailView'
import { EmptyState } from './components/EmptyState'
import { useWorkflows, useInstances } from '../lib/hooks'
import { eventManager } from '../lib/eventManager'

export function App() {
  const [apiBaseUrl, setApiBaseUrl] = useState(() => loadApiUrl())
  const [activeView, setActiveView] = useState<'workflows' | 'instances'>(
    'workflows'
  )
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [sseConnected, setSseConnected] = useState(false)

  // Load workflows and instances for counts
  const { workflows } = useWorkflows(apiBaseUrl)
  const { instances } = useInstances(apiBaseUrl)

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
    setSelectedInstance(null)
  }

  // Calculate instance counts
  const runningInstances =
    instances?.filter((i) => i.status === 'RUNNING').length || 0
  const totalInstances = instances?.length || 0

  return (
    <>
      <DemoLayout
        activeView={activeView}
        onViewChange={setActiveView}
        onSettingsClick={() => setShowSettings(true)}
        connected={connected}
        sseConnected={sseConnected}
        workflowCount={workflows?.length || 0}
        runningInstances={runningInstances}
        totalInstances={totalInstances}
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
          <div
            style={{
              display: 'flex',
              height: '100%',
              overflow: 'hidden',
            }}
          >
            {/* Instance Browser Panel */}
            <aside
              style={{
                width: '300px',
                borderRight: '1px solid #e5e7eb',
                overflow: 'auto',
                backgroundColor: '#f9fafb',
              }}
            >
              <div
                style={{
                  padding: '1rem',
                  borderBottom: '1px solid #e5e7eb',
                  backgroundColor: 'white',
                }}
              >
                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                  Instances
                </h2>
                <p
                  style={{
                    margin: '0.5rem 0 0 0',
                    fontSize: '0.75rem',
                    color: '#6b7280',
                  }}
                >
                  {totalInstances} total, {runningInstances} running
                </p>
              </div>
              <div>
                {instances && instances.length > 0 ? (
                  instances.map((instance) => (
                    <button
                      key={instance.id}
                      onClick={() => setSelectedInstance(instance.id)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        textAlign: 'left',
                        border: 'none',
                        borderBottom: '1px solid #e5e7eb',
                        backgroundColor:
                          selectedInstance === instance.id
                            ? '#eff6ff'
                            : 'white',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        if (selectedInstance !== instance.id) {
                          e.currentTarget.style.backgroundColor = '#f9fafb'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedInstance !== instance.id) {
                          e.currentTarget.style.backgroundColor = 'white'
                        }
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '0.25rem',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            fontFamily: 'ui-monospace, monospace',
                          }}
                        >
                          {instance.id.substring(0, 8)}...
                        </span>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '0.25rem',
                            backgroundColor:
                              instance.status === 'RUNNING'
                                ? '#dbeafe'
                                : instance.status === 'COMPLETED'
                                  ? '#d1fae5'
                                  : '#fee2e2',
                            color:
                              instance.status === 'RUNNING'
                                ? '#1e40af'
                                : instance.status === 'COMPLETED'
                                  ? '#065f46'
                                  : '#991b1b',
                          }}
                        >
                          {instance.status}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                        }}
                      >
                        {instance.workflowName} v{instance.workflowVersion}
                      </div>
                      <div
                        style={{
                          fontSize: '0.625rem',
                          color: '#9ca3af',
                          marginTop: '0.25rem',
                        }}
                      >
                        {new Date(instance.startedAt).toLocaleString()}
                      </div>
                    </button>
                  ))
                ) : (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                      No instances found
                    </p>
                  </div>
                )}
              </div>
            </aside>

            {/* Instance Detail Panel */}
            <main style={{ flex: 1, overflow: 'hidden' }}>
              <InstanceDetailView
                instanceId={selectedInstance}
                apiBaseUrl={apiBaseUrl}
              />
            </main>
          </div>
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
