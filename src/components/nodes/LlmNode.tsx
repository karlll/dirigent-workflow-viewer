import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import type { LlmStepDef } from '../../types/workflow'

interface LlmNodeData {
  label: string
  stepDef: LlmStepDef
  isStart?: boolean
  isEnd?: boolean
}

/**
 * Custom node component for LLM steps
 * Displays tool name, output schema, validation rules, and error handling
 */
export const LlmNode = memo(({ data }: NodeProps<LlmNodeData>) => {
  const { label, stepDef, isStart, isEnd } = data
  const outputFields = Object.entries(stepDef.out || {})
  const hasValidation = stepDef.validate && stepDef.validate.length > 0
  const hasErrorHandler = !!stepDef.on_error

  return (
    <div className="llm-node">
      <Handle type="target" position={Position.Left} />

      <div className="node-header">
        <div className="node-badges">
          {isStart && <span className="badge badge-start">START</span>}
          {isEnd && <span className="badge badge-end">END</span>}
        </div>
        <div className="node-type">LLM</div>
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

        {hasErrorHandler && (
          <div className="node-indicator error-handler">
            ⚠️ Has error handler
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  )
})

LlmNode.displayName = 'LlmNode'
