# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React component library for visualizing and monitoring Dirigent workflows. It provides both static workflow visualization and real-time execution monitoring via Server-Sent Events (SSE). The library is published as `@dirigent/workflow-viewer` and designed to be consumed as an npm package.

## Development Commands

### Build and Development
```bash
npm install                    # Install dependencies
npm run build                  # Build the library (outputs to dist/)
npm run dev                    # Run the demo app at localhost:5173
npm run storybook              # Run Storybook at localhost:6006
npm run preview                # Preview production build
```

### Testing
```bash
npm test                       # Run all tests (unit + storybook)
npm run test:unit              # Run unit tests only
npm run test:watch             # Run tests in watch mode
npm run test:ui                # Run tests with Vitest UI
npm run test:coverage          # Generate coverage report
```

### Code Quality
```bash
npm run lint                   # Lint all code with ESLint
```

## Architecture

### Library Entry Point

`src/index.ts` is the main entry point that exports all public APIs. It's organized into sections:
- Core Components (`Workflow`, `ExecutableWorkflow`)
- Library Components (`WorkflowBrowser`, `InstanceBrowser`, `InstanceMonitor`)
- Hooks (`useWorkflows`, `useInstanceState`, etc.)
- Utilities (`ApiClient`, `eventManager`)
- TypeScript types

### Key Architectural Patterns

#### 1. Workflow Rendering Pipeline

The workflow visualization follows this data flow:

```
YAML string → parser.ts → Workflow object → graphConverter.ts → Graph nodes/edges → layout.ts → Positioned nodes → React Flow
```

- **parser.ts**: Parses YAML using js-yaml, extracts Jackson type tags (`!<tool>`, `!<llm>`, etc.), and infers step kinds
- **graphConverter.ts**: Converts workflow definition into graph representation with special nodes (START, END, FAIL terminal, TRIGGER)
- **layout.ts**: Uses Dagre algorithm to calculate node positions based on direction (LR or TB)
- **Workflow.tsx**: Renders the graph using React Flow with custom node types

#### 2. EventManager Singleton Pattern

`EventManager` (src/lib/EventManager.ts) is a critical singleton that:
- Maintains a single SSE connection to Dirigent API (`/api/v1/events`)
- Provides centralized state store for all workflow instances
- Allows multiple components to subscribe to the same instance without creating duplicate SSE connections
- Handles smart state merging between REST API responses and SSE updates
- Auto-reconnects on connection loss

**Key insight**: SSE events may arrive before REST API responses update. EventManager prefers SSE data when there's a conflict (e.g., SSE shows "completed" while REST shows "running").

#### 3. Component Hierarchy

- **Workflow**: Static visualization (no execution state)
- **ExecutableWorkflow**: Extends Workflow with real-time execution state from EventManager
  - Uses `useInstanceState` hook internally
  - Enriches nodes with execution state before passing to Workflow component
- **InstanceMonitor**: Higher-level component that combines ExecutableWorkflow with metadata display

#### 4. Custom React Flow Nodes

Each step kind has a corresponding custom node component in `src/components/nodes/`:
- **StartNode** / **TriggerNode**: Entry points (TRIGGER shows event types)
- **LlmNode**: LLM steps with model info and prompts
- **ToolNode**: Tool invocations
- **SwitchNode**: Conditional branching (shows cases)
- **FailNode**: Error handling steps
- **EndNode** / **FailTerminalNode**: Terminal nodes

All nodes:
- Support both LR and TB layouts (handle positioning changes)
- Display execution state when provided (status colors, timing, animations)
- Use `BorderLoadingIndicator` for pulsing animations on running steps

#### 5. Type System

TypeScript types are organized into three files:
- **workflow.ts**: Workflow definition types (StepDef, LlmStepDef, ToolStepDef, etc.)
- **execution.ts**: Runtime execution state (InstanceState, StepState, ExecutionState)
- **api.ts**: Dirigent REST API response types (DTOs) and SSE event types

**Important**: `Workflow` type is exported as `WorkflowType` to avoid naming conflict with the `Workflow` component.

### Build Configuration

The library uses:
- **Vite** for building (vite.config.ts)
- **vite-plugin-dts** to generate TypeScript declarations
- **Rollup** (via Vite) to bundle as ESM module
- Externalizes peer dependencies (react, react-dom)
- Outputs to `dist/` with: `index.js`, `index.d.ts`, `index.css`

CSS is exported separately via package.json exports:
```json
{
  "./styles": "./dist/index.css"
}
```

### Testing Strategy

Uses Vitest with two test projects:
1. **Unit tests**: Use jsdom, test components/utilities in isolation
2. **Storybook tests**: Run in Playwright browser, test stories with MSW mocks

