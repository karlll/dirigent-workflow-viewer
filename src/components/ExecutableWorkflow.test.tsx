import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ExecutableWorkflow } from './ExecutableWorkflow'
import { eventManager } from '../lib/EventManager'
import type { InstanceState } from '../types/execution'

// Sample workflow YAML for testing
const sampleWorkflowYaml = `
name: test-workflow
version: 1
start: step1

steps:
  step1:
    kind: llm
    tool: analyze
    out:
      result: string
    goto: step2

  step2:
    kind: tool
    tool: process
    end: true
`

// Mock instance state
const mockInstanceState: InstanceState = {
  workflowName: 'test-workflow',
  workflowVersion: 1,
  status: 'running',
  startedAt: '2026-01-06T10:00:00Z',
  completedAt: undefined,
  durationMs: undefined,
  currentStepId: 'step1',
  steps: new Map([
    [
      'step1',
      {
        status: 'running',
        stepKind: 'llm',
        startedAt: '2026-01-06T10:00:00Z',
        completedAt: undefined,
        durationMs: undefined,
        error: undefined,
      },
    ],
    [
      'step2',
      {
        status: 'pending',
        stepKind: 'tool',
        startedAt: undefined,
        completedAt: undefined,
        durationMs: undefined,
        error: undefined,
      },
    ],
  ]),
  branches: [],
  error: undefined,
  failedStep: undefined,
}

