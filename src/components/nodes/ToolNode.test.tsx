import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ToolNode } from './ToolNode'
import type { NodeProps } from '@xyflow/react'
import type { ToolStepDef } from '../../types/workflow'
import type { ExecutionState } from '../../types/execution'

// Mock ReactFlow context
vi.mock('@xyflow/react', async () => {
  const actual = await vi.importActual<typeof import('@xyflow/react')>('@xyflow/react')
  return {
    ...actual,
    Handle: () => null,
  }
})

describe('ToolNode', () => {
  const mockStepDef: ToolStepDef = {
    kind: 'tool',
    tool: 'test-tool',
    args: {
      input: '{{data.value}}',
    },
    description: 'Test tool description',
  }

  const baseProps: NodeProps<any> = {
    id: 'tool-1',
    data: {
      label: 'Test Tool',
      stepDef: mockStepDef,
      direction: 'LR' as const,
    },
    type: 'tool',
    selected: false,
    selectable: true,
    deletable: true,
    draggable: true,
    isConnectable: true,
    zIndex: 0,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    width: 100,
    height: 100,
    sourcePosition: undefined,
    targetPosition: undefined,
    dragHandle: undefined,
    parentId: undefined,
  }

  it('should render tool node without execution state', () => {
    render(<ToolNode {...baseProps} />)

    expect(screen.getByText('Test Tool')).toBeInTheDocument()
    expect(screen.getByText('TOOL')).toBeInTheDocument()
    expect(screen.getByText('test-tool')).toBeInTheDocument()
  })

  it('should render description when provided', () => {
    render(<ToolNode {...baseProps} />)

    expect(screen.getByText('Test tool description')).toBeInTheDocument()
  })

  it('should render arguments when provided', () => {
    render(<ToolNode {...baseProps} />)

    expect(screen.getByText('input:')).toBeInTheDocument()
    expect(screen.getByText('{{data.value}}')).toBeInTheDocument()
  })

  it('should render with pending execution state', () => {
    const executionState: ExecutionState = {
      status: 'pending',
    }

    const propsWithExecution = {
      ...baseProps,
      data: {
        ...baseProps.data,
        execution: executionState,
      },
    }

    const { container } = render(<ToolNode {...propsWithExecution} />)

    const node = container.querySelector('.tool-node')
    expect(node).toBeInTheDocument()
    expect(node).toHaveClass('node-pending')
    // Pending status has no icon
    expect(container.querySelector('.execution-status')).toBeInTheDocument()
  })

  it('should render with running execution state', () => {
    const executionState: ExecutionState = {
      status: 'running',
      startedAt: '2026-01-06T10:00:00Z',
      isCurrentStep: true,
    }

    const propsWithExecution = {
      ...baseProps,
      data: {
        ...baseProps.data,
        execution: executionState,
      },
    }

    const { container } = render(<ToolNode {...propsWithExecution} />)

    const node = container.querySelector('.tool-node')
    expect(node).toBeInTheDocument()
    expect(node).toHaveClass('node-running')
    expect(node).toHaveClass('current-step')
    // Current step should NOT show spinner (animated border provides visual indicator)
    expect(container.querySelector('.animate-spin')).not.toBeInTheDocument()
  })

  it('should render with completed execution state', () => {
    const executionState: ExecutionState = {
      status: 'completed',
      startedAt: '2026-01-06T10:00:00Z',
      completedAt: '2026-01-06T10:00:01Z',
      durationMs: 1000,
      isOnExecutionPath: true,
    }

    const propsWithExecution = {
      ...baseProps,
      data: {
        ...baseProps.data,
        execution: executionState,
      },
    }

    render(<ToolNode {...propsWithExecution} />)

    const node = document.querySelector('.tool-node')
    expect(node).toBeInTheDocument()
    expect(node).toHaveClass('node-completed')
    expect(node).toHaveClass('on-execution-path')
    // Check for duration display
    expect(screen.getByText('1000ms')).toBeInTheDocument()
    // Should show checkmark icon
    expect(document.querySelector('.execution-status')).toBeInTheDocument()
  })

  it('should render with failed execution state and error', () => {
    const executionState: ExecutionState = {
      status: 'failed',
      startedAt: '2026-01-06T10:00:00Z',
      completedAt: '2026-01-06T10:00:01Z',
      durationMs: 1000,
      error: 'Tool execution failed',
      isOnExecutionPath: true,
    }

    const propsWithExecution = {
      ...baseProps,
      data: {
        ...baseProps.data,
        execution: executionState,
      },
    }

    render(<ToolNode {...propsWithExecution} />)

    const node = document.querySelector('.tool-node')
    expect(node).toBeInTheDocument()
    expect(node).toHaveClass('node-failed')
    expect(node).toHaveClass('on-execution-path')
    // Check for error message display
    expect(screen.getByText('Tool execution failed')).toBeInTheDocument()
    // Check for duration display
    expect(screen.getByText('1000ms')).toBeInTheDocument()
  })

  it('should handle no arguments gracefully', () => {
    const stepDefWithoutArgs: ToolStepDef = {
      kind: 'tool',
      tool: 'simple-tool',
    }

    const propsWithoutArgs = {
      ...baseProps,
      data: {
        ...baseProps.data,
        stepDef: stepDefWithoutArgs,
      },
    }

    render(<ToolNode {...propsWithoutArgs} />)

    expect(screen.getByText('simple-tool')).toBeInTheDocument()
    // Arguments section should not be rendered
    expect(screen.queryByText('Arguments:')).not.toBeInTheDocument()
  })
})
