/**
 * WorkflowBrowser component for browsing and selecting workflows.
 */

import { useWorkflows } from '../lib/hooks'
import type { WorkflowMetadata } from '../types/api'

/**
 * Props for WorkflowBrowser component
 */
export interface WorkflowBrowserProps {
  /** Base URL of the Dirigent API */
  apiBaseUrl: string

  /** Currently selected workflow name */
  selectedWorkflow?: string

  /** Callback when workflow is selected */
  onSelect?: (workflowName: string) => void

  /** Display mode: 'list', 'grid', 'dropdown' */
  mode?: 'list' | 'grid' | 'dropdown'

  /** Show workflow metadata (trigger types, step count) */
  showMetadata?: boolean

  /** Custom CSS class */
  className?: string

  /** Custom styles */
  style?: React.CSSProperties
}

/**
 * WorkflowBrowser component
 *
 * Fetches and displays available workflows from the Dirigent API.
 * Allows users to select a workflow to view or monitor.
 *
 * @example
 * ```tsx
 * <WorkflowBrowser
 *   apiBaseUrl="http://localhost:8080"
 *   mode="list"
 *   onSelect={(name) => setSelectedWorkflow(name)}
 *   showMetadata
 * />
 * ```
 */
export function WorkflowBrowser({
  apiBaseUrl,
  selectedWorkflow,
  onSelect,
  mode = 'list',
  showMetadata = false,
  className = '',
  style,
}: WorkflowBrowserProps) {
  const { workflows, loading, error } = useWorkflows(apiBaseUrl)

  if (loading) {
    return (
      <div
        className={`workflow-viewer ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          color: '#6b7280',
          ...style,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              border: '3px solid #e5e7eb',
              borderTopColor: '#3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 0.5rem',
            }}
          />
          <div style={{ fontSize: '0.875rem' }}>Loading workflows...</div>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`workflow-viewer ${className}`}
        style={{
          padding: '1rem',
          color: '#ef4444',
          backgroundColor: '#fee2e2',
          borderRadius: '0.5rem',
          border: '1px solid #fca5a5',
          fontSize: '0.875rem',
          ...style,
        }}
      >
        <strong>Error:</strong> {error}
      </div>
    )
  }

  if (workflows.length === 0) {
    return (
      <div
        className={`workflow-viewer ${className}`}
        style={{
          padding: '2rem',
          color: '#6b7280',
          textAlign: 'center',
          fontSize: '0.875rem',
          ...style,
        }}
      >
        No workflows found
      </div>
    )
  }

  if (mode === 'dropdown') {
    return (
      <select
        className={`workflow-viewer ${className}`}
        value={selectedWorkflow || ''}
        onChange={(e) => onSelect?.(e.target.value)}
        style={{
          width: '100%',
          padding: '0.5rem',
          border: '1px solid #d1d5db',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          backgroundColor: 'white',
          cursor: 'pointer',
          ...style,
        }}
        aria-label="Select workflow"
      >
        <option value="">Select a workflow...</option>
        {workflows.map((workflow) => (
          <option key={workflow.name} value={workflow.name}>
            {workflow.name} (v{workflow.version})
          </option>
        ))}
      </select>
    )
  }

  if (mode === 'grid') {
    return (
      <div
        className={`workflow-viewer ${className}`}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem',
          ...style,
        }}
      >
        {workflows.map((workflow) => (
          <WorkflowCard
            key={workflow.name}
            workflow={workflow}
            selected={selectedWorkflow === workflow.name}
            showMetadata={showMetadata}
            onClick={() => onSelect?.(workflow.name)}
          />
        ))}
      </div>
    )
  }

  // Default: list mode
  return (
    <div
      className={`workflow-viewer ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        ...style,
      }}
    >
      {workflows.map((workflow) => (
        <WorkflowListItem
          key={workflow.name}
          workflow={workflow}
          selected={selectedWorkflow === workflow.name}
          showMetadata={showMetadata}
          onClick={() => onSelect?.(workflow.name)}
        />
      ))}
    </div>
  )
}

/**
 * WorkflowCard component for grid mode
 */
interface WorkflowCardProps {
  workflow: WorkflowMetadata
  selected: boolean
  showMetadata: boolean
  onClick: () => void
}

function WorkflowCard({ workflow, selected, showMetadata, onClick }: WorkflowCardProps) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '1rem',
        border: `2px solid ${selected ? '#3b82f6' : '#e5e7eb'}`,
        borderRadius: '0.5rem',
        backgroundColor: selected ? '#eff6ff' : 'white',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = '#d1d5db'
          e.currentTarget.style.backgroundColor = '#f9fafb'
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = '#e5e7eb'
          e.currentTarget.style.backgroundColor = 'white'
        }
      }}
      aria-label={`Select workflow ${workflow.name}`}
      aria-pressed={selected}
    >
      <div style={{ fontWeight: 600, marginBottom: '0.25rem', color: '#111827' }}>
        {workflow.name}
      </div>
      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
        Version {workflow.version}
      </div>
      {showMetadata && (
        <>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
            {workflow.stepCount} step{workflow.stepCount !== 1 ? 's' : ''}
          </div>
          {workflow.triggerTypes.length > 0 && (
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
              Triggers: {workflow.triggerTypes.join(', ')}
            </div>
          )}
        </>
      )}
    </button>
  )
}

/**
 * WorkflowListItem component for list mode
 */
interface WorkflowListItemProps {
  workflow: WorkflowMetadata
  selected: boolean
  showMetadata: boolean
  onClick: () => void
}

function WorkflowListItem({ workflow, selected, showMetadata, onClick }: WorkflowListItemProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        border: `1px solid ${selected ? '#3b82f6' : '#e5e7eb'}`,
        borderRadius: '0.375rem',
        backgroundColor: selected ? '#eff6ff' : 'white',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s',
        width: '100%',
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = '#d1d5db'
          e.currentTarget.style.backgroundColor = '#f9fafb'
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = '#e5e7eb'
          e.currentTarget.style.backgroundColor = 'white'
        }
      }}
      aria-label={`Select workflow ${workflow.name}`}
      aria-pressed={selected}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, color: '#111827', marginBottom: '0.125rem' }}>
          {workflow.name}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Version {workflow.version}</div>
      </div>
      {showMetadata && (
        <div style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'right' }}>
          <div>{workflow.stepCount} steps</div>
          {workflow.triggerTypes.length > 0 && (
            <div style={{ marginTop: '0.125rem' }}>{workflow.triggerTypes.length} triggers</div>
          )}
        </div>
      )}
    </button>
  )
}
