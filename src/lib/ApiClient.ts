/**
 * HTTP client for Dirigent API.
 * Provides type-safe methods for interacting with the REST API.
 */

import type {
  WorkflowMetadata,
  WorkflowListResponse,
  InstanceListResponse,
  InstanceDetailsDto,
  InstanceFilter,
} from '../types/api'

/**
 * Error thrown when an API request fails.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public responseBody?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * HTTP client for Dirigent workflow engine API.
 *
 * Provides methods for fetching workflows, instances, and execution details.
 * All methods are async and throw ApiError on failure.
 *
 * @example
 * ```typescript
 * const client = createApiClient('http://localhost:8080')
 * const workflows = await client.listWorkflows()
 * const yaml = await client.getWorkflowYaml('sample_workflow')
 * ```
 */
export class ApiClient {
  private readonly timeoutMs: number

  /**
   * Create a new API client.
   *
   * @param baseUrl - Base URL of the Dirigent API (e.g., "http://localhost:8080")
   * @param timeoutMs - Request timeout in milliseconds (default: 30000)
   */
  constructor(
    private readonly baseUrl: string,
    timeoutMs = 30000
  ) {
    this.timeoutMs = timeoutMs
  }

  /**
   * List all loaded workflow definitions.
   *
   * @returns Array of workflow metadata
   * @throws {ApiError} If request fails or times out
   *
   * @example
   * ```typescript
   * const workflows = await client.listWorkflows()
   * console.log('Found', workflows.length, 'workflows')
   * ```
   */
  async listWorkflows(): Promise<WorkflowMetadata[]> {
    const url = `${this.baseUrl}/api/v1/workflows`
    const response = await this.fetchWithTimeout(url)

    if (!response.ok) {
      throw await this.createError('Failed to fetch workflows', response)
    }

    const data: WorkflowListResponse = await response.json()
    return data.workflows
  }

  /**
   * Get workflow definition in YAML format.
   *
   * @param name - Workflow name
   * @returns YAML string
   * @throws {ApiError} If workflow not found or request fails
   *
   * @example
   * ```typescript
   * const yaml = await client.getWorkflowYaml('sample_workflow')
   * console.log(yaml)
   * ```
   */
  async getWorkflowYaml(name: string): Promise<string> {
    const url = `${this.baseUrl}/api/v1/workflows/${encodeURIComponent(name)}`
    const response = await this.fetchWithTimeout(url)

    if (!response.ok) {
      throw await this.createError(
        `Failed to fetch workflow '${name}'`,
        response
      )
    }

    return await response.text()
  }

  /**
   * List workflow execution instances with optional filtering.
   *
   * @param filter - Optional filter criteria
   * @returns Paginated list of instances
   * @throws {ApiError} If request fails
   *
   * @example
   * ```typescript
   * const result = await client.listInstances({
   *   status: 'RUNNING',
   *   workflowName: 'sample_workflow',
   *   limit: 10
   * })
   * console.log('Total:', result.total)
   * console.log('Instances:', result.instances)
   * ```
   */
  async listInstances(filter?: InstanceFilter): Promise<InstanceListResponse> {
    const params = new URLSearchParams()

    if (filter?.status) {
      params.set('status', filter.status)
    }
    if (filter?.workflowName) {
      params.set('workflowName', filter.workflowName)
    }
    if (filter?.limit !== undefined) {
      params.set('limit', filter.limit.toString())
    }
    if (filter?.offset !== undefined) {
      params.set('offset', filter.offset.toString())
    }
    if (filter?.since) {
      params.set('since', filter.since)
    }
    if (filter?.until) {
      params.set('until', filter.until)
    }

    const queryString = params.toString()
    const url = `${this.baseUrl}/api/v1/instances${queryString ? `?${queryString}` : ''}`
    const response = await this.fetchWithTimeout(url)

    if (!response.ok) {
      throw await this.createError('Failed to fetch instances', response)
    }

    return await response.json()
  }

  /**
   * Get detailed information about a specific instance.
   *
   * @param instanceId - Instance UUID
   * @returns Instance details including steps and final state
   * @throws {ApiError} If instance not found or request fails
   *
   * @example
   * ```typescript
   * const instance = await client.getInstance('abc-123-def')
   * console.log('Status:', instance.status)
   * console.log('Steps:', instance.steps.length)
   * ```
   */
  async getInstance(instanceId: string): Promise<InstanceDetailsDto> {
    const url = `${this.baseUrl}/api/v1/instances/${encodeURIComponent(instanceId)}`
    const response = await this.fetchWithTimeout(url)

    if (!response.ok) {
      throw await this.createError(
        `Failed to fetch instance '${instanceId}'`,
        response
      )
    }

    return await response.json()
  }

  /**
   * Fetch with timeout support.
   * Uses AbortController to implement timeout.
   */
  private async fetchWithTimeout(url: string): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs)

    try {
      const response = await fetch(url, {
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError(
          `Request timeout after ${this.timeoutMs}ms`,
          undefined,
          undefined
        )
      }
      
      throw new ApiError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        undefined
      )
    }
  }

  /**
   * Create an ApiError from a Response object.
   */
  private async createError(message: string, response: Response): Promise<ApiError> {
    let body: string | undefined

    try {
      body = await response.text()
    } catch {
      // Ignore if we can't read the body
    }

    return new ApiError(
      `${message}: ${response.statusText}`,
      response.status,
      body
    )
  }
}

/**
 * Create a new API client instance.
 *
 * @param baseUrl - Base URL of the Dirigent API (e.g., "http://localhost:8080")
 * @param timeoutMs - Request timeout in milliseconds (default: 30000)
 * @returns API client instance
 *
 * @example
 * ```typescript
 * const client = createApiClient('http://localhost:8080')
 * const workflows = await client.listWorkflows()
 * ```
 */
export function createApiClient(baseUrl: string, timeoutMs?: number): ApiClient {
  return new ApiClient(baseUrl, timeoutMs)
}
