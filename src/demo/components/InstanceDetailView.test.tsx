/**
 * Tests for InstanceDetailView component
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { InstanceDetailView } from './InstanceDetailView'

// Mock the InstanceMonitor component
vi.mock('../../lib/components/InstanceMonitor', () => ({
  InstanceMonitor: ({ instanceId, apiBaseUrl }: any) => (
    <div data-testid="instance-monitor">
      Instance: {instanceId} - API: {apiBaseUrl}
    </div>
  ),
}))

describe('InstanceDetailView', () => {
  it('should show empty state when no instance selected', () => {
    render(<InstanceDetailView instanceId={null} apiBaseUrl="http://localhost:8080" />)
    
    expect(screen.getByText('Select an instance to view details')).toBeInTheDocument()
  })

  it('should render InstanceMonitor when instance is selected', () => {
    render(
      <InstanceDetailView
        instanceId="test-instance-id"
        apiBaseUrl="http://localhost:8080"
      />
    )
    
    expect(screen.getByTestId('instance-monitor')).toBeInTheDocument()
    expect(screen.getByText(/Instance: test-instance-id/)).toBeInTheDocument()
  })

  it('should pass correct props to InstanceMonitor', () => {
    render(
      <InstanceDetailView
        instanceId="my-instance"
        apiBaseUrl="http://api.example.com"
      />
    )
    
    expect(screen.getByText(/API: http:\/\/api.example.com/)).toBeInTheDocument()
  })
})
