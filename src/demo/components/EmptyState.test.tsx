/**
 * Tests for EmptyState component
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('should render message', () => {
    render(<EmptyState message="No data available" />)
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('should render default icon when not provided', () => {
    const { container } = render(<EmptyState message="Test message" />)
    expect(container.textContent).toContain('📋')
  })

  it('should render custom icon when provided', () => {
    const { container } = render(
      <EmptyState message="Test message" icon="🎉" />
    )
    expect(container.textContent).toContain('🎉')
  })

  it('should render with proper styling', () => {
    const { container } = render(<EmptyState message="Test" />)
    const wrapper = container.firstChild as HTMLElement
    
    expect(wrapper).toHaveStyle({
      display: 'flex',
      flexDirection: 'column',
    })
  })
})
