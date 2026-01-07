/**
 * Tests for InstanceBrowser component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InstanceBrowser } from './InstanceBrowser'
import * as hooks from '../lib/hooks'

// Mock the hooks
vi.mock('../lib/hooks', () => ({
  useInstances: vi.fn(),
}))

const mockUseInstances = vi.mocked(hooks.useInstances)

describe('InstanceBrowser', () => {
  const mockInstances = [
    {
      id: 'instance-1',
      workflowName: 'sample_workflow',
      workflowVersion: 1,
      status: 'RUNNING' as const,
      triggeredBy: 'evt-001',
      startedAt: '2026-01-07T10:00:00Z',
      completedAt: null,
      durationMs: null,
    },
    {
      id: 'instance-2',
      workflowName: 'notification_workflow',
      workflowVersion: 2,
      status: 'COMPLETED' as const,
      triggeredBy: 'evt-002',
      startedAt: '2026-01-07T09:00:00Z',
      completedAt: '2026-01-07T09:01:30Z',
      durationMs: 90000,
    },
    {
      id: 'instance-3',
      workflowName: 'data_processing',
      workflowVersion: 1,
      status: 'FAILED' as const,
      triggeredBy: 'evt-003',
      startedAt: '2026-01-07T08:00:00Z',
      completedAt: '2026-01-07T08:00:45Z',
      durationMs: 45000,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading state', () => {
    it('should show loading indicator', () => {
      mockUseInstances.mockReturnValue({
        instances: [],
        total: 0,
        loading: true,
        error: null,
        refresh: vi.fn(),
      })

      render(<InstanceBrowser apiBaseUrl="http://localhost:8080" />)

      expect(screen.getByText('Loading instances...')).toBeInTheDocument()
    })
  })

  describe('Error state', () => {
    it('should show error message', () => {
      mockUseInstances.mockReturnValue({
        instances: [],
        total: 0,
        loading: false,
        error: 'Network error',
        refresh: vi.fn(),
      })

      render(<InstanceBrowser apiBaseUrl="http://localhost:8080" />)

      expect(screen.getByText(/Network error/)).toBeInTheDocument()
    })
  })

  describe('Empty state', () => {
    it('should show empty message when no instances', () => {
      mockUseInstances.mockReturnValue({
        instances: [],
        total: 0,
        loading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(<InstanceBrowser apiBaseUrl="http://localhost:8080" />)

      expect(screen.getByText('No instances found')).toBeInTheDocument()
    })

    it('should show filter info in empty state', () => {
      mockUseInstances.mockReturnValue({
        instances: [],
        total: 0,
        loading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(
        <InstanceBrowser
          apiBaseUrl="http://localhost:8080"
          workflowName="test_workflow"
          status="RUNNING"
        />
      )

      expect(screen.getByText(/Workflow: test_workflow/)).toBeInTheDocument()
      expect(screen.getByText(/Status: RUNNING/)).toBeInTheDocument()
    })
  })

  describe('Instance list', () => {
    it('should render instances', () => {
      mockUseInstances.mockReturnValue({
        instances: mockInstances,
        total: 3,
        loading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(<InstanceBrowser apiBaseUrl="http://localhost:8080" />)

      expect(screen.getByText('instance-1')).toBeInTheDocument()
      expect(screen.getByText('instance-2')).toBeInTheDocument()
      expect(screen.getByText('instance-3')).toBeInTheDocument()
    })

    it('should show instance count in header', () => {
      mockUseInstances.mockReturnValue({
        instances: mockInstances,
        total: 3,
        loading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(<InstanceBrowser apiBaseUrl="http://localhost:8080" />)

      expect(screen.getByText(/3 instances/)).toBeInTheDocument()
    })

    it('should show workflow names and versions', () => {
      mockUseInstances.mockReturnValue({
        instances: mockInstances,
        total: 3,
        loading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(<InstanceBrowser apiBaseUrl="http://localhost:8080" />)

      // Check for all workflow names
      expect(screen.getAllByText(/sample_workflow/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/notification_workflow/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/data_processing/).length).toBeGreaterThan(0)
    })

    it('should show status badges', () => {
      mockUseInstances.mockReturnValue({
        instances: mockInstances,
        total: 3,
        loading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(<InstanceBrowser apiBaseUrl="http://localhost:8080" />)

      // Each status appears in both badge and possibly header
      expect(screen.getAllByText('RUNNING').length).toBeGreaterThan(0)
      expect(screen.getAllByText('COMPLETED').length).toBeGreaterThan(0)
      expect(screen.getAllByText('FAILED').length).toBeGreaterThan(0)
    })

    it('should call onSelect when instance is clicked', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()

      mockUseInstances.mockReturnValue({
        instances: mockInstances,
        total: 3,
        loading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(
        <InstanceBrowser apiBaseUrl="http://localhost:8080" onSelect={onSelect} />
      )

      await user.click(screen.getByText('instance-1'))

      expect(onSelect).toHaveBeenCalledWith('instance-1')
    })

    it('should highlight selected instance', () => {
      mockUseInstances.mockReturnValue({
        instances: mockInstances,
        total: 3,
        loading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(
        <InstanceBrowser
          apiBaseUrl="http://localhost:8080"
          selectedInstance="instance-2"
        />
      )

      const button = screen.getByLabelText('Select instance instance-2')
      expect(button).toHaveAttribute('aria-pressed', 'true')
    })
  })

  describe('Metadata display', () => {
    it('should show metadata when enabled', () => {
      mockUseInstances.mockReturnValue({
        instances: mockInstances,
        total: 3,
        loading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(
        <InstanceBrowser apiBaseUrl="http://localhost:8080" showMetadata />
      )

      // Check that metadata fields exist (multiple instances have these)
      expect(screen.getAllByText(/Started:/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Completed:/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Duration:/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Triggered by:/).length).toBeGreaterThan(0)
    })

    it('should not show metadata by default', () => {
      mockUseInstances.mockReturnValue({
        instances: mockInstances,
        total: 3,
        loading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(<InstanceBrowser apiBaseUrl="http://localhost:8080" />)

      expect(screen.queryByText(/Started:/)).not.toBeInTheDocument()
    })
  })

  describe('Filtering', () => {
    it('should pass workflowName filter to hook', () => {
      mockUseInstances.mockReturnValue({
        instances: [],
        total: 0,
        loading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(
        <InstanceBrowser
          apiBaseUrl="http://localhost:8080"
          workflowName="test_workflow"
        />
      )

      expect(mockUseInstances).toHaveBeenCalledWith(
        'http://localhost:8080',
        expect.objectContaining({
          workflowName: 'test_workflow',
        })
      )
    })

    it('should pass status filter to hook', () => {
      mockUseInstances.mockReturnValue({
        instances: [],
        total: 0,
        loading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(
        <InstanceBrowser apiBaseUrl="http://localhost:8080" status="RUNNING" />
      )

      expect(mockUseInstances).toHaveBeenCalledWith(
        'http://localhost:8080',
        expect.objectContaining({
          status: 'RUNNING',
        })
      )
    })

    it('should show filter info in header', () => {
      mockUseInstances.mockReturnValue({
        instances: mockInstances,
        total: 3,
        loading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(
        <InstanceBrowser
          apiBaseUrl="http://localhost:8080"
          workflowName="sample_workflow"
          status="RUNNING"
        />
      )

      // Header text shows filters
      const header = screen.getByText(/3 instances/)
      expect(header).toBeInTheDocument()
      expect(header.textContent).toContain('sample_workflow')
      expect(header.textContent).toContain('RUNNING')
    })
  })

  describe('Auto-refresh', () => {
    it('should pass refreshInterval to hook', () => {
      mockUseInstances.mockReturnValue({
        instances: mockInstances,
        total: 3,
        loading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(
        <InstanceBrowser apiBaseUrl="http://localhost:8080" refreshInterval={5000} />
      )

      expect(mockUseInstances).toHaveBeenCalledWith(
        'http://localhost:8080',
        expect.objectContaining({
          refreshInterval: 5000,
        })
      )
    })

    it('should show refresh info in header', () => {
      mockUseInstances.mockReturnValue({
        instances: mockInstances,
        total: 3,
        loading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(
        <InstanceBrowser apiBaseUrl="http://localhost:8080" refreshInterval={5000} />
      )

      expect(screen.getByText(/Auto-refresh: 5s/)).toBeInTheDocument()
    })
  })

  describe('Custom styling', () => {
    it('should apply custom className', () => {
      mockUseInstances.mockReturnValue({
        instances: mockInstances,
        total: 3,
        loading: false,
        error: null,
        refresh: vi.fn(),
      })

      const { container } = render(
        <InstanceBrowser
          apiBaseUrl="http://localhost:8080"
          className="custom-class"
        />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('should apply custom styles', () => {
      mockUseInstances.mockReturnValue({
        instances: mockInstances,
        total: 3,
        loading: false,
        error: null,
        refresh: vi.fn(),
      })

      const { container } = render(
        <InstanceBrowser
          apiBaseUrl="http://localhost:8080"
          style={{ maxHeight: '400px' }}
        />
      )

      expect(container.firstChild).toHaveStyle({ maxHeight: '400px' })
    })
  })
})
