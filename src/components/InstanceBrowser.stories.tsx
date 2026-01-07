/**
 * Storybook stories for InstanceBrowser component
 */

import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { InstanceBrowser } from './InstanceBrowser'
import { handlers, emptyHandlers, errorHandlers } from '../mocks/handlers'
import { http, HttpResponse, delay } from 'msw'

const meta: Meta<typeof InstanceBrowser> = {
  title: 'Components/InstanceBrowser',
  component: InstanceBrowser,
  parameters: {
    layout: 'padded',
    msw: {
      handlers,
    },
  },
}

export default meta
type Story = StoryObj<typeof InstanceBrowser>

// Interactive wrapper to demonstrate selection
function InteractiveWrapper({
  status,
  workflowName,
  refreshInterval,
  showMetadata,
}: {
  status?: 'RUNNING' | 'COMPLETED' | 'FAILED'
  workflowName?: string
  refreshInterval?: number
  showMetadata?: boolean
}) {
  const [selected, setSelected] = useState<string>()

  return (
    <div>
      <InstanceBrowser
        apiBaseUrl="http://localhost:8080"
        status={status}
        workflowName={workflowName}
        refreshInterval={refreshInterval}
        showMetadata={showMetadata}
        selectedInstance={selected}
        onSelect={setSelected}
      />
      {selected && (
        <div
          style={{
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: '#f0f9ff',
            borderRadius: '0.5rem',
          }}
        >
          Selected: <strong>{selected}</strong>
        </div>
      )}
    </div>
  )
}

export const AllInstances: Story = {
  render: () => <InteractiveWrapper />,
}

export const WithMetadata: Story = {
  render: () => <InteractiveWrapper showMetadata />,
}

export const WithSelection: Story = {
  render: () => (
    <InstanceBrowser
      apiBaseUrl="http://localhost:8080"
      showMetadata
      selectedInstance="instance-2"
      onSelect={() => {}}
    />
  ),
}

export const FilteredByStatus: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/v1/instances', async ({ request }) => {
          await delay(100)
          const url = new URL(request.url)
          const status = url.searchParams.get('status')

          // Return only running instances
          const runningInstance = {
            id: 'instance-1',
            workflowName: 'sample_workflow',
            workflowVersion: 1,
            status: 'RUNNING',
            triggeredBy: 'evt-001',
            startedAt: '2026-01-07T10:00:00Z',
            completedAt: null,
            durationMs: null,
          }

          if (status === 'RUNNING') {
            return HttpResponse.json({
              instances: [runningInstance],
              total: 1,
              limit: 50,
              offset: 0,
            })
          }

          return HttpResponse.json({
            instances: [],
            total: 0,
            limit: 50,
            offset: 0,
          })
        }),
      ],
    },
  },
  render: () => <InteractiveWrapper status="RUNNING" showMetadata />,
}

export const FilteredByWorkflow: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/v1/instances', async ({ request }) => {
          await delay(100)
          const url = new URL(request.url)
          const workflowName = url.searchParams.get('workflowName')

          const sampleWorkflowInstances = [
            {
              id: 'instance-1',
              workflowName: 'sample_workflow',
              workflowVersion: 1,
              status: 'RUNNING',
              triggeredBy: 'evt-001',
              startedAt: '2026-01-07T10:00:00Z',
              completedAt: null,
              durationMs: null,
            },
            {
              id: 'instance-4',
              workflowName: 'sample_workflow',
              workflowVersion: 1,
              status: 'COMPLETED',
              triggeredBy: 'evt-004',
              startedAt: '2026-01-07T09:30:00Z',
              completedAt: '2026-01-07T09:31:15Z',
              durationMs: 75000,
            },
          ]

          if (workflowName === 'sample_workflow') {
            return HttpResponse.json({
              instances: sampleWorkflowInstances,
              total: 2,
              limit: 50,
              offset: 0,
            })
          }

          return HttpResponse.json({
            instances: [],
            total: 0,
            limit: 50,
            offset: 0,
          })
        }),
      ],
    },
  },
  render: () => (
    <InteractiveWrapper workflowName="sample_workflow" showMetadata />
  ),
}

export const WithAutoRefresh: Story = {
  render: () => <InteractiveWrapper refreshInterval={5000} showMetadata />,
}

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/v1/instances', async () => {
          await delay(100)
          return HttpResponse.json({
            instances: [],
            total: 0,
            limit: 50,
            offset: 0,
          })
        }),
      ],
    },
  },
  render: () => <InstanceBrowser apiBaseUrl="http://localhost:8080" />,
}

export const EmptyWithFilters: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/v1/instances', async () => {
          await delay(100)
          return HttpResponse.json({
            instances: [],
            total: 0,
            limit: 50,
            offset: 0,
          })
        }),
      ],
    },
  },
  render: () => (
    <InstanceBrowser
      apiBaseUrl="http://localhost:8080"
      workflowName="missing_workflow"
      status="RUNNING"
    />
  ),
}

export const Error: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/v1/instances', async () => {
          await delay(100)
          return new HttpResponse(null, { status: 500 })
        }),
      ],
    },
  },
  render: () => <InstanceBrowser apiBaseUrl="http://localhost:8080" />,
}
