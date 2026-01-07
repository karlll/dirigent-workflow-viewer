/**
 * Tests for WorkflowDetailView component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WorkflowDetailView } from './WorkflowDetailView'
import * as hooks from '../../lib/hooks'

// Mock the hooks module
vi.mock('../../lib/hooks', () => ({
  useWorkflowDefinition: vi.fn(),
}))

// Mock the Workflow component
vi.mock('../../components/Workflow', () => ({
  Workflow: ({ workflow, direction }: any) => (
    <div data-testid="workflow-visualization">
      Workflow: {workflow.name} - Direction: {direction}
    </div>
  ),
}))

describe('WorkflowDetailView', () => {
  const mockWorkflow = {
    name: 'test_workflow',
    version: 1,
    start: 'step1',
    triggers: [{ type: 'trigger1' }, { type: 'trigger2' }],
    steps: {
      step1: {
        kind: 'tool' as const,
        tool: 'test_tool',
      },
    },
  }

  const mockYaml = 'name: test_workflow\nversion: 1\nsteps:\n  step1:\n    kind: tool'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show loading state', () => {
    vi.mocked(hooks.useWorkflowDefinition).mockReturnValue({
      yaml: null,
      workflow: null,
      loading: true,
      error: null,
    })

    render(
      <WorkflowDetailView
        workflowName="test_workflow"
        apiBaseUrl="http://localhost:8080"
      />
    )

    expect(screen.getByText('Loading workflow...')).toBeInTheDocument()
  })

  it('should show error state', () => {
    vi.mocked(hooks.useWorkflowDefinition).mockReturnValue({
      yaml: null,
      workflow: null,
      loading: false,
      error: 'Failed to load workflow',
    })

    render(
      <WorkflowDetailView
        workflowName="test_workflow"
        apiBaseUrl="http://localhost:8080"
      />
    )

    expect(screen.getByText('Error loading workflow')).toBeInTheDocument()
    expect(screen.getByText('Failed to load workflow')).toBeInTheDocument()
  })

  it('should render workflow when loaded', () => {
    vi.mocked(hooks.useWorkflowDefinition).mockReturnValue({
      yaml: mockYaml,
      workflow: mockWorkflow,
      loading: false,
      error: null,
    })

    render(
      <WorkflowDetailView
        workflowName="test_workflow"
        apiBaseUrl="http://localhost:8080"
      />
    )

    expect(screen.getByText('test_workflow')).toBeInTheDocument()
    expect(screen.getByText(/Version: 1/)).toBeInTheDocument()
    expect(
      screen.getByText(/Triggers: trigger1, trigger2/)
    ).toBeInTheDocument()
  })

  it('should display YAML content', () => {
    vi.mocked(hooks.useWorkflowDefinition).mockReturnValue({
      yaml: mockYaml,
      workflow: mockWorkflow,
      loading: false,
      error: null,
    })

    render(
      <WorkflowDetailView
        workflowName="test_workflow"
        apiBaseUrl="http://localhost:8080"
      />
    )

    expect(
      screen.getByText(/name: test_workflow/)
    ).toBeInTheDocument()
  })

  it('should render workflow visualization', () => {
    vi.mocked(hooks.useWorkflowDefinition).mockReturnValue({
      yaml: mockYaml,
      workflow: mockWorkflow,
      loading: false,
      error: null,
    })

    render(
      <WorkflowDetailView
        workflowName="test_workflow"
        apiBaseUrl="http://localhost:8080"
      />
    )

    expect(screen.getByTestId('workflow-visualization')).toBeInTheDocument()
  })

  it('should toggle layout direction', async () => {
    const user = userEvent.setup()
    vi.mocked(hooks.useWorkflowDefinition).mockReturnValue({
      yaml: mockYaml,
      workflow: mockWorkflow,
      loading: false,
      error: null,
    })

    render(
      <WorkflowDetailView
        workflowName="test_workflow"
        apiBaseUrl="http://localhost:8080"
      />
    )

    // Initial direction should be LR
    expect(screen.getByText(/Direction: LR/)).toBeInTheDocument()

    // Click vertical button
    const verticalButton = screen.getByRole('button', { name: /vertical/i })
    await user.click(verticalButton)

    // Should change to TB
    await waitFor(() => {
      expect(screen.getByText(/Direction: TB/)).toBeInTheDocument()
    })

    // Click horizontal button
    const horizontalButton = screen.getByRole('button', {
      name: /horizontal/i,
    })
    await user.click(horizontalButton)

    // Should change back to LR
    await waitFor(() => {
      expect(screen.getByText(/Direction: LR/)).toBeInTheDocument()
    })
  })

  it('should show not found message when workflow is null', () => {
    vi.mocked(hooks.useWorkflowDefinition).mockReturnValue({
      yaml: null,
      workflow: null,
      loading: false,
      error: null,
    })

    render(
      <WorkflowDetailView
        workflowName="test_workflow"
        apiBaseUrl="http://localhost:8080"
      />
    )

    expect(screen.getByText('Workflow not found')).toBeInTheDocument()
  })
})
