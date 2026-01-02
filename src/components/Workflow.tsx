import { useEffect, useState } from 'react'
import ReactFlow, { Background, Controls, type Node, type Edge } from 'reactflow'
import 'reactflow/dist/style.css'
import '../styles/nodes.css'

import { parseWorkflow } from '../utils/parser'
import { workflowToGraph } from '../utils/graphConverter'
import { applyDagreLayout, type LayoutDirection } from '../utils/layout'
import type { Workflow as WorkflowType } from '../types/workflow'
import { LlmNode, ToolNode, SwitchNode, FailNode, StartNode, EndNode, FailTerminalNode } from './nodes'

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
  /** Show workflow name and description (default: true) */
  showHeader?: boolean
}

// Define custom node types outside component to prevent re-renders
const nodeTypes = {
  llm: LlmNode,
  tool: ToolNode,
  switch: SwitchNode,
  fail: FailNode,
  start: StartNode,
  end: EndNode,
  'fail-terminal': FailTerminalNode,
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
export function Workflow({ yaml, workflow, direction = 'LR', showHeader = true }: WorkflowProps) {
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [error, setError] = useState<string | null>(null)
  const [workflowData, setWorkflowData] = useState<WorkflowType | null>(null)

  useEffect(() => {
    try {
      // Parse workflow from YAML or use provided workflow object
      const parsedWorkflow = workflow || (yaml ? parseWorkflow(yaml) : null)

      if (!parsedWorkflow) {
        setError('No workflow provided')
        setWorkflowData(null)
        return
      }

      // Store workflow data for header display
      setWorkflowData(parsedWorkflow)

      // Convert workflow to graph representation (pass direction for handle positioning)
      const graph = workflowToGraph(parsedWorkflow, direction)

      // Apply layout algorithm to position nodes
      const layoutedNodes = applyDagreLayout(graph.nodes, graph.edges, direction)

      setNodes(layoutedNodes)
      setEdges(graph.edges)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setNodes([])
      setEdges([])
      setWorkflowData(null)
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
    <div className="workflow-viewer">
      {showHeader && workflowData && (
        <div className="workflow-header">
          <h3 className="workflow-name">{workflowData.name}</h3>
          {workflowData.description && (
            <p className="workflow-description">{workflowData.description}</p>
          )}
          <div className="workflow-meta">
            <span className="meta-item">Version: {workflowData.version}</span>
            <span className="meta-item">Steps: {Object.keys(workflowData.steps).length}</span>
            <span className="meta-item">Start: {workflowData.start}</span>
          </div>
        </div>
      )}
      <div style={{ width: '100%', height: showHeader ? 'calc(100% - 80px)' : '600px' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{
            padding: 0.2,
            minZoom: 0.1,
            maxZoom: 1.5
          }}
          attributionPosition="bottom-left"
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  )
}
