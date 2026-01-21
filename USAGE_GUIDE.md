# Workflow Viewer Library - Usage Guide

Complete guide for integrating `@dirigent/workflow-viewer` into external applications.

---

## Installation

```bash
npm install @dirigent/workflow-viewer
```

**Peer Dependencies** (must be installed in your app):
```bash
npm install react@>=18.0.0 react-dom@>=18.0.0
```

**Runtime Dependencies** (bundled with library):
- `@xyflow/react@12.10.0` - Graph visualization
- `dagre@0.8.5` - Graph layout algorithm
- `js-yaml@4.1.1` - YAML parsing
- `lucide-react@^0.468.0` - Icons

---

## Quick Start

### 1. Basic Static Workflow Visualization

Display a workflow from YAML without execution state:

```tsx
import { Workflow } from '@dirigent/workflow-viewer'

function MyWorkflowView() {
  const yamlContent = `
    name: sample_workflow
    version: 1
    start: step_one
    steps:
      step_one:
        kind: tool
        tool: process_data
        goto: step_two
      step_two:
        kind: llm
        tool: classify
        end: true
  `

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <Workflow
        yaml={yamlContent}
        direction="LR"
        showHeader={true}
      />
    </div>
  )
}
```

---

### 2. Real-Time Execution Monitoring

Monitor a running workflow instance with live SSE updates:

```tsx
import { ExecutableWorkflow } from '@dirigent/workflow-viewer'

function WorkflowMonitor({ instanceId }: { instanceId: string }) {
  return (
    <div style={{ width: '100%', height: '600px' }}>
      <ExecutableWorkflow
        instanceId={instanceId}
        apiBaseUrl="http://localhost:8080"
        direction="LR"
      />
    </div>
  )
}
```

**Features:**
- Automatically fetches historical execution state from REST API
- Subscribes to SSE for real-time updates
- Highlights current executing step with animated border
- Shows execution path, timing, errors
- Dims pending/unexecuted steps

---

### 3. Browse Available Workflows

List and select from available workflows:

```tsx
import { WorkflowBrowser } from '@dirigent/workflow-viewer'
import { useState } from 'react'

function WorkflowSelector() {
  const [selected, setSelected] = useState<string>()

  return (
    <div>
      <WorkflowBrowser
        apiBaseUrl="http://localhost:8080"
        mode="list"                    // 'list' | 'grid' | 'dropdown'
        showMetadata={true}            // Show trigger types, step count
        selectedWorkflow={selected}
        onSelect={setSelected}
      />

      {selected && <p>Selected: {selected}</p>}
    </div>
  )
}
```

---

### 4. Browse Workflow Instances

List and filter workflow execution instances:

```tsx
import { InstanceBrowser } from '@dirigent/workflow-viewer'
import { useState } from 'react'

function InstanceList() {
  const [selected, setSelected] = useState<string>()

  return (
    <InstanceBrowser
      apiBaseUrl="http://localhost:8080"
      status="RUNNING"               // Filter: 'RUNNING' | 'COMPLETED' | 'FAILED'
      workflowName="my-workflow"     // Optional: filter by workflow
      refreshInterval={3000}         // Auto-refresh every 3 seconds
      limit={50}                     // Max instances to show
      showMetadata={true}
      selectedInstance={selected}
      onSelect={setSelected}
    />
  )
}
```

---

### 5. Complete Instance Monitor

High-level component combining instance details + visualization:

```tsx
import { InstanceMonitor } from '@dirigent/workflow-viewer'

function InstanceDetailView({ instanceId }: { instanceId: string }) {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <InstanceMonitor
        instanceId={instanceId}
        apiBaseUrl="http://localhost:8080"
        direction="LR"
      />
    </div>
  )
}
```

**Shows:**
- Instance metadata (ID, status, duration, timestamps)
- Error information (if failed)
- Real-time workflow visualization
- All ExecutableWorkflow features

---

## Exported Components

### Core Visualization

#### `<Workflow>`
Static workflow visualization without execution state.

