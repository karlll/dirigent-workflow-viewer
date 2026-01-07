/**
 * Tests for WorkflowBrowser component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WorkflowBrowser } from './WorkflowBrowser'
import * as hooks from '../lib/hooks'

// Mock the hooks
vi.mock('../lib/hooks', () => ({
  useWorkflows: vi.fn(),
}))

const mockUseWorkflows = vi.mocked(hooks.useWorkflows)

describe('WorkflowBrowser', () => {
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
      triggerTypes: ['task.updated', 'task.completed'],
      stepCount: 5,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading state', () => {
    it('should show loading indicator', () => {
      mockUseWorkflows.mockReturnValue({
        workflows: [],
        loading: true,
        error: null,
        refresh: vi.fn(),
      })

      render(<WorkflowBrowser apiBaseUrl="http://localhost:8080" />)

      expect(screen.getByText('Loading workflows...')).toBeInTheDocument()
    })
  })

  describe('Error state', () => {
    it('should show error message', () => {
      mockUseWorkflows.mockReturnValue({
        workflows: [],
        loading: false,
        error: 'Network error',
        refresh: vi.fn(),
      })

      render(<WorkflowBrowser apiBaseUrl="http://localhost:8080" />)

      expect(screen.getByText(/Network error/)).toBeInTheDocument()
    })
  })

  describe('Empty state', () => {
    it('should show empty message when no workflows', () => {
      mockUseWorkflows.mockReturnValue({
        workflows: [],
        loading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(<WorkflowBrowser apiBaseUrl="http://localhost:8080" />)

      expect(screen.getByText('No workflows found')).toBeInTheDocument()
    })
  })

  describe('List mode', () => {
    it('should render workflows in list mode', () => {
      mockUseWorkflows.mockReturnValue({
        workflows: mockWorkflows,
        loading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(<WorkflowBrowser apiBaseUrl="http://localhost:8080" mode="list" />)

      expect(screen.getByText('workflow1')).toBeInTheDocument()
      expect(screen.getByText('workflow2')).toBeInTheDocument()
      expect(screen.getByText('Version 1')).toBeInTheDocument()
      expect(screen.getByText('Version 2')).toBeInTheDocument()
    })

    it('should show metadata when enabled', () => {
      mockUseWorkflows.mockReturnValue({
        workflows: mockWorkflows,
        loading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(
        <WorkflowBrowser apiBaseUrl="http://localhost:8080" mode="list" showMetadata />
      )

      expect(screen.getByText('3 steps')).toBeInTheDocument()
      expect(screen.getByText('5 steps')).toBeInTheDocument()
      expect(screen.getByText('1 triggers')).toBeInTheDocument()
      expect(screen.getByText('2 triggers')).toBeInTheDocument()
    })

    it('should call onSelect when workflow is clicked', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()

      mockUseWorkflows.mockReturnValue({
        workflows: mockWorkflows,
        loading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(
        <WorkflowBrowser
          apiBaseUrl="http://localhost:8080"
          mode="list"
          onSelect={onSelect}
        />
      )

      await user.click(screen.getByText('workflow1'))

      expect(onSelect).toHaveBeenCalledWith('workflow1')
    })

    it('should highlight selected workflow', () => {
      mockUseWorkflows.mockReturnValue({
        workflows: mockWorkflows,
        loading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(
        <WorkflowBrowser
          apiBaseUrl="http://localhost:8080"
          mode="list"
          selectedWorkflow="workflow1"
        />
      )

      const button = screen.getByLabelText('Select workflow workflow1')
      expect(button).toHaveAttribute('aria-pressed', 'true')
    })
  })

  describe('Grid mode', () => {
    it('should render workflows in grid mode', () => {
      mockUseWorkflows.mockReturnValue({
        workflows: mockWorkflows,
        loading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(<WorkflowBrowser apiBaseUrl="http://localhost:8080" mode="grid" />)

      expect(screen.getByText('workflow1')).toBeInTheDocument()
      expect(screen.getByText('workflow2')).toBeInTheDocument()
    })

    it('should show metadata in grid cards', () => {
      mockUseWorkflows.mockReturnValue({
        workflows: mockWorkflows,
        loading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(
        <WorkflowBrowser apiBaseUrl="http://localhost:8080" mode="grid" showMetadata />
      )

      expect(screen.getByText('3 steps')).toBeInTheDocument()
      expect(screen.getByText('5 steps')).toBeInTheDocument()
      expect(screen.getByText(/Triggers: task\.created/)).toBeInTheDocument()
    })

    it('should call onSelect when card is clicked', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()

      mockUseWorkflows.mockReturnValue({
        workflows: mockWorkflows,
        loading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(
        <WorkflowBrowser
          apiBaseUrl="http://localhost:8080"
          mode="grid"
          onSelect={onSelect}
        />
      )

      await user.click(screen.getByText('workflow2'))

      expect(onSelect).toHaveBeenCalledWith('workflow2')
    })
  })

  describe('Dropdown mode', () => {
    it('should render workflows in dropdown', () => {
      mockUseWorkflows.mockReturnValue({
        workflows: mockWorkflows,
        loading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(<WorkflowBrowser apiBaseUrl="http://localhost:8080" mode="dropdown" />)

      const select = screen.getByLabelText('Select workflow')
      expect(select).toBeInTheDocument()
      expect(screen.getByText('Select a workflow...')).toBeInTheDocument()
      expect(screen.getByText('workflow1 (v1)')).toBeInTheDocument()
      expect(screen.getByText('workflow2 (v2)')).toBeInTheDocument()
    })

    it('should call onSelect when option is selected', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()

      mockUseWorkflows.mockReturnValue({
        workflows: mockWorkflows,
        loading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(
        <WorkflowBrowser
          apiBaseUrl="http://localhost:8080"
          mode="dropdown"
          onSelect={onSelect}
        />
      )

      const select = screen.getByLabelText('Select workflow')
      await user.selectOptions(select, 'workflow1')

      expect(onSelect).toHaveBeenCalledWith('workflow1')
    })

    it('should show selected workflow in dropdown', () => {
      mockUseWorkflows.mockReturnValue({
        workflows: mockWorkflows,
        loading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(
        <WorkflowBrowser
          apiBaseUrl="http://localhost:8080"
          mode="dropdown"
          selectedWorkflow="workflow2"
        />
      )

      const select = screen.getByLabelText('Select workflow') as HTMLSelectElement
      expect(select.value).toBe('workflow2')
    })
  })

  describe('Custom styling', () => {
    it('should apply custom className', () => {
      mockUseWorkflows.mockReturnValue({
        workflows: mockWorkflows,
        loading: false,
        error: null,
        refresh: vi.fn(),
      })

      const { container } = render(
        <WorkflowBrowser
          apiBaseUrl="http://localhost:8080"
          className="custom-class"
        />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('should apply custom styles', () => {
      mockUseWorkflows.mockReturnValue({
        workflows: mockWorkflows,
        loading: false,
        error: null,
        refresh: vi.fn(),
      })

      const { container } = render(
        <WorkflowBrowser
          apiBaseUrl="http://localhost:8080"
          style={{ maxHeight: '400px' }}
        />
      )

      expect(container.firstChild).toHaveStyle({ maxHeight: '400px' })
    })
  })
})
