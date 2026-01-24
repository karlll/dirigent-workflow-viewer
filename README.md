# @dirigent/workflow-viewer

React component library for visualizing and monitoring Dirigent workflows. Provides both static workflow visualization and real-time execution monitoring with Server-Sent Events (SSE).

## Features

### Core Visualization
- 🎨 **Visual workflow representation** - Renders workflows as interactive node graphs using React Flow
- 📊 **Automatic layout** - Uses Dagre algorithm for optimal node positioning
- 🔄 **Multiple layouts** - Supports left-to-right (LR) and top-to-bottom (TB) orientations
- 🎨 **Color modes** - Light, dark, and system preference support
- ✨ **Type-safe** - Full TypeScript support with exported types
- 🎯 **Zero config** - Works out of the box with YAML or parsed workflow objects

### Real-time Execution Monitoring
- 🔴 **Live execution visualization** - Real-time workflow execution state via SSE
- ⚡ **Execution state highlighting** - Color-coded nodes, path highlighting, and animated current step
- ⏱️ **Timing information** - Displays execution duration and timestamps
- 🚨 **Error handling** - Graceful error display for failed steps and invalid workflows
- 📡 **Automatic reconnection** - SSE connection with exponential backoff and Last-Event-ID resumption
- 🔄 **State merging** - Smart merging of REST API data with SSE updates

### Library Components
- 📋 **Workflow Browser** - List and select available workflows
- 📊 **Instance Browser** - Browse and filter workflow instances with auto-refresh
- 🖥️ **Instance Monitor** - Complete instance monitoring with metadata and visualization
- 🎣 **React Hooks** - Composable hooks for building custom workflow UIs
- 🔧 **API Client** - HTTP client for Dirigent API integration

### Dependencies
- 📦 **Minimal dependencies** - Only 4 runtime dependencies (@xyflow/react, dagre, js-yaml, lucide-react)

## Installation

### From npm (When Published)

```bash
npm install @dirigent/workflow-viewer
```

**Important:** You must also import the CSS in your application:

```javascript
import '@dirigent/workflow-viewer/styles';
// or
import '@dirigent/workflow-viewer/dist/index.css';
```

**Status:** Package is configured for public npm publishing (`"private": false` in package.json). To publish:

```bash
cd ui/workflow
npm run build
npm publish
```

### From Git Repository

```bash
npm install github:karlll/dirigent#main
```

Or add to package.json:

```json
{
  "dependencies": {
    "@dirigent/workflow-viewer": "github:karlll/dirigent#main"
  }
}
```

### Local Development (npm link)

```bash
# In the workflow viewer directory
cd ui/workflow
npm install
npm run build
npm link

# In your consuming project
cd your-project
npm link @dirigent/workflow-viewer
```

## Quick Start

**Important:** Import the CSS before using any components:

```tsx
import '@dirigent/workflow-viewer/styles';
```

For complete usage examples, API documentation, and integration guide, see **[USAGE_GUIDE.md](./USAGE_GUIDE.md)**.

### Basic Static Visualization

```tsx
import { Workflow } from '@dirigent/workflow-viewer'
import '@dirigent/workflow-viewer/styles'

function App() {
  const yaml = `
    name: my_workflow
    version: 1
    start: first_step
    steps:
      first_step:
        kind: tool
        tool: my_tool
        end: true
  `

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <Workflow yaml={yaml} direction="LR" />
    </div>
  )
}
```

### Real-time Execution Monitoring

```tsx
import { ExecutableWorkflow } from '@dirigent/workflow-viewer'
import '@dirigent/workflow-viewer/styles'

function Monitor({ instanceId }: { instanceId: string }) {
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

### Complete Workflow Dashboard

```tsx
import { InstanceMonitor } from '@dirigent/workflow-viewer'
import '@dirigent/workflow-viewer/styles'

