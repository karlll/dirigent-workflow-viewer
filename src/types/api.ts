/**
 * Type definitions for Dirigent API responses.
 * Matches the backend API models defined in ApiModels.kt.
 */

/**
 * Detailed information about a workflow execution instance.
 * Response from GET /api/v1/instances/{id}
 */
export interface InstanceDetailsDto {
  /** Unique instance identifier (UUID) */
  id: string

  /** Name of the workflow that was executed */
  workflowName: string

  /** Version number of the workflow */
  workflowVersion: number

  /** Current status of the instance (RUNNING, COMPLETED, FAILED) */
  status: string

  /** Event ID that triggered this workflow execution */
  triggeredBy: string | null

  /** ISO 8601 timestamp when instance started */
  startedAt: string

  /** ISO 8601 timestamp when instance completed or failed */
  completedAt: string | null

  /** Total execution duration in milliseconds */
  durationMs: number | null

  /** List of all step executions in order */
  steps: StepExecutionDto[]

  /** Final workflow state after execution (JSON object) */
  finalState: Record<string, unknown> | null

  /** Error message if instance failed */
  error: string | null

  /** ID of the step where failure occurred */
  failedStep: string | null
}

/**
 * Execution details for a single workflow step.
 * Part of InstanceDetailsDto response.
 */
export interface StepExecutionDto {
  /** ID of the step as defined in workflow YAML */
  stepId: string

  /** Type of step (tool, llm, switch, fail) */
  stepKind: string

  /** Status of step execution (RUNNING, SUCCEEDED, FAILED) */
  status: string

  /** ISO 8601 timestamp when step started */
  startedAt: string

  /** ISO 8601 timestamp when step completed */
  completedAt: string | null

  /** Step execution duration in milliseconds */
  durationMs: number | null

  /** Input data passed to the step (JSON object) */
  input: Record<string, unknown> | null

  /** Output data produced by the step (JSON object) */
  output: Record<string, unknown> | null

  /** Error message if step failed */
  error: string | null
}

/**
 * Summary information about a workflow instance.
 * Used in list responses from GET /api/v1/instances
 */
export interface InstanceSummaryDto {
  /** Unique instance identifier (UUID) */
  id: string

  /** Name of the workflow that was executed */
  workflowName: string

  /** Version number of the workflow */
  workflowVersion: number

  /** Current status of the instance (RUNNING, COMPLETED, FAILED) */
  status: string

  /** Event ID that triggered this workflow execution */
  triggeredBy: string | null

  /** ISO 8601 timestamp when instance started */
  startedAt: string

  /** ISO 8601 timestamp when instance completed or failed */
  completedAt: string | null

  /** Total execution duration in milliseconds */
  durationMs: number | null
}

/**
 * Paginated list of workflow instances.
 * Response from GET /api/v1/instances
 */
export interface InstanceListResponse {
  /** List of instance summaries */
  instances: InstanceSummaryDto[]

  /** Total number of instances matching the query */
  total: number

  /** Maximum results per page */
  limit: number

  /** Number of results skipped */
  offset: number
}

/**
 * Workflow metadata summary.
 * Response from GET /api/v1/workflows
 */
export interface WorkflowMetadata {
  /** Workflow name */
  name: string

  /** Workflow version number */
  version: number

  /** Event types that trigger this workflow */
  triggerTypes: string[]

  /** Number of steps in the workflow */
  stepCount: number
}

/**
 * List of workflow metadata.
 * Response from GET /api/v1/workflows
 */
export interface WorkflowListResponse {
  /** List of workflows */
  workflows: WorkflowMetadata[]
}

/**
 * Filter options for instance queries.
 * Used as query parameters in GET /api/v1/instances
 */
export interface InstanceFilter {
  /** Filter by instance status */
  status?: 'RUNNING' | 'COMPLETED' | 'FAILED'

  /** Filter by workflow name */
  workflowName?: string

  /** Maximum number of instances to return */
  limit?: number

  /** Number of instances to skip (for pagination) */
  offset?: number

  /** Filter instances started after this timestamp (ISO 8601) */
  since?: string

  /** Filter instances started before this timestamp (ISO 8601) */
  until?: string
}

// ============================================================================
// SSE Event Types
// ============================================================================

/**
 * SSE event: Workflow instance started execution.
 * Event type: "InstanceStarted"
 */
export interface SseInstanceStarted {
  /** Instance UUID */
  instanceId: string

  /** ISO 8601 timestamp */
  timestamp: string

  /** Workflow name */
  workflowName: string

  /** Workflow version */
  workflowVersion: number

  /** Trigger event ID */
  triggeredBy: string
}

/**
 * SSE event: Workflow step started execution.
 * Event type: "StepStarted"
 */
export interface SseStepStarted {
  /** Instance UUID */
  instanceId: string

  /** ISO 8601 timestamp */
  timestamp: string

  /** Step ID from workflow definition */
  stepId: string

  /** Type of step (tool, llm, switch, fail) */
  stepKind: string
}

/**
 * SSE event: Workflow step completed execution.
 * Event type: "StepCompleted"
 */
export interface SseStepCompleted {
  /** Instance UUID */
  instanceId: string

  /** ISO 8601 timestamp */
  timestamp: string

  /** Step ID from workflow definition */
  stepId: string

  /** Whether step completed successfully */
  success: boolean

  /** Step execution duration in milliseconds */
  durationMs: number
}

/**
 * SSE event: Branch decision taken in switch step.
 * Event type: "BranchTaken"
 */
export interface SseBranchTaken {
  /** Instance UUID */
  instanceId: string

  /** ISO 8601 timestamp */
  timestamp: string

  /** ID of the branching step (e.g., switch step) */
  fromStep: string

  /** ID of the step that was selected */
  toStep: string

  /** Condition expression that evaluated to true (optional) */
  condition?: string
}

/**
 * SSE event: Workflow instance completed successfully.
 * Event type: "InstanceCompleted"
 */
export interface SseInstanceCompleted {
  /** Instance UUID */
  instanceId: string

  /** ISO 8601 timestamp */
  timestamp: string

  /** Whether instance completed successfully */
  success: boolean

  /** Total number of steps executed */
  stepCount: number

  /** Total execution duration in milliseconds */
  durationMs: number
}

/**
 * SSE event: Workflow instance failed.
 * Event type: "InstanceFailed"
 */
export interface SseInstanceFailed {
  /** Instance UUID */
  instanceId: string

  /** ISO 8601 timestamp */
  timestamp: string

  /** Error message */
  error: string

  /** ID of the step where failure occurred */
  failedStep: string | null

  /** Execution duration until failure in milliseconds */
  durationMs: number
}

/**
 * Union type of all SSE event data types.
 * Used for type-safe event handling.
 */
export type SseEventData =
  | SseInstanceStarted
  | SseStepStarted
  | SseStepCompleted
  | SseBranchTaken
  | SseInstanceCompleted
  | SseInstanceFailed

/**
 * SSE event type names.
 * Maps to the "event" field in Server-Sent Events.
 */
export type SseEventType =
  | 'InstanceStarted'
  | 'StepStarted'
  | 'StepCompleted'
  | 'BranchTaken'
  | 'InstanceCompleted'
  | 'InstanceFailed'
  | 'heartbeat'