**Props:**
```typescript
interface WorkflowProps {
  yaml?: string                    // YAML workflow definition
  workflow?: WorkflowType          // Pre-parsed workflow object
  direction?: 'LR' | 'TB'          // Layout direction (default: 'LR')
  showHeader?: boolean             // Show name/description (default: true)
  colorMode?: 'light' | 'dark' | 'system'  // Color scheme (default: 'system')
  nodes?: Node[]                   // Pre-computed nodes (advanced)
  edges?: Edge[]                   // Pre-computed edges (advanced)
}
```

**Usage:**
```tsx
<Workflow yaml={yamlString} direction="TB" />
// OR
<Workflow workflow={parsedWorkflow} direction="LR" />
```

---

#### `<ExecutableWorkflow>`
Real-time execution visualization with SSE updates.

**Props:**
```typescript
interface ExecutableWorkflowProps {
  instanceId: string               // UUID of workflow instance
  apiBaseUrl: string               // Dirigent API base URL
  yaml?: string                    // Workflow YAML
  workflow?: WorkflowType          // Pre-parsed workflow
  direction?: 'LR' | 'TB'          // Layout direction
  showLoading?: boolean            // Show loading spinner (default: true)
  // ... inherits all WorkflowProps
}
```

**Usage:**
```tsx
<ExecutableWorkflow
  instanceId="abc-123"
  apiBaseUrl="http://localhost:8080"
  workflow={workflowDef}
/>
```

---

### Library Components

#### `<WorkflowBrowser>`
Browse and select workflows.

**Props:**
```typescript
interface WorkflowBrowserProps {
  apiBaseUrl: string
  selectedWorkflow?: string
  onSelect?: (workflowName: string) => void
  mode?: 'list' | 'grid' | 'dropdown'     // Display mode
  showMetadata?: boolean                  // Show triggers, step count
  className?: string
  style?: React.CSSProperties
}
```

---

#### `<InstanceBrowser>`
Browse and filter instances.

**Props:**
```typescript
interface InstanceBrowserProps {
  apiBaseUrl: string
  workflowName?: string                   // Filter by workflow
  status?: 'RUNNING' | 'COMPLETED' | 'FAILED'
  selectedInstance?: string
  onSelect?: (instanceId: string) => void
  refreshInterval?: number                // Auto-refresh (ms)
  showMetadata?: boolean
  limit?: number                          // Max instances (default: 50)
  className?: string
  style?: React.CSSProperties
}
```

---

#### `<InstanceMonitor>`
Complete instance details + visualization.

**Props:**
```typescript
interface InstanceMonitorProps {
  instanceId: string
  apiBaseUrl: string
  direction?: 'LR' | 'TB'
}
```

---

## React Hooks

For building custom integrations.

### `useWorkflows(apiBaseUrl)`

Fetch list of available workflows.

```tsx
import { useWorkflows } from '@dirigent/workflow-viewer'

function MyComponent() {
  const { workflows, loading, error, refresh } = useWorkflows('http://localhost:8080')

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <ul>
      {workflows.map(w => (
        <li key={w.name}>
          {w.name} v{w.version} ({w.stepCount} steps)
        </li>
      ))}
    </ul>
  )
}
```

**Returns:**
```typescript
{
  workflows: WorkflowMetadata[]
  loading: boolean
  error: string | null
  refresh: () => void
}
```

---

### `useWorkflowDefinition(workflowName, apiBaseUrl)`

Fetch specific workflow YAML and parse it.

```tsx
import { useWorkflowDefinition } from '@dirigent/workflow-viewer'

function WorkflowDetail({ name }: { name: string }) {
  const { workflow, yaml, loading, error } = useWorkflowDefinition(
    name,
    'http://localhost:8080'
  )

  if (!workflow) return null

  return (
    <div>
      <h2>{workflow.name}</h2>
      <pre>{yaml}</pre>
    </div>
  )
}
```

**Returns:**
```typescript
{
  workflow: Workflow | null       // Parsed workflow object
  yaml: string | null             // Raw YAML string
  loading: boolean
  error: string | null
  refresh: () => void
}
```

---

### `useInstances(apiBaseUrl, options)`

Fetch and filter instances with optional auto-refresh.

```tsx
import { useInstances } from '@dirigent/workflow-viewer'

function RunningInstances() {
  const { instances, total, loading, error, refresh } = useInstances(
    'http://localhost:8080',
    {
      status: 'RUNNING',
      workflowName: 'my-workflow',    // Optional filter
      limit: 20,
      refreshInterval: 5000           // Auto-refresh every 5s
    }
  )

  return (
    <div>
      <h3>{total} running instances</h3>
      {instances.map(i => (
        <div key={i.id}>{i.id} - {i.status}</div>
      ))}
    </div>
  )
}
```

