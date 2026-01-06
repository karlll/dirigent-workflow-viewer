# @dirigent/workflow-viewer

React component for visualizing Dirigent workflow YAML files as interactive node graphs.

## Features

- 🎨 **Visual workflow representation** - Renders workflows as interactive node graphs using React Flow
- 🔴 **Real-time execution visualization** - Live workflow execution state via Server-Sent Events (SSE)
- 📊 **Automatic layout** - Uses Dagre algorithm for optimal node positioning
- 🔄 **Multiple layouts** - Supports left-to-right (LR) and top-to-bottom (TB) orientations
- ⚡ **Execution state highlighting** - Color-coded nodes, path highlighting, and current step animation
- ⏱️ **Timing information** - Displays execution duration and error messages
- ✨ **Type-safe** - Full TypeScript support with exported types
- 🎯 **Zero config** - Works out of the box with YAML or parsed workflow objects
- 🚨 **Error handling** - Graceful error display for invalid YAML or workflows
- 📦 **Minimal dependencies** - Only 3 runtime dependencies (reactflow, dagre, js-yaml)

## Installation

### Local Development (npm link)

```bash
# In the workflow viewer directory
cd ui/workflow
npm install
npm run build
npm link

# In your project (e.g., knutpunkt frontend)
cd your-project
npm link @dirigent/workflow-viewer
```

### From Git Repository

```json
{
  "dependencies": {
    "@dirigent/workflow-viewer": "github:your-org/dirigent#ui/workflow/v0.1.0"
  }
}
```

## Usage

### Basic Example

```tsx
import { Workflow } from '@dirigent/workflow-viewer'

const yamlWorkflow = `
name: simple_workflow
version: 1
start: first_step

steps:
  first_step:
    kind: tool
    tool: my_tool
    end: true
`

function App() {
  return <Workflow yaml={yamlWorkflow} />
}
```

### With Parsed Workflow Object

```tsx
import { Workflow, type WorkflowType } from '@dirigent/workflow-viewer'

const workflow: WorkflowType = {
  name: 'my_workflow',
  version: 1,
  start: 'first_step',
  steps: {
    first_step: {
      kind: 'tool',
      tool: 'my_tool',
      end: true
    }
  }
}

function App() {
  return <Workflow workflow={workflow} />
}
```

### Custom Layout Direction

```tsx
<Workflow
  yaml={yamlWorkflow}
  direction="TB"  // Top-to-bottom
/>

<Workflow
  yaml={yamlWorkflow}
  direction="LR"  // Left-to-right (default)
/>
```

### Dark Mode

```tsx
// Explicit dark mode
<Workflow
  yaml={yamlWorkflow}
  colorMode="dark"
/>

// Explicit light mode
<Workflow
  yaml={yamlWorkflow}
  colorMode="light"
/>

// System preference (default)
<Workflow
  yaml={yamlWorkflow}
  colorMode="system"
/>
```

## Real-time Execution Visualization

The `ExecutableWorkflow` component extends the base `Workflow` component with real-time execution state from the Dirigent API. It connects via Server-Sent Events (SSE) to visualize workflow execution as it happens.

### Basic Real-time Example

```tsx
import { ExecutableWorkflow } from '@dirigent/workflow-viewer'

function App() {
  return (
    <ExecutableWorkflow
      instanceId="550e8400-e29b-41d4-a716-446655440000"
      apiBaseUrl="http://localhost:8081"
      yaml={yamlWorkflow}
      direction="LR"
    />
  )
}
```

### Features

- **Real-time Updates** - Automatically subscribes to SSE events for live execution state
- **Execution Path Highlighting** - Visual indication of which steps have executed
- **Current Step Animation** - Pulsing animation on the currently executing step
- **Status Colors** - Color-coded nodes based on execution status (pending, running, completed, failed)
- **Timing Information** - Displays execution duration for completed steps
- **Error Display** - Shows error messages for failed steps
- **Loading States** - Graceful loading and error handling

### ExecutableWorkflow vs Workflow

| Feature | `Workflow` | `ExecutableWorkflow` |
|---------|-----------|---------------------|
| Static visualization | ✅ | ✅ |
| YAML/object input | ✅ | ✅ |
| Real-time execution state | ❌ | ✅ |
| SSE connection | ❌ | ✅ |
| Execution highlighting | ❌ | ✅ |
| Step timing info | ❌ | ✅ |
| Error messages | ❌ | ✅ |

### EventManager Integration

The `ExecutableWorkflow` component uses the `EventManager` singleton to manage SSE connections and state updates.

#### Automatic Connection Management

