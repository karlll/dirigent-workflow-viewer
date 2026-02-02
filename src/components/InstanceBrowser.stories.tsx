/**
 * Storybook stories for InstanceBrowser component
 */

import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { InstanceBrowser } from './InstanceBrowser'
import { handlers } from '../mocks/handlers'
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
  argTypes: {
    colorMode: {
      control: 'radio',
      options: ['light', 'dark', 'system'],
      description: 'Color scheme: light, dark, or system (follows OS preference)',
    },
    showMetadata: {
      control: 'boolean',
      description: 'Show detailed metadata (timestamps, duration, trigger)',
    },
    showHeader: {
      control: 'boolean',
      description: 'Show header with instance count and filters',
    },
    refreshInterval: {
      control: 'number',
      description: 'Auto-refresh interval in milliseconds (0 to disable)',
    },
  },
}

export default meta
type Story = StoryObj<typeof InstanceBrowser>

// Interactive wrapper to demonstrate selection
function InteractiveWrapper({
  apiBaseUrl,
  status,
  workflowName,
  refreshInterval,
  showMetadata,
  colorMode,
}: {
  apiBaseUrl: string
  status?: 'RUNNING' | 'COMPLETED' | 'FAILED'
  workflowName?: string
  refreshInterval?: number
  showMetadata?: boolean
  colorMode?: 'light' | 'dark' | 'system'
}) {
  const [selected, setSelected] = useState<string>()

  return (
    <div>
      <InstanceBrowser
        apiBaseUrl={apiBaseUrl}
        status={status}
        workflowName={workflowName}
        refreshInterval={refreshInterval}
        showMetadata={showMetadata}
        colorMode={colorMode}
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
  args: {
    apiBaseUrl: 'http://localhost:8080',
  },
  render: (args) => <InteractiveWrapper {...args} />
}

export const WithMetadata: Story = {
  args: {
    apiBaseUrl: 'http://localhost:8080',
    showMetadata: true,
  },
  render: (args) => <InteractiveWrapper {...args} />,
}

export const WithSelection: Story = {
  args: {
    apiBaseUrl: 'http://localhost:8080',
    showMetadata: true,
    selectedInstance: 'instance-2',
  },
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
  args: {
    apiBaseUrl: 'http://localhost:8080',
    status: 'RUNNING',
    showMetadata: true,
  },
  render: (args) => <InteractiveWrapper {...args} />,
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
  args: {
    apiBaseUrl: 'http://localhost:8080',
    workflowName: 'sample_workflow',
    showMetadata: true,
  },
  render: (args) => <InteractiveWrapper {...args} />,
}

export const WithAutoRefresh: Story = {
  args: {
    apiBaseUrl: 'http://localhost:8080',
    refreshInterval: 5000,
    showMetadata: true,
  },
  render: (args) => <InteractiveWrapper {...args} />,
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
  args: {
    apiBaseUrl: 'http://localhost:8080',
  },
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
  args: {
    apiBaseUrl: 'http://localhost:8080',
    workflowName: 'missing_workflow',
    status: 'RUNNING',
  },
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
  args: {
    apiBaseUrl: 'http://localhost:8080',
  },
}

/**
 * Dark mode - demonstrates dark color scheme with Catppuccin Mocha colors.
 */
export const DarkMode: Story = {
  args: {
    apiBaseUrl: 'http://localhost:8080',
    colorMode: 'dark',
    showMetadata: true,
  },
  render: (args) => <InteractiveWrapper {...args} />,
}

/**
 * Dark mode with selection - demonstrates dark mode with selected item.
 */
export const DarkModeWithSelection: Story = {
  args: {
    apiBaseUrl: 'http://localhost:8080',
    colorMode: 'dark',
    showMetadata: true,
    selectedInstance: 'instance-2',
  },
}

/**
 * System color mode - follows OS preference.
 */
export const SystemColorMode: Story = {
  args: {
    apiBaseUrl: 'http://localhost:8080',
    colorMode: 'system',
    showMetadata: true,
  },
  render: (args) => <InteractiveWrapper {...args} />,
}
