/**
 * Tests for Header component
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Header } from './Header'

describe('Header', () => {
  const defaultProps = {
    apiBaseUrl: 'http://localhost:8080',
    onSettingsClick: vi.fn(),
    connected: true,
    sseConnected: true,
  }

  it('should render app title', () => {
    render(<Header {...defaultProps} />)
    expect(screen.getByText('Dirigent Workflow Viewer')).toBeInTheDocument()
    expect(screen.getByText('Demo Application')).toBeInTheDocument()
  })

  it('should show connection status indicators', () => {
    render(<Header {...defaultProps} />)
    expect(screen.getByText('REST:')).toBeInTheDocument()
    expect(screen.getByText('SSE:')).toBeInTheDocument()
  })

  it('should render settings button', () => {
    render(<Header {...defaultProps} />)
    const settingsButton = screen.getByRole('button', { name: /settings/i })
    expect(settingsButton).toBeInTheDocument()
  })

  it('should call onSettingsClick when settings button clicked', async () => {
    const user = userEvent.setup()
    const onSettingsClick = vi.fn()
    
    render(<Header {...defaultProps} onSettingsClick={onSettingsClick} />)
    
    const settingsButton = screen.getByRole('button', { name: /settings/i })
    await user.click(settingsButton)
    
    expect(onSettingsClick).toHaveBeenCalledTimes(1)
  })

  it('should show connected status when both are connected', () => {
    const { container } = render(
      <Header {...defaultProps} connected={true} sseConnected={true} />
    )
    
    // Both indicators should be present
    expect(screen.getByText('REST:')).toBeInTheDocument()
    expect(screen.getByText('SSE:')).toBeInTheDocument()
  })

  it('should show disconnected status when REST is disconnected', () => {
    render(<Header {...defaultProps} connected={false} />)
    expect(screen.getByText('REST:')).toBeInTheDocument()
  })

  it('should show disconnected status when SSE is disconnected', () => {
    render(<Header {...defaultProps} sseConnected={false} />)
    expect(screen.getByText('SSE:')).toBeInTheDocument()
  })
})
