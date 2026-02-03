/**
 * Real-time instance monitoring component.
 * Displays instance details and subscribes to SSE updates for running instances.
 */

import { useInstanceDetails, useWorkflowDefinition } from '../hooks'
import { ExecutableWorkflow } from '../../components/ExecutableWorkflow'
import type { ColorMode } from '@xyflow/react'
import { cn } from '../utils'
import { statusBadgeVariants } from '../variants'

export interface InstanceMonitorProps {
  /** Instance ID to monitor */
  instanceId: string
  /** Base URL for the Dirigent API */
  apiBaseUrl: string
  /** Optional: layout direction for workflow visualization */
  direction?: 'LR' | 'TB'
  /** Color mode for the component (default: system) */
  colorMode?: ColorMode
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
 *   colorMode="dark"
 * />
 * ```
 */
export function InstanceMonitor({
  instanceId,
  apiBaseUrl,
  direction = 'LR',
  colorMode = 'system',
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
      <div className="workflow-viewer flex items-center justify-center p-8 text-muted-foreground">
        Loading instance details...
      </div>
    )
  }

  if (error) {
    return (
      <div className="workflow-viewer p-4 text-destructive bg-destructive/10 rounded-md border border-destructive">
        <h3 className="text-base font-semibold mb-2">
          Error loading instance
        </h3>
        <p className="text-sm">
          {error}
        </p>
      </div>
    )
  }

  if (!instance || !workflow) {
    return (
      <div className="workflow-viewer p-8 text-center text-muted-foreground">
        Instance not found
      </div>
    )
  }

  const statusValue = instance.status.toUpperCase() as 'RUNNING' | 'COMPLETED' | 'FAILED'

  return (
    <div className="workflow-viewer flex flex-col h-full overflow-hidden">
      {/* Instance Header */}
      <header className="p-4 border-b border-border bg-muted">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-foreground">
            {instance.workflowName}
          </h2>
          <span className={cn(statusBadgeVariants({ status: statusValue }))}>
            {instance.status}
          </span>
        </div>

        <div className="flex gap-6 text-xs text-muted-foreground">
          <span>
            ID:{' '}
            <code className="font-mono bg-muted/10 px-1 rounded text-xs">
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
          <div className="mt-2 p-2 bg-destructive/10 border border-destructive rounded text-xs text-destructive">
            <strong>Error:</strong> {instance.error}
            {instance.failedStep && <> (Step: {instance.failedStep})</>}
          </div>
        )}
      </header>

      {/* Workflow Visualization */}
      <div className="flex-1 overflow-auto p-4">
        <ExecutableWorkflow
          workflow={workflow}
          instanceId={instance.id}
          apiBaseUrl={apiBaseUrl}
          direction={direction}
          colorMode={colorMode}
        />
      </div>
    </div>
  )
}