```tsx
import { ExecutableWorkflow } from '@dirigent/workflow-viewer'

// EventManager automatically connects on first mount
function WorkflowViewer({ instanceId }: { instanceId: string }) {
  return (
    <ExecutableWorkflow
      instanceId={instanceId}
      apiBaseUrl="http://localhost:8081"
      yaml={workflowYaml}
    />
  )
}

// Multiple instances share the same SSE connection
function MultipleWorkflows() {
  return (
    <>
      <ExecutableWorkflow instanceId="instance-1" apiBaseUrl="http://localhost:8081" yaml={yaml1} />
      <ExecutableWorkflow instanceId="instance-2" apiBaseUrl="http://localhost:8081" yaml={yaml2} />
    </>
  )
}
```

#### Manual EventManager Control (Advanced)

For advanced use cases, you can directly control the `EventManager`:

```tsx
import { eventManager } from '@dirigent/workflow-viewer'

// Manually connect to SSE endpoint
eventManager.connect('http://localhost:8081')

// Check connection status
const isConnected = eventManager.isEventSourceConnected()

// Fetch instance state manually
const state = await eventManager.fetchState('instance-id')

// Get cached state
const cachedState = eventManager.getState('instance-id')

// Subscribe to state updates
const unsubscribe = eventManager.subscribe('instance-id', (state) => {
  console.log('State updated:', state)
})

// Clean up
unsubscribe()
eventManager.disconnect()
```

### Loading States

Control loading spinner visibility:

```tsx
// Show loading spinner (default)
<ExecutableWorkflow
  instanceId={instanceId}
  apiBaseUrl={apiBaseUrl}
  yaml={yaml}
  showLoading={true}
/>

// Hide loading spinner
<ExecutableWorkflow
  instanceId={instanceId}
  apiBaseUrl={apiBaseUrl}
  yaml={yaml}
  showLoading={false}
/>
```

### Error Handling

The component handles various error scenarios:

```tsx
function WorkflowViewer() {
  return (
    <ExecutableWorkflow
      instanceId="unknown-instance"
      apiBaseUrl="http://localhost:8081"
      yaml={yaml}
    />
  )
}

// Displays: "Error: Instance 'unknown-instance' not found"
```

Common error scenarios:
- **Invalid instance ID** - Shows "Instance not found" error
- **Network failure** - Shows connection error message
- **Invalid YAML** - Shows YAML parsing error
- **API unavailable** - Shows fetch error with retry guidance

## Component API

### `<Workflow>`

Main component for rendering static workflow visualizations.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `yaml` | `string` | - | YAML string representing the workflow |
| `workflow` | `WorkflowType` | - | Pre-parsed workflow object |
| `direction` | `'LR' \| 'TB'` | `'LR'` | Layout direction (left-to-right or top-to-bottom) |
| `showHeader` | `boolean` | `true` | Show workflow name, description, and metadata |
| `colorMode` | `'light' \| 'dark' \| 'system'` | `'system'` | Color scheme for the viewer |

**Note:** Either `yaml` or `workflow` must be provided, but not both.

#### Example

```tsx
<Workflow
  yaml={yamlString}
  direction="LR"
/>
```

### `<ExecutableWorkflow>`

Component for rendering workflows with real-time execution state from the Dirigent API.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `instanceId` | `string` | **required** | UUID of the workflow instance to track |
| `apiBaseUrl` | `string` | **required** | Base URL of the Dirigent API (e.g., "http://localhost:8081") |
| `yaml` | `string` | - | YAML string representing the workflow |
| `workflow` | `WorkflowType` | - | Pre-parsed workflow object |
| `direction` | `'LR' \| 'TB'` | `'LR'` | Layout direction (left-to-right or top-to-bottom) |
| `showHeader` | `boolean` | `true` | Show workflow name, description, and metadata |
| `colorMode` | `'light' \| 'dark' \| 'system'` | `'system'` | Color scheme for the viewer |
| `showLoading` | `boolean` | `true` | Show loading spinner while fetching state |

**Note:** Either `yaml` or `workflow` must be provided, but not both.

#### Example

```tsx
<ExecutableWorkflow
  instanceId="550e8400-e29b-41d4-a716-446655440000"
  apiBaseUrl="http://localhost:8081"
  yaml={yamlString}
  direction="LR"
  showLoading={true}
/>
```

#### Execution State Visual Indicators

| Status | Visual Indicator |
|--------|-----------------|
| **Pending** | Gray, semi-transparent (50% opacity) |
| **Running** | Yellow gradient with orange pulsing border animation |
| **Completed** | Green gradient with green border |
| **Failed** | Red gradient with red border + error message |
| **On Execution Path** | Blue border with glow effect |
| **Current Step** | Orange border with pulsing animation |

## Exported Types

### Workflow Types

```typescript
import type {
  // Workflow definition types
  WorkflowType,      // Main workflow type
  StepDef,           // Union of all step types
  LlmStepDef,        // LLM step definition
  ToolStepDef,       // Tool step definition
  SwitchStepDef,     // Switch/branch step definition
  FailStepDef,       // Fail/error step definition
  Trigger,           // Event trigger definition
  CaseDef,           // Switch case definition
  Goto,              // Goto target
} from '@dirigent/workflow-viewer'
```