function Dashboard({ instanceId }: { instanceId: string }) {
  return (
    <div style={{ height: '100vh' }}>
      <InstanceMonitor
        instanceId={instanceId}
        apiBaseUrl="http://localhost:8080"
      />
    </div>
  )
}
```

## Exported Components

### Core Components

- **`<Workflow>`** - Static workflow visualization from YAML or parsed object
- **`<ExecutableWorkflow>`** - Real-time execution monitoring with SSE

### Library Components

- **`<WorkflowBrowser>`** - Browse and select available workflows
- **`<InstanceBrowser>`** - Browse and filter workflow instances with auto-refresh
- **`<InstanceMonitor>`** - Complete instance monitoring (metadata + visualization)

### React Hooks

- **`useWorkflows(apiBaseUrl)`** - Fetch list of available workflows
- **`useWorkflowDefinition(name, apiBaseUrl)`** - Fetch specific workflow YAML
- **`useInstances(apiBaseUrl, options)`** - Fetch/filter instances with auto-refresh
- **`useInstanceState(instanceId, apiBaseUrl)`** - Subscribe to real-time SSE updates
- **`useInstanceDetails(instanceId, apiBaseUrl)`** - Fetch detailed instance information

### Utilities

- **`ApiClient`** - HTTP client for Dirigent API
- **`eventManager`** - Singleton for managing SSE connections

### TypeScript Types

All workflow, execution, and API types are exported. See [Exported Types](#exported-types) section below.

## Usage Examples

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
      apiBaseUrl="http://localhost:8080"
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
      apiBaseUrl="http://localhost:8080"
      yaml={workflowYaml}
    />
  )
}

// Multiple instances share the same SSE connection
function MultipleWorkflows() {
  return (
    <>
      <ExecutableWorkflow instanceId="instance-1" apiBaseUrl="http://localhost:8080" yaml={yaml1} />
      <ExecutableWorkflow instanceId="instance-2" apiBaseUrl="http://localhost:8080" yaml={yaml2} />
    </>
  )
}
```

#### Manual EventManager Control (Advanced)

For advanced use cases, you can directly control the `EventManager`:

```tsx
import { eventManager } from '@dirigent/workflow-viewer'

// Manually connect to SSE endpoint
eventManager.connect('http://localhost:8080')

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
      apiBaseUrl="http://localhost:8080"
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
| `apiBaseUrl` | `string` | **required** | Base URL of the Dirigent API (e.g., "http://localhost:8080") |
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
  apiBaseUrl="http://localhost:8080"
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

The library exports comprehensive TypeScript types for type-safe integration.

### Workflow Definition Types

```typescript
import type {
  WorkflowType,      // Main workflow definition
  StepDef,           // Union of all step types
  LlmStepDef,        // LLM step definition
  ToolStepDef,       // Tool step definition
  SwitchStepDef,     // Switch/branch step definition
  FailStepDef,       // Fail/error step definition
  Trigger,           // Event trigger definition
  CaseDef,           // Switch case definition
  Goto,              // Goto target (string or end marker)
} from '@dirigent/workflow-viewer'
```

### Execution State Types

```typescript
import type {
  InstanceState,     // Complete workflow instance execution state
  StepState,         // Individual step execution state
  ExecutionState,    // Visual execution state for node enrichment
} from '@dirigent/workflow-viewer'
```

### API Response Types

```typescript
import type {
  WorkflowMetadata,      // Workflow summary (name, version, triggers, step count)
  WorkflowListResponse,  // List of workflows response
  InstanceSummaryDto,    // Instance summary for lists
  InstanceListResponse,  // List of instances response
  InstanceDetailsDto,    // Detailed instance information
  StepExecutionDto,      // Step execution details
} from '@dirigent/workflow-viewer'
```

### Component Props Types

```typescript
import type {
  WorkflowProps,             // Workflow component props
  ExecutableWorkflowProps,   // ExecutableWorkflow component props
  WorkflowBrowserProps,      // WorkflowBrowser component props
  InstanceBrowserProps,      // InstanceBrowser component props
  InstanceMonitorProps,      // InstanceMonitor component props
} from '@dirigent/workflow-viewer'
```

### Utility Types

```typescript
import type {
  LayoutDirection,           // 'LR' | 'TB'
  ColorMode,                 // 'light' | 'dark' | 'system' (from @xyflow/react)
} from '@dirigent/workflow-viewer'
```

### Utilities and Singletons

```typescript
import { eventManager } from '@dirigent/workflow-viewer'
// EventManager singleton for managing SSE connections

import { ApiClient } from '@dirigent/workflow-viewer'
// HTTP client for Dirigent API

