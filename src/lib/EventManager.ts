/**
 * EventManager - Singleton for managing workflow execution state via SSE.
 *
 * Maintains a single SSE connection to Dirigent API and provides a centralized
 * state store for all workflow instances. Components can subscribe to specific
 * instances and receive real-time updates as SSE events arrive.
 *
 * Usage:
 * ```typescript
 * import { eventManager } from './lib/EventManager'
 *
 * // Initialize once at app startup
 * eventManager.connect('http://localhost:8081')
 *
 * // Subscribe to instance updates
 * const unsubscribe = eventManager.subscribe('instance-id', (state) => {
 *   console.log('Instance updated:', state)
 * })
 *
 * // Later: unsubscribe
 * unsubscribe()
 * ```
 */

import type { InstanceState, StepState, BranchInfo } from '../types/execution'
import type {
  InstanceDetailsDto,
  SseInstanceStarted,
  SseStepStarted,
  SseStepCompleted,
  SseBranchTaken,
  SseInstanceCompleted,
  SseInstanceFailed,
} from '../types/api'

type StateUpdateCallback = (state: InstanceState) => void

/**
 * Singleton class managing SSE connection and instance state.
 */
class WorkflowEventManager {
  private static instance: WorkflowEventManager
  private eventSource: EventSource | null = null
  private instanceStates = new Map<string, InstanceState>()
  private listeners = new Map<string, Set<StateUpdateCallback>>()
  private apiBaseUrl: string = ''
  private isConnected: boolean = false

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get the singleton instance.
   */
  static getInstance(): WorkflowEventManager {
    if (!this.instance) {
      this.instance = new WorkflowEventManager()
    }
    return this.instance
  }

  /**
   * Initialize and connect to Dirigent SSE endpoint.
   * Should be called once at application startup.
   *
   * @param apiBaseUrl - Base URL of Dirigent API (e.g., "http://localhost:8081")
   */
  connect(apiBaseUrl: string): void {
    if (this.eventSource) {
      console.warn('[EventManager] Already connected. Call disconnect() first to reconnect.')
      return
    }

    this.apiBaseUrl = apiBaseUrl
    const sseUrl = `${apiBaseUrl}/api/v1/events`

    console.log('[EventManager] Connecting to SSE:', sseUrl)

    this.eventSource = new EventSource(sseUrl)

    this.eventSource.onopen = () => {
      console.log('[EventManager] SSE connection established')
      this.isConnected = true
    }

    this.eventSource.onerror = (error) => {
      console.error('[EventManager] SSE connection error:', error)
      this.isConnected = false
      // EventSource will auto-reconnect
    }

    // Instance lifecycle events
    this.eventSource.addEventListener('InstanceStarted', (e: MessageEvent) => {
      const data: SseInstanceStarted = JSON.parse(e.data)
      console.log('[EventManager] InstanceStarted:', data.instanceId)

      this.updateInstance(data.instanceId, {
        status: 'running',
        workflowName: data.workflowName,
        workflowVersion: data.workflowVersion,
        startedAt: data.timestamp,
        steps: new Map(),
        branches: [],
        currentStepId: undefined,
      })
    })

    this.eventSource.addEventListener('InstanceCompleted', (e: MessageEvent) => {
      const data: SseInstanceCompleted = JSON.parse(e.data)
      console.log('[EventManager] InstanceCompleted:', data.instanceId)

      this.updateInstance(data.instanceId, {
        status: 'completed',
        completedAt: data.timestamp,
        durationMs: data.durationMs,
        currentStepId: undefined,
      })
    })

    this.eventSource.addEventListener('InstanceFailed', (e: MessageEvent) => {
      const data: SseInstanceFailed = JSON.parse(e.data)
      console.log('[EventManager] InstanceFailed:', data.instanceId)

      this.updateInstance(data.instanceId, {
        status: 'failed',
        completedAt: data.timestamp,
        durationMs: data.durationMs,
        error: data.error,
        failedStep: data.failedStep || undefined,
        currentStepId: undefined,
      })
    })

    // Step execution events
    this.eventSource.addEventListener('StepStarted', (e: MessageEvent) => {
      const data: SseStepStarted = JSON.parse(e.data)
      console.log('[EventManager] StepStarted:', data.instanceId, data.stepId)

      this.updateInstanceStep(data.instanceId, data.stepId, {
        status: 'running',
        stepKind: data.stepKind,
        startedAt: data.timestamp,
      })

      // Mark as current step
      this.updateInstance(data.instanceId, {
        currentStepId: data.stepId,
      })
    })

    this.eventSource.addEventListener('StepCompleted', (e: MessageEvent) => {
      const data: SseStepCompleted = JSON.parse(e.data)
      console.log('[EventManager] StepCompleted:', data.instanceId, data.stepId,
                  data.success ? 'success' : 'failed')

      this.updateInstanceStep(data.instanceId, data.stepId, {
        status: data.success ? 'completed' : 'failed',
        completedAt: data.timestamp,
        durationMs: data.durationMs,
      })
    })

    // Branch navigation
    this.eventSource.addEventListener('BranchTaken', (e: MessageEvent) => {
      const data: SseBranchTaken = JSON.parse(e.data)
      console.log('[EventManager] BranchTaken:', data.instanceId,
                  `${data.fromStep} -> ${data.toStep}`)

      this.recordBranch(data.instanceId, {
        fromStep: data.fromStep,
        toStep: data.toStep,
        condition: data.condition,
        timestamp: data.timestamp,
      })
    })

    // Ignore heartbeat events
    this.eventSource.addEventListener('heartbeat', () => {
      // Keepalive - no action needed
    })
  }

