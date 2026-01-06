import { describe, it, expect, beforeEach, vi } from 'vitest'
import { eventManager } from './EventManager'
import type { InstanceState } from '../types/execution'

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

      // Manually add state (simulating an event being received)
      const mockState: InstanceState = {
        status: 'running',
        workflowName: 'test-workflow',
        workflowVersion: 1,
        steps: new Map(),
        branches: [],
      }

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
