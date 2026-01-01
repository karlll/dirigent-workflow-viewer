# @dirigent/workflow-viewer

React component for visualizing Dirigent workflow YAML files as interactive node graphs.

## Features

- 🎨 **Visual workflow representation** - Renders workflows as interactive node graphs using React Flow
- 📊 **Automatic layout** - Uses Dagre algorithm for optimal node positioning
- 🔄 **Multiple layouts** - Supports left-to-right (LR) and top-to-bottom (TB) orientations
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

## Component API

### `<Workflow>`

Main component for rendering workflow visualizations.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `yaml` | `string` | - | YAML string representing the workflow |
| `workflow` | `WorkflowType` | - | Pre-parsed workflow object |
| `direction` | `'LR' \| 'TB'` | `'LR'` | Layout direction (left-to-right or top-to-bottom) |

**Note:** Either `yaml` or `workflow` must be provided, but not both.

#### Example

```tsx
<Workflow
  yaml={yamlString}
  direction="LR"
/>
```

## Exported Types

```typescript
import type {
  WorkflowType,      // Main workflow type
  WorkflowProps,     // Component props
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
│   │   ├── Workflow.tsx           # Main component
│   │   └── Workflow.stories.tsx   # Storybook stories
│   ├── types/
│   │   └── workflow.ts            # TypeScript types
│   ├── utils/
│   │   ├── parser.ts              # YAML parser
│   │   ├── graphConverter.ts      # Workflow → graph converter
│   │   └── layout.ts              # Dagre layout engine
│   ├── fixtures/
│   │   └── *.yaml                 # Example workflows
│   ├── App.tsx                    # Demo application
│   └── index.ts                   # Library entry point
├── .storybook/                    # Storybook configuration
├── dist/                          # Build output
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
