/**
 * Detailed view of a workflow instance with real-time monitoring.
 */

import { InstanceMonitor } from '../../lib/components/InstanceMonitor'
import { EmptyState } from './EmptyState'

interface InstanceDetailViewProps {
  instanceId: string | null
  apiBaseUrl: string
}

export function InstanceDetailView({
  instanceId,
  apiBaseUrl,
}: InstanceDetailViewProps) {
  if (!instanceId) {
    return (
      <EmptyState
        message="Select an instance to view details"
        icon="📊"
      />
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        gap: '1rem',
      }}
    >
      <InstanceMonitor instanceId={instanceId} apiBaseUrl={apiBaseUrl} />
    </div>
  )
}
