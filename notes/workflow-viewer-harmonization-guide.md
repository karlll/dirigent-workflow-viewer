# Dirigent Workflow Viewer - Harmonization Guide

## Overview

This guide outlines the technical and design considerations for aligning the `@dirigent/workflow-viewer` component with the Knutpunkt frontend architecture, theming system, and visual design language.

---

## Current State Analysis

### Knutpunkt Frontend Stack
- **Framework**: React 19 + TypeScript 5
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS v4 with `@catppuccin/tailwindcss`
- **UI Components**: Radix UI primitives + ShadCN custom components
- **Theme System**: Catppuccin (Latte for light, Mocha for dark)
- **State Management**: Zustand with localStorage persistence
- **Icons**: Lucide React
- **Utilities**: `clsx`, `tailwind-merge`, `class-variance-authority`

### Workflow Viewer Current Integration
Located in `frontend/src/components/workflow/WorkflowViewerPane.tsx`:
- Imports pre-built CSS: `@dirigent/workflow-viewer/dist/index.css`
- Uses `InstanceBrowser` and `InstanceMonitor` components
- Wrapped with Knutpunkt's Button component for navigation

**Problem**: The workflow viewer likely has its own styling that doesn't respond to Knutpunkt's theme system, creating visual inconsistencies.

---

## Technology Alignment

### 1. Dependency Harmonization

#### Current Dependencies to Align With
```json
{
  "@radix-ui/*": "Latest versions",
  "tailwindcss": "^4.1.17",
  "@catppuccin/tailwindcss": "^1.0.0",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.4.0",
  "lucide-react": "^0.555.0"
}
```

#### Recommendations

**1. Radix UI Components**
- **Why**: Knutpunkt uses Radix extensively for accessibility and composability
- **Impact**: Replace any custom modal/dialog/dropdown implementations with Radix primitives
- **Example Components**:
  - `@radix-ui/react-dialog` for modals
  - `@radix-ui/react-select` for dropdowns
  - `@radix-ui/react-tabs` for tab navigation
  - `@radix-ui/react-collapsible` for expandable sections
  - `@radix-ui/react-alert-dialog` for confirmations

**2. Tailwind CSS v4**
- **Why**: Knutpunkt uses Tailwind v4 with CSS-first configuration
- **Impact**:
  - Move from bundled CSS to Tailwind utility classes
  - Use Tailwind's `@theme` directive for custom properties
  - Leverage Tailwind's dark mode with `.dark` class strategy
- **Migration Path**:
  ```css
  /* Old approach */
  .workflow-node {
    background: #f0f0f0;
    border: 1px solid #ccc;
  }

  /* New approach */
  <div className="bg-card border border-border rounded-lg" />
  ```

**3. CVA (Class Variance Authority)**
- **Why**: Provides type-safe variant management aligned with Knutpunkt's component patterns
- **Impact**: Define variants for workflow nodes, edges, and states
- **Example**:
  ```typescript
  import { cva, type VariantProps } from 'class-variance-authority'

  const nodeVariants = cva(
    "rounded-lg border transition-colors", // base
    {
      variants: {
        status: {
          pending: "bg-muted text-muted-foreground border-border",
          running: "bg-primary/10 text-primary border-primary",
          success: "bg-ctp-green/10 text-ctp-green border-ctp-green",
          error: "bg-destructive/10 text-destructive border-destructive",
        },
        size: {
          sm: "px-3 py-2 text-sm",
          md: "px-4 py-3 text-base",
          lg: "px-6 py-4 text-lg",
        }
      },
      defaultVariants: {
        status: "pending",
        size: "md",
      }
    }
  )
  ```

**4. Icon Alignment**
- **Current**: Workflow viewer likely uses its own icon system
- **Target**: Lucide React (consistent with Knutpunkt)
- **Benefits**:
  - Unified icon style across the app
  - SVG-based, theme-aware
  - Tree-shakeable
- **Common Workflow Icons**:
  ```typescript
  import {
    Play, Pause, CheckCircle, XCircle, Clock,
    ArrowRight, GitBranch, RefreshCw, Zap
  } from 'lucide-react'
  ```

---

## Theme Integration

### Catppuccin Color System

Knutpunkt uses Catppuccin's semantic color palette with two flavors:

#### Light Mode (Latte)
```css
:root {
  --background: #eff1f5;     /* base */
  --foreground: #4c4f69;     /* text */
  --primary: #1e66f5;        /* blue */
  --destructive: #d20f39;    /* red */
  --border: #acb0be;         /* surface2 */
  --ctp-green: #40a02b;
  --ctp-yellow: #df8e1d;
  --ctp-peach: #fe640b;
  --ctp-lavender: #7287fd;
}
```

#### Dark Mode (Mocha)
```css
.dark {
  --background: #1e1e2e;     /* base */
  --foreground: #cdd6f4;     /* text */
  --primary: #89b4fa;        /* blue */
  --destructive: #f38ba8;    /* red */
  --border: #585b70;         /* surface2 */
  --ctp-green: #a6e3a1;
  --ctp-yellow: #f9e2af;
  --ctp-peach: #fab387;
  --ctp-lavender: #b4befe;
}
```

### Workflow-Specific Color Mapping

Map workflow states to Catppuccin semantic colors:

| Workflow State | Light Mode | Dark Mode | CSS Variable |
|----------------|------------|-----------|--------------|
| **Pending** | Gray/Muted | Gray/Muted | `var(--muted)` |
| **Running** | Blue | Blue | `var(--primary)` |
| **Success** | Green | Green | `var(--ctp-green)` |
| **Failed** | Red | Red | `var(--destructive)` |
| **Warning** | Yellow | Yellow | `var(--ctp-yellow)` |
| **Skipped** | Lavender | Lavender | `var(--ctp-lavender)` |
| **Cancelled** | Peach | Peach | `var(--ctp-peach)` |

### Theme Detection

Workflow viewer must respect the theme set by `useThemeStore`:

```typescript
import { useThemeStore } from '@/stores/themeStore'

export function WorkflowViewer() {
  const theme = useThemeStore((state) => state.theme)

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      {/* Workflow content */}
    </div>
  )
}
```

**Key Considerations**:
1. Use CSS variables (not hardcoded colors) for all theme-dependent properties
2. Test both light and dark modes during development
3. Ensure sufficient contrast ratios (WCAG AA: 4.5:1 for text)
4. Use Tailwind's `dark:` prefix for dark mode overrides
5. Consider color blindness - don't rely solely on color for state indication

---

## Design System Alignment

### 1. Typography

Knutpunkt defines three font families:

```css
--font-sans: Montserrat, sans-serif;  /* UI text */
--font-mono: Fira Code, monospace;    /* Code/IDs */
--font-serif: Georgia, serif;         /* Rarely used */
```

**Workflow Viewer Typography Strategy**:
- **Node labels**: Use `font-sans` (Montserrat)
- **Step IDs/timestamps**: Use `font-mono` (Fira Code)
- **Descriptions**: Use `font-sans`

**Size Scale** (use Tailwind classes):
```typescript
const textSizes = {
  xs: 'text-xs',      // 0.75rem - timestamps, metadata
  sm: 'text-sm',      // 0.875rem - secondary text
  base: 'text-base',  // 1rem - node labels
  lg: 'text-lg',      // 1.125rem - section headers
  xl: 'text-xl',      // 1.25rem - page titles
}
```

### 2. Spacing & Layout

Knutpunkt uses a base spacing unit of `0.25rem` (4px):

```css
--spacing: 0.25rem;
```

**Apply Consistent Spacing**:
```tsx
<div className="space-y-4">     {/* 16px vertical spacing */}
  <div className="p-4">         {/* 16px padding */}
    <div className="gap-2">     {/* 8px gap in flex/grid */}
      {/* Content */}
    </div>
  </div>
</div>
```

**Layout Patterns**:
- **Card padding**: `p-4` or `p-6` for larger cards
- **Section gaps**: `space-y-4` for vertical, `gap-4` for flex/grid
- **Icon-text gaps**: `gap-2` (8px)
- **Component margins**: `mb-4` or `mt-4`

### 3. Border Radius

Knutpunkt uses a consistent border radius:

```css
--radius: 0.35rem; /* ~5.6px */
--radius-sm: calc(var(--radius) - 4px);
--radius-md: calc(var(--radius) - 2px);
--radius-lg: var(--radius);
--radius-xl: calc(var(--radius) + 4px);
```

**Workflow Component Rounding**:
- **Nodes**: `rounded-lg` (matches cards)
- **Badges/pills**: `rounded-full` (for status indicators)
- **Buttons**: `rounded-md` (matches ShadCN buttons)
- **Modals**: `rounded-lg`