  /**
   * Subscribe to state changes for a specific workflow instance.
   *
   * @param instanceId - UUID of the workflow instance
   * @param callback - Function called whenever instance state changes
   * @returns Unsubscribe function
   *
   * @example
   * ```typescript
   * const unsubscribe = eventManager.subscribe('abc-123', (state) => {
   *   console.log('Status:', state.status)
   * })
   *
   * // Later: stop receiving updates
   * unsubscribe()
   * ```
   */
  subscribe(
    instanceId: string,
    callback: StateUpdateCallback
  ): () => void {
    if (!this.listeners.has(instanceId)) {
      this.listeners.set(instanceId, new Set())
    }

    this.listeners.get(instanceId)!.add(callback)

    // Send current state immediately if available
    const currentState = this.instanceStates.get(instanceId)
    if (currentState) {
      try {
        callback(currentState)
      } catch (error) {
        console.error('[EventManager] Error in subscriber callback:', error)
      }
    }

    // Return unsubscribe function
    return () => {
      this.listeners.get(instanceId)?.delete(callback)

      // Clean up listener set if empty
      if (this.listeners.get(instanceId)?.size === 0) {
        this.listeners.delete(instanceId)
      }
    }
  }

  /**
   * Get current state for an instance.
   * Returns undefined if instance is not in memory.
   *
   * @param instanceId - UUID of the workflow instance
   * @returns Current instance state or undefined
   */
  getState(instanceId: string): InstanceState | undefined {
    return this.instanceStates.get(instanceId)
  }

