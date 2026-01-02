import type { Workflow, StepDef } from '../types/workflow'
import type { LayoutDirection } from './layout'

/**
 * Simple Node type (will use React Flow's Node type later)
 */
export interface Node {
  id: string
  type: string
  data: {
    label: string
    stepDef: StepDef
    isStart?: boolean
    isEnd?: boolean
    direction?: LayoutDirection
  }
  position: { x: number; y: number }
}

/**
 * Simple Edge type (will use React Flow's Edge type later)
 */
export interface Edge {
  id: string
  source: string
  target: string
  label?: string
  type?: string
  style?: {
    stroke?: string
    strokeDasharray?: string
  }
}

/**
 * Graph representation with nodes and edges
 */
export interface GraphData {
  nodes: Node[]
  edges: Edge[]
}

/**
 * Convert a Workflow object to a graph representation
 * @param workflow - Parsed workflow object
 * @param direction - Layout direction for handle positioning
 * @returns Graph data with nodes and edges (positions will be set by layout engine)
 */
export function workflowToGraph(workflow: Workflow, direction: LayoutDirection = 'LR'): GraphData {
  const nodes: Node[] = []
  const edges: Edge[] = []

  // Create nodes for each step
  for (const [stepId, stepDef] of Object.entries(workflow.steps)) {
    nodes.push({
      id: stepId,
      type: stepDef.kind,
      data: {
        label: stepId,
        stepDef,
        isStart: stepId === workflow.start,
        isEnd: stepDef.end === true,
        direction
      },
      position: { x: 0, y: 0 } // Will be set by layout engine
    })

    // Generate edges based on step type
    edges.push(...createEdgesForStep(stepId, stepDef))
  }

  return { nodes, edges }
}

/**
 * Create edges for a specific step based on its type and transitions
 */
function createEdgesForStep(stepId: string, stepDef: StepDef): Edge[] {
  const edges: Edge[] = []

  // Regular goto transition
  if ('goto' in stepDef && stepDef.goto) {
    edges.push({
      id: `${stepId}-${stepDef.goto}`,
      source: stepId,
      target: stepDef.goto,
      type: 'default'
    })
  }

  // Error path (for LLM steps)
  if ('on_error' in stepDef && stepDef.on_error) {
    edges.push({
      id: `${stepId}-error-${stepDef.on_error.goto}`,
      source: stepId,
      target: stepDef.on_error.goto,
      label: 'on_error',
      type: 'default',
      style: {
        stroke: '#ef4444',
        strokeDasharray: '5,5'
      }
    })
  }

  // Switch cases
  if (stepDef.kind === 'switch') {
    // Add edge for each case
    stepDef.cases.forEach((caseDef, index) => {
      edges.push({
        id: `${stepId}-case-${index}`,
        source: stepId,
        target: caseDef.goto,
        label: caseDef.when,
        type: 'default'
      })
    })

    // Add default edge
    edges.push({
      id: `${stepId}-default`,
      source: stepId,
      target: stepDef.default,
      label: 'default',
      type: 'default'
    })
  }

  return edges
}
