/**
 * Type definitions for workflow execution state.
 * Used to enrich static workflow visualizations with runtime execution information.
 */

/**
 * Execution state for a single workflow step.
 * Tracks the runtime status, timing, and results of step execution.
 */
export interface StepState {
  /** Current execution status of the step */
  status: 'pending' | 'running' | 'completed' | 'failed'

  /** Type of step (tool, llm, switch, fail) */
  stepKind: string

  /** ISO 8601 timestamp when step execution started */
  startedAt?: string

  /** ISO 8601 timestamp when step execution completed */
  completedAt?: string

  /** Execution duration in milliseconds */
  durationMs?: number

  /** Error message if step failed */
  error?: string

  /** Input data passed to the step (from workflow state) */
  input?: Record<string, unknown>

  /** Output data produced by the step */
  output?: Record<string, unknown>
}

/**
 * Information about a branch decision taken during workflow execution.
 * Records which path was chosen in a switch/conditional step.
 */
export interface BranchInfo {
  /** ID of the step where the branch originated (e.g., switch step) */
  fromStep: string

  /** ID of the step that was chosen/executed */
  toStep: string

  /** Optional condition expression that evaluated to true */
  condition?: string

  /** ISO 8601 timestamp when branch decision was made */
  timestamp: string
}

/**
 * Complete execution state for a workflow instance.
 * Represents the current or final state of a workflow execution.
 */
export interface InstanceState {
  /** Current overall status of the workflow instance */
  status: 'running' | 'completed' | 'failed'

  /** Name of the workflow being executed */
  workflowName?: string

  /** Version number of the workflow */
  workflowVersion?: number

  /** ISO 8601 timestamp when workflow execution started */
  startedAt?: string

  /** ISO 8601 timestamp when workflow execution completed or failed */
  completedAt?: string

  /** Total execution duration in milliseconds */
  durationMs?: number

  /** Error message if workflow failed */
  error?: string

  /** ID of the step where workflow failed (if status is 'failed') */
  failedStep?: string

  /** Map of step ID to step execution state */
  steps: Map<string, StepState>

  /** List of branch decisions taken during execution */
  branches: BranchInfo[]

  /** ID of the currently executing step (only set when status is 'running') */
  currentStepId?: string
}

/**
 * Processed execution data ready for workflow visualization.
 * Combines instance state with derived information for rendering.
 */
export interface ExecutionData {
  /** Complete instance execution state */
  instanceState: InstanceState

  /** Set of all step IDs that were executed (for path highlighting) */
  executionPath: Set<string>
}

/**
 * Visual execution state for enriching workflow nodes.
 * Contains both actual execution data and derived display flags.
 */
export interface ExecutionState {
  /** Display status for the node */
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'

  /** ISO 8601 timestamp when step started */
  startedAt?: string

  /** ISO 8601 timestamp when step completed */
  completedAt?: string

  /** Execution duration in milliseconds */
  durationMs?: number

  /** Error message if step failed */
  error?: string

  /** Whether this step was executed in the current instance */
  isOnExecutionPath?: boolean

  /** Whether this is the currently executing step */
  isCurrentStep?: boolean
}
