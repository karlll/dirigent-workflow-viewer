# Workflow Viewer Harmonization - Implementation Plan

## Executive Summary

This document outlines the implementation plan to harmonize the `@dirigent/workflow-viewer` with the Knutpunkt frontend's design system based on the `notes/workflow-viewer-harmonization-guide.md`.

## Current State Analysis

### ✅ Already Aligned
- **Icons**: Using `lucide-react@^0.468.0` (target: `^0.555.0` - minor version diff, compatible)
- **Dark Mode**: Already supports `.dark` class strategy
- **Some Catppuccin Colors**: Already using Catppuccin colors in CSS (but hardcoded, not as variables)
- **React Flow**: Good foundation for visualization

### ❌ Gaps to Address

1. **Dependencies**
   - Missing: Tailwind CSS v4
   - Missing: `class-variance-authority` (CVA)
   - Missing: `clsx` and `tailwind-merge`
   - Missing: Radix UI primitives

2. **Styling Architecture**
   - Currently: 732 lines of custom CSS with hardcoded colors
   - Target: Tailwind utilities + CSS variables
   - Issue: Inline styles in InstanceBrowser and other components

3. **Theme System**
   - Currently: Hardcoded Catppuccin colors
   - Target: CSS variables inheriting from Knutpunkt theme
   - Issue: No CSS variable abstraction layer

4. **Typography**
   - Currently: Generic system fonts
   - Target: Montserrat (sans), Fira Code (mono)

5. **Component Architecture**
   - Currently: No Radix UI usage
   - Target: Replace any modal/dialog/dropdown with Radix primitives

## Implementation Strategy

### Approach: Gradual Migration (Recommended)

This approach maintains backward compatibility while incrementally adopting the new design system. Each phase can be committed separately.

---

## Phase 1: Foundation - Dependencies & Utilities

**Goal**: Add required dependencies and create utility infrastructure without breaking existing functionality.

### Changes Required

#### 1.1 Add Dependencies

```bash
npm install --save class-variance-authority clsx tailwind-merge
npm install --save-dev tailwindcss@next @catppuccin/tailwindcss
```

#### 1.2 Create Utility Files

**File**: `src/lib/utils.ts`
```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**File**: `src/lib/variants.ts`
```typescript
import { cva } from 'class-variance-authority'

// Example node variant (will be expanded in Phase 4)
export const nodeVariants = cva(
  "rounded-lg border transition-colors",
  {
    variants: {
      status: {
        pending: "bg-muted/50 text-muted-foreground border-border opacity-50",
        running: "bg-primary/10 text-primary border-primary",
        success: "bg-ctp-green/10 text-ctp-green border-ctp-green",
        error: "bg-destructive/10 text-destructive border-destructive",
      }
    }
  }
)
```

#### 1.3 Tailwind Configuration

**File**: `tailwind.config.ts`
```typescript
import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Catppuccin Latte (light) & Mocha (dark)
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        'ctp-green': 'var(--ctp-green)',
        'ctp-yellow': 'var(--ctp-yellow)',
        'ctp-peach': 'var(--ctp-peach)',
        'ctp-lavender': 'var(--ctp-lavender)',
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
} satisfies Config
```

#### 1.4 Add Tailwind Directives

**File**: `src/styles/tailwind.css` (new)
```css
@import 'tailwindcss';
```

### Commit 1: Dependencies and utilities
```
chore(deps): add Tailwind CSS v4, CVA, and utility libraries

Add dependencies for Knutpunkt design system alignment:
- tailwindcss@next with Catppuccin plugin
- class-variance-authority for type-safe variants
- clsx and tailwind-merge for className utilities

Create utility infrastructure:
- cn() helper for merging class names
- variants.ts for CVA variant definitions
- tailwind.config.ts with Catppuccin colors
- tailwind.css entry point

