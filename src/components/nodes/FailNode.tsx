import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import type { FailStepDef } from '../../types/workflow'
import type { LayoutDirection } from '../../utils/layout'

interface FailNodeData {
  label: string
  stepDef: FailStepDef
  isStart?: boolean
  isEnd?: boolean
  direction?: LayoutDirection
}

/**
 * Custom node component for Fail/error steps
 * Displays failure reason with error styling
 */
export const FailNode = memo(({ data }: NodeProps<FailNodeData>) => {
  const { label, stepDef, isStart, isEnd, direction = 'LR' } = data

  // Determine handle positions based on layout direction
  const targetPosition = direction === 'TB' ? Position.Top : Position.Left
  const sourcePosition = direction === 'TB' ? Position.Bottom : Position.Right

  return (
    <div className="fail-node">
      <Handle type="target" position={targetPosition} />

      <div className="node-header">
        <div className="node-badges">
          {isStart && <span className="badge badge-start">START</span>}
          {isEnd && <span className="badge badge-end">END</span>}
        </div>
        <div className="node-type">FAIL</div>
        <div className="node-label">{label}</div>
      </div>

      <div className="node-body">
        {stepDef.description && (
          <div className="node-description">{stepDef.description}</div>
        )}

        <div className="node-field">
          <span className="field-label">Reason:</span>
          <span className="field-value reason-text">{stepDef.reason}</span>
        </div>

        <div className="node-indicator error-indicator">
          ❌ Workflow will fail
        </div>
      </div>

      {/* Fail nodes typically don't have outgoing connections, but include handle for completeness */}
      <Handle type="source" position={sourcePosition} style={{ opacity: 0 }} />
    </div>
  )
})

FailNode.displayName = 'FailNode'
