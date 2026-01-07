/**
 * Sidebar component for demo application
 */

interface SidebarProps {
  activeView: 'workflows' | 'instances'
  onViewChange: (view: 'workflows' | 'instances') => void
  workflowCount: number
  runningInstances: number
  totalInstances: number
}

export function Sidebar({
  activeView,
  onViewChange,
  workflowCount,
  runningInstances,
  totalInstances,
}: SidebarProps) {
  return (
    <nav
      style={{
        width: '240px',
        backgroundColor: '#f8fafc',
        borderRight: '1px solid #e2e8f0',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      <NavItem
        icon="📋"
        label="Workflows"
        badge={workflowCount.toString()}
        active={activeView === 'workflows'}
        onClick={() => onViewChange('workflows')}
      />
      <NavItem
        icon="📊"
        label="Instances"
        badge={`${runningInstances}/${totalInstances}`}
        active={activeView === 'instances'}
        onClick={() => onViewChange('instances')}
      />
    </nav>
  )
}

interface NavItemProps {
  icon: string
  label: string
  badge: string
  active: boolean
  onClick: () => void
}

function NavItem({ icon, label, badge, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        backgroundColor: active ? '#3b82f6' : 'transparent',
        color: active ? 'white' : '#475569',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: active ? 600 : 500,
        transition: 'all 0.2s',
        width: '100%',
        textAlign: 'left',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = '#e2e8f0'
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'transparent'
        }
      }}
      aria-current={active ? 'page' : undefined}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.25rem' }}>{icon}</span>
        <span>{label}</span>
      </div>
      <span
        style={{
          padding: '0.125rem 0.5rem',
          backgroundColor: active ? 'rgba(255, 255, 255, 0.2)' : '#e2e8f0',
          color: active ? 'white' : '#64748b',
          borderRadius: '0.25rem',
          fontSize: '0.75rem',
          fontWeight: 600,
        }}
      >
        {badge}
      </span>
    </button>
  )
}