Part of workflow-viewer harmonization with Knutpunkt frontend.
```

---

## Phase 2: Theme System - CSS Variables

**Goal**: Replace hardcoded colors with CSS variables that can inherit from Knutpunkt's theme.

### Changes Required

#### 2.1 Create Theme CSS

**File**: `src/styles/theme.css` (new)
```css
@layer base {
  :root {
    /* Light mode (Catppuccin Latte) */
    --background: #eff1f5;
    --foreground: #4c4f69;
    --primary: #1e66f5;
    --destructive: #d20f39;
    --border: #acb0be;
    --muted: #e6e9ef;
    --muted-foreground: #6c6f85;

    --ctp-green: #40a02b;
    --ctp-yellow: #df8e1d;
    --ctp-peach: #fe640b;
    --ctp-lavender: #7287fd;
    --ctp-mauve: #8839ef;
    --ctp-blue: #1e66f5;

    --radius: 0.35rem;
  }

  .dark {
    /* Dark mode (Catppuccin Mocha) */
    --background: #1e1e2e;
    --foreground: #cdd6f4;
    --primary: #89b4fa;
    --destructive: #f38ba8;
    --border: #585b70;
    --muted: #313244;
    --muted-foreground: #a6adc8;

    --ctp-green: #a6e3a1;
    --ctp-yellow: #f9e2af;
    --ctp-peach: #fab387;
    --ctp-lavender: #b4befe;
    --ctp-mauve: #cba6f7;
    --ctp-blue: #89b4fa;
  }
}

@layer components {
  .workflow-viewer {
    /* Workflow-specific semantic colors */
    --workflow-node-pending: var(--muted);
    --workflow-node-running: var(--primary);
    --workflow-node-success: var(--ctp-green);
    --workflow-node-error: var(--destructive);
    --workflow-node-llm: var(--ctp-mauve);
    --workflow-node-tool: var(--ctp-blue);
    --workflow-node-switch: var(--ctp-yellow);
    --workflow-node-fail: var(--destructive);
  }
}
```

#### 2.2 Update Existing CSS to Use Variables

Gradually replace hardcoded colors in `src/styles/nodes.css` and `src/styles/execution.css` with CSS variables.

**Example changes in nodes.css**:
```css
/* Before */
.llm-node {
  border-color: #cba6f7;
}

/* After */
.llm-node {
  border-color: var(--ctp-mauve);
}
```

### Commit 2: Theme system with CSS variables
```
refactor(theme): implement CSS variable system for theming

Replace hardcoded colors with CSS variables:
- Create theme.css with Catppuccin Latte/Mocha variables
- Update nodes.css to use CSS variables
- Update execution.css to use CSS variables
- Define workflow-specific semantic color mappings

This enables theme inheritance from Knutpunkt and simplifies
customization without breaking existing functionality.

Part of workflow-viewer harmonization with Knutpunkt frontend.
```

---

## Phase 3: Component Migration - InstanceBrowser

**Goal**: Refactor InstanceBrowser to use Tailwind classes and CVA variants. This is isolated from workflow visualization and can be done independently.

### Changes Required

#### 3.1 Create InstanceBrowser Variants

**Add to**: `src/lib/variants.ts`
```typescript
export const instanceItemVariants = cva(
  "rounded-lg border-2 p-3 cursor-pointer transition-all",
  {
    variants: {
      status: {
        RUNNING: "bg-primary/10 border-primary",
        COMPLETED: "bg-ctp-green/10 border-ctp-green",
        FAILED: "bg-destructive/10 border-destructive",
      },
      selected: {
        true: "ring-2 ring-offset-2",
        false: "hover:border-border hover:bg-muted/50",
      },
    },
    defaultVariants: {
      selected: false,
    },
  }
)