**Options:**
```typescript
interface UseInstancesOptions {
  status?: 'RUNNING' | 'COMPLETED' | 'FAILED'
  workflowName?: string
  limit?: number
  offset?: number
  since?: string                    // ISO timestamp
  until?: string                    // ISO timestamp
  refreshInterval?: number          // Auto-refresh interval (ms)
}
```

**Returns:**
```typescript
{
  instances: InstanceSummaryDto[]
  total: number
  loading: boolean
  error: string | null
  refresh: () => void
}
```

---

### `useInstanceState(instanceId, apiBaseUrl)`

Subscribe to real-time instance updates via SSE.

```tsx
import { useInstanceState } from '@dirigent/workflow-viewer'

function InstanceStatus({ instanceId }: { instanceId: string }) {
  const { state, loading, error } = useInstanceState(
    instanceId,
    'http://localhost:8080'
  )

  if (!state) return null

  return (
    <div>
      Status: {state.status}
      Steps: {state.steps.size}
      Current: {state.currentStepId}
    </div>
  )
}
```

**Returns:**
```typescript
{
  state: InstanceState | null
  loading: boolean
  error: string | null
}
```

---

### `useInstanceDetails(instanceId, apiBaseUrl)`

Fetch detailed instance information from REST API.

```tsx
import { useInstanceDetails } from '@dirigent/workflow-viewer'

function InstanceInfo({ instanceId }: { instanceId: string }) {
  const { instance, loading, error, refresh } = useInstanceDetails(
    instanceId,
    'http://localhost:8080'
  )

  if (!instance) return null

  return (
    <div>
      <h3>{instance.workflowName}</h3>
      <p>Status: {instance.status}</p>
      <p>Started: {new Date(instance.startedAt).toLocaleString()}</p>
      {instance.error && <p>Error: {instance.error}</p>}
    </div>
  )
}
```

**Returns:**
```typescript
{
  instance: InstanceDetailsDto | null
  loading: boolean
  error: string | null
  refresh: () => void
}
```

---

## Low-Level Utilities

For advanced use cases.

### `ApiClient`

HTTP client for Dirigent API.

```tsx
import { ApiClient } from '@dirigent/workflow-viewer'

const client = new ApiClient('http://localhost:8080')

// List workflows
const workflows = await client.listWorkflows()

// Get workflow YAML
const yaml = await client.getWorkflowYaml('my-workflow')

// List instances
const instances = await client.listInstances({
  status: 'RUNNING',
  limit: 10
})

// Get instance details
const instance = await client.getInstance('instance-id')
```

---

### `eventManager`

Singleton for managing SSE connections.

```tsx
import { eventManager } from '@dirigent/workflow-viewer'

// Connect to SSE endpoint
eventManager.connect('http://localhost:8080')

// Subscribe to instance updates
const unsubscribe = eventManager.subscribe('instance-id', (state) => {
  console.log('Instance updated:', state)
})

// Fetch instance state (REST API)
const state = await eventManager.fetchState('instance-id')

// Get current state from memory
const cached = eventManager.getState('instance-id')

// Cleanup
unsubscribe()
eventManager.disconnect()
```

**Note:** Most components handle EventManager automatically. Only use directly for custom integrations.

---

## TypeScript Types

All types are exported for type-safe integration.

### Workflow Types

```typescript
import type {
  WorkflowType,
  StepDef,
  LlmStepDef,
  ToolStepDef,
  SwitchStepDef,
  FailStepDef,
  CaseDef,
  Trigger,
  Goto
} from '@dirigent/workflow-viewer'
```

### Execution Types

```typescript
import type {
  InstanceState,
  StepState,
  ExecutionState
} from '@dirigent/workflow-viewer'
```

### API Types

```typescript
import type {
  WorkflowMetadata,
  WorkflowListResponse,
  InstanceSummaryDto,
  InstanceListResponse,
  InstanceDetailsDto,
  StepExecutionDto
} from '@dirigent/workflow-viewer'
```

