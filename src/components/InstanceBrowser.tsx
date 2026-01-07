/**
 * InstanceBrowser component for browsing and filtering workflow instances.
 */

import { useInstances } from '../lib/hooks'
import type { InstanceSummaryDto } from '../types/api'

/**
 * Props for InstanceBrowser component
 */
export interface InstanceBrowserProps {
  /** Base URL of the Dirigent API */
  apiBaseUrl: string

  /** Filter by workflow name */
  workflowName?: string

  /** Filter by status */
  status?: 'RUNNING' | 'COMPLETED' | 'FAILED'

  /** Currently selected instance ID */
  selectedInstance?: string

  /** Callback when instance is selected */
  onSelect?: (instanceId: string) => void

  /** Auto-refresh interval in milliseconds (0 to disable) */
  refreshInterval?: number

  /** Show detailed metadata */
  showMetadata?: boolean

  /** Maximum number of instances to display */
  limit?: number

  /** Custom CSS class */
  className?: string

  /** Custom styles */
  style?: React.CSSProperties
}

/**
 * InstanceBrowser component
 *
 * Fetches and displays workflow execution instances from the Dirigent API.
 * Supports filtering by workflow, status, and auto-refresh for monitoring.
 *
 * @example
 * ```tsx
 * <InstanceBrowser
 *   apiBaseUrl="http://localhost:8080"
 *   status="RUNNING"
 *   onSelect={(id) => setSelectedInstance(id)}
 *   refreshInterval={5000}
 *   showMetadata
 * />
 * ```
 */
export function InstanceBrowser({
  apiBaseUrl,
  workflowName,
  status,
  selectedInstance,
  onSelect,
  refreshInterval,
  showMetadata = false,
  limit = 50,
  className = '',
  style,
}: InstanceBrowserProps) {
  const { instances, total, loading, error } = useInstances(apiBaseUrl, {
    workflowName,
    status,
    limit,
    refreshInterval,
  })

  if (loading) {
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
          <div style={{ fontSize: '0.875rem' }}>Loading instances...</div>
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

  if (instances.length === 0) {
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
        No instances found
        {(workflowName || status) && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
            {workflowName && `Workflow: ${workflowName}`}
            {workflowName && status && ' • '}
            {status && `Status: ${status}`}
          </div>
        )}
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
      {/* Header with count */}
      <div
        style={{
          padding: '0.75rem 1rem',
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
          fontSize: '0.875rem',
          color: '#6b7280',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          {total} instance{total !== 1 ? 's' : ''}
          {(workflowName || status) && (
            <span style={{ marginLeft: '0.5rem' }}>
              {workflowName && `• ${workflowName}`}
              {workflowName && status && ' '}
              {status && `• ${status}`}
            </span>
          )}
        </div>
        {refreshInterval && refreshInterval > 0 && (
          <div style={{ fontSize: '0.75rem' }}>
            Auto-refresh: {refreshInterval / 1000}s
          </div>
        )}
      </div>

      {/* Instance list */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          padding: '0.5rem',
          maxHeight: '600px',
          overflowY: 'auto',
        }}
      >
        {instances.map((instance) => (
          <InstanceItem
            key={instance.id}
            instance={instance}
            selected={selectedInstance === instance.id}
            showMetadata={showMetadata}
            onClick={() => onSelect?.(instance.id)}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * InstanceItem component for displaying a single instance
 */
interface InstanceItemProps {
  instance: InstanceSummaryDto
  selected: boolean
  showMetadata: boolean
  onClick: () => void
}

function InstanceItem({ instance, selected, showMetadata, onClick }: InstanceItemProps) {
  const statusColors: Record<string, { bg: string; border: string; text: string }> = {
    RUNNING: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
    COMPLETED: { bg: '#d1fae5', border: '#10b981', text: '#065f46' },
    FAILED: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
  }

  const colors = statusColors[instance.status] || statusColors.RUNNING
  const isRunning = instance.status === 'RUNNING'

  // Format duration
  const formatDuration = (ms: number | null) => {
    if (ms === null) return null
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.75rem',
        border: `2px solid ${selected ? colors.border : '#e5e7eb'}`,
        borderRadius: '0.5rem',
        backgroundColor: selected ? colors.bg : 'white',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = '#d1d5db'
          e.currentTarget.style.backgroundColor = '#f9fafb'
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = '#e5e7eb'
          e.currentTarget.style.backgroundColor = 'white'
        }
      }}
      aria-label={`Select instance ${instance.id}`}
      aria-pressed={selected}
    >
      {/* Status badge */}
      <div
        style={{
          position: 'absolute',
          top: '0.75rem',
          right: '0.75rem',
          padding: '0.25rem 0.5rem',
          borderRadius: '0.25rem',
          fontSize: '0.75rem',
          fontWeight: 600,
          backgroundColor: colors.bg,
          color: colors.text,
          border: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
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
        {instance.status}
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      {/* Instance ID */}
      <div
        style={{
          fontSize: '0.875rem',
          fontFamily: 'monospace',
          color: '#111827',
          marginBottom: '0.5rem',
          paddingRight: '6rem', // Make space for status badge
        }}
      >
        {instance.id}
      </div>

      {/* Workflow name and version */}
      <div style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.25rem' }}>
        <strong>{instance.workflowName}</strong> v{instance.workflowVersion}
      </div>

      {showMetadata && (
        <>
          {/* Timestamps */}
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
            <div>Started: {formatTime(instance.startedAt)}</div>
            {instance.completedAt && (
              <div style={{ marginTop: '0.125rem' }}>
                Completed: {formatTime(instance.completedAt)}
              </div>
            )}
          </div>

          {/* Duration */}
          {instance.durationMs !== null && (
            <div
              style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                marginTop: '0.25rem',
              }}
            >
              Duration: {formatDuration(instance.durationMs)}
            </div>
          )}

          {/* Trigger */}
          <div
            style={{
              fontSize: '0.75rem',
              color: '#6b7280',
              marginTop: '0.25rem',
            }}
          >
            Triggered by: {instance.triggeredBy}
          </div>
        </>
      )}
    </button>
  )
}
