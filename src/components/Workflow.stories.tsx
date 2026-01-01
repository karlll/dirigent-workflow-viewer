import type { Meta, StoryObj } from '@storybook/react'
import { Workflow } from './Workflow'

// Import workflows as raw strings
import sampleYaml from '../fixtures/sample.yaml?raw'
import securityYaml from '../fixtures/on_task_created_security.yaml?raw'
import ongoingYaml from '../fixtures/on_task_status_ongoing.yaml?raw'

const meta: Meta<typeof Workflow> = {
  title: 'Workflow Viewer',
  component: Workflow,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    direction: {
      control: 'radio',
      options: ['LR', 'TB'],
      description: 'Layout direction: LR (left-to-right) or TB (top-to-bottom)',
    },
    yaml: {
      control: 'text',
      description: 'YAML workflow definition',
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Workflow>

/**
 * Sample workflow demonstrating LLM classification, switch routing,
 * and error handling.
 */
export const SampleWorkflow: Story = {
  args: {
    yaml: sampleYaml,
    direction: 'LR',
  },
}

/**
 * Event-triggered workflow for security triage.
 * Shows a simple workflow with triggers.
 */
export const SecurityWorkflow: Story = {
  args: {
    yaml: securityYaml,
    direction: 'LR',
  },
}

/**
 * Task status workflow demonstrating event handling.
 */
export const TaskStatusWorkflow: Story = {
  args: {
    yaml: ongoingYaml,
    direction: 'LR',
  },
}

/**
 * Sample workflow with top-to-bottom layout.
 */
export const TopToBottomLayout: Story = {
  args: {
    yaml: sampleYaml,
    direction: 'TB',
  },
}

/**
 * Workflow with error - demonstrates error handling.
 */
export const InvalidWorkflow: Story = {
  args: {
    yaml: 'invalid: yaml: content:',
    direction: 'LR',
  },
}

/**
 * Empty workflow - demonstrates empty state.
 */
export const EmptyWorkflow: Story = {
  args: {
    yaml: '',
    direction: 'LR',
  },
}