MSW handlers (src/mocks/handlers.ts) provide mock Dirigent API responses for Storybook.

## Important Implementation Notes

### CSS Import Requirement

Package consumers MUST import CSS separately:
```tsx
import '@dirigent/workflow-viewer/styles'
```

This is required because CSS is not bundled with the JavaScript.

### EventManager Usage Pattern

Components using real-time features should:
1. Connect EventManager once at app level: `eventManager.connect(apiBaseUrl)`
2. Use `useInstanceState` hook which handles subscription/unsubscription
3. EventManager auto-fetches from REST API if SSE hasn't received events yet

### Jackson YAML Type Tags

Dirigent workflow YAML uses Jackson format with type tags:
```yaml
steps:
  my_step: !<tool>
    tool: my_tool
```

The parser strips these tags and infers `kind` field from step properties or explicit tags.

### Handle Positioning

Node handles (connection points) change position based on layout direction:
- **LR layout**: Handles on left/right edges
- **TB layout**: Handles on top/bottom edges

This is controlled via `direction` prop passed to node `data`.

### Execution State Enrichment

ExecutableWorkflow enriches graph nodes with execution state before passing to Workflow:
```typescript
// In graphConverter, execution state is merged into node data
data: {
  label: stepId,
  stepDef,
  direction,
  execution: stepDef.execution  // ExecutionState merged here
}
```

Nodes then use `data.execution` to render status colors, timing, and animations.

## Common Patterns

### Adding a New Node Type

1. Create node component in `src/components/nodes/`
2. Register in `nodeTypes` object in `Workflow.tsx`
3. Add case in `graphConverter.ts` if special edge logic needed
4. Update `StepDef` union type in `types/workflow.ts`

### Adding a New Hook

1. Implement in `src/lib/hooks.ts`
2. Export from `src/index.ts`
3. Add JSDoc with usage example

### Adding a New SSE Event Type

1. Add type definition in `types/api.ts`
2. Add event listener in `EventManager.connect()`
3. Update state via `updateInstance()` or `updateInstanceStep()`

## Package Publishing

The package is configured for npm publishing:
- Set to `"private": false` in package.json
- GitHub repository: https://github.com/karlll/dirigent-workflow-viewer
- Exports ESM module with TypeScript declarations

To publish:
```bash
npm run build
npm publish
```

## Commit Message Format

This project follows [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- **feat**: New feature (e.g., `feat: add dark mode support to Workflow component`)
- **fix**: Bug fix (e.g., `fix: correct SSE reconnection logic in EventManager`)
- **docs**: Documentation only (e.g., `docs: update USAGE_GUIDE with hook examples`)
- **style**: Code style changes (e.g., `style: format EventManager with prettier`)
- **refactor**: Code refactoring (e.g., `refactor: extract node enrichment logic to utility`)
- **test**: Adding/updating tests (e.g., `test: add EventManager state merging tests`)
- **chore**: Maintenance tasks (e.g., `chore: update dependencies to latest versions`)
- **build**: Build system changes (e.g., `build: configure vite externals for peer deps`)
- **ci**: CI/CD changes (e.g., `ci: add Playwright browser installation step`)
- **perf**: Performance improvements (e.g., `perf: memoize graph layout calculations`)

### Scopes (Optional)

Use scopes to indicate which part of the codebase is affected:

- `workflow` - Workflow component
- `executable` - ExecutableWorkflow component
- `nodes` - Custom node components
- `events` - EventManager and SSE handling
- `hooks` - React hooks
- `api` - ApiClient and API types
- `types` - TypeScript type definitions
- `parser` - YAML parsing
- `layout` - Graph layout logic
- `demo` - Demo application
- `storybook` - Storybook configuration/stories

### Examples

```bash
feat(nodes): add execution timing display to ToolNode
fix(events): prefer SSE state over REST API when timestamps conflict
docs: add EventManager state merging explanation to CLAUDE.md
refactor(parser): simplify Jackson type tag extraction logic
test(hooks): add useInstanceState subscription cleanup tests
chore(deps): update @xyflow/react to 12.10.0
```

### Breaking Changes

For breaking changes, add `!` after type/scope and explain in footer:

```
feat(api)!: change EventManager.connect() to return Promise

BREAKING CHANGE: EventManager.connect() is now async. Update calls to use await.
```

## Dependencies Philosophy

The library maintains minimal runtime dependencies (only 4):
- **@xyflow/react**: Node graph rendering
- **dagre**: Layout algorithm
- **js-yaml**: YAML parsing
- **lucide-react**: Icons

All dependencies use exact versions except lucide-react (which uses `^` for flexibility).
