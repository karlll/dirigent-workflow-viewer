import type { Meta, StoryObj } from '@storybook/react'
import { Workflow } from './Workflow'
import { parseWorkflow } from '../utils/parser'
import type { Workflow as WorkflowType } from '../types/workflow'

// Import workflows as raw strings
import sampleYaml from '../fixtures/sample.yaml?raw'

const meta: Meta<typeof Workflow> = {
  title: 'ExecutableWorkflow Viewer (Direct)',
  component: Workflow,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Workflow>

// Parse the workflow
const baseWorkflow = parseWorkflow(sampleYaml)

// Create enriched workflow with running state
const runningWorkflow: WorkflowType = {
  ...baseWorkflow,
  steps: {
    ...baseWorkflow.steps,
    classify: {
      ...baseWorkflow.steps.classify,
      execution: {
        status: 'running',
        startedAt: '2026-01-06T10:00:00Z',
        isOnExecutionPath: true,
        isCurrentStep: true,
      },
    },
  },
}

// Create enriched workflow with completed state
const completedWorkflow: WorkflowType = {
  ...baseWorkflow,
  steps: {
    ...baseWorkflow.steps,
    classify: {
      ...baseWorkflow.steps.classify,
      execution: {
        status: 'completed',
        startedAt: '2026-01-06T10:00:00Z',
        completedAt: '2026-01-06T10:00:02Z',
        durationMs: 2000,
        isOnExecutionPath: true,
      },
    },
    route: {
      ...baseWorkflow.steps.route,
      execution: {
        status: 'completed',
        startedAt: '2026-01-06T10:00:02Z',
        completedAt: '2026-01-06T10:00:02.1Z',
        durationMs: 100,
        isOnExecutionPath: true,
      },
    },
    do_task: {
      ...baseWorkflow.steps.do_task,
      execution: {
        status: 'completed',
        startedAt: '2026-01-06T10:00:02.1Z',
        completedAt: '2026-01-06T10:00:05Z',
        durationMs: 2900,
        isOnExecutionPath: true,
      },
    },
  },
}

// Create enriched workflow with failed state
const failedWorkflow: WorkflowType = {
  ...baseWorkflow,
  steps: {
    ...baseWorkflow.steps,
    classify: {
      ...baseWorkflow.steps.classify,
      execution: {
        status: 'failed',
        startedAt: '2026-01-06T10:00:00Z',
        completedAt: '2026-01-06T10:00:03Z',
        durationMs: 3000,
        error: 'LLM API rate limit exceeded',
        isOnExecutionPath: true,
      },
    },
  },
}

/**
 * Workflow execution in progress - shows running step with animation.
 */
export const Running: Story = {
  args: {
    workflow: runningWorkflow,
    direction: 'LR',
  },
}

/**
 * Completed workflow execution - shows execution path and timing.
 */
export const Completed: Story = {
  args: {
    workflow: completedWorkflow,
    direction: 'LR',
  },
}

/**
 * Failed workflow execution - shows error message.
 */
export const Failed: Story = {
  args: {
    workflow: failedWorkflow,
    direction: 'LR',
  },
}

/**
 * Running workflow in dark mode.
 */
export const RunningDarkMode: Story = {
  args: {
    workflow: runningWorkflow,
    direction: 'LR',
    colorMode: 'dark',
  },
}

/**
 * Completed workflow in dark mode.
 */
export const CompletedDarkMode: Story = {
  args: {
    workflow: completedWorkflow,
    direction: 'LR',
    colorMode: 'dark',
  },
}

/**
 * Failed workflow in dark mode.
 */
export const FailedDarkMode: Story = {
  args: {
    workflow: failedWorkflow,
    direction: 'LR',
    colorMode: 'dark',
  },
}
