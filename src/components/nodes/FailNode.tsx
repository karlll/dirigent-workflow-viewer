import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { AlertTriangle } from 'lucide-react'
import type { FailStepDef } from '../../types/workflow'
import type { LayoutDirection } from '../../utils/layout'

interface FailNodeData extends Record<string, unknown> {
  label: string
  stepDef: FailStepDef
  direction?: LayoutDirection
}

type FailNode = Node<FailNodeData>

/**
 * Custom node component for Fail/error steps
 * Displays failure reason
 */
export const FailNode = memo(({ data }: NodeProps<FailNode>) => {
  const { label, stepDef, direction = 'LR' } = data

  // Determine handle positions based on layout direction
  const targetPosition = direction === 'TB' ? Position.Top : Position.Left
  const sourcePosition = direction === 'TB' ? Position.Bottom : Position.Right

  return (
    <div className="fail-node">
      <Handle type="target" position={targetPosition} />

      <div className="node-header">
        <div className="node-header-content">
          <div>
            <div className="node-type">FAIL</div>
            <div className="node-label">{label}</div>
          </div>
          <AlertTriangle className="node-icon" />
        </div>
      </div>

      <div className="node-body">
        {stepDef.description && (
          <div className="node-description">{stepDef.description}</div>
        )}

        <div className="node-field">
          <span className="field-label">Reason:</span>
          <span className="field-value reason-text">{stepDef.reason}</span>
        </div>
      </div>

      <Handle type="source" position={sourcePosition} />
    </div>
  )
})

FailNode.displayName = 'FailNode'