### Component Types

```typescript
import type {
  // Component props
  WorkflowProps,           // Workflow component props
  ExecutableWorkflowProps, // ExecutableWorkflow component props
} from '@dirigent/workflow-viewer'
```

### Execution State Types

```typescript
import type {
  // Execution state types
  InstanceState,     // Complete workflow instance execution state
  StepState,         // Individual step execution state
  ExecutionState,    // Visual execution state for nodes
} from '@dirigent/workflow-viewer'
```

### EventManager

```typescript
import { eventManager } from '@dirigent/workflow-viewer'

// EventManager is a singleton for managing SSE connections
// and workflow execution state across multiple components
```

## Development

### Running the Demo App

```bash
npm run dev
```

Opens the interactive demo at `http://localhost:5173`

### Running Storybook

```bash
npm run storybook
```

Opens Storybook at `http://localhost:6006` with component examples and documentation.

### Building the Library

```bash
npm run build
```

Outputs:
- `dist/index.js` - ESM library bundle
- `dist/index.d.ts` - TypeScript type definitions
- `dist/index.css` - React Flow styles

### Running Tests

```bash
npm test
```

## Project Structure

```
ui/workflow/
├── src/
│   ├── components/
│   │   ├── Workflow.tsx                  # Static workflow viewer
│   │   ├── Workflow.stories.tsx          # Storybook stories
│   │   ├── ExecutableWorkflow.tsx        # Real-time execution viewer
│   │   ├── ExecutableWorkflow.test.tsx   # Execution viewer tests
│   │   └── nodes/
│   │       ├── StartNode.tsx             # START node component
│   │       ├── EndNode.tsx               # END node component
│   │       ├── LlmNode.tsx               # LLM step node
│   │       ├── ToolNode.tsx              # Tool step node
│   │       ├── SwitchNode.tsx            # Switch/branch node
│   │       └── FailNode.tsx              # Fail/error node
│   ├── lib/
│   │   ├── EventManager.ts               # SSE connection manager
│   │   └── EventManager.test.ts          # EventManager tests
│   ├── types/
│   │   ├── workflow.ts                   # Workflow definition types
│   │   ├── execution.ts                  # Execution state types
│   │   └── api.ts                        # API response types
│   ├── styles/
│   │   ├── nodes.css                     # Node styling
│   │   └── execution.css                 # Execution state styling
│   ├── utils/
│   │   ├── parser.ts                     # YAML parser
│   │   ├── graphConverter.ts             # Workflow → graph converter
│   │   └── layout.ts                     # Dagre layout engine
│   ├── test/
│   │   └── setup.ts                      # Test environment setup
│   ├── fixtures/
│   │   └── *.yaml                        # Example workflows
│   ├── App.tsx                           # Demo application
│   └── index.ts                          # Library entry point
├── .storybook/                           # Storybook configuration
├── dist/                                 # Build output
├── package.json
├── vite.config.ts
└── README.md
```

## Dependencies

### Runtime Dependencies (3)

- **reactflow** `11.11.0` - Node-based UI rendering
- **dagre** `0.8.5` - Graph layout algorithm
- **js-yaml** `4.1.1` - YAML parsing

### Peer Dependencies

- **react** `>=18.0.0` - Provided by consuming application
- **react-dom** `>=18.0.0` - Provided by consuming application

## Security

- All dependencies use **exact versions** (no `^` or `~`)
- Regular `npm audit` checks for vulnerabilities
- Minimal dependency tree (3 runtime deps + ~50 transitive)
- No publishing to public npm registry

### Dependency Security Status

```bash
npm audit  # Should report: found 0 vulnerabilities
```

## Workflow YAML Structure

The component visualizes workflows defined in YAML format matching the Dirigent workflow engine schema:

```yaml
name: workflow_name
version: 1
start: first_step

steps:
  first_step:
    kind: llm | tool | switch | fail
    # Step-specific fields...
    goto: next_step  # Optional next step
    end: true        # Optional terminal marker

  # Additional steps...
```

See the Dirigent documentation for full workflow schema details.

## Troubleshooting

### Build Errors

If you encounter build errors after installation:

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### React Flow Styles Not Loading

Make sure React Flow CSS is imported (the component does this automatically):

```tsx
import 'reactflow/dist/style.css'
```

### Type Errors with WorkflowType

The Workflow type is exported as `WorkflowType` to avoid naming conflicts:

```tsx
import { Workflow, type WorkflowType } from '@dirigent/workflow-viewer'
//       ^component      ^type
```

## License

MIT

## Contributing

This component is part of the Dirigent workflow engine project. See the main project README for contribution guidelines.
