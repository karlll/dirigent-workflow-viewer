import { useEffect, useState } from 'react'
import ReactFlow, { Background, Controls, type Node, type Edge } from 'reactflow'
import 'reactflow/dist/style.css'

import { parseWorkflow } from '../utils/parser'
import { workflowToGraph } from '../utils/graphConverter'
import { applyDagreLayout, type LayoutDirection } from '../utils/layout'
import type { Workflow as WorkflowType } from '../types/workflow'

/**
 * Props for the Workflow component
 */
export interface WorkflowProps {
  /** YAML string representing the workflow */
  yaml?: string
  /** Pre-parsed workflow object */
  workflow?: WorkflowType
  /** Layout direction (default: LR) */
  direction?: LayoutDirection
}

/**
 * Workflow visualization component
 *
 * Renders a workflow definition as an interactive node graph using React Flow.
 * Accepts either a YAML string or a pre-parsed workflow object.
 *
 * @example
 * ```tsx
 * <Workflow yaml={yamlString} direction="LR" />
 * ```
 */
export function Workflow({ yaml, workflow, direction = 'LR' }: WorkflowProps) {
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      // Parse workflow from YAML or use provided workflow object
      const workflowData = workflow || (yaml ? parseWorkflow(yaml) : null)

      if (!workflowData) {
        setError('No workflow provided')
        return
      }

      // Convert workflow to graph representation
      const graph = workflowToGraph(workflowData)

      // Apply layout algorithm to position nodes
      const layoutedNodes = applyDagreLayout(graph.nodes, graph.edges, direction)

      setNodes(layoutedNodes)
      setEdges(graph.edges)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setNodes([])
      setEdges([])
    }
  }, [yaml, workflow, direction])

  if (error) {
    return (
      <div style={{
        padding: '20px',
        color: '#ef4444',
        backgroundColor: '#fee2e2',
        borderRadius: '8px',
        border: '1px solid #fca5a5'
      }}>
        <strong>Error:</strong> {error}
      </div>
    )
  }

  if (nodes.length === 0) {
    return (
      <div style={{
        padding: '20px',
        color: '#6b7280',
        textAlign: 'center'
      }}>
        No workflow to display
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}
