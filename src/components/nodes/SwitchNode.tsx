import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { GitBranch } from 'lucide-react'
import type { SwitchStepDef } from '../../types/workflow'
import type { LayoutDirection } from '../../utils/layout'
import type { ExecutionState } from '../../types/execution'

interface SwitchNodeData extends Record<string, unknown> {
  label: string
  stepDef: SwitchStepDef
  direction?: LayoutDirection
  execution?: ExecutionState
}

type SwitchNode = Node<SwitchNodeData>

/**
 * Custom node component for Switch/branching steps
 * Cases are shown on edge labels
 */
export const SwitchNode = memo(({ data }: NodeProps<SwitchNode>) => {
  const { label, stepDef, direction = 'LR' } = data
  const caseCount = stepDef.cases.length

  // Determine handle positions based on layout direction
  const targetPosition = direction === 'TB' ? Position.Top : Position.Left
  const sourcePosition = direction === 'TB' ? Position.Bottom : Position.Right

  return (
    <div className="switch-node">
      <Handle type="target" position={targetPosition} />

      <div className="node-header">
        <div className="node-header-content">
          <div>
            <div className="node-type">SWITCH</div>
            <div className="node-label">{label}</div>
          </div>
          <GitBranch className="node-icon" />
        </div>
      </div>

      <div className="node-body">
        {stepDef.description && (
          <div className="node-description">{stepDef.description}</div>
        )}

        <div className="node-field">
          <span className="field-label">Branches:</span>
          <span className="field-value">{caseCount} case{caseCount !== 1 ? 's' : ''} + default</span>
        </div>
      </div>

      <Handle type="source" position={sourcePosition} />
    </div>
  )
})

SwitchNode.displayName = 'SwitchNode'