---

## Complete Example: Custom Workflow Dashboard

```tsx
import { useState } from 'react'
import {
  WorkflowBrowser,
  InstanceBrowser,
  InstanceMonitor,
  type WorkflowMetadata
} from '@dirigent/workflow-viewer'

function WorkflowDashboard() {
  const apiBaseUrl = 'http://localhost:8080'
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>()
  const [selectedInstance, setSelectedInstance] = useState<string>()

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 300px 1fr', height: '100vh' }}>
      {/* Workflow selector */}
      <div style={{ borderRight: '1px solid #e5e7eb', overflow: 'auto' }}>
        <h2 style={{ padding: '1rem' }}>Workflows</h2>
        <WorkflowBrowser
          apiBaseUrl={apiBaseUrl}
          mode="list"
          showMetadata
          selectedWorkflow={selectedWorkflow}
          onSelect={setSelectedWorkflow}
        />
      </div>

      {/* Instance browser */}
      <div style={{ borderRight: '1px solid #e5e7eb', overflow: 'auto' }}>
        <h2 style={{ padding: '1rem' }}>Instances</h2>
        <InstanceBrowser
          apiBaseUrl={apiBaseUrl}
          workflowName={selectedWorkflow}
          refreshInterval={3000}
          selectedInstance={selectedInstance}
          onSelect={setSelectedInstance}
          showMetadata
        />
      </div>

      {/* Instance monitor */}
      <div style={{ overflow: 'auto' }}>
        {selectedInstance ? (
          <InstanceMonitor
            instanceId={selectedInstance}
            apiBaseUrl={apiBaseUrl}
            direction="LR"
          />
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
            Select an instance to monitor
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkflowDashboard
```

---

## API Requirements

The library expects the Dirigent API to expose these endpoints:

- `GET /api/v1/workflows` - List workflows
- `GET /api/v1/workflows/{name}` - Get workflow YAML
- `GET /api/v1/instances` - List instances (with filters)
- `GET /api/v1/instances/{id}` - Get instance details
- `GET /api/v1/events` - SSE endpoint for real-time updates

See `api/openapi.yaml` in the repository for complete API specification.

---

## Styling

The library includes default styles. Import the CSS in your app:

```tsx
import '@dirigent/workflow-viewer/dist/index.css'
```

**Custom styling:**
- All components accept `className` and `style` props
- React Flow classes (`.react-flow`, `.react-flow__node`, etc.) can be targeted
- Execution state classes: `.node-pending`, `.node-running`, `.node-completed`, `.node-failed`
- Dark mode: Set `colorMode="dark"` on `<Workflow>` component

---

## Best Practices

1. **Always provide width/height** - Components use React Flow which requires explicit sizing:
   ```tsx
   <div style={{ width: '100%', height: '600px' }}>
     <Workflow yaml={yaml} />
   </div>
   ```

2. **Single EventManager instance** - Don't call `eventManager.connect()` multiple times. Components handle this automatically.

3. **Memoize callbacks** - Use `useCallback` for `onSelect` handlers to prevent unnecessary re-renders:
   ```tsx
   const handleSelect = useCallback((id: string) => {
     setSelected(id)
   }, [])
   ```

4. **Clean up subscriptions** - Hooks handle cleanup automatically. If using EventManager directly, always call the unsubscribe function.

5. **Error boundaries** - Wrap components in error boundaries for production apps:
   ```tsx
   <ErrorBoundary>
     <InstanceMonitor instanceId={id} apiBaseUrl={url} />
   </ErrorBoundary>
   ```

---

## Troubleshooting

### "Instance not updating in real-time"
- Verify SSE endpoint is accessible at `{apiBaseUrl}/api/v1/events`
- Check browser DevTools Network tab for SSE connection
- Ensure CORS headers allow SSE from your domain

### "Workflow not rendering"
- Check YAML syntax is valid
- Ensure container has explicit width/height
- Open browser console for parsing errors

### "TypeScript errors"
- Ensure React types are installed: `@types/react`, `@types/react-dom`
- Check TypeScript version compatibility (5.0+)

---

## Version

Current version: **0.1.0**

Check version programmatically:
```tsx
import { version } from '@dirigent/workflow-viewer'
console.log(version) // "0.1.0"
```