export const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      status: {
        RUNNING: "bg-primary text-white",
        COMPLETED: "bg-ctp-green text-white",
        FAILED: "bg-destructive text-white",
      },
    },
  }
)
```

#### 3.2 Refactor InstanceBrowser Component

Replace inline styles with Tailwind classes and CVA variants.

**Key changes**:
- Remove all `style={}` props
- Use `className={cn(variants({ ... }), additionalClasses)}`
- Use Tailwind spacing/typography scale

### Commit 3: Refactor InstanceBrowser with Tailwind and CVA
```
refactor(InstanceBrowser): migrate to Tailwind classes and CVA variants

Replace inline styles with Tailwind utilities:
- Use instanceItemVariants and statusBadgeVariants from CVA
- Apply consistent spacing with Tailwind scale (gap-4, p-3, etc.)
- Use semantic color variables (bg-primary, text-foreground, etc.)
- Remove hardcoded style objects

Benefits:
- Responds to parent theme automatically
- Type-safe variants
- Smaller runtime CSS
- Consistent with Knutpunkt design patterns

Part of workflow-viewer harmonization with Knutpunkt frontend.
```

---

## Phase 4: Node Components Refactoring

**Goal**: Migrate node components (ToolNode, LlmNode, etc.) to use Tailwind + CVA while preserving all functionality.

### Changes Required

#### 4.1 Define Node Variants

**Expand in**: `src/lib/variants.ts`
```typescript
export const workflowNodeVariants = cva(
  "rounded-lg border-2 shadow-md transition-all min-w-[200px] max-w-[300px] bg-card",
  {
    variants: {
      nodeType: {
        llm: "border-ctp-mauve",
        tool: "border-ctp-blue",
        switch: "border-ctp-yellow",
        fail: "border-destructive bg-destructive/5",
      },
      executionStatus: {
        pending: "opacity-50",
        running: "bg-primary/10 border-primary",
        completed: "bg-ctp-green/10 border-ctp-green",
        failed: "bg-destructive/10 border-destructive",
        skipped: "opacity-30 grayscale",
      },
      onExecutionPath: {
        true: "ring-2 ring-primary shadow-lg",
        false: "",
      },
      isCurrentStep: {
        true: "border-ctp-peach animate-pulse",
        false: "",
      },
    },
    compoundVariants: [
      {
        onExecutionPath: true,
        executionStatus: "completed",
        class: "border-primary",
      },
    ],
  }
)

export const nodeHeaderVariants = cva(
  "p-2 border-b",
  {
    variants: {
      nodeType: {
        llm: "bg-gradient-to-br from-ctp-mauve/80 to-ctp-mauve/60",
        tool: "bg-gradient-to-br from-ctp-blue/80 to-ctp-blue/60",
        switch: "bg-gradient-to-br from-ctp-yellow/80 to-ctp-yellow/60",
        fail: "bg-gradient-to-br from-destructive/80 to-destructive/60 text-white",
      },
    },
  }
)
```

#### 4.2 Refactor Node Components

For each node type (ToolNode, LlmNode, SwitchNode, FailNode):
1. Remove CSS class names
2. Apply Tailwind classes via CVA variants
3. Use `cn()` helper for conditional classes
4. Preserve all execution state logic

**Example for ToolNode**:
```typescript
const nodeClassName = cn(
  workflowNodeVariants({
    nodeType: 'tool',
    executionStatus: execution?.status,
    onExecutionPath: execution?.isOnExecutionPath,
    isCurrentStep: execution?.isCurrentStep,
  })
)
```

### Commit 4: Refactor workflow node components with Tailwind and CVA
```
refactor(nodes): migrate node components to Tailwind and CVA

Refactor all node types to use Tailwind utilities:
- ToolNode, LlmNode, SwitchNode, FailNode, special nodes
- Replace CSS classes with CVA variants
- Use workflowNodeVariants and nodeHeaderVariants
- Apply Tailwind typography (font-sans, font-mono)
- Maintain all execution state visualization logic

Benefits:
- Nodes now respond to theme changes automatically
- Consistent with Knutpunkt's component patterns
- Type-safe styling with CVA
- Reduced CSS bundle size

