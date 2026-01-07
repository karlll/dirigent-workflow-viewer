/**
 * Tests for React hooks
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import {
  useWorkflows,
  useInstances,
  useInstanceState,
  useWorkflowDefinition,
} from './hooks'
import { createApiClient } from './ApiClient'
import { eventManager } from './EventManager'
import { parseWorkflow } from '../utils/parser'

// Mock dependencies
vi.mock('./ApiClient')
vi.mock('./EventManager')
vi.mock('../utils/parser')

const mockCreateApiClient = vi.mocked(createApiClient)
const mockEventManager = vi.mocked(eventManager)
const mockParseWorkflow = vi.mocked(parseWorkflow)

describe('useWorkflows', () => {
  const mockWorkflows = [
    {
      name: 'workflow1',
      version: 1,
      triggerTypes: ['task.created'],
      stepCount: 3,
    },
    {
      name: 'workflow2',
      version: 2,
      triggerTypes: ['task.updated'],
      stepCount: 5,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch workflows on mount', async () => {
    const mockListWorkflows = vi.fn().mockResolvedValue(mockWorkflows)
    mockCreateApiClient.mockReturnValue({
      listWorkflows: mockListWorkflows,
    } as any)

    const { result } = renderHook(() => useWorkflows('http://localhost:8080'))

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockListWorkflows).toHaveBeenCalled()
    expect(result.current.workflows).toEqual(mockWorkflows)
    expect(result.current.error).toBeNull()
  })

  it('should handle errors', async () => {
    const mockError = new Error('Network error')
    const mockListWorkflows = vi.fn().mockRejectedValue(mockError)
    mockCreateApiClient.mockReturnValue({
      listWorkflows: mockListWorkflows,
    } as any)

    const { result } = renderHook(() => useWorkflows('http://localhost:8080'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Network error')
    expect(result.current.workflows).toEqual([])
  })

  it('should provide refresh function', async () => {
    const mockListWorkflows = vi.fn().mockResolvedValue(mockWorkflows)
    mockCreateApiClient.mockReturnValue({
      listWorkflows: mockListWorkflows,
    } as any)

    const { result } = renderHook(() => useWorkflows('http://localhost:8080'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockListWorkflows).toHaveBeenCalledTimes(1)

    // Call refresh
    result.current.refresh()

    await waitFor(() => {
      expect(mockListWorkflows).toHaveBeenCalledTimes(2)
    })
  })

  it('should refetch when apiBaseUrl changes', async () => {
    const mockListWorkflows = vi.fn().mockResolvedValue(mockWorkflows)
    mockCreateApiClient.mockReturnValue({
      listWorkflows: mockListWorkflows,
    } as any)

    const { rerender } = renderHook(
      ({ url }) => useWorkflows(url),
      { initialProps: { url: 'http://localhost:8080' } }
    )

    await waitFor(() => {
      expect(mockListWorkflows).toHaveBeenCalledTimes(1)
    })

    // Change URL
    rerender({ url: 'http://localhost:9090' })

    await waitFor(() => {
      expect(mockListWorkflows).toHaveBeenCalledTimes(2)
    })
  })
})

describe('useInstances', () => {
  const mockInstances = [
    {
      id: 'abc-123',
      workflowName: 'workflow1',
      workflowVersion: 1,
      status: 'RUNNING',
      triggeredBy: 'evt-1',
      startedAt: '2026-01-07T10:00:00Z',
      completedAt: null,
      durationMs: null,
    },
    {
      id: 'def-456',
      workflowName: 'workflow1',
      workflowVersion: 1,
      status: 'COMPLETED',
      triggeredBy: 'evt-2',
      startedAt: '2026-01-07T09:00:00Z',
      completedAt: '2026-01-07T09:01:00Z',
      durationMs: 60000,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch instances on mount', async () => {
    const mockListInstances = vi.fn().mockResolvedValue({
      instances: mockInstances,
      total: 2,
      limit: 50,
      offset: 0,
    })
    mockCreateApiClient.mockReturnValue({
      listInstances: mockListInstances,
    } as any)

    const { result } = renderHook(() => useInstances('http://localhost:8080'))

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockListInstances).toHaveBeenCalled()
    expect(result.current.instances).toEqual(mockInstances)
    expect(result.current.total).toBe(2)
    expect(result.current.error).toBeNull()
  })

  it('should apply filters', async () => {
    const mockListInstances = vi.fn().mockResolvedValue({
      instances: [mockInstances[0]],
      total: 1,
      limit: 50,
      offset: 0,
    })
    mockCreateApiClient.mockReturnValue({
      listInstances: mockListInstances,
    } as any)

    const { result } = renderHook(() =>
      useInstances('http://localhost:8080', {
        status: 'RUNNING',
        workflowName: 'workflow1',
        limit: 10,
      })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockListInstances).toHaveBeenCalledWith({
      status: 'RUNNING',
      workflowName: 'workflow1',
      limit: 10,
    })
  })

  it.skip('should handle auto-refresh', async () => {
    vi.useFakeTimers()
    
    const mockListInstances = vi.fn().mockResolvedValue({
      instances: mockInstances,
      total: 2,
      limit: 50,
      offset: 0,
    })
    mockCreateApiClient.mockReturnValue({
      listInstances: mockListInstances,
    } as any)

    const { unmount } = renderHook(() =>
      useInstances('http://localhost:8080', {
        refreshInterval: 5000,
      })
    )

    // Wait for initial fetch
    await waitFor(() => {
      expect(mockListInstances).toHaveBeenCalledTimes(1)
    })

    // Advance time by 5 seconds and run all timers
    await vi.advanceTimersByTimeAsync(5000)

    // Should have refreshed
    await waitFor(() => {
      expect(mockListInstances).toHaveBeenCalledTimes(2)
    })

    // Advance another 5 seconds
    await vi.advanceTimersByTimeAsync(5000)

    // Should have refreshed again
    await waitFor(() => {
      expect(mockListInstances).toHaveBeenCalledTimes(3)
    })

    // Cleanup should stop interval
    unmount()

    await vi.advanceTimersByTimeAsync(5000)

    // Should not call again after unmount
    expect(mockListInstances).toHaveBeenCalledTimes(3)
    
    vi.useRealTimers()
  })

  it('should handle errors', async () => {
    const mockError = new Error('Failed to fetch')
    const mockListInstances = vi.fn().mockRejectedValue(mockError)
    mockCreateApiClient.mockReturnValue({
      listInstances: mockListInstances,
    } as any)

    const { result } = renderHook(() => useInstances('http://localhost:8080'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Failed to fetch')
    expect(result.current.instances).toEqual([])
  })
})

describe('useInstanceState', () => {
  const mockState = {
    status: 'running' as const,
    steps: new Map(),
    branches: [],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should get state from EventManager memory', async () => {
    mockEventManager.isEventSourceConnected.mockReturnValue(true)
    mockEventManager.getState.mockReturnValue(mockState)
    mockEventManager.subscribe.mockReturnValue(() => {})

    const { result } = renderHook(() =>
      useInstanceState('abc-123', 'http://localhost:8080')
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockEventManager.getState).toHaveBeenCalledWith('abc-123')
    expect(result.current.state).toEqual(mockState)
    expect(result.current.error).toBeNull()
  })

  it('should fetch state from API if not in memory', async () => {
    mockEventManager.isEventSourceConnected.mockReturnValue(true)
    mockEventManager.getState.mockReturnValue(undefined)
    mockEventManager.fetchState.mockResolvedValue(mockState)
    mockEventManager.subscribe.mockReturnValue(() => {})

    const { result } = renderHook(() =>
      useInstanceState('abc-123', 'http://localhost:8080')
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockEventManager.fetchState).toHaveBeenCalledWith('abc-123')
    expect(result.current.state).toEqual(mockState)
  })

  it('should subscribe to EventManager updates', async () => {
    const mockUnsubscribe = vi.fn()
    mockEventManager.isEventSourceConnected.mockReturnValue(true)
    mockEventManager.getState.mockReturnValue(mockState)
    mockEventManager.subscribe.mockReturnValue(mockUnsubscribe)

    const { unmount } = renderHook(() =>
      useInstanceState('abc-123', 'http://localhost:8080')
    )

    await waitFor(() => {
      expect(mockEventManager.subscribe).toHaveBeenCalled()
    })

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalled()
  })

  it('should warn if EventManager not connected', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mockEventManager.isEventSourceConnected.mockReturnValue(false)
    mockEventManager.getState.mockReturnValue(undefined)
    mockEventManager.fetchState.mockResolvedValue(mockState)
    mockEventManager.subscribe.mockReturnValue(() => {})

    renderHook(() => useInstanceState('abc-123', 'http://localhost:8080'))

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('EventManager not connected')
      )
    })

    consoleSpy.mockRestore()
  })

  it('should handle empty instanceId', async () => {
    const { result } = renderHook(() => useInstanceState('', 'http://localhost:8080'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockEventManager.getState).not.toHaveBeenCalled()
    expect(result.current.state).toBeNull()
  })

  it('should handle fetch errors', async () => {
    const mockError = new Error('Instance not found')
    mockEventManager.isEventSourceConnected.mockReturnValue(true)
    mockEventManager.getState.mockReturnValue(undefined)
    mockEventManager.fetchState.mockRejectedValue(mockError)
    mockEventManager.subscribe.mockReturnValue(() => {})

    const { result } = renderHook(() =>
      useInstanceState('abc-123', 'http://localhost:8080')
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Instance not found')
    expect(result.current.state).toBeNull()
  })
})

describe('useWorkflowDefinition', () => {
  const mockYaml = 'name: test\nversion: 1\nsteps: {}'
  const mockWorkflow = {
    name: 'test',
    version: 1,
    start: 'step1',
    steps: {},
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch and parse workflow', async () => {
    const mockGetWorkflowYaml = vi.fn().mockResolvedValue(mockYaml)
    mockCreateApiClient.mockReturnValue({
      getWorkflowYaml: mockGetWorkflowYaml,
    } as any)
    mockParseWorkflow.mockReturnValue(mockWorkflow as any)

    const { result } = renderHook(() =>
      useWorkflowDefinition('test_workflow', 'http://localhost:8080')
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockGetWorkflowYaml).toHaveBeenCalledWith('test_workflow')
    expect(mockParseWorkflow).toHaveBeenCalledWith(mockYaml)
    expect(result.current.yaml).toBe(mockYaml)
    expect(result.current.workflow).toEqual(mockWorkflow)
    expect(result.current.error).toBeNull()
  })

  it('should handle empty workflowName', async () => {
    const { result } = renderHook(() =>
      useWorkflowDefinition('', 'http://localhost:8080')
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockCreateApiClient).not.toHaveBeenCalled()
    expect(result.current.yaml).toBeNull()
    expect(result.current.workflow).toBeNull()
  })

  it('should handle fetch errors', async () => {
    const mockError = new Error('Workflow not found')
    const mockGetWorkflowYaml = vi.fn().mockRejectedValue(mockError)
    mockCreateApiClient.mockReturnValue({
      getWorkflowYaml: mockGetWorkflowYaml,
    } as any)

    const { result } = renderHook(() =>
      useWorkflowDefinition('missing', 'http://localhost:8080')
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Workflow not found')
    expect(result.current.yaml).toBeNull()
    expect(result.current.workflow).toBeNull()
  })

  it('should handle parse errors', async () => {
    const mockGetWorkflowYaml = vi.fn().mockResolvedValue(mockYaml)
    mockCreateApiClient.mockReturnValue({
      getWorkflowYaml: mockGetWorkflowYaml,
    } as any)
    mockParseWorkflow.mockImplementation(() => {
      throw new Error('Invalid YAML')
    })

    const { result } = renderHook(() =>
      useWorkflowDefinition('test_workflow', 'http://localhost:8080')
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toContain('Failed to parse workflow YAML')
    expect(result.current.yaml).toBeNull()
    expect(result.current.workflow).toBeNull()
  })

  it('should refetch when workflowName changes', async () => {
    const mockGetWorkflowYaml = vi.fn().mockResolvedValue(mockYaml)
    mockCreateApiClient.mockReturnValue({
      getWorkflowYaml: mockGetWorkflowYaml,
    } as any)
    mockParseWorkflow.mockReturnValue(mockWorkflow as any)

    const { rerender } = renderHook(
      ({ name }) => useWorkflowDefinition(name, 'http://localhost:8080'),
      { initialProps: { name: 'workflow1' } }
    )

    await waitFor(() => {
      expect(mockGetWorkflowYaml).toHaveBeenCalledTimes(1)
    })

    // Change workflow name
    rerender({ name: 'workflow2' })

    await waitFor(() => {
      expect(mockGetWorkflowYaml).toHaveBeenCalledTimes(2)
      expect(mockGetWorkflowYaml).toHaveBeenLastCalledWith('workflow2')
    })
  })
})
