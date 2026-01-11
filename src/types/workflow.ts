/**
 * Workflow definition matching the Kotlin model in Model.kt
 */

import type { ExecutionState } from './execution'

/**
 * Top-level workflow definition
 */
export interface Workflow {
  /** Workflow name */
  name: string
  /** Workflow version number */
  version: number
  /** Optional description of the workflow's purpose */
  description?: string
  /** ID of the starting step */
  start: string
  /** Map of step IDs to step definitions */
  steps: Record<string, StepDef>
  /** Optional event triggers that activate this workflow */
  triggers?: Trigger[]
}

/**
 * Event trigger definition
 */
export interface Trigger {
  /** Event type (e.g., "task.created", "task.updated") */
  type: string
  /** Optional expression to filter events */
  when?: string
}

/**
 * Goto target for step transitions
 */
export interface Goto {
  /** Target step ID */
  goto: string
}

/**
 * Union type of all step definitions
 * Discriminated by the 'kind' property
 */
export type StepDef = LlmStepDef | ToolStepDef | SwitchStepDef | FailStepDef

/**
 * LLM step - calls an LLM tool and validates output
 */
export interface LlmStepDef {
  /** Step type discriminator */
  kind: 'llm'
  /** Optional description of what this step does */
  description?: string
  /** Name of the LLM tool to call */
  tool: string
  /** Expected output schema (field name -> type) */
  out: Record<string, string>
  /** Optional validation expressions to check LLM output */
  validate?: string[]
  /** Optional error handler if validation fails */
  on_error?: Goto
  /** Optional next step to execute */
  goto?: string
  /** If true, this is a terminal step */
  end?: boolean
  /** Runtime execution state (added when enriching with execution data) */
  execution?: ExecutionState
}

/**
 * Tool step - calls a registered tool with arguments
 */
export interface ToolStepDef {
  /** Step type discriminator */
  kind: 'tool'
  /** Optional description of what this step does */
  description?: string
  /** Name of the tool to call */
  tool: string
  /** Optional arguments to pass to the tool (supports template substitution) */
  args?: Record<string, string>
  /** Optional next step to execute */
  goto?: string
  /** If true, this is a terminal step */
  end?: boolean
  /** Runtime execution state (added when enriching with execution data) */
  execution?: ExecutionState
}

/**
 * Switch step - branching based on conditional expressions
 */
export interface SwitchStepDef {
  /** Step type discriminator */
  kind: 'switch'
  /** Optional description of what this step does */
  description?: string
  /** List of conditional cases to evaluate in order */
  cases: CaseDef[]
  /** Default step to execute if no cases match */
  default: string
  /** If true, this is a terminal step */
  end?: boolean
  /** Runtime execution state (added when enriching with execution data) */
  execution?: ExecutionState
}

/**
 * Case definition for switch statements
 */
export interface CaseDef {
  /** Conditional expression to evaluate */
  when: string
  /** Step to execute if condition is true */
  goto: string
}

/**
 * Fail step - terminates workflow with an error
 */
export interface FailStepDef {
  /** Step type discriminator */
  kind: 'fail'
  /** Optional description of what this step does */
  description?: string
  /** Reason for the failure */
  reason: string
  /** If true, this is a terminal step (typically true for fail steps) */
  end?: boolean
  /** Runtime execution state (added when enriching with execution data) */
  execution?: ExecutionState
}
