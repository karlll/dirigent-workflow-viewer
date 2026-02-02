import { useEffect, useState, useMemo } from 'react'
import { Workflow, type WorkflowProps } from './Workflow'
import { eventManager } from '../lib/EventManager'
import type { Workflow as WorkflowType } from '../types/workflow'
import type { InstanceState, ExecutionState } from '../types/execution'
import { parseWorkflow } from '../utils/parser'
import { workflowToGraph } from '../utils/graphConverter'
import { applyDagreLayout } from '../utils/layout'
import type { Node, Edge } from '@xyflow/react'

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

    const execution: ExecutionState = stepState
      ? {
          status: stepState.status,
          startedAt: stepState.startedAt,
          completedAt: stepState.completedAt,
          durationMs: stepState.durationMs,
          error: stepState.error,
          isOnExecutionPath: executionPath.has(stepId),
          isCurrentStep: instanceState.currentStepId === stepId,
        }
      : {
          status: 'pending',
          isOnExecutionPath: false,
          isCurrentStep: false,
        }

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

    // Always fetch complete state from REST API to ensure we have all historical data
    // EventManager will merge with any SSE updates that arrived in the meantime
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

    // Subscribe to real-time updates (will merge with fetched state)
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

  // Compute enriched nodes and edges with execution path classes
  const { enrichedNodes, enrichedEdges } = useMemo(() => {
    if (!enrichedWorkflow || !instanceState) {
      return { enrichedNodes: undefined, enrichedEdges: undefined }
    }

    const direction = workflowProps.direction || 'LR'
    const graph = workflowToGraph(enrichedWorkflow, direction)
    const layoutedNodes = applyDagreLayout(graph.nodes, graph.edges, direction)

    // Build execution path: set of step IDs that were executed
    const executionPath = new Set<string>()
    instanceState.steps.forEach((stepState, stepId) => {
      if (stepState.status !== 'pending') {
        executionPath.add(stepId)
      }
    })

    // Enrich edges with execution path class
    const edgesWithExecution: Edge[] = graph.edges.map(edge => {
      // Check if both source and target are on execution path
      const sourceOnPath = executionPath.has(edge.source) || edge.source === '__start__'
      const targetOnPath = executionPath.has(edge.target) ||
                           (edge.target === '__end__' && instanceState.status === 'completed') ||
                           (edge.target === '__fail__' && instanceState.status === 'failed')
      const isOnExecutionPath = sourceOnPath && targetOnPath

      return {
        ...edge,
        className: isOnExecutionPath ? 'on-execution-path' : undefined,
      }
    })

    return {
      enrichedNodes: layoutedNodes as Node[],
      enrichedEdges: edgesWithExecution,
    }
  }, [enrichedWorkflow, instanceState, workflowProps.direction])

  // Loading state
  if (loading && showLoading) {
    return (
      <div className="workflow-viewer flex items-center justify-center p-10 text-muted-foreground">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <div>Loading execution state...</div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="workflow-viewer p-5 text-destructive bg-destructive/10 rounded-lg border border-destructive">
        <strong>Error:</strong> {error}
      </div>
    )
  }

  // No workflow
  if (!enrichedWorkflow) {
    return (
      <div className="workflow-viewer p-5 text-muted-foreground text-center">
        No workflow to display
      </div>
    )
  }

  // Render workflow with execution state
  return (
    <Workflow
      workflow={enrichedWorkflow}
      nodes={enrichedNodes}
      edges={enrichedEdges}
      {...workflowProps}
    />
  )
}
