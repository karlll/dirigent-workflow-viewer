import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { XCircle } from 'lucide-react'
import type { LayoutDirection } from '../../utils/layout'

interface FailTerminalNodeData {
  direction?: LayoutDirection
}

/**
 * Special fail terminal node component
 * Minimal design with only title, icon, and color
 */
export const FailTerminalNode = memo(({ data }: NodeProps<FailTerminalNodeData>) => {
  const { direction = 'LR' } = data

  // Only target handle (no source - this is a terminal point)
  const targetPosition = direction === 'TB' ? Position.Top : Position.Left

  return (
    <div className="fail-terminal-node special-node">
      <Handle type="target" position={targetPosition} />
      <div className="special-node-content">
        <XCircle className="special-node-icon" />
        <div className="special-node-title">FAIL</div>
      </div>
    </div>
  )
})

FailTerminalNode.displayName = 'FailTerminalNode'
