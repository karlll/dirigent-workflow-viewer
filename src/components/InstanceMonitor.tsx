/**
 * InstanceMonitor component for monitoring workflow execution in real-time.
 * Combines workflow visualization with execution state overlay.
 */

import { useInstanceState, useWorkflowDefinition } from '../lib/hooks'
import { ExecutableWorkflow } from './ExecutableWorkflow'
import { cn } from '../lib/utils'
import { statusBadgeVariants } from '../lib/variants'
import type { ColorMode } from '@xyflow/react'

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

  /** Color mode for the component (default: system) */
  colorMode?: ColorMode
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
  colorMode = 'system',
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
        className={cn('workflow-viewer flex items-center justify-center p-8 text-muted-foreground', className)}
        style={style}
      >
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-border border-t-primary rounded-full animate-spin mx-auto mb-2" />
          <div className="text-sm">Loading instance monitor...</div>
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
        style={style}
      >
        <strong>Error:</strong> {error}
      </div>
    )
  }

  if (!workflow || !yaml) {
    return (
      <div
        className={cn('workflow-viewer p-8 text-muted-foreground text-center text-sm', className)}
        style={style}
      >
        Workflow not found
      </div>
    )
  }

  return (
    <div
      className={cn('workflow-viewer flex flex-col', className)}
      style={style}
    >
      {/* Header with instance info */}
      <div className="p-4 bg-muted border-b border-border flex justify-between items-center">
        <div>
          <div className="text-sm text-muted-foreground">
            Monitoring Instance
          </div>
          <div className="text-sm font-mono text-foreground mt-1">
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
      <div className="flex-1 min-h-0">
        <ExecutableWorkflow
          yaml={yaml}
          instanceId={instanceId}
          apiBaseUrl={apiBaseUrl}
          direction={direction}
          showLoading={false} // We handle loading at this level
          colorMode={colorMode}
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
  const isRunning = status.toLowerCase() === 'running'
  const statusValue = status.toUpperCase() as 'RUNNING' | 'COMPLETED' | 'FAILED'

  return (
    <div className="flex flex-col items-end gap-1">
      <div className={cn(statusBadgeVariants({ status: statusValue }))}>
        {isRunning && (
          <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
        )}
        {status.toUpperCase()}
      </div>
      {currentStep && isRunning && (
        <div className="text-xs text-muted-foreground">
          Current: {currentStep}
        </div>
      )}
    </div>
  )
}
