import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock EventSource for SSE tests
global.EventSource = class MockEventSource {
  url: string
  onopen: ((this: EventSource, ev: Event) => unknown) | null = null
  onmessage: ((this: EventSource, ev: MessageEvent) => unknown) | null = null
  onerror: ((this: EventSource, ev: Event) => unknown) | null = null
  readyState: number = 0
  CONNECTING = 0
  OPEN = 1
  CLOSED = 2
  private listeners: Map<string, Set<EventListener>> = new Map()

  constructor(url: string) {
    this.url = url
    this.readyState = this.CONNECTING

    // Simulate connection opening asynchronously
    setTimeout(() => {
      if (this.readyState === this.CONNECTING) {
        this.readyState = this.OPEN
        if (this.onopen) {
          this.onopen.call(this, new Event('open'))
        }
      }
    }, 0)
  }

  addEventListener(type: string, listener: EventListener) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type)!.add(listener)
  }

  removeEventListener(type: string, listener: EventListener) {
    this.listeners.get(type)?.delete(listener)
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
} as unknown as typeof EventSource
