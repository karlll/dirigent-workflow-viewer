/**
 * Tests for ApiClient
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ApiClient, createApiClient, ApiError } from './ApiClient'
import type {
  WorkflowMetadata,
  InstanceSummaryDto,
  InstanceDetailsDto,
} from '../types/api'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('ApiClient', () => {
  let client: ApiClient

  beforeEach(() => {
    client = createApiClient('http://localhost:8080', 5000)
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('listWorkflows', () => {
    it('should fetch workflows successfully', async () => {
      const mockWorkflows: WorkflowMetadata[] = [
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

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ workflows: mockWorkflows }),
      })

      const result = await client.listWorkflows()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/v1/workflows',
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      )
      expect(result).toEqual(mockWorkflows)
    })

    it('should throw ApiError on HTTP error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error details',
      })

      await expect(client.listWorkflows()).rejects.toThrow(ApiError)
      
      // Mock again for second call
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error details',
      })
      
      await expect(client.listWorkflows()).rejects.toThrow(
        'Failed to fetch workflows: Internal Server Error'
      )
    })

    it('should throw ApiError on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network failure'))

      await expect(client.listWorkflows()).rejects.toThrow(ApiError)
      
      // Mock again for second call
      mockFetch.mockRejectedValueOnce(new Error('Network failure'))
      
      await expect(client.listWorkflows()).rejects.toThrow('Network error')
    })

    it('should throw ApiError on timeout', async () => {
      mockFetch.mockImplementationOnce(() => {
        return new Promise((_, reject) => {
          setTimeout(() => {
            const error = new Error('Aborted')
            error.name = 'AbortError'
            reject(error)
          }, 100)
        })
      })

      await expect(client.listWorkflows()).rejects.toThrow(ApiError)
      
      // Mock again for second call
      mockFetch.mockImplementationOnce(() => {
        return new Promise((_, reject) => {
          setTimeout(() => {
            const error = new Error('Aborted')
            error.name = 'AbortError'
            reject(error)
          }, 100)
        })
      })
      
      await expect(client.listWorkflows()).rejects.toThrow('Request timeout')
    })
  })

  describe('getWorkflowYaml', () => {
    it('should fetch workflow YAML successfully', async () => {
      const mockYaml = 'name: test\nversion: 1\nsteps: {}'

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => mockYaml,
      })

      const result = await client.getWorkflowYaml('test_workflow')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/v1/workflows/test_workflow',
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      )
      expect(result).toBe(mockYaml)
    })

    it('should encode workflow name in URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => 'yaml content',
      })

      await client.getWorkflowYaml('workflow with spaces')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/v1/workflows/workflow%20with%20spaces',
        expect.any(Object)
      )
    })

    it('should throw ApiError on 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Workflow not found',
      })

      await expect(client.getWorkflowYaml('missing')).rejects.toThrow(ApiError)
      
      // Mock again for second call
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Workflow not found',
      })
      
      await expect(client.getWorkflowYaml('missing')).rejects.toThrow(
        "Failed to fetch workflow 'missing'"
      )
    })
  })

  describe('listInstances', () => {
    const mockInstances: InstanceSummaryDto[] = [
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

    it('should fetch instances without filters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          instances: mockInstances,
          total: 2,
          limit: 50,
          offset: 0,
        }),
      })

      const result = await client.listInstances()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/v1/instances',
        expect.any(Object)
      )
      expect(result.instances).toEqual(mockInstances)
      expect(result.total).toBe(2)
    })

    it('should apply status filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          instances: [mockInstances[0]],
          total: 1,
          limit: 50,
          offset: 0,
        }),
      })

      await client.listInstances({ status: 'RUNNING' })

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/v1/instances?status=RUNNING',
        expect.any(Object)
      )
    })

    it('should apply multiple filters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          instances: [],
          total: 0,
          limit: 10,
          offset: 20,
        }),
      })

      await client.listInstances({
        status: 'COMPLETED',
        workflowName: 'workflow1',
        limit: 10,
        offset: 20,
      })

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/v1/instances?status=COMPLETED&workflowName=workflow1&limit=10&offset=20',
        expect.any(Object)
      )
    })

    it('should apply time filters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          instances: [],
          total: 0,
          limit: 50,
          offset: 0,
        }),
      })

      await client.listInstances({
        since: '2026-01-07T00:00:00Z',
        until: '2026-01-07T23:59:59Z',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/v1/instances?since=2026-01-07T00%3A00%3A00Z&until=2026-01-07T23%3A59%3A59Z',
        expect.any(Object)
      )
    })

    it('should throw ApiError on failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Error details',
      })

      await expect(client.listInstances()).rejects.toThrow(ApiError)
    })
  })

  describe('getInstance', () => {
    const mockInstance: InstanceDetailsDto = {
      id: 'abc-123',
      workflowName: 'workflow1',
      workflowVersion: 1,
      status: 'COMPLETED',
      triggeredBy: 'evt-1',
      startedAt: '2026-01-07T10:00:00Z',
      completedAt: '2026-01-07T10:01:00Z',
      durationMs: 60000,
      steps: [
        {
          stepId: 'step1',
          stepKind: 'tool',
          status: 'COMPLETED',
          startedAt: '2026-01-07T10:00:00Z',
          completedAt: '2026-01-07T10:00:30Z',
          durationMs: 30000,
          input: { key: 'value' },
          output: { result: 'success' },
          error: null,
        },
      ],
      finalState: { status: 'done' },
      error: null,
      failedStep: null,
    }

    it('should fetch instance details successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockInstance,
      })

      const result = await client.getInstance('abc-123')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/v1/instances/abc-123',
        expect.any(Object)
      )
      expect(result).toEqual(mockInstance)
    })

    it('should encode instance ID in URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockInstance,
      })

      await client.getInstance('abc-123-def/456')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/v1/instances/abc-123-def%2F456',
        expect.any(Object)
      )
    })

    it('should throw ApiError on 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Instance not found',
      })

      await expect(client.getInstance('missing')).rejects.toThrow(ApiError)
      
      // Mock again for second call
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Instance not found',
      })
      
      await expect(client.getInstance('missing')).rejects.toThrow(
        "Failed to fetch instance 'missing'"
      )
    })
  })

  describe('ApiError', () => {
    it('should include status code and response body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () => 'Invalid parameter',
      })

      try {
        await client.listWorkflows()
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        const apiError = error as ApiError
        expect(apiError.statusCode).toBe(400)
        expect(apiError.responseBody).toBe('Invalid parameter')
        expect(apiError.message).toContain('Bad Request')
      }
    })
  })

  describe('createApiClient factory', () => {
    it('should create client with default timeout', () => {
      const defaultClient = createApiClient('http://example.com')
      expect(defaultClient).toBeInstanceOf(ApiClient)
    })

    it('should create client with custom timeout', () => {
      const customClient = createApiClient('http://example.com', 10000)
      expect(customClient).toBeInstanceOf(ApiClient)
    })
  })
})
