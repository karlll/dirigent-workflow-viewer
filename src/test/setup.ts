import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock EventSource for SSE tests
// Using any to avoid complex type issues with EventSource interface
global.EventSource = class MockEventSource {
  url: string
  onopen: ((this: EventSource, ev: Event) => unknown) | null = null
  onmessage: ((this: EventSource, ev: MessageEvent) => unknown) | null = null
  onerror: ((this: EventSource, ev: Event) => unknown) | null = null
  readyState: number = 0
  withCredentials: boolean = false
  CONNECTING = 0 as const
  OPEN = 1 as const
  CLOSED = 2 as const
  private listeners: Map<string, Set<any>> = new Map()

  constructor(url: string | URL, _eventSourceInitDict?: EventSourceInit) {
    this.url = url.toString()
    this.readyState = this.CONNECTING

    // Simulate connection opening asynchronously
    setTimeout(() => {
      if (this.readyState === this.CONNECTING) {
        this.readyState = this.OPEN
        if (this.onopen) {
          this.onopen.call(this as any, new Event('open'))
        }
      }
    }, 0)
  }

  addEventListener(type: string, listener: any, _options?: any): void {
    if (!listener) return
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    const fn = typeof listener === 'function' ? listener : listener.handleEvent.bind(listener)
    this.listeners.get(type)!.add(fn)
  }

  removeEventListener(type: string, listener: any, _options?: any): void {
    if (!listener) return
    const fn = typeof listener === 'function' ? listener : listener.handleEvent.bind(listener)
    this.listeners.get(type)?.delete(fn)
  }

  close() {
    this.readyState = this.CLOSED
  }

  dispatchEvent(event: Event): boolean {
    const listeners = this.listeners.get(event.type)
    if (listeners) {
      listeners.forEach(listener => listener.call(this, event))
    }
    return true
  }
} as any
