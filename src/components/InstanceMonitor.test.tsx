/**
 * Tests for InstanceMonitor component (src/lib/components/InstanceMonitor)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { InstanceMonitor } from '../lib/components/InstanceMonitor'
import type { InstanceDetailsDto } from '../types/api'
import * as hooks from '../lib/hooks'

// Mock the hooks
vi.mock('../lib/hooks', () => ({
  useInstanceDetails: vi.fn(),
  useWorkflowDefinition: vi.fn(),
}))

const mockUseInstanceDetails = vi.mocked(hooks.useInstanceDetails)
const mockUseWorkflowDefinition = vi.mocked(hooks.useWorkflowDefinition)

describe('InstanceMonitor', () => {
  const mockWorkflow = {
    name: 'sample_workflow',
    version: 1,
    start: 'step1',
    steps: {
      step1: {
        kind: 'tool' as const,
        tool: 'sample_tool',
        end: true,
      },
    },
  }

  const mockInstance: InstanceDetailsDto = {
    id: 'test-123',
    workflowName: 'sample_workflow',
    workflowVersion: 1,
    status: 'RUNNING',
    triggeredBy: 'evt-001',
    startedAt: '2026-01-07T10:00:00Z',
    completedAt: null,
    durationMs: null,
    steps: [],
    finalState: null,
    error: null,
    failedStep: null,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading state', () => {
    it('should show loading indicator when instance details are loading', () => {
      mockUseInstanceDetails.mockReturnValue({
        instance: null,
        loading: true,
        error: null,
      })
      mockUseWorkflowDefinition.mockReturnValue({
        workflow: null,
        yaml: null,
        loading: false,
        error: null,
      })

      render(
        <InstanceMonitor
          apiBaseUrl="http://localhost:8080"
          instanceId="test-123"
        />
      )

      expect(screen.getByText('Loading instance details...')).toBeInTheDocument()
    })

    it('should show loading indicator when workflow definition is loading', () => {
      mockUseInstanceDetails.mockReturnValue({
        instance: mockInstance,
        loading: false,
        error: null,
      })
      mockUseWorkflowDefinition.mockReturnValue({
        workflow: null,
        yaml: null,
        loading: true,
        error: null,
      })

      render(
        <InstanceMonitor
          apiBaseUrl="http://localhost:8080"
          instanceId="test-123"
        />
      )

      expect(screen.getByText('Loading instance details...')).toBeInTheDocument()
    })
  })

  describe('Error state', () => {
    it('should show error when instance details fail to load', () => {
      mockUseInstanceDetails.mockReturnValue({
        instance: null,
        loading: false,
        error: 'Failed to fetch instance',
      })
      mockUseWorkflowDefinition.mockReturnValue({
        workflow: null,
        yaml: null,
        loading: false,
        error: null,
      })

      render(
        <InstanceMonitor
          apiBaseUrl="http://localhost:8080"
          instanceId="test-123"
        />
      )

      expect(screen.getByText('Error loading instance')).toBeInTheDocument()
      expect(screen.getByText('Failed to fetch instance')).toBeInTheDocument()
    })
  })

  describe('Empty state', () => {
    it('should show not found when instance is null', () => {
      mockUseInstanceDetails.mockReturnValue({
        instance: null,
        loading: false,
        error: null,
      })
      mockUseWorkflowDefinition.mockReturnValue({
        workflow: null,
        yaml: null,
        loading: false,
        error: null,
      })

      render(
        <InstanceMonitor
          apiBaseUrl="http://localhost:8080"
          instanceId="test-123"
        />
      )

      expect(screen.getByText('Instance not found')).toBeInTheDocument()
    })

    it('should show not found when workflow is null but instance exists', () => {
      mockUseInstanceDetails.mockReturnValue({
        instance: mockInstance,
        loading: false,
        error: null,
      })
      mockUseWorkflowDefinition.mockReturnValue({
        workflow: null,
        yaml: null,
        loading: false,
        error: null,
      })

      render(
        <InstanceMonitor
          apiBaseUrl="http://localhost:8080"
          instanceId="test-123"
        />
      )

      expect(screen.getByText('Instance not found')).toBeInTheDocument()
    })
  })

  describe('Instance header', () => {
    it('should display workflow name', () => {
      mockUseInstanceDetails.mockReturnValue({
        instance: mockInstance,
        loading: false,
        error: null,
      })
      mockUseWorkflowDefinition.mockReturnValue({
        workflow: mockWorkflow,
        yaml: 'name: sample_workflow',
        loading: false,
        error: null,
      })

      render(
        <InstanceMonitor
          apiBaseUrl="http://localhost:8080"
          instanceId="test-123"
        />
      )

      expect(screen.getByText('sample_workflow')).toBeInTheDocument()
    })

    it('should display instance ID', () => {
      mockUseInstanceDetails.mockReturnValue({
        instance: mockInstance,
        loading: false,
        error: null,
      })
      mockUseWorkflowDefinition.mockReturnValue({
        workflow: mockWorkflow,
        yaml: 'name: sample_workflow',
        loading: false,
        error: null,
      })

      render(
        <InstanceMonitor
          apiBaseUrl="http://localhost:8080"
          instanceId="test-123"
        />
      )

      expect(screen.getByText('test-123')).toBeInTheDocument()
    })

    it('should display status badge', () => {
      mockUseInstanceDetails.mockReturnValue({
        instance: mockInstance,
        loading: false,
        error: null,
      })
      mockUseWorkflowDefinition.mockReturnValue({
        workflow: mockWorkflow,
        yaml: 'name: sample_workflow',
        loading: false,
        error: null,
      })

      render(
        <InstanceMonitor
          apiBaseUrl="http://localhost:8080"
          instanceId="test-123"
        />
      )

      expect(screen.getByText('RUNNING')).toBeInTheDocument()
    })

    it('should display completion time when instance is completed', () => {
      const completedInstance: InstanceDetailsDto = {
        ...mockInstance,
        status: 'COMPLETED',
        completedAt: '2026-01-07T10:01:00Z',
        durationMs: 60000,
      }

      mockUseInstanceDetails.mockReturnValue({
        instance: completedInstance,
        loading: false,
        error: null,
      })
      mockUseWorkflowDefinition.mockReturnValue({
        workflow: mockWorkflow,
        yaml: 'name: sample_workflow',
        loading: false,
        error: null,
      })

      render(
        <InstanceMonitor
          apiBaseUrl="http://localhost:8080"
          instanceId="test-123"
        />
      )

      expect(screen.getByText(/Completed:/)).toBeInTheDocument()
      expect(screen.getByText(/Duration: 60000ms/)).toBeInTheDocument()
    })

    it('should display error details when instance has failed', () => {
      const failedInstance: InstanceDetailsDto = {
        ...mockInstance,
        status: 'FAILED',
        error: 'LLM timeout',
        failedStep: 'step2',
      }

      mockUseInstanceDetails.mockReturnValue({
        instance: failedInstance,
        loading: false,
        error: null,
      })
      mockUseWorkflowDefinition.mockReturnValue({
        workflow: mockWorkflow,
        yaml: 'name: sample_workflow',
        loading: false,
        error: null,
      })

      render(
        <InstanceMonitor
          apiBaseUrl="http://localhost:8080"
          instanceId="test-123"
        />
      )

      expect(screen.getByText(/LLM timeout/)).toBeInTheDocument()
      expect(screen.getByText(/Step: step2/)).toBeInTheDocument()
    })
  })

  describe('Hook wiring', () => {
    it('should pass instanceId and apiBaseUrl to useInstanceDetails', () => {
      mockUseInstanceDetails.mockReturnValue({
        instance: null,
        loading: true,
        error: null,
      })
      mockUseWorkflowDefinition.mockReturnValue({
        workflow: null,
        yaml: null,
        loading: false,
        error: null,
      })

      render(
        <InstanceMonitor
          apiBaseUrl="http://localhost:8080"
          instanceId="abc-456"
        />
      )

      expect(mockUseInstanceDetails).toHaveBeenCalledWith('abc-456', 'http://localhost:8080')
    })

    it('should derive workflowName from instance and pass to useWorkflowDefinition', () => {
      mockUseInstanceDetails.mockReturnValue({
        instance: mockInstance,
        loading: false,
        error: null,
      })
      mockUseWorkflowDefinition.mockReturnValue({
        workflow: mockWorkflow,
        yaml: 'name: sample_workflow',
        loading: false,
        error: null,
      })

      render(
        <InstanceMonitor
          apiBaseUrl="http://localhost:8080"
          instanceId="test-123"
        />
      )

      expect(mockUseWorkflowDefinition).toHaveBeenCalledWith('sample_workflow', 'http://localhost:8080')
    })

    it('should pass empty string to useWorkflowDefinition when instance is not yet loaded', () => {
      mockUseInstanceDetails.mockReturnValue({
        instance: null,
        loading: true,
        error: null,
      })
      mockUseWorkflowDefinition.mockReturnValue({
        workflow: null,
        yaml: null,
        loading: true,
        error: null,
      })

      render(
        <InstanceMonitor
          apiBaseUrl="http://localhost:8080"
          instanceId="test-123"
        />
      )

      expect(mockUseWorkflowDefinition).toHaveBeenCalledWith('', 'http://localhost:8080')
    })
  })
})
