import * as yaml from 'js-yaml'
import type { Workflow } from '../types/workflow'

/**
 * Custom error class for workflow parsing errors
 */
export class WorkflowParseError extends Error {
  cause?: unknown

  constructor(message: string, cause?: unknown) {
    super(message)
    this.name = 'WorkflowParseError'
    this.cause = cause
  }
}

/**
 * Parse a YAML string into a Workflow object
 * @param yamlString - YAML workflow definition
 * @returns Parsed and validated Workflow object
 * @throws {WorkflowParseError} If YAML is invalid or missing required fields
 */
export function parseWorkflow(yamlString: string): Workflow {
  if (!yamlString || yamlString.trim() === '') {
    throw new WorkflowParseError('YAML string is empty')
  }

  // Strip Jackson YAML type tags (!<tool>, !<llm>, etc.) from backend
  // These are used for polymorphic deserialization on the backend but we don't need them
  // on the frontend since we treat all steps uniformly
  const cleanedYaml = yamlString.replace(/!<[^>]+>/g, '')

  let parsed: unknown
  try {
    parsed = yaml.load(cleanedYaml)
  } catch (error) {
    throw new WorkflowParseError(
      'Failed to parse YAML',
      error
    )
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new WorkflowParseError('Invalid YAML: expected object at root level')
  }

  const workflow = parsed as Workflow

  // Validate required fields
  const missingFields: string[] = []

  if (!workflow.name) missingFields.push('name')
  if (workflow.version === undefined || workflow.version === null) missingFields.push('version')
  if (!workflow.start) missingFields.push('start')
  if (!workflow.steps) missingFields.push('steps')

  if (missingFields.length > 0) {
    throw new WorkflowParseError(
      `Missing required fields: ${missingFields.join(', ')}`
    )
  }

  // Validate that steps is an object
  if (typeof workflow.steps !== 'object' || Array.isArray(workflow.steps)) {
    throw new WorkflowParseError('steps must be an object (map of step IDs to step definitions)')
  }

  // Validate that start step exists
  if (!(workflow.start in workflow.steps)) {
    throw new WorkflowParseError(
      `Start step "${workflow.start}" not found in steps`
    )
  }

  return workflow
}
