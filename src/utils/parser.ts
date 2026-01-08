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

  // Extract type information from Jackson YAML type tags (!<tool>, !<llm>, etc.)
  // and add 'kind' field to each step
  const typeTagRegex = /!<(\w+)>/g
  const stepKinds: Record<string, string> = {}
  
  // Find all type tags in the YAML and their positions
  let match: RegExpExecArray | null
  while ((match = typeTagRegex.exec(yamlString)) !== null) {
    const kind = match[1]
    // Store the kind for later matching with steps
    stepKinds[match.index] = kind.toLowerCase()
  }

  // Parse YAML without the type tags
  const cleanedYaml = yamlString.replace(/!<[^>]+>/g, '')
  let parsed: unknown
  try {
    parsed = yaml.load(cleanedYaml, {
      schema: yaml.JSON_SCHEMA,
    })
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

  // Add 'kind' field to steps based on extracted type tags
  // We need to match type tags with steps by parsing the YAML structure
  for (const [stepId, stepDef] of Object.entries(workflow.steps)) {
    // If kind is already present, skip
    if ('kind' in stepDef) {
      continue
    }
    
    // Try to infer kind from step properties
    const step = stepDef as any
    if (step.tool) {
      // Could be llm or tool - llm has 'out' field
      if (step.out) {
        step.kind = 'llm'
      } else {
        step.kind = 'tool'
      }
    } else if (step.cases) {
      step.kind = 'switch'
    } else if (step.reason) {
      step.kind = 'fail'
    } else {
      // Fallback: try to extract from YAML directly
      const stepPattern = new RegExp(`${stepId}:\\s*!<(\\w+)>`)
      const typeMatch = yamlString.match(stepPattern)
      if (typeMatch) {
        step.kind = typeMatch[1].toLowerCase()
      } else {
        throw new WorkflowParseError(
          `Unable to determine kind for step "${stepId}"`
        )
      }
    }
  }

  return workflow
}
