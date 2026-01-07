/**
 * Tests for DemoLayout component
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DemoLayout } from './DemoLayout'

describe('DemoLayout', () => {
  const defaultProps = {
    apiBaseUrl: 'http://localhost:8080',
    onApiBaseUrlChange: vi.fn(),
    activeView: 'workflows' as const,
    onViewChange: vi.fn(),
    children: <div>Test Content</div>,
    onSettingsClick: vi.fn(),
    connected: true,
    sseConnected: true,
    workflowCount: 5,
    runningInstances: 2,
    totalInstances: 10,
  }

  it('should render header', () => {
    render(<DemoLayout {...defaultProps} />)
    expect(screen.getByText('Dirigent Workflow Viewer')).toBeInTheDocument()
  })

  it('should render sidebar', () => {
    render(<DemoLayout {...defaultProps} />)
    expect(screen.getByText('Workflows')).toBeInTheDocument()
    expect(screen.getByText('Instances')).toBeInTheDocument()
  })

  it('should render children in main content area', () => {
    render(<DemoLayout {...defaultProps} />)
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('should pass props to Header', () => {
    render(<DemoLayout {...defaultProps} connected={false} />)
    // Header should be rendered (app title visible)
    expect(screen.getByText('Dirigent Workflow Viewer')).toBeInTheDocument()
  })

  it('should pass props to Sidebar', () => {
    render(<DemoLayout {...defaultProps} workflowCount={10} />)
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('should have proper layout structure', () => {
    const { container } = render(<DemoLayout {...defaultProps} />)
    
    // Should have main element
    const main = container.querySelector('main')
    expect(main).toBeInTheDocument()
    
    // Should have nav element (sidebar)
    const nav = container.querySelector('nav')
    expect(nav).toBeInTheDocument()
    
    // Should have header element
    const header = container.querySelector('header')
    expect(header).toBeInTheDocument()
  })

  it('should render with instances view active', () => {
    render(<DemoLayout {...defaultProps} activeView="instances" />)
    const instancesButton = screen.getByText('Instances').closest('button')
    expect(instancesButton).toHaveAttribute('aria-current', 'page')
  })

  it('should render with workflows view active', () => {
    render(<DemoLayout {...defaultProps} activeView="workflows" />)
    const workflowsButton = screen.getByText('Workflows').closest('button')
    expect(workflowsButton).toHaveAttribute('aria-current', 'page')
  })
})
