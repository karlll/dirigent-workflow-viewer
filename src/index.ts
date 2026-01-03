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
