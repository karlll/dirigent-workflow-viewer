import { useEffect, useState, useMemo } from 'react'
import { Workflow, type WorkflowProps } from './Workflow'
import { eventManager } from '../lib/EventManager'
import type { Workflow as WorkflowType } from '../types/workflow'
import type { InstanceState, ExecutionState } from '../types/execution'
import { parseWorkflow } from '../utils/parser'

/**
 * Props for ExecutableWorkflow component
 */
export interface ExecutableWorkflowProps extends Omit<WorkflowProps, 'workflow'> {
  /** UUID of the workflow instance to track */
  instanceId: string
  /** Base URL of the Dirigent API (e.g., "http://localhost:8081") */
  apiBaseUrl: string
  /** YAML string representing the workflow */
  yaml?: string
  /** Pre-parsed workflow object */
  workflow?: WorkflowType
  /** Show loading spinner while fetching state (default: true) */
  showLoading?: boolean
}

/**
 * Helper function to enrich workflow with execution state
 */
function enrichWorkflowWithExecution(
  workflow: WorkflowType,
  instanceState: InstanceState | null
): WorkflowType {
  if (!instanceState) {
    return workflow
  }

  // Build execution path set
  const executionPath = new Set<string>()
  instanceState.steps.forEach((stepState, stepId) => {
    if (stepState.status !== 'pending') {
      executionPath.add(stepId)
    }
  })

  // Enrich each step with execution state
  const enrichedSteps: Record<string, any> = {}

  for (const [stepId, stepDef] of Object.entries(workflow.steps)) {
    const stepState = instanceState.steps.get(stepId)

    const execution: ExecutionState | undefined = stepState
      ? {
          status: stepState.status,
          startedAt: stepState.startedAt,
          completedAt: stepState.completedAt,
          durationMs: stepState.durationMs,
          error: stepState.error,
          isOnExecutionPath: executionPath.has(stepId),
          isCurrentStep: instanceState.currentStepId === stepId,
        }
      : undefined

    enrichedSteps[stepId] = {
      ...stepDef,
      execution,
    }
  }

  return {
    ...workflow,
    steps: enrichedSteps,
  }
}

/**
 * ExecutableWorkflow component
 *
 * Wraps the base Workflow component and enriches it with real-time execution state
 * from the EventManager. Subscribes to SSE events and updates the visualization
 * as the workflow executes.
 *
 * @example
 * ```tsx
 * <ExecutableWorkflow
 *   instanceId="abc-123"
 *   apiBaseUrl="http://localhost:8081"
 *   workflow={workflowDef}
 *   direction="LR"
 * />
 * ```
 */
export function ExecutableWorkflow({
  instanceId,
  apiBaseUrl,
  yaml,
  workflow,
  showLoading = true,
  ...workflowProps
}: ExecutableWorkflowProps) {
  const [instanceState, setInstanceState] = useState<InstanceState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Parse workflow from YAML or use provided workflow object
  const baseWorkflow = useMemo(() => {
    try {
      return workflow || (yaml ? parseWorkflow(yaml) : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse workflow')
      return null
    }
  }, [yaml, workflow])

  // Connect to EventManager on mount
  useEffect(() => {
    // Connect EventManager if not already connected
    if (!eventManager.isEventSourceConnected()) {
      eventManager.connect(apiBaseUrl)
    }
  }, [apiBaseUrl])

  // Subscribe to instance state updates
  useEffect(() => {
    if (!instanceId) return

    setLoading(true)
    setError(null)

    // Try to get state from memory first
    const currentState = eventManager.getState(instanceId)

    if (currentState) {
      setInstanceState(currentState)
      setLoading(false)
    } else {
      // Fetch from API
      eventManager
        .fetchState(instanceId)
        .then((state) => {
          setInstanceState(state)
          setLoading(false)
          setError(null)
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Failed to fetch instance state')
          setLoading(false)
          setInstanceState(null)
        })
    }

    // Subscribe to real-time updates
    const unsubscribe = eventManager.subscribe(instanceId, (state) => {
      setInstanceState(state)
      setError(null)
    })

    return () => {
      unsubscribe()
    }
  }, [instanceId])

  // Enrich workflow with execution state
  const enrichedWorkflow = useMemo(() => {
    if (!baseWorkflow) return null
    return enrichWorkflowWithExecution(baseWorkflow, instanceState)
  }, [baseWorkflow, instanceState])

  // Loading state
  if (loading && showLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          color: '#6b7280',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e5e7eb',
              borderTopColor: '#3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <div>Loading execution state...</div>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div
        style={{
          padding: '20px',
          color: '#ef4444',
          backgroundColor: '#fee2e2',
          borderRadius: '8px',
          border: '1px solid #fca5a5',
        }}
      >
        <strong>Error:</strong> {error}
      </div>
    )
  }

  // No workflow
  if (!enrichedWorkflow) {
    return (
      <div
        style={{
          padding: '20px',
          color: '#6b7280',
          textAlign: 'center',
        }}
      >
        No workflow to display
      </div>
    )
  }

  // Render workflow with execution state
  return <Workflow workflow={enrichedWorkflow} {...workflowProps} />
}
