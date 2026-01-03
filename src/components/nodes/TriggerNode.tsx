import { memo, useState } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { Zap } from 'lucide-react'
import type { LayoutDirection } from '../../utils/layout'
import type { Trigger } from '../../types/workflow'

interface TriggerNodeData extends Record<string, unknown> {
  direction?: LayoutDirection
  triggers?: Trigger[]
}

type TriggerNode = Node<TriggerNodeData>

/**
 * Special trigger node component for event-driven workflows
 * Shows minimal info with hover tooltip for trigger details
 */
export const TriggerNode = memo(({ data }: NodeProps<TriggerNode>) => {
  const { direction = 'LR', triggers = [] } = data
  const triggerCount = triggers.length
  const [showTooltip, setShowTooltip] = useState(false)

  // Only source handle (no target - this is the entry point)
  const sourcePosition = direction === 'TB' ? Position.Bottom : Position.Right

  // Dynamically size circle based on trigger count
  const nodeSize = triggerCount > 1 ? 'trigger-node-large' : ''

  return (
    <div
      className={`trigger-node special-node ${nodeSize}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {showTooltip && triggers.length > 0 && (
        <div className="trigger-tooltip">
          <div className="trigger-tooltip-header">Event Triggers</div>
          {triggers.map((trigger, idx) => (
            <div key={idx} className="trigger-tooltip-item">
              <div className="trigger-type">{trigger.type}</div>
              {trigger.when && (
                <div className="trigger-condition">{trigger.when}</div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="special-node-content">
        <Zap className="special-node-icon" />
        <div className="special-node-title">
          TRIGGER{triggerCount > 1 ? ` (${triggerCount})` : ''}
        </div>
      </div>
      <Handle type="source" position={sourcePosition} />
    </div>
  )
})

TriggerNode.displayName = 'TriggerNode'
