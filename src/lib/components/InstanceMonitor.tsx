/**
 * Real-time instance monitoring component.
 * Displays instance details and subscribes to SSE updates for running instances.
 */

import { useInstanceDetails, useWorkflowDefinition } from '../hooks'
import { ExecutableWorkflow } from '../../components/ExecutableWorkflow'

export interface InstanceMonitorProps {
  /** Instance ID to monitor */
  instanceId: string
  /** Base URL for the Dirigent API */
  apiBaseUrl: string
  /** Optional: layout direction for workflow visualization */
  direction?: 'LR' | 'TB'
}

/**
 * Component that monitors a workflow instance in real-time.
 * 
 * Features:
 * - Fetches instance details from API
 * - Subscribes to SSE for real-time updates (if instance is running)
 * - Displays workflow visualization with execution state
 * - Shows instance metadata and status
 * 
 * @example
 * ```tsx
 * <InstanceMonitor
 *   instanceId="abc123"
 *   apiBaseUrl="http://localhost:8080"
 * />
 * ```
 */
export function InstanceMonitor({
  instanceId,
  apiBaseUrl,
  direction = 'LR',
}: InstanceMonitorProps) {
  const { instance, loading, error } = useInstanceDetails(instanceId, apiBaseUrl)
  
  // Fetch the workflow definition for visualization
  const { 
    workflow, 
    loading: workflowLoading 
  } = useWorkflowDefinition(
    instance?.workflowName || '', 
    apiBaseUrl
  )

  // No need to subscribe here - ExecutableWorkflow handles SSE subscriptions

  if (loading || workflowLoading) {
    return (
      <div
        style={{
          padding: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280',
        }}
      >
        Loading instance details...
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{
          padding: '2rem',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '0.375rem',
          margin: '1rem',
        }}
      >
        <h3
          style={{
            margin: '0 0 0.5rem 0',
            fontSize: '1rem',
            fontWeight: 600,
            color: '#991b1b',
          }}
        >
          Error loading instance
        </h3>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#7f1d1d' }}>
          {error}
        </p>
      </div>
    )
  }

  if (!instance || !workflow) {
    return (
      <div
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#6b7280',
        }}
      >
        Instance not found
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Instance Header */}
      <header
        style={{
          padding: '1rem',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: 'white',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '1.125rem',
              fontWeight: 600,
            }}
          >
            {instance.workflowName}
          </h2>
          <span
            style={{
              fontSize: '0.875rem',
              padding: '0.25rem 0.75rem',
              borderRadius: '0.25rem',
              fontWeight: 500,
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
            display: 'flex',
            gap: '1.5rem',
            fontSize: '0.75rem',
            color: '#6b7280',
          }}
        >
          <span>
            ID:{' '}
            <code
              style={{
                fontFamily: 'ui-monospace, monospace',
                backgroundColor: '#f3f4f6',
                padding: '0.125rem 0.25rem',
                borderRadius: '0.125rem',
              }}
            >
              {instance.id}
            </code>
          </span>
          <span>Version: {instance.workflowVersion}</span>
          <span>Started: {new Date(instance.startedAt).toLocaleString()}</span>
          {instance.completedAt && (
            <span>
              Completed: {new Date(instance.completedAt).toLocaleString()}
            </span>
          )}
          {instance.durationMs !== null && (
            <span>Duration: {instance.durationMs}ms</span>
          )}
        </div>

        {instance.error && (
          <div
            style={{
              marginTop: '0.5rem',
              padding: '0.5rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.25rem',
              fontSize: '0.75rem',
              color: '#991b1b',
            }}
          >
            <strong>Error:</strong> {instance.error}
            {instance.failedStep && <> (Step: {instance.failedStep})</>}
          </div>
        )}
      </header>

      {/* Workflow Visualization */}
      <div style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
        <ExecutableWorkflow
          workflow={workflow}
          instanceId={instance.id}
          apiBaseUrl={apiBaseUrl}
          direction={direction}
        />
      </div>
    </div>
  )
}
