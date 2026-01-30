/**
 * InstanceBrowser component for browsing and filtering workflow instances.
 */

import { useInstances } from '../lib/hooks'
import type { InstanceSummaryDto } from '../types/api'
import { cn } from '../lib/utils'
import { instanceItemVariants, statusBadgeVariants } from '../lib/variants'

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

  /** Show header with instance count and filters (default: false) */
  showHeader?: boolean

  /** Maximum number of instances to display */
  limit?: number

  /** Custom CSS class */
  className?: string
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
  showHeader = false,
  limit = 50,
  className = '',
}: InstanceBrowserProps) {
  const { instances, total, loading, isRefreshing, error } = useInstances(apiBaseUrl, {
    workflowName,
    status,
    limit,
    refreshInterval,
  })

  // Only show full loading spinner on INITIAL load
  if (loading && instances.length === 0) {
    return (
      <div className={cn('workflow-viewer flex items-center justify-center p-8 text-muted-foreground', className)}>
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-border border-t-primary rounded-full animate-spin mx-auto mb-2" />
          <div className="text-sm">Loading instances...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={cn(
          'workflow-viewer p-4 text-destructive bg-destructive/10 rounded-lg border border-destructive text-sm',
          className
        )}
      >
        <strong>Error:</strong> {error}
      </div>
    )
  }

  if (instances.length === 0) {
    return (
      <div className={cn('workflow-viewer p-8 text-muted-foreground text-center text-sm', className)}>
        No instances found
        {(workflowName || status) && (
          <div className="mt-2 text-xs">
            {workflowName && `Workflow: ${workflowName}`}
            {workflowName && status && ' • '}
            {status && `Status: ${status}`}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn('workflow-viewer flex flex-col', className)}>
      {/* Header with count */}
      {showHeader && (
        <div className="px-4 py-3 bg-muted border-b border-border text-sm text-muted-foreground flex justify-between items-center">
          <div>
            {total} instance{total !== 1 ? 's' : ''}
            {(workflowName || status) && (
              <span className="ml-2">
                {workflowName && `• ${workflowName}`}
                {workflowName && status && ' '}
                {status && `• ${status}`}
              </span>
            )}
          </div>
          {/* Show subtle refresh indicator */}
          {isRefreshing && (
            <div
              className="w-4 h-4 border-2 border-border border-t-primary rounded-full animate-spin"
              title="Refreshing..."
            />
          )}
        </div>
      )}

      {/* Instance list */}
      <div className="flex flex-col gap-2 p-2 max-h-[600px] overflow-y-auto">
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
      className={cn(
        instanceItemVariants({
          status: instance.status as 'RUNNING' | 'COMPLETED' | 'FAILED',
          selected: selected,
        }),
        'relative'
      )}
      aria-label={`Select instance ${instance.id}`}
      aria-pressed={selected}
    >
      {/* Status badge */}
      <div
        className={cn(
          statusBadgeVariants({ status: instance.status as 'RUNNING' | 'COMPLETED' | 'FAILED' }),
          'absolute top-3 right-3'
        )}
      >
        {isRunning && (
          <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
        )}
        {instance.status}
      </div>

      {/* Instance ID */}
      <div className="text-sm font-mono text-foreground mb-2 pr-24">
        {instance.id}
      </div>

      {/* Workflow name and version */}
      <div className="text-sm text-muted-foreground mb-1">
        <strong className="text-foreground">{instance.workflowName}</strong> v{instance.workflowVersion}
      </div>

      {showMetadata && (
        <>
          {/* Timestamps */}
          <div className="text-xs text-muted-foreground mt-2 space-y-0.5">
            <div>Started: {formatTime(instance.startedAt)}</div>
            {instance.completedAt && (
              <div>Completed: {formatTime(instance.completedAt)}</div>
            )}
          </div>

          {/* Duration */}
          {instance.durationMs !== null && (
            <div className="text-xs text-muted-foreground mt-1">
              Duration: {formatDuration(instance.durationMs)}
            </div>
          )}

          {/* Trigger */}
          <div className="text-xs text-muted-foreground mt-1">
            Triggered by: {instance.triggeredBy}
          </div>
        </>
      )}
    </button>
  )
}
