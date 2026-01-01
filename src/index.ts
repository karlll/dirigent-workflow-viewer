// Entry point for the workflow viewer library
// This will export the main Workflow component and types

export const version = '0.1.0'

// Export all workflow types
export type {
  Workflow,
  Trigger,
  Goto,
  StepDef,
  LlmStepDef,
  ToolStepDef,
  SwitchStepDef,
  FailStepDef,
  CaseDef
} from './types/workflow'

// Placeholder - will be replaced with actual component exports in later steps
