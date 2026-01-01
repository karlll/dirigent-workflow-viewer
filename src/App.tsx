import { useState } from 'react'
import { Workflow } from './components/Workflow'
import type { LayoutDirection } from './utils/layout'

const SAMPLE_WORKFLOW = `name: triage_and_execute
version: 1
start: classify

steps:
  classify:
    kind: llm
    tool: classify_input
    out:
      intent: string
      confidence: number
    validate:
      - "confidence >= 0 && confidence <= 1"
    on_error:
      goto: fail_invalid
    goto: route

  route:
    kind: switch
    cases:
      - when: "confidence < 0.7"
        goto: ask_clarify
      - when: "intent == 'do_task'"
        goto: do_task
    default: fail_no_route

  ask_clarify:
    kind: tool
    tool: ask_user
    args:
      question: "I'm not confident I understood. What exactly should I do?"
    end: true

  do_task:
    kind: tool
    tool: run_task
    args:
      intent: "{{intent}}"
      payload: "{{input.text}}"
    end: true

  fail_invalid:
    kind: fail
    reason: "LLM output didn't validate"

  fail_no_route:
    kind: fail
    reason: "No route matched"
`

function App() {
  const [yaml, setYaml] = useState(SAMPLE_WORKFLOW)
  const [direction, setDirection] = useState<LayoutDirection>('LR')

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1>Dirigent Workflow Viewer - Demo</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
        Interactive demo of the workflow visualization component
      </p>

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <label style={{ fontWeight: 500 }}>
          Layout Direction:
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as LayoutDirection)}
            style={{
              marginLeft: '0.5rem',
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #d1d5db'
            }}
          >
            <option value="LR">Left to Right</option>
            <option value="TB">Top to Bottom</option>
          </select>
        </label>

        <button
          onClick={() => setYaml(SAMPLE_WORKFLOW)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            border: '1px solid #d1d5db',
            backgroundColor: '#f9fafb',
            cursor: 'pointer'
          }}
        >
          Reset to Sample
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>YAML Input</h2>
          <textarea
            value={yaml}
            onChange={(e) => setYaml(e.target.value)}
            style={{
              width: '100%',
              height: '600px',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              padding: '1rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              resize: 'vertical'
            }}
          />
        </div>

        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Visualization</h2>
          <Workflow yaml={yaml} direction={direction} />
        </div>
      </div>
    </div>
  )
}

export default App
