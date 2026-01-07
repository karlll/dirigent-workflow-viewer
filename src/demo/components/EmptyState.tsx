/**
 * Empty state placeholder component
 */

interface EmptyStateProps {
  message: string
  icon?: React.ReactNode
}

export function EmptyState({ message, icon }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '2rem',
        color: '#6b7280',
      }}
    >
      <div
        style={{
          fontSize: '3rem',
          marginBottom: '1rem',
          opacity: 0.5,
        }}
      >
        {icon || '📋'}
      </div>
      <p
        style={{
          fontSize: '1rem',
          margin: 0,
          textAlign: 'center',
        }}
      >
        {message}
      </p>
    </div>
  )
}
