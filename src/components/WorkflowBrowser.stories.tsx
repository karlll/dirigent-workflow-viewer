/**
 * Storybook stories for WorkflowBrowser component
 */

import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { WorkflowBrowser } from './WorkflowBrowser'
import { handlers, emptyHandlers, errorHandlers } from '../mocks/handlers'

const meta: Meta<typeof WorkflowBrowser> = {
  title: 'Components/WorkflowBrowser',
  component: WorkflowBrowser,
  parameters: {
    layout: 'padded',
    msw: {
      handlers,
    },
  },
}

export default meta
type Story = StoryObj<typeof WorkflowBrowser>

// Interactive wrapper to demonstrate selection
function InteractiveWrapper({
  mode,
  showMetadata,
}: {
  mode?: 'list' | 'grid' | 'dropdown'
  showMetadata?: boolean
}) {
  const [selected, setSelected] = useState<string>()

  return (
    <div>
      <WorkflowBrowser
        apiBaseUrl="http://localhost:8080"
        mode={mode}
        showMetadata={showMetadata}
        selectedWorkflow={selected}
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

export const ListMode: Story = {
  render: () => <InteractiveWrapper mode="list" />,
}

export const ListModeWithMetadata: Story = {
  render: () => <InteractiveWrapper mode="list" showMetadata />,
}

export const ListModeWithSelection: Story = {
  render: () => (
    <WorkflowBrowser
      apiBaseUrl="http://localhost:8080"
      mode="list"
      showMetadata
      selectedWorkflow="notification_workflow"
      onSelect={() => {}}
    />
  ),
}

export const GridMode: Story = {
  render: () => <InteractiveWrapper mode="grid" />,
}

export const GridModeWithMetadata: Story = {
  render: () => <InteractiveWrapper mode="grid" showMetadata />,
}

export const GridModeWithSelection: Story = {
  render: () => (
    <WorkflowBrowser
      apiBaseUrl="http://localhost:8080"
      mode="grid"
      showMetadata
      selectedWorkflow="data_processing"
      onSelect={() => {}}
    />
  ),
}

export const DropdownMode: Story = {
  render: () => <InteractiveWrapper mode="dropdown" />,
}

export const DropdownModeWithSelection: Story = {
  render: () => (
    <WorkflowBrowser
      apiBaseUrl="http://localhost:8080"
      mode="dropdown"
      selectedWorkflow="sample_workflow"
      onSelect={() => {}}
    />
  ),
}

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: emptyHandlers,
    },
  },
  render: () => <WorkflowBrowser apiBaseUrl="http://localhost:8080" mode="list" />,
}

export const Error: Story = {
  parameters: {
    msw: {
      handlers: errorHandlers,
    },
  },
  render: () => <WorkflowBrowser apiBaseUrl="http://localhost:8080" mode="list" />,
}

