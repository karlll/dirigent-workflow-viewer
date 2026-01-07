import type { Workflow, StepDef, Trigger } from '../types/workflow'
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
    triggers?: Trigger[]
    execution?: any  // Optional execution state for ExecutableWorkflow
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

  const START_NODE_ID = '__start__'
  const END_NODE_ID = '__end__'
  const FAIL_NODE_ID = '__fail__'

  // Check if workflow is event-driven (has triggers)
  const hasTriggers = workflow.triggers && workflow.triggers.length > 0

  // Add special START or TRIGGER node
  if (hasTriggers) {
    nodes.push({
      id: START_NODE_ID,
      type: 'trigger',
      data: {
        label: 'TRIGGER',
        stepDef: { kind: 'trigger' } as any, // Special type
        direction,
        triggers: workflow.triggers
      },
      position: { x: 0, y: 0 }
    })
  } else {
    nodes.push({
      id: START_NODE_ID,
      type: 'start',
      data: {
        label: 'START',
        stepDef: { kind: 'start' } as any, // Special type
        direction
      },
      position: { x: 0, y: 0 }
    })
  }

  // Connect START/TRIGGER node to the workflow's starting step
  edges.push({
    id: `${START_NODE_ID}-${workflow.start}`,
    source: START_NODE_ID,
    target: workflow.start,
    type: 'default'
  })

  let hasFailSteps = false

  // Create nodes for each workflow step
  for (const [stepId, stepDef] of Object.entries(workflow.steps)) {
    // Skip fail steps - they will connect to the fail terminal node
    if (stepDef.kind === 'fail') {
      hasFailSteps = true
      // Still create the node but will connect it to fail terminal
      nodes.push({
        id: stepId,
        type: stepDef.kind,
        data: {
          label: stepId,
          stepDef,
          direction,
          execution: (stepDef as any).execution  // Pass through execution state if present
        },
        position: { x: 0, y: 0 }
      })
      continue
    }

    nodes.push({
      id: stepId,
      type: stepDef.kind,
      data: {
        label: stepId,
        stepDef,
        direction,
        execution: (stepDef as any).execution  // Pass through execution state if present
      },
      position: { x: 0, y: 0 }
    })

    // Generate edges based on step type
    edges.push(...createEdgesForStep(stepId, stepDef))

    // Connect terminal steps to END node
    if (stepDef.end === true) {
      edges.push({
        id: `${stepId}-${END_NODE_ID}`,
        source: stepId,
        target: END_NODE_ID,
        type: 'default'
      })
    }
  }

  // Add special END node
  nodes.push({
    id: END_NODE_ID,
    type: 'end',
    data: {
      label: 'END',
      stepDef: { kind: 'end' } as any, // Special type
      direction
    },
    position: { x: 0, y: 0 }
  })

  // Add special FAIL terminal node if there are any fail steps
  if (hasFailSteps) {
    nodes.push({
      id: FAIL_NODE_ID,
      type: 'fail-terminal',
      data: {
        label: 'FAIL',
        stepDef: { kind: 'fail-terminal' } as any, // Special type
        direction
      },
      position: { x: 0, y: 0 }
    })

    // Connect all fail steps to the FAIL terminal node
    for (const [stepId, stepDef] of Object.entries(workflow.steps)) {
      if (stepDef.kind === 'fail') {
        edges.push({
          id: `${stepId}-${FAIL_NODE_ID}`,
          source: stepId,
          target: FAIL_NODE_ID,
          type: 'default',
          style: {
            stroke: '#f38ba8',
            strokeDasharray: '5,5'
          }
        })
      }
    }
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
