import type { Meta, StoryObj } from '@storybook/react'
import { ExecutableWorkflow } from './ExecutableWorkflow'
import { eventManager } from '../lib/EventManager'
import type { InstanceState } from '../types/execution'

// Import workflows as raw strings
import sampleYaml from '../fixtures/sample.yaml?raw'
import securityYaml from '../fixtures/on_task_created_security.yaml?raw'

// Mock instance states for different scenarios
const runningInstanceState: InstanceState = {
  workflowName: 'sample_workflow',
  workflowVersion: 1,
  status: 'running',
  startedAt: '2026-01-06T10:00:00Z',
  currentStepId: 'classify',
  steps: new Map([
    [
      'classify',
      {
        status: 'running',
        stepKind: 'llm',
        startedAt: '2026-01-06T10:00:00Z',
      },
    ],
    [
      'route_high',
      {
        status: 'pending',
        stepKind: 'tool',
      },
    ],
    [
      'route_low',
      {
        status: 'pending',
        stepKind: 'tool',
      },
    ],
    [
      'error_handler',
      {
        status: 'pending',
        stepKind: 'fail',
      },
    ],
  ]),
  branches: [],
}

const completedInstanceState: InstanceState = {
  workflowName: 'sample_workflow',
  workflowVersion: 1,
  status: 'completed',
  startedAt: '2026-01-06T10:00:00Z',
  completedAt: '2026-01-06T10:00:05Z',
  durationMs: 5000,
  steps: new Map([
    [
      'classify',
      {
        status: 'completed',
        stepKind: 'llm',
        startedAt: '2026-01-06T10:00:00Z',
        completedAt: '2026-01-06T10:00:02Z',
        durationMs: 2000,
      },
    ],
    [
      'route_high',
      {
        status: 'completed',
        stepKind: 'tool',
        startedAt: '2026-01-06T10:00:02Z',
        completedAt: '2026-01-06T10:00:05Z',
        durationMs: 3000,
      },
    ],
    [
      'route_low',
      {
        status: 'pending',
        stepKind: 'tool',
      },
    ],
    [
      'error_handler',
      {
        status: 'pending',
        stepKind: 'fail',
      },
    ],
  ]),
  branches: [
    {
      fromStep: 'classify',
      toStep: 'route_high',
      condition: 'confidence > 0.8',
      timestamp: '2026-01-06T10:00:02Z',
    },
  ],
}

const failedInstanceState: InstanceState = {
  workflowName: 'sample_workflow',
  workflowVersion: 1,
  status: 'failed',
  startedAt: '2026-01-06T10:00:00Z',
  completedAt: '2026-01-06T10:00:03Z',
  durationMs: 3000,
  failedStep: 'classify',
  error: 'LLM API rate limit exceeded',
  steps: new Map([
    [
      'classify',
      {
        status: 'failed',
        stepKind: 'llm',
        startedAt: '2026-01-06T10:00:00Z',
        completedAt: '2026-01-06T10:00:03Z',
        durationMs: 3000,
        error: 'LLM API rate limit exceeded',
      },
    ],
    [
      'route_high',
      {
        status: 'pending',
        stepKind: 'tool',
      },
    ],
    [
      'route_low',
      {
        status: 'pending',
        stepKind: 'tool',
      },
    ],
    [
      'error_handler',
      {
        status: 'pending',
        stepKind: 'fail',
      },
    ],
  ]),
  branches: [],
}

const meta: Meta<typeof ExecutableWorkflow> = {
  title: 'ExecutableWorkflow Viewer',
  component: ExecutableWorkflow,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Real-time workflow execution visualization with SSE integration. **Note:** These stories use mocked data. In production, connect to a live Dirigent API instance.',
      },
    },
  },
  argTypes: {
    instanceId: {
      control: 'text',
      description: 'UUID of the workflow instance to track',
    },
    apiBaseUrl: {
      control: 'text',
      description: 'Base URL of the Dirigent API',
    },
    direction: {
      control: 'radio',
      options: ['LR', 'TB'],
      description: 'Layout direction: LR (left-to-right) or TB (top-to-bottom)',
    },
    yaml: {
      control: 'text',
      description: 'YAML workflow definition',
    },
    showHeader: {
      control: 'boolean',
      description: 'Show workflow name, description, and metadata header',
    },
    showLoading: {
      control: 'boolean',
      description: 'Show loading spinner while fetching state',
    },
    colorMode: {
      control: 'radio',
      options: ['light', 'dark', 'system'],
      description: 'Color scheme: light, dark, or system (follows OS preference)',
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story, context) => {
      // Mock EventManager for Storybook
      const mockInstanceId = context.args.instanceId || 'mock-instance-123'

      // Set up mock based on story name
      if (context.name.includes('Running')) {
        eventManager.getState = () => runningInstanceState
      } else if (context.name.includes('Completed')) {
        eventManager.getState = () => completedInstanceState
      } else if (context.name.includes('Failed')) {
        eventManager.getState = () => failedInstanceState
      } else {
        eventManager.getState = () => undefined
      }

      // Mock connection check
      eventManager.isEventSourceConnected = () => false

      // Mock subscribe to prevent actual SSE connections
      eventManager.subscribe = () => () => {}

      return <Story />
    },
  ],
}

