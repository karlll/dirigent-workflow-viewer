import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { Wrench, CheckCircle, XCircle, AlertCircle, Clock, Loader2 } from 'lucide-react'
import type { ToolStepDef } from '../../types/workflow'
import type { LayoutDirection } from '../../utils/layout'
import type { ExecutionState } from '../../types/execution'
import { classNames } from '../../utils/classNames'

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
  const { label, stepDef, direction = 'LR', execution } = data
  const hasArgs = stepDef.args && Object.keys(stepDef.args).length > 0

  // Determine handle positions based on layout direction
  const targetPosition = direction === 'TB' ? Position.Top : Position.Left
  const sourcePosition = direction === 'TB' ? Position.Bottom : Position.Right

  // Build dynamic className based on execution state
  const nodeClassName = classNames('tool-node', {
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
            <div className="node-type">TOOL</div>
            <div className="node-label">{label}</div>
          </div>
          <div className="node-header-icons">
            <Wrench className="node-icon" />
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

ToolNode.displayName = 'ToolNode'
