/**
 * Header component for demo application
 */

interface HeaderProps {
  onSettingsClick: () => void
  connected: boolean
  sseConnected: boolean
}

export function Header({
  onSettingsClick,
  connected,
  sseConnected,
}: HeaderProps) {
  return (
    <header
      style={{
        padding: '1rem 1.5rem',
        backgroundColor: '#1e293b',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #334155',
      }}
    >
      <div>
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
          Dirigent Workflow Viewer
        </h1>
        <div
          style={{
            fontSize: '0.75rem',
            color: '#94a3b8',
            marginTop: '0.25rem',
          }}
        >
          Demo Application
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Connection Status */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <StatusIndicator label="REST" connected={connected} />
          <StatusIndicator label="SSE" connected={sseConnected} />
        </div>

        {/* Settings Button */}
        <button
          onClick={onSettingsClick}
          style={{
            padding: '0.5rem',
            backgroundColor: 'transparent',
            border: '1px solid #475569',
            borderRadius: '0.375rem',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#334155'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
          title="Settings"
          aria-label="Open settings"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v6m0 6v6m8.66-10v6m-17.32 0v-6M20 12h-6m-6 0H2m17.66-8.66l-4.24 4.24m-6.84 6.84l-4.24 4.24m13.08 0l-4.24-4.24M7.76 7.76L3.52 3.52" />
          </svg>
        </button>
      </div>
    </header>
  )
}

interface StatusIndicatorProps {
  label: string
  connected: boolean
}

function StatusIndicator({ label, connected }: StatusIndicatorProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.75rem',
      }}
    >
      <span style={{ color: '#94a3b8' }}>{label}:</span>
      <div
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: connected ? '#10b981' : '#ef4444',
          boxShadow: connected
            ? '0 0 8px rgba(16, 185, 129, 0.6)'
            : '0 0 8px rgba(239, 68, 68, 0.6)',
        }}
        title={connected ? 'Connected' : 'Disconnected'}
      />
    </div>
  )
}