### 4. Shadows

Knutpunkt defines a shadow scale:

```css
--shadow-sm: 0px 4px 8px -1px hsl(0 0% 0% / 0.10);
--shadow-md: 0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 2px 4px -2px hsl(0 0% 0% / 0.10);
--shadow-lg: 0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 4px 6px -2px hsl(0 0% 0% / 0.10);
```

**Usage Guidelines**:
- **Cards/Nodes**: `shadow-md` (subtle elevation)
- **Hoverable elements**: `hover:shadow-lg` (interactive feedback)
- **Modals/Dialogs**: `shadow-xl` (prominent overlays)
- **Avoid**: Heavy shadows that conflict with flat design aesthetics

### 5. Component Patterns

Match Knutpunkt's existing component structure:

**Card Pattern** (from `src/components/ui/card.tsx`):
```tsx
<div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm">
  <div className="p-6">
    <h3 className="text-lg font-semibold">Card Title</h3>
    <p className="text-sm text-muted-foreground">Description</p>
  </div>
</div>
```

**Badge Pattern** (from `src/components/ui/badge.tsx`):
```tsx
const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input bg-background",
      },
    },
  }
)
```

**Button Pattern** (from `src/components/ui/button.tsx`):
- Use existing Button component for all interactive elements
- Variants: `default`, `secondary`, `ghost`, `link`, `destructive`
- Sizes: `sm`, `default`, `lg`, `icon`

---

## Architecture Recommendations

### 1. File Structure

```
@dirigent/workflow-viewer/
├── src/
│   ├── components/
│   │   ├── ui/                    # Radix-based primitives
│   │   │   ├── WorkflowCard.tsx
│   │   │   ├── NodeBadge.tsx
│   │   │   └── StatusIcon.tsx
│   │   ├── InstanceBrowser.tsx
│   │   ├── InstanceMonitor.tsx
│   │   └── WorkflowGraph.tsx
│   ├── lib/
│   │   ├── utils.ts               # cn(), clsx helpers
│   │   └── variants.ts            # CVA definitions
│   ├── styles/
│   │   └── workflow.css           # Minimal custom CSS using CSS vars
│   └── index.ts
├── tailwind.config.ts             # Shared Tailwind config
└── package.json
```

### 2. Theme Provider Integration

Ensure workflow viewer respects parent theme:

```typescript
// WorkflowViewer.tsx
import { useEffect } from 'react'

export function WorkflowViewer({ theme }: { theme?: 'light' | 'dark' }) {
  useEffect(() => {
    // Apply theme class to workflow container
    const container = document.getElementById('workflow-root')
    if (container) {
      container.classList.toggle('dark', theme === 'dark')
    }
  }, [theme])

  return (
    <div id="workflow-root" className="workflow-viewer">
      {/* Content */}
    </div>
  )
}
```

### 3. CSS Variable Strategy

**Define workflow-specific variables that inherit from Knutpunkt**:

```css
/* workflow.css */
@layer components {
  .workflow-viewer {
    /* Inherit Knutpunkt theme variables */
    --workflow-bg: var(--background);
    --workflow-text: var(--foreground);
    --workflow-border: var(--border);

    /* Workflow-specific semantic colors */
    --workflow-node-pending: var(--muted);
    --workflow-node-running: var(--primary);
    --workflow-node-success: var(--ctp-green);
    --workflow-node-error: var(--destructive);

    /* Layout variables */
    --workflow-node-size: 120px;
    --workflow-edge-width: 2px;
    --workflow-spacing: var(--spacing);
  }
}
```

### 4. Component API Design

Align props API with Knutpunkt patterns:

```typescript
interface WorkflowViewerProps {
  apiBaseUrl: string
  instanceId?: string
  onInstanceSelect?: (id: string) => void

  // Theme integration
  theme?: 'light' | 'dark'

  // Layout options
  direction?: 'LR' | 'TB' | 'RL' | 'BT'
  compact?: boolean

  // Feature flags
  showMetadata?: boolean
  showTimestamps?: boolean
  enableInteractive?: boolean

  // Callbacks
  onNodeClick?: (nodeId: string) => void
  onError?: (error: Error) => void

  // Styling overrides (use sparingly)
  className?: string
}
```

---

## Implementation Checklist

### Phase 1: Dependency Alignment
- [ ] Add Radix UI primitives to workflow-viewer dependencies
- [ ] Add Tailwind CSS v4 configuration
- [ ] Add CVA, clsx, tailwind-merge utilities
- [ ] Add Lucide React for icons
- [ ] Remove or minimize custom CSS bundle

