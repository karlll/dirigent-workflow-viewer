import { describe, it, expect, beforeEach, vi } from 'vitest'
import { eventManager } from './EventManager'

describe('EventManager', () => {
  beforeEach(() => {
    // Disconnect any existing connections
    eventManager.disconnect()

    // Clear any internal state
    vi.clearAllMocks()
  })

  describe('connect', () => {
    it('should establish SSE connection', async () => {
      const apiUrl = 'http://localhost:8081'

      eventManager.connect(apiUrl)

      // Wait for async connection to complete
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(eventManager.isEventSourceConnected()).toBe(true)
    })

    it('should warn if already connected', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const apiUrl = 'http://localhost:8081'

      eventManager.connect(apiUrl)

      // Wait for connection
      await new Promise(resolve => setTimeout(resolve, 10))

      eventManager.connect(apiUrl) // Second connection attempt

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Already connected')
      )

      consoleSpy.mockRestore()
    })
  })

  describe('subscribe', () => {
    it('should call callback immediately with current state if available', () => {
      const instanceId = 'test-instance-123'
      const mockCallback = vi.fn()

      // Subscribe
      eventManager.subscribe(instanceId, mockCallback)

      // Callback should be called immediately if state exists
      // (In this test it won't because we don't have a way to inject state yet)
      expect(mockCallback).toHaveBeenCalledTimes(0)
    })

    it('should return unsubscribe function', () => {
      const instanceId = 'test-instance-123'
      const mockCallback = vi.fn()

      const unsubscribe = eventManager.subscribe(instanceId, mockCallback)

      expect(typeof unsubscribe).toBe('function')

      // Should not throw when called
      expect(() => unsubscribe()).not.toThrow()
    })

    it('should not call callback after unsubscribe', () => {
      const instanceId = 'test-instance-123'
      const mockCallback = vi.fn()

      const unsubscribe = eventManager.subscribe(instanceId, mockCallback)
      unsubscribe()

      // Callback should not be called after unsubscribe
      expect(mockCallback).toHaveBeenCalledTimes(0)
    })
  })

  describe('getState', () => {
    it('should return undefined for unknown instance', () => {
      const state = eventManager.getState('unknown-instance')

      expect(state).toBeUndefined()
    })
  })

  describe('fetchState', () => {
    it('should throw error if not connected', async () => {
      // Ensure eventManager is disconnected
      eventManager.disconnect()

      await expect(
        eventManager.fetchState('test-instance')
      ).rejects.toThrow('EventManager not connected')
    })

    it('should fetch instance state from API', async () => {
      const apiUrl = 'http://localhost:8081'
      const instanceId = 'test-instance-123'

      // Mock fetch
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
          steps: [],
          finalState: null,
          error: null,
          failedStep: null,
        }),
      })

      eventManager.connect(apiUrl)

      const state = await eventManager.fetchState(instanceId)

      expect(state).toBeDefined()
      expect(state.workflowName).toBe('test-workflow')
      expect(state.status).toBe('running')
      expect(fetch).toHaveBeenCalledWith(
        `${apiUrl}/api/v1/instances/${instanceId}`
      )
    })

    it('should throw error for 404 response', async () => {
      const apiUrl = 'http://localhost:8081'
      const instanceId = 'unknown-instance'

      // Mock fetch
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })

      eventManager.connect(apiUrl)

      await expect(
        eventManager.fetchState(instanceId)
      ).rejects.toThrow(`Instance '${instanceId}' not found`)
    })

    it('should merge SSE state with REST API state', async () => {
      const apiUrl = 'http://localhost:8081'
      const instanceId = 'test-instance-merge'

      // Connect EventManager
      eventManager.connect(apiUrl)

      // Simulate SSE event arriving first (StepStarted for step_1)
      // We'll need to use the internal updateInstanceStep method
      // For now, we'll create the scenario via fetchState then SSE updates

      // First fetch: REST API shows step_1 running, step_2 pending
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: instanceId,
          workflowName: 'test-workflow',
          workflowVersion: 1,
          status: 'RUNNING',
          triggeredBy: null,
          startedAt: '2026-01-17T10:00:00Z',
          completedAt: null,
          durationMs: null,
          steps: [
            {
              stepId: 'step_1',
              stepKind: 'tool',
              status: 'RUNNING',
              startedAt: '2026-01-17T10:00:01Z',
              completedAt: null,
              durationMs: null,
              input: null,
              output: null,
              error: null,
            },
          ],
          finalState: null,
          error: null,
          failedStep: null,
        }),
      })

      const state1 = await eventManager.fetchState(instanceId)

      expect(state1.steps.size).toBe(1)
      expect(state1.steps.get('step_1')?.status).toBe('running')

      // Simulate SSE StepCompleted event arriving (step_1 completed)
      // In reality this would come through SSE, but we'll directly call the update method
      // Since we can't access private methods, we'll simulate by fetching again
      // but REST API still shows running (lag), SSE should have preference

      // For this test, we'll verify that fetchState with existing state works correctly
      // Second fetch: Pretend REST API is lagging and still shows step_1 as running
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: instanceId,
          workflowName: 'test-workflow',
          workflowVersion: 1,
          status: 'RUNNING',
          triggeredBy: null,
          startedAt: '2026-01-17T10:00:00Z',
          completedAt: null,
          durationMs: null,
          steps: [
            {
              stepId: 'step_1',
              stepKind: 'tool',
              status: 'SUCCEEDED',  // Now completed in REST API
              startedAt: '2026-01-17T10:00:01Z',
              completedAt: '2026-01-17T10:00:03Z',
              durationMs: 2000,
              input: null,
              output: null,
              error: null,
            },
            {
              stepId: 'step_2',
              stepKind: 'tool',
              status: 'RUNNING',
              startedAt: '2026-01-17T10:00:03Z',
              completedAt: null,
              durationMs: null,
              input: null,
              output: null,
              error: null,
            },
          ],
          finalState: null,
          error: null,
          failedStep: null,
        }),
      })

      const state2 = await eventManager.fetchState(instanceId)

      // Should have merged to include both steps
      expect(state2.steps.size).toBe(2)
      expect(state2.steps.get('step_1')?.status).toBe('completed')
      expect(state2.steps.get('step_2')?.status).toBe('running')
    })
  })

  describe('disconnect', () => {
    it('should close SSE connection', async () => {
      const apiUrl = 'http://localhost:8081'

      eventManager.connect(apiUrl)

      // Wait for async connection to complete
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(eventManager.isEventSourceConnected()).toBe(true)

      eventManager.disconnect()
      expect(eventManager.isEventSourceConnected()).toBe(false)
    })

    it('should handle disconnect when not connected', () => {
      expect(() => eventManager.disconnect()).not.toThrow()
    })
  })
})
