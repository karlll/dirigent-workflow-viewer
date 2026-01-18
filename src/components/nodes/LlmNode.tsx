import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { Brain, CheckCircle, XCircle, AlertCircle, Clock, Loader2 } from 'lucide-react'
import type { LlmStepDef } from '../../types/workflow'
import type { LayoutDirection } from '../../utils/layout'
import type { ExecutionState } from '../../types/execution'
import { classNames } from '../../utils/classNames'
import { BorderLoadingIndicator } from './BorderLoadingIndicator'

interface LlmNodeData extends Record<string, unknown> {
  label: string
  stepDef: LlmStepDef
  direction?: LayoutDirection
  execution?: ExecutionState
}

type LlmNode = Node<LlmNodeData>

/**
 * Custom node component for LLM steps
 * Displays tool name, output schema, and validation rules
 */
export const LlmNode = memo(({ data }: NodeProps<LlmNode>) => {
  const { label, stepDef, direction = 'LR', execution } = data
  const outputFields = Object.entries(stepDef.out || {})
  const hasValidation = stepDef.validate && stepDef.validate.length > 0

  // Determine handle positions based on layout direction
  const targetPosition = direction === 'TB' ? Position.Top : Position.Left
  const sourcePosition = direction === 'TB' ? Position.Bottom : Position.Right

  // Build dynamic className based on execution state
  const nodeClassName = classNames('llm-node', {
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
            <div className="node-type">LLM</div>
            <div className="node-label">{label}</div>
          </div>
          <div className="node-header-icons">
            <Brain className="node-icon" />
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

        {outputFields.length > 0 && (
          <div className="node-section">
            <div className="section-title">Output:</div>
            <div className="output-schema">
              {outputFields.map(([key, type]) => (
                <div key={key} className="schema-field">
                  <span className="schema-key">{key}</span>
                  <span className="schema-type">{type}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasValidation && (
          <div className="node-section">
            <div className="section-title">Validation:</div>
            <ul className="validation-list">
              {stepDef.validate!.map((rule, idx) => (
                <li key={idx} className="validation-rule">{rule}</li>
              ))}
            </ul>
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

  // Wrap with BorderLoadingIndicator if this is the currently executing step
  return execution?.isCurrentStep ? (
    <BorderLoadingIndicator>{nodeContent}</BorderLoadingIndicator>
  ) : (
    nodeContent
  )
})

LlmNode.displayName = 'LlmNode'