### Phase 2: Theme Integration
- [ ] Replace hardcoded colors with CSS variables
- [ ] Implement `.dark` class support
- [ ] Map workflow states to Catppuccin colors
- [ ] Test light/dark mode switching
- [ ] Ensure WCAG contrast compliance

### Phase 3: Component Refactoring
- [ ] Replace custom modals with Radix Dialog
- [ ] Replace custom dropdowns with Radix Select
- [ ] Use Lucide icons throughout
- [ ] Apply CVA variants to all components
- [ ] Match Knutpunkt's typography scale
- [ ] Apply consistent spacing/radius/shadows

### Phase 4: Testing & Documentation
- [ ] Visual regression tests (Storybook)
- [ ] Theme switching tests
- [ ] Accessibility audit (axe-core)
- [ ] Update component documentation
- [ ] Create Storybook stories for all states
- [ ] Document theme customization API

---

## Example: Node Component Refactor

### Before (Current State)
```tsx
// Likely hardcoded styles
<div style={{
  background: '#f0f0f0',
  border: '1px solid #ccc',
  borderRadius: '8px',
  padding: '16px',
}}>
  <span style={{ color: '#333' }}>Node Label</span>
</div>
```

### After (Harmonized)
```tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

const nodeVariants = cva(
  "rounded-lg border transition-all duration-200 p-4 flex items-center gap-3",
  {
    variants: {
      status: {
        pending: "bg-muted/50 text-muted-foreground border-border",
        running: "bg-primary/10 text-primary border-primary shadow-md",
        success: "bg-ctp-green/10 text-ctp-green border-ctp-green",
        error: "bg-destructive/10 text-destructive border-destructive",
      },
      size: {
        sm: "px-3 py-2 text-sm",
        md: "px-4 py-3 text-base",
        lg: "px-6 py-4 text-lg",
      }
    },
    defaultVariants: {
      status: "pending",
      size: "md",
    }
  }
)

interface WorkflowNodeProps extends VariantProps<typeof nodeVariants> {
  label: string
  className?: string
}

export function WorkflowNode({ label, status, size, className }: WorkflowNodeProps) {
  const StatusIcon = {
    pending: Clock,
    running: Clock,
    success: CheckCircle,
    error: XCircle,
  }[status || 'pending']

  return (
    <div className={cn(nodeVariants({ status, size }), className)}>
      <StatusIcon className="h-5 w-5" />
      <span className="font-mono text-sm">{label}</span>
    </div>
  )
}
```

---

## Testing Strategy

### 1. Visual Regression Testing
Use Storybook with Chromatic:
```tsx
// WorkflowNode.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { WorkflowNode } from './WorkflowNode'

const meta: Meta<typeof WorkflowNode> = {
  title: 'Workflow/WorkflowNode',
  component: WorkflowNode,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof WorkflowNode>

export const LightMode: Story = {
  args: {
    label: 'Build Step',
    status: 'running',
  },
}

export const DarkMode: Story = {
  args: {
    label: 'Build Step',
    status: 'running',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
}

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <WorkflowNode label="Pending" status="pending" />
      <WorkflowNode label="Running" status="running" />
      <WorkflowNode label="Success" status="success" />
      <WorkflowNode label="Error" status="error" />
    </div>
  ),
}
```

### 2. Theme Switching Tests
```typescript
// WorkflowViewer.test.tsx
import { render, screen } from '@testing-library/react'
import { WorkflowViewer } from './WorkflowViewer'

describe('WorkflowViewer Theme Integration', () => {
  it('applies dark class when theme is dark', () => {
    const { container } = render(<WorkflowViewer theme="dark" />)
    expect(container.firstChild).toHaveClass('dark')
  })

  it('uses Catppuccin colors for status states', () => {
    render(<WorkflowViewer theme="light" />)
    const successNode = screen.getByTestId('node-success')
    const styles = window.getComputedStyle(successNode)
    // Verify it uses CSS variable, not hardcoded color
    expect(styles.getPropertyValue('color')).toContain('var(--ctp-green)')
  })
})
```

### 3. Accessibility Testing
```bash
# Run axe-core in tests
npm install --save-dev @axe-core/playwright

# In test
import { injectAxe, checkA11y } from '@axe-core/playwright'

test('workflow viewer is accessible', async ({ page }) => {
  await page.goto('/workflow')
  await injectAxe(page)
  await checkA11y(page)
})
```

