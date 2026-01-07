/**
 * Workflow detail view component showing YAML + visualization
 */

import { useState } from 'react'
import { useWorkflowDefinition } from '../../lib/hooks'
import { Workflow } from '../../components/Workflow'
import type { LayoutDirection } from '../../utils/layout'

interface WorkflowDetailViewProps {
  workflowName: string
  apiBaseUrl: string
}

export function WorkflowDetailView({
  workflowName,
  apiBaseUrl,
}: WorkflowDetailViewProps) {
  const [layoutDirection, setLayoutDirection] = useState<LayoutDirection>('LR')
  const { yaml, workflow, loading, error } = useWorkflowDefinition(
    workflowName,
    apiBaseUrl
  )

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
        Loading workflow...
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#ef4444',
        }}
      >
        <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
          Error loading workflow
        </p>
        <p style={{ fontSize: '0.875rem' }}>{error}</p>
      </div>
    )
  }

  if (!workflow) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
        Workflow not found
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
              {workflow.name}
            </h2>
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                marginTop: '0.5rem',
                fontSize: '0.875rem',
                color: '#6b7280',
              }}
            >
              <span>Version: {workflow.version}</span>
              {workflow.triggers && workflow.triggers.length > 0 && (
                <span>
                  Triggers: {workflow.triggers.map((t) => t.type).join(', ')}
                </span>
              )}
            </div>
          </div>

          {/* Layout Direction Toggle */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setLayoutDirection('LR')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor:
                  layoutDirection === 'LR' ? '#3b82f6' : 'transparent',
                color: layoutDirection === 'LR' ? 'white' : '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Horizontal
            </button>
            <button
              onClick={() => setLayoutDirection('TB')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor:
                  layoutDirection === 'TB' ? '#3b82f6' : 'transparent',
                color: layoutDirection === 'TB' ? 'white' : '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Vertical
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* YAML Panel */}
        <div
          style={{
            width: '40%',
            borderRight: '1px solid #e5e7eb',
            overflow: 'auto',
            backgroundColor: '#f9fafb',
          }}
        >
          <div style={{ padding: '1rem' }}>
            <h3
              style={{
                margin: '0 0 1rem 0',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#374151',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Workflow Definition (YAML)
            </h3>
            <pre
              style={{
                margin: 0,
                padding: '1rem',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                fontSize: '0.75rem',
                lineHeight: '1.5',
                overflow: 'auto',
                fontFamily: 'ui-monospace, monospace',
              }}
            >
              {yaml}
            </pre>
          </div>
        </div>

        {/* Visualization Panel */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            backgroundColor: 'white',
          }}
        >
          <div style={{ padding: '1rem', height: '100%' }}>
            <h3
              style={{
                margin: '0 0 1rem 0',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#374151',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Visual Representation
            </h3>
            <div
              style={{
                height: 'calc(100% - 2.5rem)',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
              }}
            >
              <Workflow workflow={workflow} direction={layoutDirection} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
