/**
 * Storybook stories for InstanceMonitor component
 */

import type { Meta, StoryObj } from '@storybook/react'
import { InstanceMonitor } from '../lib/components/InstanceMonitor'
import { handlers } from '../mocks/handlers'
import { http, HttpResponse, delay } from 'msw'

// Mock workflow YAML
const sampleWorkflowYaml = `name: sample_workflow
version: 1
start: step1

steps:
  step1:
    kind: tool
    tool: fetch_data
    goto: step2

  step2:
    kind: llm
    tool: analyze_data
    out:
      result: string
    goto: step3

  step3:
    kind: tool
    tool: save_result
    end: true
`

const meta: Meta<typeof InstanceMonitor> = {
  title: 'Components/InstanceMonitor',
  component: InstanceMonitor,
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        ...handlers,
        // Override workflow endpoint to return our sample
        http.get('*/api/v1/workflows/:name', async () => {
          await delay(100)
          return new HttpResponse(sampleWorkflowYaml, {
            headers: { 'Content-Type': 'text/plain' },
          })
        }),
        // Mock SSE endpoint (EventManager will connect to this)
        http.get('*/api/v1/events', async () => {
          await delay(100)
          return new HttpResponse('', {
            headers: { 'Content-Type': 'text/event-stream' },
          })
        }),
        // Mock instance state endpoint
        http.get('*/api/v1/instances/:id/state', async () => {
          await delay(100)
          return HttpResponse.json({
            workflowName: 'sample_workflow',
            workflowVersion: 1,
            status: 'running',
            startedAt: '2026-01-07T10:00:00Z',
            currentStepId: 'step2',
            steps: {
              step1: {
                status: 'completed',
                stepKind: 'tool',
                startedAt: '2026-01-07T10:00:00Z',
                completedAt: '2026-01-07T10:00:05Z',
                durationMs: 5000,
              },
              step2: {
                status: 'running',
                stepKind: 'llm',
                startedAt: '2026-01-07T10:00:05Z',
              },
              step3: {
                status: 'pending',
                stepKind: 'tool',
              },
            },
          })
        }),
      ],
    },
  },
  argTypes: {
    colorMode: {
      control: 'radio',
      options: ['light', 'dark', 'system'],
      description: 'Color scheme: light, dark, or system (follows OS preference)',
    },
  },
}

export default meta
type Story = StoryObj<typeof InstanceMonitor>

export const RunningInstance: Story = {
  args: {
    apiBaseUrl: 'http://localhost:8080',
    instanceId: 'instance-1',
    direction: 'LR',
  },
}

export const RunningInstanceVertical: Story = {
  args: {
    apiBaseUrl: 'http://localhost:8080',
    instanceId: 'instance-1',
    direction: 'TB',
  },
}

export const CompletedInstance: Story = {
  parameters: {
    msw: {
      handlers: [
        ...handlers,
        http.get('*/api/v1/workflows/:name', async () => {
          await delay(100)
          return new HttpResponse(sampleWorkflowYaml, {
            headers: { 'Content-Type': 'text/plain' },
          })
        }),
        http.get('*/api/v1/instances/:id', async () => {
          await delay(100)
          return HttpResponse.json({
            id: 'instance-2',
            workflowName: 'sample_workflow',
            workflowVersion: 1,
            status: 'COMPLETED',
            triggeredBy: 'evt-002',
            startedAt: '2026-01-07T10:00:00Z',
            completedAt: '2026-01-07T10:01:00Z',
            durationMs: 60000,
            error: null,
            failedStep: null,
            steps: [],
          })
        }),
        http.get('*/api/v1/events', async () => {
          await delay(100)
          return new HttpResponse('', {
            headers: { 'Content-Type': 'text/event-stream' },
          })
        }),
        http.get('*/api/v1/instances/:id/state', async () => {
          await delay(100)
          return HttpResponse.json({
            workflowName: 'sample_workflow',
            workflowVersion: 1,
            status: 'completed',
            startedAt: '2026-01-07T10:00:00Z',
            completedAt: '2026-01-07T10:01:00Z',
            currentStepId: null,
            steps: {
              step1: { status: 'completed', stepKind: 'tool', startedAt: '2026-01-07T10:00:00Z', completedAt: '2026-01-07T10:00:05Z', durationMs: 5000 },
              step2: { status: 'completed', stepKind: 'llm', startedAt: '2026-01-07T10:00:05Z', completedAt: '2026-01-07T10:00:50Z', durationMs: 45000 },
              step3: { status: 'completed', stepKind: 'tool', startedAt: '2026-01-07T10:00:50Z', completedAt: '2026-01-07T10:01:00Z', durationMs: 10000 },
            },
          })
        }),
      ],
    },
  },
  args: {
    apiBaseUrl: 'http://localhost:8080',
    instanceId: 'instance-2',
    direction: 'LR',
  },
}

export const FailedInstance: Story = {
  parameters: {
    msw: {
      handlers: [
        ...handlers,
        http.get('*/api/v1/workflows/:name', async () => {
          await delay(100)
          return new HttpResponse(sampleWorkflowYaml, {
            headers: { 'Content-Type': 'text/plain' },
          })
        }),
        http.get('*/api/v1/instances/:id', async () => {
          await delay(100)
          return HttpResponse.json({
            id: 'instance-3',
            workflowName: 'sample_workflow',
            workflowVersion: 1,
            status: 'FAILED',
            triggeredBy: 'evt-003',
            startedAt: '2026-01-07T10:00:00Z',
            completedAt: '2026-01-07T10:00:25Z',
            durationMs: 25000,
            error: 'LLM timeout - no response after 20 seconds',
            failedStep: 'step2',
            steps: [],
          })
        }),
        http.get('*/api/v1/events', async () => {
          await delay(100)
          return new HttpResponse('', {
            headers: { 'Content-Type': 'text/event-stream' },
          })
        }),
        http.get('*/api/v1/instances/:id/state', async () => {
          await delay(100)
          return HttpResponse.json({
            workflowName: 'sample_workflow',
            workflowVersion: 1,
            status: 'failed',
            startedAt: '2026-01-07T10:00:00Z',
            completedAt: '2026-01-07T10:00:25Z',
            currentStepId: null,
            steps: {
              step1: { status: 'completed', stepKind: 'tool', startedAt: '2026-01-07T10:00:00Z', completedAt: '2026-01-07T10:00:05Z', durationMs: 5000 },
              step2: { status: 'failed', stepKind: 'llm', startedAt: '2026-01-07T10:00:05Z', completedAt: '2026-01-07T10:00:25Z', durationMs: 20000, error: 'LLM timeout - no response after 20 seconds' },
              step3: { status: 'skipped', stepKind: 'tool' },
            },
          })
        }),
      ],
    },
  },
  args: {
    apiBaseUrl: 'http://localhost:8080',
    instanceId: 'instance-3',
    direction: 'LR',
  },
}

export const ErrorLoadingInstance: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/v1/instances/:id', async () => {
          await delay(100)
          return new HttpResponse(null, { status: 404 })
        }),
      ],
    },
  },
  args: {
    apiBaseUrl: 'http://localhost:8080',
    instanceId: 'missing-instance',
    direction: 'LR',
  },
}

export const DarkMode: Story = {
  args: {
    apiBaseUrl: 'http://localhost:8080',
    instanceId: 'instance-1',
    direction: 'LR',
    colorMode: 'dark',
  },
}
