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

// Export API types
export type {
  WorkflowMetadata,
  WorkflowListResponse,
  InstanceSummaryDto,
  InstanceListResponse,
  InstanceDetailsDto,
  StepExecutionDto,
} from './types/api'

// Export React Flow types for consumers
export type { ColorMode } from '@xyflow/react'

// ============================================================================
// Core Components
// ============================================================================

// Export main Workflow component (static workflow visualization)
export { Workflow } from './components/Workflow'
export type { WorkflowProps } from './components/Workflow'

// Export ExecutableWorkflow component (workflow with execution state)
export { ExecutableWorkflow } from './components/ExecutableWorkflow'
export type { ExecutableWorkflowProps } from './components/ExecutableWorkflow'

// ============================================================================
// Library Components (for building workflow UIs)
// ============================================================================

// Export WorkflowBrowser component
export { WorkflowBrowser } from './components/WorkflowBrowser'
export type { WorkflowBrowserProps } from './components/WorkflowBrowser'

// Export InstanceBrowser component
export { InstanceBrowser } from './components/InstanceBrowser'
export type { InstanceBrowserProps } from './components/InstanceBrowser'

// Export InstanceMonitor component
export { InstanceMonitor } from './lib/components/InstanceMonitor'
export type { InstanceMonitorProps } from './lib/components/InstanceMonitor'

// ============================================================================
// Hooks (for custom integrations)
// ============================================================================

export {
  useWorkflows,
  useWorkflowDefinition,
  useInstances,
  useInstanceState,
  useInstanceDetails,
} from './lib/hooks'

// ============================================================================
// Utilities
// ============================================================================

// Export ApiClient for advanced use cases
export { ApiClient } from './lib/ApiClient'

// Export EventManager for advanced use cases
export { eventManager } from './lib/EventManager'

// Export utility functions (for Tailwind CSS className merging)
export { cn } from './lib/utils'

// Export CVA variants (for component styling)
export {
  nodeVariants,
  instanceItemVariants,
  statusBadgeVariants,
} from './lib/variants'

// Export utility types
export type { LayoutDirection } from './utils/layout'

// ============================================================================
// Execution types
// ============================================================================

export type { InstanceState, StepState, ExecutionState } from './types/execution'