import { version } from '@dirigent/workflow-viewer'
// Current library version (e.g., "0.1.0")
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
│   ├── index.ts                          # Library entry point (exports)
│   ├── components/
│   │   ├── Workflow.tsx                  # Static workflow viewer
│   │   ├── Workflow.stories.tsx          # Storybook stories
│   │   ├── ExecutableWorkflow.tsx        # Real-time execution viewer
│   │   ├── ExecutableWorkflow.test.tsx   # Component tests
│   │   ├── WorkflowBrowser.tsx           # Workflow list component
│   │   ├── InstanceBrowser.tsx           # Instance list component
│   │   ├── InstanceMonitor.tsx           # Instance detail component
│   │   └── nodes/
│   │       ├── StartNode.tsx             # START node
│   │       ├── EndNode.tsx               # END node
│   │       ├── TriggerNode.tsx           # TRIGGER node
│   │       ├── LlmNode.tsx               # LLM step node
│   │       ├── ToolNode.tsx              # Tool step node
│   │       ├── SwitchNode.tsx            # Switch/branch node
│   │       ├── FailNode.tsx              # Fail/error node
│   │       └── BorderLoadingIndicator.tsx # Animated border
│   ├── lib/
│   │   ├── ApiClient.ts                  # HTTP client for Dirigent API
│   │   ├── EventManager.ts               # SSE connection manager
│   │   ├── EventManager.test.ts          # EventManager tests
│   │   ├── hooks.ts                      # React hooks
│   │   └── components/
│   │       └── InstanceMonitor.tsx       # Instance monitor wrapper
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
│   │   ├── layout.ts                     # Dagre layout engine
│   │   └── classNames.ts                 # CSS utility
│   ├── demo/
│   │   ├── main.tsx                      # Demo app entry point
│   │   ├── App.tsx                       # Full-featured demo
│   │   └── components/                   # Demo-specific components
│   ├── test/
│   │   └── setup.ts                      # Test environment setup
│   ├── mocks/
│   │   └── handlers.ts                   # MSW mock handlers for Storybook
│   └── fixtures/
│       └── *.yaml                        # Example workflows for testing
├── .storybook/
│   ├── main.ts                           # Storybook configuration
│   └── preview.ts                        # Preview settings
├── dist/                                 # Build output (ESM)
│   ├── index.js                          # Bundled library
│   ├── index.d.ts                        # TypeScript definitions
│   └── index.css                         # Styles
├── public/
│   └── mockServiceWorker.js              # MSW service worker
├── package.json
├── vite.config.ts                        # Vite build config
├── tsconfig.json                         # TypeScript config
├── README.md                             # This file
└── USAGE_GUIDE.md                        # Comprehensive integration guide
```

## Dependencies

### Runtime Dependencies (4)

- **@xyflow/react** `12.10.0` - Interactive node-based UI rendering
- **dagre** `0.8.5` - Graph layout algorithm for automatic node positioning
- **js-yaml** `4.1.1` - YAML parsing
- **lucide-react** `^0.468.0` - Icon library for UI elements

### Peer Dependencies (Required)

- **react** `>=18.0.0` - Provided by consuming application
- **react-dom** `>=18.0.0` - Provided by consuming application

### Dev Dependencies (Testing & Build)

- **Vite** `^7.2.4` - Build tool and dev server
- **TypeScript** `~5.9.3` - Type checking and compilation
- **Vitest** `^4.0.16` - Unit testing framework
- **Testing Library** - React component testing
- **Storybook** `^10.1.11` - Component documentation and demos
- **ESLint** - Code linting

## Security

- Runtime dependencies use **exact versions** for @xyflow/react, dagre, and js-yaml
- Regular `npm audit` checks for vulnerabilities
- Minimal dependency tree (4 runtime deps)
- Clean dependency audit status

### Dependency Security Status

```bash
npm audit  # Check for vulnerabilities
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

## Documentation

- **[USAGE_GUIDE.md](./USAGE_GUIDE.md)** - Comprehensive integration guide with examples
- **[Main Project README](../../README.md)** - Dirigent workflow engine documentation
- **[Storybook](http://localhost:6006)** - Interactive component demos (run `npm run storybook`)

## Related Projects

- **[Dirigent](https://github.com/karlll/dirigent)** - Deterministic workflow engine for JVM (Kotlin)
- **Workflow DSL** - YAML-based agent workflow definition language
- **REST API** - Dirigent API for querying workflows and instances
- **SSE Stream** - Real-time workflow execution events

## License

MIT

## Contributing

This library is part of the Dirigent workflow engine project.

**Ways to contribute:**
- Report bugs or request features via GitHub Issues
- Submit pull requests with improvements or bug fixes
- Improve documentation and examples
- Add test coverage

**Development setup:**
```bash
git clone https://github.com/karlll/dirigent.git
cd dirigent/ui/workflow
npm install
npm run dev        # Start demo app
npm run storybook  # Start Storybook
npm test           # Run tests
```

**Before submitting PRs:**
- Run `npm test` to ensure tests pass
- Run `npm run lint` to check code style
- Update documentation if adding new features
- Add tests for new functionality