export default meta
type Story = StoryObj<typeof ExecutableWorkflow>

/**
 * Workflow execution in progress - shows running step with animation.
 * The "classify" step is currently executing with a pulsing orange border.
 */
export const Running: Story = {
  args: {
    instanceId: 'running-instance-123',
    apiBaseUrl: 'http://localhost:8081',
    yaml: sampleYaml,
    direction: 'LR',
    showLoading: false,
  },
}

/**
 * Completed workflow execution - shows execution path and timing.
 * The workflow completed successfully, taking 5 seconds total.
 * Steps on the execution path are highlighted in blue.
 */
export const Completed: Story = {
  args: {
    instanceId: 'completed-instance-123',
    apiBaseUrl: 'http://localhost:8081',
    yaml: sampleYaml,
    direction: 'LR',
    showLoading: false,
  },
}

/**
 * Failed workflow execution - shows error message.
 * The "classify" step failed with an LLM API rate limit error.
 * Error details are displayed in the failed node.
 */
export const Failed: Story = {
  args: {
    instanceId: 'failed-instance-123',
    apiBaseUrl: 'http://localhost:8081',
    yaml: sampleYaml,
    direction: 'LR',
    showLoading: false,
  },
}

/**
 * Running workflow in top-to-bottom layout.
 * Demonstrates vertical layout with execution state.
 */
export const RunningTopToBottom: Story = {
  args: {
    instanceId: 'running-tb-instance',
    apiBaseUrl: 'http://localhost:8081',
    yaml: sampleYaml,
    direction: 'TB',
    showLoading: false,
  },
}

/**
 * Running workflow in dark mode.
 * Shows execution state styling with dark color scheme.
 */
export const RunningDarkMode: Story = {
  args: {
    instanceId: 'running-dark-instance',
    apiBaseUrl: 'http://localhost:8081',
    yaml: sampleYaml,
    direction: 'LR',
    colorMode: 'dark',
    showLoading: false,
  },
}

/**
 * Completed workflow in dark mode.
 * Demonstrates execution path highlighting in dark theme.
 */
export const CompletedDarkMode: Story = {
  args: {
    instanceId: 'completed-dark-instance',
    apiBaseUrl: 'http://localhost:8081',
    yaml: sampleYaml,
    direction: 'LR',
    colorMode: 'dark',
    showLoading: false,
  },
}

/**
 * Failed workflow in dark mode.
 * Shows error message styling in dark theme.
 */
export const FailedDarkMode: Story = {
  args: {
    instanceId: 'failed-dark-instance',
    apiBaseUrl: 'http://localhost:8081',
    yaml: sampleYaml,
    direction: 'LR',
    colorMode: 'dark',
    showLoading: false,
  },
}

/**
 * Security workflow execution in progress.
 * Demonstrates real-time execution on an event-triggered workflow.
 */
export const RunningSecurityWorkflow: Story = {
  args: {
    instanceId: 'security-running-instance',
    apiBaseUrl: 'http://localhost:8081',
    yaml: securityYaml,
    direction: 'LR',
    showLoading: false,
  },
}

/**
 * Workflow without header - compact view with execution state.
 * Useful for embedding in dashboards or smaller UI contexts.
 */
export const RunningWithoutHeader: Story = {
  args: {
    instanceId: 'running-no-header',
    apiBaseUrl: 'http://localhost:8081',
    yaml: sampleYaml,
    direction: 'LR',
    showHeader: false,
    showLoading: false,
  },
}

/**
 * Loading state - demonstrates spinner while fetching execution state.
 * This is what users see initially when the component mounts.
 */
export const LoadingState: Story = {
  args: {
    instanceId: 'loading-instance',
    apiBaseUrl: 'http://localhost:8081',
    yaml: sampleYaml,
    direction: 'LR',
    showLoading: true,
  },
  decorators: [
    (Story) => {
      // Mock to simulate slow loading
      eventManager.getState = () => undefined
      eventManager.fetchState = () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(runningInstanceState), 10000)
        })
      return <Story />
    },
  ],
}

/**
 * Error state - instance not found.
 * Demonstrates error handling when the instance ID doesn't exist.
 */
export const ErrorInstanceNotFound: Story = {
  args: {
    instanceId: 'non-existent-instance',
    apiBaseUrl: 'http://localhost:8081',
    yaml: sampleYaml,
    direction: 'LR',
    showLoading: false,
  },
  decorators: [
    (Story) => {
      eventManager.getState = () => undefined
      eventManager.fetchState = () =>
        Promise.reject(new Error("Instance 'non-existent-instance' not found"))
      return <Story />
    },
  ],
}

/**
 * Error state - invalid YAML.
 * Shows error handling when the workflow YAML is malformed.
 */
export const ErrorInvalidYAML: Story = {
  args: {
    instanceId: 'invalid-yaml-instance',
    apiBaseUrl: 'http://localhost:8081',
    yaml: 'invalid: yaml: content:',
    direction: 'LR',
    showLoading: false,
  },
}
