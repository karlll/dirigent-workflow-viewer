import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { GitBranch, CheckCircle, XCircle, AlertCircle, Clock, Loader2 } from 'lucide-react'
import type { SwitchStepDef } from '../../types/workflow'
import type { LayoutDirection } from '../../utils/layout'
import type { ExecutionState } from '../../types/execution'
import { classNames } from '../../utils/classNames'

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
  const { label, stepDef, direction = 'LR', execution } = data
  const caseCount = stepDef.cases.length

  // Determine handle positions based on layout direction
  const targetPosition = direction === 'TB' ? Position.Top : Position.Left
  const sourcePosition = direction === 'TB' ? Position.Bottom : Position.Right

  // Build dynamic className based on execution state
  const nodeClassName = classNames('switch-node', {
    'node-pending': execution?.status === 'pending',
    'node-running': execution?.status === 'running',
    'node-completed': execution?.status === 'completed',
    'node-failed': execution?.status === 'failed',
    'node-skipped': execution?.status === 'skipped',
    'on-execution-path': execution?.isOnExecutionPath,
    'current-step': execution?.isCurrentStep,
  })

  return (
    <div className={nodeClassName}>
      <Handle type="target" position={targetPosition} />

      <div className="node-header">
        <div className="node-header-content">
          <div>
            <div className="node-type">SWITCH</div>
            <div className="node-label">{label}</div>
          </div>
          <div className="node-header-icons">
            <GitBranch className="node-icon" />
            {execution && (
              <div className="execution-status">
                {execution.status === 'running' && <Loader2 className="animate-spin" size={16} />}
                {execution.status === 'completed' && <CheckCircle size={16} />}
                {execution.status === 'failed' && <XCircle size={16} />}
              </div>
            )}
          </div>
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

        {execution?.durationMs !== undefined && (
          <div className="execution-timing">
            <Clock size={14} />
            <span>{execution.durationMs}ms</span>
          </div>
        )}

        {execution?.error && (
          <div className="execution-error">
            <AlertCircle size={14} />
            <span>{execution.error}</span>
          </div>
        )}
      </div>

      <Handle type="source" position={sourcePosition} />
    </div>
  )
})

SwitchNode.displayName = 'SwitchNode'
