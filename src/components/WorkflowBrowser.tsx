/**
 * WorkflowBrowser component for browsing and selecting workflows.
 */

import { useWorkflows } from '../lib/hooks'
import type { WorkflowMetadata } from '../types/api'
import { cn } from '../lib/utils'

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
        className={cn('workflow-viewer flex items-center justify-center p-8 text-muted-foreground', className)}
        style={style}
      >
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-border border-t-primary rounded-full animate-spin mx-auto mb-2" />
          <div className="text-sm">Loading workflows...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={cn(
          'workflow-viewer p-4 text-destructive bg-destructive/10 rounded-lg border border-destructive text-sm',
          className
        )}
        style={style}
      >
        <strong>Error:</strong> {error}
      </div>
    )
  }

  if (workflows.length === 0) {
    return (
      <div
        className={cn('workflow-viewer p-8 text-muted-foreground text-center text-sm', className)}
        style={style}
      >
        No workflows found
      </div>
    )
  }

  if (mode === 'dropdown') {
    return (
      <select
        className={cn('workflow-viewer w-full p-2 border border-border rounded-md text-sm bg-card cursor-pointer', className)}
        value={selectedWorkflow || ''}
        onChange={(e) => onSelect?.(e.target.value)}
        style={style}
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
      className={cn(
        'p-4 border-2 rounded-lg bg-card cursor-pointer text-left transition-all duration-200',
        selected
          ? 'border-primary bg-primary/10'
          : 'border-border hover:border-muted-foreground hover:bg-muted/10'
      )}
      aria-label={`Select workflow ${workflow.name}`}
      aria-pressed={selected}
    >
      <div className="font-semibold mb-1 text-foreground">
        {workflow.name}
      </div>
      <div className="text-xs text-muted-foreground mb-2">
        Version {workflow.version}
      </div>
      {showMetadata && (
        <>
          <div className="text-xs text-muted-foreground mt-2">
            {workflow.stepCount} step{workflow.stepCount !== 1 ? 's' : ''}
          </div>
          {workflow.triggerTypes.length > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
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
      className={cn(
        'flex items-center justify-between p-3 border rounded-md bg-card cursor-pointer text-left transition-all duration-200 w-full',
        selected
          ? 'border-primary bg-primary/10'
          : 'border-border hover:border-muted-foreground hover:bg-muted/10'
      )}
      aria-label={`Select workflow ${workflow.name}`}
      aria-pressed={selected}
    >
      <div className="flex-1">
        <div className="font-semibold text-foreground mb-0.5">
          {workflow.name}
        </div>
        <div className="text-xs text-muted-foreground">Version {workflow.version}</div>
      </div>
      {showMetadata && (
        <div className="text-xs text-muted-foreground text-right">
          <div>{workflow.stepCount} steps</div>
          {workflow.triggerTypes.length > 0 && (
            <div className="mt-0.5">{workflow.triggerTypes.length} triggers</div>
          )}
        </div>
      )}
    </button>
  )
}