---

## Migration Path

### Option 1: Gradual Migration (Recommended)
1. **Phase 1**: Add theming support without breaking existing functionality
   - Introduce CSS variables alongside hardcoded colors
   - Add `theme` prop to all components
   - Maintain backward compatibility

2. **Phase 2**: Replace custom components with Radix primitives
   - One component at a time (dialogs → selects → collapsibles)
   - Keep old implementations as fallbacks

3. **Phase 3**: Full Tailwind adoption
   - Replace inline styles with Tailwind classes
   - Remove bundled CSS
   - Publish new major version

### Option 2: Hard Break (Faster, Breaking Changes)
1. Rewrite components from scratch using Knutpunkt patterns
2. Publish as new major version with migration guide
3. Provide codemod scripts for automatic migration

---

## Documentation Requirements

### 1. Theme Customization Guide
Document how to customize colors for specific use cases:
```typescript
// Custom theme override example
<WorkflowViewer
  theme="dark"
  customColors={{
    nodeSuccess: '#00ff00',  // Override if needed
    nodeError: '#ff0000',
  }}
/>
```

### 2. Integration Examples
Provide examples for common Knutpunkt integration scenarios:
```tsx
// Example: Embedded in TaskDialog
import { WorkflowViewer } from '@dirigent/workflow-viewer'
import { useThemeStore } from '@/stores/themeStore'

export function TaskWorkflowDialog() {
  const theme = useThemeStore((state) => state.theme)

  return (
    <Dialog>
      <DialogContent className="max-w-4xl">
        <WorkflowViewer
          theme={theme}
          apiBaseUrl={import.meta.env.VITE_WORKFLOW_API_URL}
          className="h-[600px]"
        />
      </DialogContent>
    </Dialog>
  )
}
```

### 3. Troubleshooting Guide
Common issues and solutions:
- Theme not applying → Check `.dark` class propagation
- Colors look wrong → Verify CSS variable inheritance
- Layout broken → Check for conflicting CSS specificity

---

## Performance Considerations

### 1. Bundle Size
- **Current Risk**: Bundling Radix + Tailwind increases size
- **Mitigation**:
  - Tree-shake unused components
  - Use dynamic imports for large visualization libraries
  - Separate core and visualization bundles

### 2. Theme Switching
- **Concern**: Avoid FOUC (Flash of Unstyled Content) when switching themes
- **Solution**: Use CSS variables for instant switching
  ```tsx
  // No re-render needed, just class toggle
  document.documentElement.classList.toggle('dark')
  ```

### 3. Large Workflow Graphs
- **Optimization**: Virtualize node rendering for workflows with >100 nodes
- **Library**: `react-window` or `@tanstack/react-virtual`

---

## Resources

### Catppuccin
- [Catppuccin Tailwind Plugin](https://github.com/catppuccin/tailwindcss)
- [Catppuccin Palette](https://github.com/catppuccin/catppuccin)

### Radix UI
- [Radix Primitives](https://www.radix-ui.com/primitives)
- [Radix Themes](https://www.radix-ui.com/themes)

### Tailwind CSS
- [Tailwind v4 Docs](https://tailwindcss.com/docs)
- [Dark Mode Guide](https://tailwindcss.com/docs/dark-mode)

### Tools
- [CVA Documentation](https://cva.style/docs)
- [Storybook Theming](https://storybook.js.org/docs/react/configure/theming)
- [axe DevTools](https://www.deque.com/axe/devtools/)

---

## Summary

**Key Takeaways**:
1. **Replace bundled CSS** with Tailwind utilities using Knutpunkt's CSS variables
2. **Adopt Radix UI** for all interactive primitives (dialogs, selects, etc.)
3. **Use CVA** for type-safe variant management across all components
4. **Map workflow states** to Catppuccin semantic colors (green/red/blue/yellow)
5. **Respect theme context** by detecting `.dark` class and using CSS variables
6. **Maintain consistency** with Knutpunkt's spacing, typography, and shadow scales
7. **Test thoroughly** with Storybook stories for both light and dark modes
8. **Document clearly** how to integrate and customize for downstream consumers

By following this guide, the `@dirigent/workflow-viewer` will seamlessly integrate into Knutpunkt's design system while maintaining its own modularity and reusability.
