/**
 * Tests for InstanceMonitor component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { InstanceMonitor } from './InstanceMonitor'
import * as hooks from '../lib/hooks'

// Mock the hooks
vi.mock('../lib/hooks', () => ({
  useWorkflowDefinition: vi.fn(),
  useInstanceState: vi.fn(),
}))

const mockUseWorkflowDefinition = vi.mocked(hooks.useWorkflowDefinition)
const mockUseInstanceState = vi.mocked(hooks.useInstanceState)

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

  const mockYaml = `name: sample_workflow
version: 1
start: step1
steps:
  step1:
    kind: tool
    tool: sample_tool
    end: true
`

  const mockInstanceState = {
    workflowName: 'sample_workflow',
    workflowVersion: 1,
    status: 'running',
    startedAt: '2026-01-07T10:00:00Z',
    currentStepId: 'step1',
    steps: new Map([
      [
        'step1',
        {
          status: 'running',
          stepKind: 'tool',
          startedAt: '2026-01-07T10:00:00Z',
        },
      ],
    ]),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading state', () => {
    it('should show loading indicator when workflow is loading', () => {
      mockUseWorkflowDefinition.mockReturnValue({
        workflow: null,
        yaml: null,
        loading: true,
        error: null,
      })
      mockUseInstanceState.mockReturnValue({
        state: null,
        loading: false,
        error: null,
      })

      render(
        <InstanceMonitor
          apiBaseUrl="http://localhost:8080"
          instanceId="test-123"
          workflowName="sample_workflow"
        />
      )

      expect(screen.getByText('Loading instance monitor...')).toBeInTheDocument()
    })

    it('should show loading indicator when instance state is loading', () => {
      mockUseWorkflowDefinition.mockReturnValue({
        workflow: mockWorkflow,
        yaml: mockYaml,
        loading: false,
        error: null,
      })
      mockUseInstanceState.mockReturnValue({
        state: null,
        loading: true,
        error: null,
      })

      render(
        <InstanceMonitor
          apiBaseUrl="http://localhost:8080"
          instanceId="test-123"
          workflowName="sample_workflow"
        />
      )

      expect(screen.getByText('Loading instance monitor...')).toBeInTheDocument()
    })

    it('should not show loading when showLoading is false', () => {
      mockUseWorkflowDefinition.mockReturnValue({
        workflow: null,
        yaml: null,
        loading: true,
        error: null,
      })
      mockUseInstanceState.mockReturnValue({
        state: null,
        loading: false,
        error: null,
      })

      render(
        <InstanceMonitor
          apiBaseUrl="http://localhost:8080"
          instanceId="test-123"
          workflowName="sample_workflow"
          showLoading={false}
        />
      )

      expect(screen.queryByText('Loading instance monitor...')).not.toBeInTheDocument()
    })
  })

  describe('Error state', () => {
    it('should show workflow error', () => {
      mockUseWorkflowDefinition.mockReturnValue({
        workflow: null,
        yaml: null,
        loading: false,
        error: 'Failed to fetch workflow',
      })
      mockUseInstanceState.mockReturnValue({
        state: null,
        loading: false,
        error: null,
      })

      render(
        <InstanceMonitor
          apiBaseUrl="http://localhost:8080"
          instanceId="test-123"
          workflowName="sample_workflow"
        />
      )

      expect(screen.getByText(/Failed to fetch workflow/)).toBeInTheDocument()
    })

    it('should show instance state error', () => {
      mockUseWorkflowDefinition.mockReturnValue({
        workflow: mockWorkflow,
        yaml: mockYaml,
        loading: false,
        error: null,
      })
      mockUseInstanceState.mockReturnValue({
        state: null,
        loading: false,
        error: 'Failed to fetch instance state',
      })

      render(
        <InstanceMonitor
          apiBaseUrl="http://localhost:8080"
          instanceId="test-123"
          workflowName="sample_workflow"
        />
      )

      expect(screen.getByText(/Failed to fetch instance state/)).toBeInTheDocument()
    })

    it('should prioritize workflow error over instance error', () => {
      mockUseWorkflowDefinition.mockReturnValue({
        workflow: null,
        yaml: null,
        loading: false,
        error: 'Workflow error',
      })
      mockUseInstanceState.mockReturnValue({
        state: null,
        loading: false,
        error: 'Instance error',
      })

      render(
        <InstanceMonitor
          apiBaseUrl="http://localhost:8080"
          instanceId="test-123"
          workflowName="sample_workflow"
        />
      )

      expect(screen.getByText(/Workflow error/)).toBeInTheDocument()
    })
  })

  describe('Empty state', () => {
    it('should show workflow not found when workflow is null', () => {
      mockUseWorkflowDefinition.mockReturnValue({
        workflow: null,
        yaml: null,
        loading: false,
        error: null,
      })
      mockUseInstanceState.mockReturnValue({
        state: mockInstanceState,
        loading: false,
        error: null,
      })

      render(
        <InstanceMonitor
          apiBaseUrl="http://localhost:8080"
          instanceId="test-123"
          workflowName="sample_workflow"
        />
      )

      expect(screen.getByText('Workflow not found')).toBeInTheDocument()
    })
  })

  describe('Monitoring display', () => {
    it('should render instance header with ID', () => {
      mockUseWorkflowDefinition.mockReturnValue({
        workflow: mockWorkflow,
        yaml: mockYaml,
        loading: false,
        error: null,
      })
      mockUseInstanceState.mockReturnValue({
        state: mockInstanceState,
        loading: false,
        error: null,
      })

      render(
        <InstanceMonitor
          apiBaseUrl="http://localhost:8080"
          instanceId="test-123"
          workflowName="sample_workflow"
        />
      )

      expect(screen.getByText('Monitoring Instance')).toBeInTheDocument()
      expect(screen.getByText('test-123')).toBeInTheDocument()
    })

    it('should show status badge', () => {
      mockUseWorkflowDefinition.mockReturnValue({
        workflow: mockWorkflow,
        yaml: mockYaml,
        loading: false,
        error: null,
      })
      mockUseInstanceState.mockReturnValue({
        state: mockInstanceState,
        loading: false,
        error: null,
      })

      render(
        <InstanceMonitor
          apiBaseUrl="http://localhost:8080"
          instanceId="test-123"
          workflowName="sample_workflow"
        />
      )

      expect(screen.getByText('RUNNING')).toBeInTheDocument()
    })

    it('should show current step for running instances', () => {
      mockUseWorkflowDefinition.mockReturnValue({
        workflow: mockWorkflow,
        yaml: mockYaml,
        loading: false,
        error: null,
      })
      mockUseInstanceState.mockReturnValue({
        state: mockInstanceState,
        loading: false,
        error: null,
      })

      render(
        <InstanceMonitor
          apiBaseUrl="http://localhost:8080"
          instanceId="test-123"
          workflowName="sample_workflow"
        />
      )

      expect(screen.getByText(/Current: step1/)).toBeInTheDocument()
    })

    it('should not show current step for completed instances', () => {
      const completedState = {
        ...mockInstanceState,
        status: 'completed',
        currentStepId: null,
      }

      mockUseWorkflowDefinition.mockReturnValue({
        workflow: mockWorkflow,
        yaml: mockYaml,
        loading: false,
        error: null,
      })
      mockUseInstanceState.mockReturnValue({
        state: completedState,
        loading: false,
        error: null,
      })

      render(
        <InstanceMonitor
          apiBaseUrl="http://localhost:8080"
          instanceId="test-123"
          workflowName="sample_workflow"
        />
      )

      expect(screen.queryByText(/Current:/)).not.toBeInTheDocument()
    })

    it('should render ExecutableWorkflow component', () => {
      mockUseWorkflowDefinition.mockReturnValue({
        workflow: mockWorkflow,
        yaml: mockYaml,
        loading: false,
        error: null,
      })
      mockUseInstanceState.mockReturnValue({
        state: mockInstanceState,
        loading: false,
        error: null,
      })

      const { container } = render(
        <InstanceMonitor
          apiBaseUrl="http://localhost:8080"
          instanceId="test-123"
          workflowName="sample_workflow"
        />
      )

      // ExecutableWorkflow should be rendered (check for React Flow container)
      expect(container.querySelector('.react-flow')).toBeInTheDocument()
    })
  })

  describe('Props handling', () => {
    it('should pass direction prop to ExecutableWorkflow', () => {
      mockUseWorkflowDefinition.mockReturnValue({
        workflow: mockWorkflow,
        yaml: mockYaml,
        loading: false,
        error: null,
      })
      mockUseInstanceState.mockReturnValue({
        state: mockInstanceState,
        loading: false,
        error: null,
      })

      render(
        <InstanceMonitor
          apiBaseUrl="http://localhost:8080"
          instanceId="test-123"
          workflowName="sample_workflow"
          direction="TB"
        />
      )

      // Component should render without errors
      expect(screen.getByText('Monitoring Instance')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      mockUseWorkflowDefinition.mockReturnValue({
        workflow: mockWorkflow,
        yaml: mockYaml,
        loading: false,
        error: null,
      })
      mockUseInstanceState.mockReturnValue({
        state: mockInstanceState,
        loading: false,
        error: null,
      })

      const { container } = render(
        <InstanceMonitor
          apiBaseUrl="http://localhost:8080"
          instanceId="test-123"
          workflowName="sample_workflow"
          className="custom-class"
        />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('should apply custom styles', () => {
      mockUseWorkflowDefinition.mockReturnValue({
        workflow: mockWorkflow,
        yaml: mockYaml,
        loading: false,
        error: null,
      })
      mockUseInstanceState.mockReturnValue({
        state: mockInstanceState,
        loading: false,
        error: null,
      })

      const { container } = render(
        <InstanceMonitor
          apiBaseUrl="http://localhost:8080"
          instanceId="test-123"
          workflowName="sample_workflow"
          style={{ maxHeight: '500px' }}
        />
      )

      expect(container.firstChild).toHaveStyle({ maxHeight: '500px' })
    })
  })
})
