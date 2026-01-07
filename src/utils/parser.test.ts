import { describe, it, expect } from 'vitest'
import { parseWorkflow, WorkflowParseError } from './parser'

describe('parseWorkflow', () => {
  it('should parse YAML with Jackson type tags (!<tool>, !<llm>, etc.)', () => {
    const yamlWithTags = `---
name: "on_task_created"
version: 1
description: "Test workflow"
start: "notify"
steps:
  notify: !<tool>
    description: null
    tool: "log_info"
    args:
      message: "Got task, content = {{event}}"
    goto: null
    end: true
triggers:
- type: "task.created"
  when: null
`

    const workflow = parseWorkflow(yamlWithTags)
    
    expect(workflow.name).toBe('on_task_created')
    expect(workflow.version).toBe(1)
    expect(workflow.start).toBe('notify')
    expect(workflow.steps).toHaveProperty('notify')
    expect(workflow.steps.notify).toMatchObject({
      tool: 'log_info',
      args: {
        message: 'Got task, content = {{event}}'
      }
    })
  })

  it('should parse YAML with multiple tag types', () => {
    const yamlWithMultipleTags = `---
name: "multi_step"
version: 1
start: "step1"
steps:
  step1: !<tool>
    tool: "some_tool"
    end: false
  step2: !<llm>
    model: "gpt-4"
    prompt: "test"
    end: false
  step3: !<switch>
    expression: "1 == 1"
    cases:
      - when: "true"
        goto: "step4"
    end: false
  step4: !<fail>
    message: "Failed"
    end: true
`

    const workflow = parseWorkflow(yamlWithMultipleTags)
    
    expect(workflow.name).toBe('multi_step')
    expect(workflow.steps).toHaveProperty('step1')
    expect(workflow.steps).toHaveProperty('step2')
    expect(workflow.steps).toHaveProperty('step3')
    expect(workflow.steps).toHaveProperty('step4')
  })

  it('should parse YAML without tags (plain YAML)', () => {
    const plainYaml = `---
name: "plain_workflow"
version: 1
start: "step1"
steps:
  step1:
    tool: "some_tool"
    end: true
`

    const workflow = parseWorkflow(plainYaml)
    
    expect(workflow.name).toBe('plain_workflow')
    expect(workflow.steps.step1).toMatchObject({
      tool: 'some_tool',
      end: true
    })
  })

  it('should throw error for empty YAML', () => {
    expect(() => parseWorkflow('')).toThrow(WorkflowParseError)
    expect(() => parseWorkflow('   ')).toThrow('YAML string is empty')
  })

  it('should throw error for invalid YAML', () => {
    expect(() => parseWorkflow('{ invalid yaml [')).toThrow(WorkflowParseError)
  })

  it('should throw error for missing required fields', () => {
    expect(() => parseWorkflow('name: "test"')).toThrow('Missing required fields')
  })

  it('should throw error when start step is not in steps', () => {
    const invalidYaml = `---
name: "test"
version: 1
start: "nonexistent"
steps:
  step1:
    tool: "test"
`
    
    expect(() => parseWorkflow(invalidYaml)).toThrow('Start step "nonexistent" not found')
  })
})