  /**
   * Fetch complete instance state from Dirigent REST API.
   * Use when instance started before EventManager connected,
   * or to ensure you have complete historical data.
   *
   * @param instanceId - UUID of the workflow instance
   * @returns Promise resolving to instance state
   * @throws Error if fetch fails or instance not found
   *
   * @example
   * ```typescript
   * try {
   *   const state = await eventManager.fetchState('abc-123')
   *   console.log('Fetched state:', state)
   * } catch (error) {
   *   console.error('Failed to fetch:', error)
   * }
   * ```
   */
  async fetchState(instanceId: string): Promise<InstanceState> {
    if (!this.apiBaseUrl) {
      throw new Error('EventManager not connected. Call connect() first.')
    }

    const url = `${this.apiBaseUrl}/api/v1/instances/${instanceId}`
    console.log('[EventManager] Fetching instance state:', instanceId)

    const response = await fetch(url)

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Instance '${instanceId}' not found`)
      }
      throw new Error(`Failed to fetch instance: ${response.statusText}`)
    }

    const data: InstanceDetailsDto = await response.json()

    // Helper function to map API status to frontend status
    const mapInstanceStatus = (apiStatus: string): 'running' | 'completed' | 'failed' => {
      const normalized = apiStatus.toUpperCase()
      switch (normalized) {
        case 'RUNNING':
          return 'running'
        case 'COMPLETED':
          return 'completed'
        case 'FAILED':
          return 'failed'
        default:
          console.warn(`[EventManager] Unknown instance status: ${apiStatus}, defaulting to 'failed'`)
          return 'failed'
      }
    }

    const mapStepStatus = (apiStatus: string): StepState['status'] => {
      const normalized = apiStatus.toUpperCase()
      switch (normalized) {
        case 'PENDING':
          return 'pending'
        case 'RUNNING':
          return 'running'
        case 'SUCCEEDED':
          return 'completed'
        case 'FAILED':
          return 'failed'
        default:
          console.warn(`[EventManager] Unknown step status: ${apiStatus}, defaulting to 'pending'`)
          return 'pending'
      }
    }

    // Transform API response to InstanceState
    let state: InstanceState = {
      status: mapInstanceStatus(data.status),
      workflowName: data.workflowName,
      workflowVersion: data.workflowVersion,
      startedAt: data.startedAt,
      completedAt: data.completedAt || undefined,
      durationMs: data.durationMs ?? undefined,
      error: data.error || undefined,
      failedStep: data.failedStep || undefined,
      steps: new Map(
        data.steps.map(step => [step.stepId, {
          status: mapStepStatus(step.status),
          stepKind: step.stepKind,
          startedAt: step.startedAt,
          completedAt: step.completedAt || undefined,
          durationMs: step.durationMs ?? undefined,
          error: step.error || undefined,
          input: step.input || undefined,
          output: step.output || undefined,
        }])
      ),
      branches: [],
      currentStepId: data.status === 'RUNNING'
        ? data.steps.find(s => s.status === 'RUNNING')?.stepId
        : undefined,
    }

    // Merge with existing SSE-tracked state if available
    const existing = this.instanceStates.get(instanceId)

    if (existing) {
      console.log('[EventManager] Merging REST API state with existing SSE state for:', instanceId)

      // Merge steps: prefer newer data based on status and timestamps
      const mergedSteps = new Map(state.steps)

      existing.steps.forEach((existingStep, stepId) => {
        const fetchedStep = state.steps.get(stepId)

        if (!fetchedStep) {
          // SSE tracked a step not yet in REST API response
          console.log(`[EventManager] Keeping SSE-only step: ${stepId}`)
          mergedSteps.set(stepId, existingStep)
        } else {
          // Both have the step - merge intelligently
          let preferredStep = fetchedStep

          // If SSE shows completed but REST API shows running, prefer SSE (REST API lag)
          if (existingStep.status === 'completed' && fetchedStep.status === 'running') {
            console.log(`[EventManager] Preferring SSE completed status over REST API running for step: ${stepId}`)
            preferredStep = existingStep
          } else if (existingStep.status === 'failed' && fetchedStep.status === 'running') {
            console.log(`[EventManager] Preferring SSE failed status over REST API running for step: ${stepId}`)
            preferredStep = existingStep
          } else if (existingStep.completedAt && fetchedStep.completedAt) {
            // Both show completed - use whichever has later timestamp
            const existingTime = new Date(existingStep.completedAt).getTime()
            const fetchedTime = new Date(fetchedStep.completedAt).getTime()

            if (existingTime > fetchedTime) {
              console.log(`[EventManager] Preferring SSE step data (newer timestamp) for: ${stepId}`)
              preferredStep = existingStep
            }
          }

          mergedSteps.set(stepId, preferredStep)
        }
      })

      // Merge branches: combine both (SSE might have captured branches not yet in REST API)
      const mergedBranches = [...existing.branches]

      // Prefer currentStepId from SSE if REST API doesn't have one
      const mergedCurrentStepId = state.currentStepId || existing.currentStepId

      state = {
        ...state,
        steps: mergedSteps,
        branches: mergedBranches,
        currentStepId: mergedCurrentStepId,
      }
    }

    // Store merged state in memory
    this.instanceStates.set(instanceId, state)

    // Notify listeners
    this.notifyListeners(instanceId, state)

    console.log('[EventManager] Fetched and stored state for:', instanceId)

    return state
  }

  /**
   * Clean up old completed instances to prevent memory leaks.
   * Only removes instances without active listeners.
   *
   * @param maxAge - Maximum age in milliseconds (default: 1 hour)
   *
   * @example
   * ```typescript
   * // Remove instances completed more than 30 minutes ago
   * eventManager.cleanup(30 * 60 * 1000)
   * ```
   */
  cleanup(maxAge: number = 3600000): void {
    const now = Date.now()
    let cleanedCount = 0

    for (const [instanceId, state] of this.instanceStates.entries()) {
      if (state.completedAt) {
        const completedTime = new Date(state.completedAt).getTime()

        if (now - completedTime > maxAge) {
          // Only clean up if no active listeners
          if (!this.listeners.has(instanceId) ||
              this.listeners.get(instanceId)!.size === 0) {
            this.instanceStates.delete(instanceId)
            this.listeners.delete(instanceId)
            cleanedCount++
          }
        }
      }
    }

    if (cleanedCount > 0) {
      console.log(`[EventManager] Cleaned up ${cleanedCount} old instances`)
    }
  }

  /**
   * Check if EventManager is currently connected to SSE.
   */
  isEventSourceConnected(): boolean {
    return this.isConnected
  }

  /**
   * Disconnect from SSE endpoint.
   * Call on application unmount.
   */
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
      this.isConnected = false
      this.apiBaseUrl = ''
      console.log('[EventManager] Disconnected from SSE')
    }
  }

  // Private methods

  private updateInstance(instanceId: string, updates: Partial<InstanceState>): void {
    const current = this.instanceStates.get(instanceId)

    let updated: InstanceState
    if (!current) {
      // New instance - create with defaults
      updated = {
        status: 'running',
        steps: new Map(),
        branches: [],
        ...updates,
      } as InstanceState
    } else {
      // Update existing - create new object to trigger React re-renders
      updated = { ...current, ...updates }
    }

    this.instanceStates.set(instanceId, updated)
    this.notifyListeners(instanceId, updated)
  }

  private updateInstanceStep(
    instanceId: string,
    stepId: string,
    stepState: Partial<StepState>
  ): void {
    const instance = this.instanceStates.get(instanceId)

    if (!instance) {
      console.warn(`[EventManager] Instance ${instanceId} not found for step update`)
      return
    }

    const current = instance.steps.get(stepId) || {
      status: 'pending' as const,
      stepKind: '',
    }

    // Create new Map to avoid mutation
    const newSteps = new Map(instance.steps)
    newSteps.set(stepId, { ...current, ...stepState } as StepState)

    // Create new instance object with new Map
    const updated = { ...instance, steps: newSteps }
    this.instanceStates.set(instanceId, updated)

    this.notifyListeners(instanceId, updated)
  }

  private recordBranch(instanceId: string, branch: BranchInfo): void {
    const instance = this.instanceStates.get(instanceId)

    if (!instance) {
      console.warn(`[EventManager] Instance ${instanceId} not found for branch`)
      return
    }

    // Create new array and instance object to avoid mutation
    const updated = { ...instance, branches: [...instance.branches, branch] }
    this.instanceStates.set(instanceId, updated)

    this.notifyListeners(instanceId, updated)
  }

  private notifyListeners(instanceId: string, state: InstanceState): void {
    const callbacks = this.listeners.get(instanceId)

    if (!callbacks) return

    callbacks.forEach(callback => {
      try {
        callback(state)
      } catch (error) {
        console.error('[EventManager] Error in listener callback:', error)
      }
    })
  }
}

/**
 * Singleton instance of the EventManager.
 * Import and use this throughout your application.
 *
 * @example
 * ```typescript
 * import { eventManager } from './lib/EventManager'
 *
 * // In your App component
 * useEffect(() => {
 *   eventManager.connect('http://localhost:8081')
 *   return () => eventManager.disconnect()
 * }, [])
 * ```
 */
export const eventManager = WorkflowEventManager.getInstance()
