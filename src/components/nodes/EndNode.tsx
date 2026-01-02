import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { CheckCircle2 } from 'lucide-react'
import type { LayoutDirection } from '../../utils/layout'

interface EndNodeData {
  direction?: LayoutDirection
}

/**
 * Special end node component
 * Minimal design with only title, icon, and color
 */
export const EndNode = memo(({ data }: NodeProps<EndNodeData>) => {
  const { direction = 'LR' } = data

  // Only target handle (no source - this is a terminal point)
  const targetPosition = direction === 'TB' ? Position.Top : Position.Left

  return (
    <div className="end-node special-node">
      <Handle type="target" position={targetPosition} />
      <div className="special-node-content">
        <CheckCircle2 className="special-node-icon" />
        <div className="special-node-title">END</div>
      </div>
    </div>
  )
})

EndNode.displayName = 'EndNode'
