/**
 * React hooks for integrating with Dirigent API.
 * Provides convenient data fetching and state management for workflows and instances.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { createApiClient } from './ApiClient'
import { eventManager } from './EventManager'
import { parseWorkflow } from '../utils/parser'
import type { WorkflowMetadata, InstanceSummaryDto, InstanceFilter } from '../types/api'
import type { InstanceState } from '../types/execution'
import type { Workflow } from '../types/workflow'

/**
 * Fetch list of available workflows from the Dirigent API.
 *
 * @param apiBaseUrl - Base URL of the Dirigent API
 * @returns Object containing workflows, loading state, error, and refresh function
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { workflows, loading, error, refresh } = useWorkflows('http://localhost:8080')
 *  
 *   if (loading) return <div>Loading...</div>
 *   if (error) return <div>Error: {error}</div>
 *  
 *   return (
 *     <ul>
 *       {workflows.map(w => <li key={w.name}>{w.name}</li>)}
 *     </ul>
 *   )
 * }
 * ```
 */
export function useWorkflows(apiBaseUrl: string) {
  const [workflows, setWorkflows] = useState<WorkflowMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWorkflows = async () => {
    try {
      setLoading(true)
      setError(null)
      const client = createApiClient(apiBaseUrl)
      const result = await client.listWorkflows()
      setWorkflows(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workflows')
      setWorkflows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkflows()
  }, [apiBaseUrl])

  return { workflows, loading, error, refresh: fetchWorkflows }
}

/**
 * Options for useInstances hook.
 */
export interface UseInstancesOptions extends InstanceFilter {
  /** Auto-refresh interval in milliseconds (0 to disable) */
  refreshInterval?: number
}

/**
 * Fetch and filter workflow execution instances.
 * Supports auto-refresh for monitoring running instances.
 *
 * @param apiBaseUrl - Base URL of the Dirigent API
 * @param options - Filter and refresh options
 * @returns Object containing instances, total count, loading state, error, and refresh function
 *
 * @example
 * ```tsx
 * function InstanceList() {
 *   const { instances, total, loading } = useInstances('http://localhost:8080', {
 *     status: 'RUNNING',
 *     refreshInterval: 5000  // Refresh every 5 seconds
 *   })
 *  
 *   return <div>Found {total} running instances</div>
 * }
 * ```
 */
export function useInstances(apiBaseUrl: string, options?: UseInstancesOptions) {
  const [instances, setInstances] = useState<InstanceSummaryDto[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<number | null>(null)

  const fetchInstances = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const client = createApiClient(apiBaseUrl)
      const result = await client.listInstances(options)
      setInstances(result.instances)
      setTotal(result.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch instances')
      setInstances([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [apiBaseUrl, options?.status, options?.workflowName, options?.limit, options?.offset, options?.since, options?.until])

  // Initial fetch
  useEffect(() => {
    fetchInstances()
  }, [fetchInstances])

  // Auto-refresh
  useEffect(() => {
    if (options?.refreshInterval && options.refreshInterval > 0) {
      intervalRef.current = window.setInterval(() => {
        fetchInstances()
      }, options.refreshInterval)

      return () => {
        if (intervalRef.current !== null) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [options?.refreshInterval, fetchInstances])

  return { instances, total, loading, error, refresh: fetchInstances }
}

/**
 * Subscribe to real-time updates for a specific workflow instance.
 * Integrates with EventManager for SSE-based updates.
 *
 * @param instanceId - UUID of the workflow instance
 * @param apiBaseUrl - Base URL of the Dirigent API
 * @returns Object containing instance state, loading state, and error
 *
 * @example
 * ```tsx
 * function InstanceMonitor({ instanceId }: { instanceId: string }) {
 *   const { state, loading, error } = useInstanceState(instanceId, 'http://localhost:8080')
 *  
 *   if (loading) return <div>Loading...</div>
 *   if (error) return <div>Error: {error}</div>
 *   if (!state) return null
 *  
 *   return <div>Status: {state.status}</div>
 * }
 * ```
 */
export function useInstanceState(instanceId: string, apiBaseUrl: string) {
  const [state, setState] = useState<InstanceState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!instanceId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    // Check if EventManager is connected
    if (!eventManager.isEventSourceConnected()) {
      console.warn('[useInstanceState] EventManager not connected. Call eventManager.connect() first.')
    }

    // Try to get state from memory first
    const currentState = eventManager.getState(instanceId)

    if (currentState) {
      setState(currentState)
      setLoading(false)
    } else {
      // Fetch from API
      eventManager
        .fetchState(instanceId)
        .then((fetchedState) => {
          setState(fetchedState)
          setLoading(false)
          setError(null)
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Failed to fetch instance state')
          setLoading(false)
          setState(null)
        })
    }

    // Subscribe to real-time updates
    const unsubscribe = eventManager.subscribe(instanceId, (updatedState) => {
      setState(updatedState)
      setError(null)
    })

    return () => {
      unsubscribe()
    }
  }, [instanceId, apiBaseUrl])

  return { state, loading, error }
}

/**
 * Fetch workflow definition (YAML) and parse it.
 * Returns both raw YAML and parsed workflow object.
 *
 * @param workflowName - Name of the workflow to fetch
 * @param apiBaseUrl - Base URL of the Dirigent API
 * @returns Object containing YAML string, parsed workflow, loading state, and error
 *
 * @example
 * ```tsx
 * function WorkflowViewer({ name }: { name: string }) {
 *   const { yaml, workflow, loading, error } = useWorkflowDefinition(
 *     name,
 *     'http://localhost:8080'
 *   )
 *  
 *   if (loading) return <div>Loading...</div>
 *   if (error) return <div>Error: {error}</div>
 *   if (!workflow) return null
 *  
 *   return (
 *     <div>
 *       <pre>{yaml}</pre>
 *       <Workflow workflow={workflow} />
 *     </div>
 *   )
 * }
 * ```
 */
export function useWorkflowDefinition(workflowName: string, apiBaseUrl: string) {
  const [yaml, setYaml] = useState<string | null>(null)
  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!workflowName) {
      setYaml(null)
      setWorkflow(null)
      setLoading(false)
      return
    }

    const fetchWorkflow = async () => {
      try {
        setLoading(true)
        setError(null)
        const client = createApiClient(apiBaseUrl)
        const yamlContent = await client.getWorkflowYaml(workflowName)
        setYaml(yamlContent)

        // Parse YAML to workflow object
        try {
          const parsed = parseWorkflow(yamlContent)
          setWorkflow(parsed)
        } catch (parseErr) {
          throw new Error(
            `Failed to parse workflow YAML: ${parseErr instanceof Error ? parseErr.message : 'Unknown error'}`
          )
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : `Failed to fetch workflow '${workflowName}'`
        )
        setYaml(null)
        setWorkflow(null)
      } finally {
        setLoading(false)
      }
    }

    fetchWorkflow()
  }, [workflowName, apiBaseUrl])

  return { yaml, workflow, loading, error }
}
