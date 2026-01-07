/**
 * Tests for SettingsPanel component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SettingsPanel, loadApiUrl } from './SettingsPanel'

describe('SettingsPanel', () => {
  const defaultProps = {
    apiBaseUrl: 'http://localhost:8080',
    onApiBaseUrlChange: vi.fn(),
    onClose: vi.fn(),
  }

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should render settings form', () => {
    render(<SettingsPanel {...defaultProps} />)
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByLabelText('API Base URL')).toBeInTheDocument()
  })

  it('should display current API URL in input', () => {
    render(<SettingsPanel {...defaultProps} />)
    const input = screen.getByLabelText('API Base URL') as HTMLInputElement
    expect(input.value).toBe('http://localhost:8080')
  })

  it('should allow changing the URL', async () => {
    const user = userEvent.setup()
    render(<SettingsPanel {...defaultProps} />)
    
    const input = screen.getByLabelText('API Base URL')
    await user.clear(input)
    await user.type(input, 'http://example.com:9000')
    
    expect((input as HTMLInputElement).value).toBe('http://example.com:9000')
  })

  it('should save URL to localStorage on save', async () => {
    const user = userEvent.setup()
    const onApiBaseUrlChange = vi.fn()
    
    render(
      <SettingsPanel
        {...defaultProps}
        onApiBaseUrlChange={onApiBaseUrlChange}
      />
    )
    
    const input = screen.getByLabelText('API Base URL')
    await user.clear(input)
    await user.type(input, 'http://test.com')
    
    const saveButton = screen.getByRole('button', { name: /save/i })
    await user.click(saveButton)
    
    expect(localStorage.getItem('dirigent-demo-api-url')).toBe(
      'http://test.com'
    )
    expect(onApiBaseUrlChange).toHaveBeenCalledWith('http://test.com')
  })

  it('should show saved state after saving', async () => {
    const user = userEvent.setup()
    render(<SettingsPanel {...defaultProps} />)
    
    const saveButton = screen.getByRole('button', { name: /save/i })
    await user.click(saveButton)
    
    expect(screen.getByText('✓ Saved')).toBeInTheDocument()
  })

  it('should reset URL to default on reset', async () => {
    const user = userEvent.setup()
    const onApiBaseUrlChange = vi.fn()
    
    // Set a custom URL first
    localStorage.setItem('dirigent-demo-api-url', 'http://custom.com')
    
    render(
      <SettingsPanel
        apiBaseUrl="http://custom.com"
        onApiBaseUrlChange={onApiBaseUrlChange}
        onClose={defaultProps.onClose}
      />
    )
    
    const resetButton = screen.getByRole('button', { name: /reset/i })
    await user.click(resetButton)
    
    const input = screen.getByLabelText('API Base URL') as HTMLInputElement
    expect(input.value).toBe('http://localhost:8080')
    expect(onApiBaseUrlChange).toHaveBeenCalledWith('http://localhost:8080')
    expect(localStorage.getItem('dirigent-demo-api-url')).toBeNull()
  })

  it('should call onClose when close button clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    
    render(<SettingsPanel {...defaultProps} onClose={onClose} />)
    
    const closeButton = screen.getByRole('button', { name: /close/i })
    await user.click(closeButton)
    
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when clicking backdrop', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    
    const { container } = render(
      <SettingsPanel {...defaultProps} onClose={onClose} />
    )
    
    const backdrop = container.firstChild as HTMLElement
    await user.click(backdrop)
    
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should not close when clicking panel content', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    
    render(<SettingsPanel {...defaultProps} onClose={onClose} />)
    
    const panel = screen.getByText('Settings').parentElement
    if (panel) {
      await user.click(panel)
    }
    
    expect(onClose).not.toHaveBeenCalled()
  })
})

describe('loadApiUrl', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should return default URL when nothing stored', () => {
    expect(loadApiUrl()).toBe('http://localhost:8080')
  })

  it('should return stored URL when available', () => {
    localStorage.setItem('dirigent-demo-api-url', 'http://custom.com')
    expect(loadApiUrl()).toBe('http://custom.com')
  })
})
