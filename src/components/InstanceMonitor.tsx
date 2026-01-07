/**
 * InstanceMonitor component for monitoring workflow execution in real-time.
 * Combines workflow visualization with execution state overlay.
 */

import { useInstanceState, useWorkflowDefinition } from '../lib/hooks'
import { ExecutableWorkflow } from './ExecutableWorkflow'

/**
 * Props for InstanceMonitor component
 */
export interface InstanceMonitorProps {
  /** Base URL of the Dirigent API */
  apiBaseUrl: string

  /** Instance ID to monitor */
  instanceId: string

  /** Workflow name (for fetching definition) */
  workflowName: string

  /** Layout direction for workflow visualization */
  direction?: 'LR' | 'TB'

  /** Show loading state while fetching */
  showLoading?: boolean

  /** Custom CSS class */
  className?: string

  /** Custom styles */
  style?: React.CSSProperties
}

/**
 * InstanceMonitor component
 *
 * Monitors a workflow instance execution in real-time by fetching the workflow
 * definition and subscribing to execution state updates via SSE.
 *
 * This is a convenience component that combines:
 * - Workflow definition fetching (useWorkflowDefinition)
 * - Instance state monitoring (useInstanceState)
 * - Visual workflow display (ExecutableWorkflow)
 *
 * @example
 * ```tsx
 * <InstanceMonitor
 *   apiBaseUrl="http://localhost:8080"
 *   instanceId="abc-123"
 *   workflowName="sample_workflow"
 *   direction="LR"
 * />
 * ```
 */
export function InstanceMonitor({
  apiBaseUrl,
  instanceId,
  workflowName,
  direction = 'LR',
  showLoading = true,
  className = '',
  style,
}: InstanceMonitorProps) {
  const {
    workflow,
    yaml,
    loading: workflowLoading,
    error: workflowError,
  } = useWorkflowDefinition(apiBaseUrl, workflowName)

  const {
    state: instanceState,
    loading: stateLoading,
    error: stateError,
  } = useInstanceState(apiBaseUrl, instanceId)

  const loading = workflowLoading || stateLoading
  const error = workflowError || stateError

  if (loading && showLoading) {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          color: '#6b7280',
          ...style,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              border: '3px solid #e5e7eb',
              borderTopColor: '#3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 0.5rem',
            }}
          />
          <div style={{ fontSize: '0.875rem' }}>Loading instance monitor...</div>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={className}
        style={{
          padding: '1rem',
          color: '#ef4444',
          backgroundColor: '#fee2e2',
          borderRadius: '0.5rem',
          border: '1px solid #fca5a5',
          fontSize: '0.875rem',
          ...style,
        }}
      >
        <strong>Error:</strong> {error}
      </div>
    )
  }

  if (!workflow || !yaml) {
    return (
      <div
        className={className}
        style={{
          padding: '2rem',
          color: '#6b7280',
          textAlign: 'center',
          fontSize: '0.875rem',
          ...style,
        }}
      >
        Workflow not found
      </div>
    )
  }

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      {/* Header with instance info */}
      <div
        style={{
          padding: '1rem',
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Monitoring Instance
          </div>
          <div
            style={{
              fontSize: '0.875rem',
              fontFamily: 'monospace',
              color: '#111827',
              marginTop: '0.25rem',
            }}
          >
            {instanceId}
          </div>
        </div>
        {instanceState && (
          <StatusBadge
            status={instanceState.status}
            currentStep={instanceState.currentStepId}
          />
        )}
      </div>

      {/* Workflow visualization */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <ExecutableWorkflow
          yaml={yaml}
          instanceId={instanceId}
          apiBaseUrl={apiBaseUrl}
          direction={direction}
          showLoading={false} // We handle loading at this level
        />
      </div>
    </div>
  )
}

/**
 * Status badge component
 */
interface StatusBadgeProps {
  status: string
  currentStep?: string | null
}

function StatusBadge({ status, currentStep }: StatusBadgeProps) {
  const statusColors = {
    running: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
    completed: { bg: '#d1fae5', border: '#10b981', text: '#065f46' },
    failed: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
  }

  const colors =
    statusColors[status.toLowerCase() as keyof typeof statusColors] ||
    statusColors.running

  const isRunning = status.toLowerCase() === 'running'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '0.25rem',
      }}
    >
      <div
        style={{
          padding: '0.25rem 0.75rem',
          borderRadius: '0.25rem',
          fontSize: '0.75rem',
          fontWeight: 600,
          backgroundColor: colors.bg,
          color: colors.text,
          border: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        {isRunning && (
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: colors.text,
              animation: 'pulse 2s infinite',
            }}
          />
        )}
        {status.toUpperCase()}
      </div>
      {currentStep && isRunning && (
        <div
          style={{
            fontSize: '0.75rem',
            color: '#6b7280',
          }}
        >
          Current: {currentStep}
        </div>
      )}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
