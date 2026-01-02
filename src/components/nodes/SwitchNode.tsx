import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import type { SwitchStepDef } from '../../types/workflow'
import type { LayoutDirection } from '../../utils/layout'

interface SwitchNodeData {
  label: string
  stepDef: SwitchStepDef
  isStart?: boolean
  isEnd?: boolean
  direction?: LayoutDirection
}

/**
 * Custom node component for Switch/branching steps
 * Displays case conditions and default path
 */
export const SwitchNode = memo(({ data }: NodeProps<SwitchNodeData>) => {
  const { label, stepDef, isStart, isEnd, direction = 'LR' } = data
  const caseCount = stepDef.cases.length

  // Determine handle positions based on layout direction
  const targetPosition = direction === 'TB' ? Position.Top : Position.Left
  const sourcePosition = direction === 'TB' ? Position.Bottom : Position.Right

  return (
    <div className="switch-node">
      <Handle type="target" position={targetPosition} />

      <div className="node-header">
        <div className="node-badges">
          {isStart && <span className="badge badge-start">START</span>}
          {isEnd && <span className="badge badge-end">END</span>}
        </div>
        <div className="node-type">SWITCH</div>
        <div className="node-label">{label}</div>
      </div>

      <div className="node-body">
        <div className="node-field">
          <span className="field-label">Branches:</span>
          <span className="field-value">{caseCount} case{caseCount !== 1 ? 's' : ''} + default</span>
        </div>

        {stepDef.description && (
          <div className="node-description">{stepDef.description}</div>
        )}

        <div className="node-section">
          <div className="section-title">Cases:</div>
          <ul className="cases-list">
            {stepDef.cases.map((caseDef, idx) => (
              <li key={idx} className="case-item">
                <span className="case-when">{caseDef.when}</span>
                <span className="case-arrow">→</span>
                <span className="case-goto">{caseDef.goto}</span>
              </li>
            ))}
            <li className="case-item case-default">
              <span className="case-when">default</span>
              <span className="case-arrow">→</span>
              <span className="case-goto">{stepDef.default}</span>
            </li>
          </ul>
        </div>
      </div>

      <Handle type="source" position={sourcePosition} />
    </div>
  )
})

SwitchNode.displayName = 'SwitchNode'
