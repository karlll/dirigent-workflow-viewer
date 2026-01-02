import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import type { ToolStepDef } from '../../types/workflow'

interface ToolNodeData {
  label: string
  stepDef: ToolStepDef
  isStart?: boolean
  isEnd?: boolean
}

/**
 * Custom node component for Tool steps
 * Displays tool name and arguments with template variables
 */
export const ToolNode = memo(({ data }: NodeProps<ToolNodeData>) => {
  const { label, stepDef, isStart, isEnd } = data
  const hasArgs = stepDef.args && Object.keys(stepDef.args).length > 0

  return (
    <div className="tool-node">
      <Handle type="target" position={Position.Left} />

      <div className="node-header">
        <div className="node-badges">
          {isStart && <span className="badge badge-start">START</span>}
          {isEnd && <span className="badge badge-end">END</span>}
        </div>
        <div className="node-type">TOOL</div>
        <div className="node-label">{label}</div>
      </div>

      <div className="node-body">
        <div className="node-field">
          <span className="field-label">Tool:</span>
          <span className="field-value">{stepDef.tool}</span>
        </div>

        {stepDef.description && (
          <div className="node-description">{stepDef.description}</div>
        )}

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

      <Handle type="source" position={Position.Right} />
    </div>
  )
})

ToolNode.displayName = 'ToolNode'