Part of workflow-viewer harmonization with Knutpunkt frontend.
```

---

## Phase 5: Cleanup and Documentation

**Goal**: Remove old CSS files, update build configuration, and document the new theming system.

### Changes Required

#### 5.1 Remove Old CSS Files

- Delete or significantly reduce `src/styles/nodes.css`
- Delete or significantly reduce `src/styles/execution.css`
- Keep minimal CSS only for React Flow integration

#### 5.2 Update Build Configuration

**Update**: `vite.config.ts`
```typescript
import tailwindcss from 'tailwindcss'

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
      ],
    },
  },
  // ... rest of config
})
```

#### 5.3 Update Entry Point

**Update**: `src/index.ts`
```typescript
// Import Tailwind and theme first
import './styles/tailwind.css'
import './styles/theme.css'

// Then React Flow styles
import '@xyflow/react/dist/style.css'

// ... rest of exports
```

#### 5.4 Update Documentation

Update README.md to document:
- New theme system
- How to customize colors via CSS variables
- Migration guide for consumers

### Commit 5: Cleanup CSS and update documentation
```
refactor: remove legacy CSS and finalize harmonization

Cleanup and finalization:
- Remove old custom CSS files (nodes.css, execution.css)
- Configure Tailwind PostCSS in Vite
- Update build to include Tailwind processing
- Update README with theme customization guide
- Add THEME_GUIDE.md for advanced customization

Completes workflow-viewer harmonization with Knutpunkt frontend.
All components now use:
- Tailwind CSS v4 utilities
- CSS variables for theming
- CVA for type-safe variants
- Catppuccin color palette
```

---

## Optional Phase 6: Radix UI Integration

**Goal**: Replace any custom modal/dialog/dropdown components with Radix UI primitives (if applicable).

**Note**: Current implementation doesn't seem to have modals/dialogs, so this may not be necessary. Can be done later if needed.

---

## Testing Strategy

### For Each Phase

1. **Visual Regression**:
   - Run Storybook: `npm run storybook`
   - Verify all stories render correctly in both light and dark modes
   - Check that node colors match Catppuccin palette

2. **Unit Tests**:
   - Run tests: `npm test`
   - Ensure all existing tests pass
   - Add new tests for variant functions

3. **Integration Testing**:
   - Test in Knutpunkt frontend after each phase
   - Verify theme switching works correctly
   - Check that components inherit theme from parent

### Acceptance Criteria

- [ ] All components respond to `.dark` class theme switching
- [ ] Colors match Catppuccin palette (Latte for light, Mocha for dark)
- [ ] Typography uses Montserrat (sans) and Fira Code (mono)
- [ ] Spacing follows Tailwind scale
- [ ] All existing tests pass
- [ ] No visual regressions in Storybook
- [ ] Bundle size does not increase significantly

---

## Rollback Strategy

Each phase is independently committable. If issues arise:

1. **Rollback via Git**: `git revert <commit-hash>`
2. **Phase Independence**: Each phase can be reverted without affecting others
3. **Gradual Adoption**: Old CSS remains alongside new styles during migration

---

## Timeline Estimate

- **Phase 1**: 2-3 hours (dependencies, config, utilities)
- **Phase 2**: 3-4 hours (CSS variable migration)
- **Phase 3**: 2-3 hours (InstanceBrowser refactor)
- **Phase 4**: 4-6 hours (node components refactor)
- **Phase 5**: 2-3 hours (cleanup, documentation)

**Total**: ~15-20 hours of development time

---

## Summary

This phased approach provides:

1. **Incremental Value**: Each commit delivers a functional improvement
2. **Low Risk**: Changes are isolated and reversible
3. **Clear Progress**: 5 well-defined milestones
4. **Backward Compatible**: No breaking changes during migration
5. **Test Coverage**: Each phase has clear testing criteria

The workflow-viewer will be fully harmonized with Knutpunkt's design system while maintaining all existing functionality.
