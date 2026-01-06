import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { Wrench } from 'lucide-react'
import type { ToolStepDef } from '../../types/workflow'
import type { LayoutDirection } from '../../utils/layout'
import type { ExecutionState } from '../../types/execution'

interface ToolNodeData extends Record<string, unknown> {
  label: string
  stepDef: ToolStepDef
  direction?: LayoutDirection
  execution?: ExecutionState
}

type ToolNode = Node<ToolNodeData>

/**
 * Custom node component for Tool steps
 * Displays tool name and arguments with template variables
 */
export const ToolNode = memo(({ data }: NodeProps<ToolNode>) => {
  const { label, stepDef, direction = 'LR' } = data
  const hasArgs = stepDef.args && Object.keys(stepDef.args).length > 0

  // Determine handle positions based on layout direction
  const targetPosition = direction === 'TB' ? Position.Top : Position.Left
  const sourcePosition = direction === 'TB' ? Position.Bottom : Position.Right

  return (
    <div className="tool-node">
      <Handle type="target" position={targetPosition} />

      <div className="node-header">
        <div className="node-header-content">
          <div>
            <div className="node-type">TOOL</div>
            <div className="node-label">{label}</div>
          </div>
          <Wrench className="node-icon" />
        </div>
      </div>

      <div className="node-body">
        {stepDef.description && (
          <div className="node-description">{stepDef.description}</div>
        )}

        <div className="node-field">
          <span className="field-label">Tool:</span>
          <span className="field-value">{stepDef.tool}</span>
        </div>

        {hasArgs && (
          <div className="node-section">
            <div className="section-title">Arguments:</div>
            <div className="args-list">
              {Object.entries(stepDef.args!).map(([key, value]) => (
                <div key={key} className="arg-field">
                  <span className="arg-key">{key}:</span>
                  <span className="arg-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Handle type="source" position={sourcePosition} />
    </div>
  )
})

ToolNode.displayName = 'ToolNode'
