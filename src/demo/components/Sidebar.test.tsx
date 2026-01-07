/**
 * Tests for Sidebar component
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Sidebar } from './Sidebar'

describe('Sidebar', () => {
  const defaultProps = {
    activeView: 'workflows' as const,
    onViewChange: vi.fn(),
    workflowCount: 5,
    runningInstances: 2,
    totalInstances: 10,
  }

  it('should render navigation items', () => {
    render(<Sidebar {...defaultProps} />)
    expect(screen.getByText('Workflows')).toBeInTheDocument()
    expect(screen.getByText('Instances')).toBeInTheDocument()
  })

  it('should display workflow count badge', () => {
    render(<Sidebar {...defaultProps} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('should display instances count badge', () => {
    render(<Sidebar {...defaultProps} />)
    expect(screen.getByText('2/10')).toBeInTheDocument()
  })

  it('should highlight active view', () => {
    render(<Sidebar {...defaultProps} activeView="workflows" />)
    
    const workflowsButton = screen.getByText('Workflows').closest('button')
    expect(workflowsButton).toHaveAttribute('aria-current', 'page')
  })

  it('should call onViewChange when clicking Workflows', async () => {
    const user = userEvent.setup()
    const onViewChange = vi.fn()
    
    render(<Sidebar {...defaultProps} onViewChange={onViewChange} />)
    
    const workflowsButton = screen.getByText('Workflows').closest('button')
    if (workflowsButton) {
      await user.click(workflowsButton)
    }
    
    expect(onViewChange).toHaveBeenCalledWith('workflows')
  })

  it('should call onViewChange when clicking Instances', async () => {
    const user = userEvent.setup()
    const onViewChange = vi.fn()
    
    render(<Sidebar {...defaultProps} onViewChange={onViewChange} />)
    
    const instancesButton = screen.getByText('Instances').closest('button')
    if (instancesButton) {
      await user.click(instancesButton)
    }
    
    expect(onViewChange).toHaveBeenCalledWith('instances')
  })

  it('should show instances as active when activeView is instances', () => {
    render(<Sidebar {...defaultProps} activeView="instances" />)
    
    const instancesButton = screen.getByText('Instances').closest('button')
    expect(instancesButton).toHaveAttribute('aria-current', 'page')
  })

  it('should display zero counts correctly', () => {
    render(
      <Sidebar
        {...defaultProps}
        workflowCount={0}
        runningInstances={0}
        totalInstances={0}
      />
    )
    
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('0/0')).toBeInTheDocument()
  })
})
