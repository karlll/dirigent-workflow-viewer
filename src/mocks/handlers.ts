/**
 * MSW (Mock Service Worker) handlers for Dirigent API
 * Used in Storybook stories to mock API responses
 */

import { http, HttpResponse, delay } from 'msw'
import type { WorkflowMetadata, InstanceListResponse, InstanceDetailsDto } from '../types/api'

// Mock workflow data
export const mockWorkflows: WorkflowMetadata[] = [
  {
    name: 'sample_workflow',
    version: 1,
    triggerTypes: ['task.created'],
    stepCount: 5,
  },
  {
    name: 'notification_workflow',
    version: 2,
    triggerTypes: ['task.completed', 'task.failed'],
    stepCount: 3,
  },
  {
    name: 'data_processing',
    version: 1,
    triggerTypes: ['data.received'],
    stepCount: 8,
  },
]

// Mock instance data
export const mockInstances = [
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
    id: 'instance-2',
    workflowName: 'notification_workflow',
    workflowVersion: 2,
    status: 'COMPLETED',
    triggeredBy: 'evt-002',
    startedAt: '2026-01-07T09:00:00Z',
    completedAt: '2026-01-07T09:01:30Z',
    durationMs: 90000,
  },
  {
    id: 'instance-3',
    workflowName: 'data_processing',
    workflowVersion: 1,
    status: 'FAILED',
    triggeredBy: 'evt-003',
    startedAt: '2026-01-07T08:00:00Z',
    completedAt: '2026-01-07T08:00:45Z',
    durationMs: 45000,
  },
]

// Default handlers
export const handlers = [
  // GET /api/v1/workflows - List workflows
  http.get('*/api/v1/workflows', async () => {
    await delay(100) // Simulate network delay
    return HttpResponse.json({
      workflows: mockWorkflows,
    })
  }),

  // GET /api/v1/workflows/:name - Get workflow YAML
  http.get('*/api/v1/workflows/:name', async ({ params }) => {
    await delay(100)
    const { name } = params
    
    const workflow = mockWorkflows.find(w => w.name === name)
    if (!workflow) {
      return new HttpResponse(null, { status: 404 })
    }

    // Return a simple YAML representation
    const yaml = `name: ${workflow.name}
version: ${workflow.version}
start: step1
steps:
  step1:
    kind: tool
    tool: sample_tool
    end: true
`
    return new HttpResponse(yaml, {
      headers: { 'Content-Type': 'text/plain' },
    })
  }),

  // GET /api/v1/instances - List instances
  http.get('*/api/v1/instances', async ({ request }) => {
    await delay(100)
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const workflowName = url.searchParams.get('workflowName')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    let filtered = [...mockInstances]

    if (status) {
      filtered = filtered.filter(i => i.status === status)
    }
    if (workflowName) {
      filtered = filtered.filter(i => i.workflowName === workflowName)
    }

    const paginated = filtered.slice(offset, offset + limit)

    const response: InstanceListResponse = {
      instances: paginated,
      total: filtered.length,
      limit,
      offset,
    }

    return HttpResponse.json(response)
  }),

  // GET /api/v1/instances/:id - Get instance details
  http.get('*/api/v1/instances/:id', async ({ params }) => {
    await delay(100)
    const { id } = params

    const instance = mockInstances.find(i => i.id === id)
    if (!instance) {
      return new HttpResponse(null, { status: 404 })
    }

    const details: InstanceDetailsDto = {
      ...instance,
      steps: [
        {
          stepId: 'step1',
          stepKind: 'tool',
          status: instance.status === 'FAILED' ? 'FAILED' : 'SUCCEEDED',
          startedAt: instance.startedAt,
          completedAt: instance.completedAt,
          durationMs: instance.durationMs,
          input: { key: 'value' },
          output: instance.status === 'FAILED' ? null : { result: 'success' },
          error: instance.status === 'FAILED' ? 'Tool execution failed' : null,
        },
      ],
      finalState: instance.status === 'COMPLETED' ? { status: 'done' } : null,
      error: instance.status === 'FAILED' ? 'Workflow execution failed' : null,
      failedStep: instance.status === 'FAILED' ? 'step1' : null,
    }

    return HttpResponse.json(details)
  }),
]

// Scenario-specific handler sets
export const emptyHandlers = [
  http.get('*/api/v1/workflows', async () => {
    await delay(100)
    return HttpResponse.json({ workflows: [] })
  }),
]

export const errorHandlers = [
  http.get('*/api/v1/workflows', async () => {
    await delay(100)
    return new HttpResponse(null, { status: 500 })
  }),
]

export const loadingHandlers = [
  http.get('*/api/v1/workflows', async () => {
    await delay(5000) // Long delay to simulate loading
    return HttpResponse.json({ workflows: mockWorkflows })
  }),
]
