import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { AlertTriangle, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react'
import type { FailStepDef } from '../../types/workflow'
import type { LayoutDirection } from '../../utils/layout'
import type { ExecutionState } from '../../types/execution'
import { classNames } from '../../utils/classNames'
import { BorderLoadingIndicator } from './BorderLoadingIndicator'

interface FailNodeData extends Record<string, unknown> {
  label: string
  stepDef: FailStepDef
  direction?: LayoutDirection
  execution?: ExecutionState
}

type FailNode = Node<FailNodeData>

/**
 * Custom node component for Fail/error steps
 * Displays failure reason
 */
export const FailNode = memo(({ data }: NodeProps<FailNode>) => {
  const { label, stepDef, direction = 'LR', execution } = data

  // Determine handle positions based on layout direction
  const targetPosition = direction === 'TB' ? Position.Top : Position.Left
  const sourcePosition = direction === 'TB' ? Position.Bottom : Position.Right

  // Build dynamic className based on execution state
  const nodeClassName = classNames('fail-node', {
    'node-pending': execution?.status === 'pending',
    'node-running': execution?.status === 'running',
    'node-completed': execution?.status === 'completed',
    'node-failed': execution?.status === 'failed',
    'node-skipped': execution?.status === 'skipped',
    'on-execution-path': execution?.isOnExecutionPath,
    'current-step': execution?.isCurrentStep,
  })

  const nodeContent = (
    <div className={nodeClassName}>
      <Handle type="target" position={targetPosition} />

      <div className="node-header">
        <div className="node-header-content">
          <div>
            <div className="node-type">FAIL</div>
            <div className="node-label">{label}</div>
          </div>
          <div className="node-header-icons">
            <AlertTriangle className="node-icon" />
            {execution && (
              <div className="execution-status">
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
          <span className="field-label">Reason:</span>
          <span className="field-value reason-text">{stepDef.reason}</span>
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

  // Wrap with BorderLoadingIndicator if this is the currently executing step
  return execution?.isCurrentStep ? (
    <BorderLoadingIndicator>{nodeContent}</BorderLoadingIndicator>
  ) : (
    nodeContent
  )
})

FailNode.displayName = 'FailNode'
