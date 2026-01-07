// Entry point for the workflow viewer library
// This will export the main Workflow component and types

export const version = '0.1.0'

// Export workflow types (rename Workflow type to avoid conflict with component)
export type {
  Workflow as WorkflowType,
  Trigger,
  Goto,
  StepDef,
  LlmStepDef,
  ToolStepDef,
  SwitchStepDef,
  FailStepDef,
  CaseDef
} from './types/workflow'

// Export React Flow types for consumers
export type { ColorMode } from '@xyflow/react'

// Export main Workflow component
export { Workflow } from './components/Workflow'
export type { WorkflowProps } from './components/Workflow'

// Export ExecutableWorkflow component
export { ExecutableWorkflow } from './components/ExecutableWorkflow'
export type { ExecutableWorkflowProps } from './components/ExecutableWorkflow'

// Export execution types
export type { InstanceState, StepState, ExecutionState } from './types/execution'

// Export EventManager for advanced use cases
export { eventManager } from './lib/EventManager'

// Export utility types
export type { LayoutDirection } from './utils/layout'