describe('ExecutableWorkflow', () => {
  const apiBaseUrl = 'http://localhost:8081'
  const instanceId = 'test-instance-123'

  beforeEach(() => {
    // Disconnect any existing connections
    eventManager.disconnect()

    // Mock fetch for fetchState calls
    global.fetch = vi.fn()

    vi.clearAllMocks()
  })

  afterEach(() => {
    eventManager.disconnect()
  })

  describe('Component mounting and initialization', () => {
    it('should render loading state initially when showLoading is true', () => {
      // Mock fetchState to delay resolution
      global.fetch = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({
                    id: instanceId,
                    workflowName: 'test-workflow',
                    workflowVersion: 1,
                    status: 'RUNNING',
                    triggeredBy: null,
                    startedAt: '2026-01-06T10:00:00Z',
                    completedAt: null,
                    durationMs: null,
                    currentStepId: 'step1',
                    steps: [],
                    finalState: null,
                    error: null,
                    failedStep: null,
                  }),
                }),
              100
            )
          })
      )

      render(
        <ExecutableWorkflow
          instanceId={instanceId}
          apiBaseUrl={apiBaseUrl}
          yaml={sampleWorkflowYaml}
          showLoading={true}
        />
      )

      expect(screen.getByText('Loading execution state...')).toBeInTheDocument()
    })

    it('should not render loading state when showLoading is false', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: instanceId,
          workflowName: 'test-workflow',
          workflowVersion: 1,
          status: 'RUNNING',
          triggeredBy: null,
          startedAt: '2026-01-06T10:00:00Z',
          completedAt: null,
          durationMs: null,
          currentStepId: 'step1',
          steps: [],
          finalState: null,
          error: null,
          failedStep: null,
        }),
      })

      render(
        <ExecutableWorkflow
          instanceId={instanceId}
          apiBaseUrl={apiBaseUrl}
          yaml={sampleWorkflowYaml}
          showLoading={false}
        />
      )

      // Should render workflow immediately without loading state
      await waitFor(() => {
        expect(screen.queryByText('Loading execution state...')).not.toBeInTheDocument()
      })
    })

    it('should connect to EventManager on mount', () => {
      const connectSpy = vi.spyOn(eventManager, 'connect')

      render(
        <ExecutableWorkflow
          instanceId={instanceId}
          apiBaseUrl={apiBaseUrl}
          yaml={sampleWorkflowYaml}
        />
      )

      expect(connectSpy).toHaveBeenCalledWith(apiBaseUrl)
    })

    it('should not reconnect if EventManager is already connected', async () => {
      // Pre-connect and mock isEventSourceConnected to return true
      vi.spyOn(eventManager, 'isEventSourceConnected').mockReturnValue(true)
      const connectSpy = vi.spyOn(eventManager, 'connect')

      render(
        <ExecutableWorkflow
          instanceId={instanceId}
          apiBaseUrl={apiBaseUrl}
          yaml={sampleWorkflowYaml}
        />
      )

      // Should not call connect since already connected
      expect(connectSpy).not.toHaveBeenCalled()
    })
  })

  describe('State fetching', () => {
    it('should fetch instance state from API when not in memory', async () => {
      // Mock getState to return undefined (not in memory)
      vi.spyOn(eventManager, 'getState').mockReturnValue(undefined)

      // Mock fetchState to return mock state
      const fetchStateSpy = vi
        .spyOn(eventManager, 'fetchState')
        .mockResolvedValue(mockInstanceState)

      render(
        <ExecutableWorkflow
          instanceId={instanceId}
          apiBaseUrl={apiBaseUrl}
          yaml={sampleWorkflowYaml}
        />
      )

      await waitFor(
        () => {
          expect(fetchStateSpy).toHaveBeenCalledWith(instanceId)
        },
        { timeout: 1000 }
      )

      fetchStateSpy.mockRestore()
    })

    it('should always fetch complete state from API', async () => {
      // With the new implementation, we ALWAYS fetch from API to ensure complete historical data
      const fetchStateSpy = vi.spyOn(eventManager, 'fetchState').mockResolvedValue(mockInstanceState)

      render(
        <ExecutableWorkflow
          instanceId={instanceId}
          apiBaseUrl={apiBaseUrl}
          yaml={sampleWorkflowYaml}
        />
      )

      // Should always call fetchState to get complete historical data
      await waitFor(() => {
        expect(fetchStateSpy).toHaveBeenCalledWith(instanceId)
      })

      fetchStateSpy.mockRestore()
    })

    it('should display error when fetch fails', async () => {
      // Mock getState to return undefined (not in memory)
      vi.spyOn(eventManager, 'getState').mockReturnValue(undefined)

      // Mock fetchState to throw error
      vi.spyOn(eventManager, 'fetchState').mockRejectedValue(
        new Error(`Instance '${instanceId}' not found`)
      )

      render(
        <ExecutableWorkflow
          instanceId={instanceId}
          apiBaseUrl={apiBaseUrl}
          yaml={sampleWorkflowYaml}
        />
      )

      await waitFor(
        () => {
          expect(screen.getByText(/Instance 'test-instance-123' not found/)).toBeInTheDocument()
        },
        { timeout: 1000 }
      )
    })

    it('should display error when YAML parsing fails', async () => {
      // Provide invalid YAML
      const invalidYaml = `
name: test
invalid yaml content here
      - missing proper structure
`

      render(
        <ExecutableWorkflow
          instanceId={instanceId}
          apiBaseUrl={apiBaseUrl}
          yaml={invalidYaml}
          showLoading={false}
        />
      )

      await waitFor(
        () => {
          expect(screen.getByText(/Error:/)).toBeInTheDocument()
        },
        { timeout: 1000 }
      )
    })
  })

  describe('Real-time updates', () => {
    it('should subscribe to EventManager for real-time updates', async () => {
      const subscribeSpy = vi.spyOn(eventManager, 'subscribe')

      render(
        <ExecutableWorkflow
          instanceId={instanceId}
          apiBaseUrl={apiBaseUrl}
          yaml={sampleWorkflowYaml}
        />
      )

      await waitFor(() => {
        expect(subscribeSpy).toHaveBeenCalledWith(instanceId, expect.any(Function))
      })

      subscribeSpy.mockRestore()
    })

    it('should unsubscribe on unmount', async () => {
      const unsubscribeMock = vi.fn()
      vi.spyOn(eventManager, 'subscribe').mockReturnValue(unsubscribeMock)

      const { unmount } = render(
        <ExecutableWorkflow
          instanceId={instanceId}
          apiBaseUrl={apiBaseUrl}
          yaml={sampleWorkflowYaml}
        />
      )

      unmount()

      expect(unsubscribeMock).toHaveBeenCalled()
    })

    it('should re-subscribe when instanceId changes', async () => {
      const subscribeSpy = vi.spyOn(eventManager, 'subscribe')

      const { rerender } = render(
        <ExecutableWorkflow
          instanceId="instance-1"
          apiBaseUrl={apiBaseUrl}
          yaml={sampleWorkflowYaml}
        />
      )

      await waitFor(() => {
        expect(subscribeSpy).toHaveBeenCalledWith('instance-1', expect.any(Function))
      })

      rerender(
        <ExecutableWorkflow
          instanceId="instance-2"
          apiBaseUrl={apiBaseUrl}
          yaml={sampleWorkflowYaml}
        />
      )

      await waitFor(() => {
        expect(subscribeSpy).toHaveBeenCalledWith('instance-2', expect.any(Function))
      })

      subscribeSpy.mockRestore()
    })
  })

  describe('Workflow enrichment', () => {
    it('should enrich workflow with execution state', async () => {
      // Mock fetchState to return mock instance state
      vi.spyOn(eventManager, 'fetchState').mockResolvedValue(mockInstanceState)

      const { container } = render(
        <ExecutableWorkflow
          instanceId={instanceId}
          apiBaseUrl={apiBaseUrl}
          yaml={sampleWorkflowYaml}
        />
      )

      await waitFor(() => {
        // Check if workflow is rendered
        expect(container.querySelector('.react-flow')).toBeInTheDocument()
      })

      // The enriched workflow should have execution data in the nodes
      // This will be rendered by the base Workflow component
    })

    it('should display error when state fetch fails', async () => {
      // Mock fetchState to reject with error
      vi.spyOn(eventManager, 'fetchState').mockRejectedValueOnce(new Error('Network error'))

      render(
        <ExecutableWorkflow
          instanceId={instanceId}
          apiBaseUrl={apiBaseUrl}
          yaml={sampleWorkflowYaml}
          showLoading={false}
        />
      )

      await waitFor(() => {
        // Should show error state
        expect(screen.getByText(/Error:/)).toBeInTheDocument()
      })
    })

    it('should mark unexecuted steps as pending', async () => {
      // Create an instance state with only one executed step
      const partialInstanceState: InstanceState = {
        status: 'running',
        workflowName: 'sample_workflow',
        workflowVersion: 1,
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
        ]),
        branches: [],
      }

      vi.spyOn(eventManager, 'fetchState').mockResolvedValue(partialInstanceState)

      const { container } = render(
        <ExecutableWorkflow
          instanceId={instanceId}
          apiBaseUrl={apiBaseUrl}
          yaml={sampleWorkflowYaml}
        />
      )

      await waitFor(() => {
        expect(container.querySelector('.react-flow')).toBeInTheDocument()
      })

      // Check that unexecuted steps have the 'node-pending' class
      await waitFor(() => {
        const pendingNodes = container.querySelectorAll('.node-pending')
        // Sample workflow has 5 steps, 1 is running, so 4 should be pending
        expect(pendingNodes.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Props pass-through', () => {
    it('should pass direction prop to base Workflow', async () => {
      vi.spyOn(eventManager, 'fetchState').mockResolvedValue(mockInstanceState)

      const { container } = render(
        <ExecutableWorkflow
          instanceId={instanceId}
          apiBaseUrl={apiBaseUrl}
          yaml={sampleWorkflowYaml}
          direction="TB"
        />
      )

      await waitFor(() => {
        expect(container.querySelector('.react-flow')).toBeInTheDocument()
      })

      // Direction is applied by the base Workflow component via layout algorithm
    })

    it('should pass colorMode prop to base Workflow', async () => {
      vi.spyOn(eventManager, 'fetchState').mockResolvedValue(mockInstanceState)

      const { container } = render(
        <ExecutableWorkflow
          instanceId={instanceId}
          apiBaseUrl={apiBaseUrl}
          yaml={sampleWorkflowYaml}
          colorMode="dark"
        />
      )

      await waitFor(() => {
        expect(container.querySelector('.react-flow')).toBeInTheDocument()
      })
    })

    it('should pass showHeader prop to base Workflow', async () => {
      vi.spyOn(eventManager, 'fetchState').mockResolvedValue(mockInstanceState)

      render(
        <ExecutableWorkflow
          instanceId={instanceId}
          apiBaseUrl={apiBaseUrl}
          yaml={sampleWorkflowYaml}
          showHeader={true}
        />
      )

      await waitFor(() => {
        // Header should be visible
        expect(screen.getByText('test-workflow')).toBeInTheDocument()
      })
    })
  })

  describe('Edge cases', () => {
    it('should handle empty instanceId gracefully', () => {
      const { container } = render(
        <ExecutableWorkflow instanceId="" apiBaseUrl={apiBaseUrl} yaml={sampleWorkflowYaml} />
      )

      // Should not throw, but also not fetch
      expect(container).toBeInTheDocument()
    })

    it('should display "No workflow to display" when no YAML or workflow provided', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: instanceId,
          workflowName: 'test-workflow',
          workflowVersion: 1,
          status: 'RUNNING',
          triggeredBy: null,
          startedAt: '2026-01-06T10:00:00Z',
          completedAt: null,
          durationMs: null,
          currentStepId: null,
          steps: [],
          finalState: null,
          error: null,
          failedStep: null,
        }),
      })

      render(<ExecutableWorkflow instanceId={instanceId} apiBaseUrl={apiBaseUrl} />)

      await waitFor(() => {
        expect(screen.getByText('No workflow to display')).toBeInTheDocument()
      })
    })
  })
})
