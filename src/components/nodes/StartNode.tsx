import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { Play } from 'lucide-react'
import type { LayoutDirection } from '../../utils/layout'

interface StartNodeData {
  direction?: LayoutDirection
}

/**
 * Special start node component
 * Minimal design with only title, icon, and color
 */
export const StartNode = memo(({ data }: NodeProps<StartNodeData>) => {
  const { direction = 'LR' } = data

  // Only source handle (no target - this is the entry point)
  const sourcePosition = direction === 'TB' ? Position.Bottom : Position.Right

  return (
    <div className="start-node special-node">
      <div className="special-node-content">
        <Play className="special-node-icon" />
        <div className="special-node-title">START</div>
      </div>
      <Handle type="source" position={sourcePosition} />
    </div>
  )
})

StartNode.displayName = 'StartNode'
