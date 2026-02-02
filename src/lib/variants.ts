/**
 * CVA (Class Variance Authority) variant definitions
 *
 * This file contains type-safe variant definitions for workflow components.
 * Variants will be expanded in subsequent phases as components are migrated.
 */

import { cva } from 'class-variance-authority'

/**
 * Base node variants for workflow visualization
 *
 * This is a foundational variant that will be extended with more
 * specific node types and execution states in Phase 4.
 */
export const nodeVariants = cva(
  'rounded-lg border transition-colors duration-200',
  {
    variants: {
      status: {
        pending: 'bg-muted/50 text-muted-foreground border-border opacity-50',
        running: 'bg-primary/10 text-primary border-primary shadow-md',
        success: 'bg-ctp-green/10 text-ctp-green border-ctp-green',
        error: 'bg-destructive/10 text-destructive border-destructive',
      },
      size: {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-3 text-base',
        lg: 'px-6 py-4 text-lg',
      },
    },
    defaultVariants: {
      status: 'pending',
      size: 'md',
    },
  }
)

/**
 * Instance browser item variants
 *
 * Used for styling workflow instance items in the InstanceBrowser component.
 * Matches WorkflowBrowser styling: thin borders, subtle appearance, colors only on selection.
 * Uses bg-card for theme-aware background (white in light mode, dark card color in dark mode).
 */
export const instanceItemVariants = cva(
  'rounded-md border p-3 cursor-pointer transition-all duration-200 bg-card text-foreground text-left relative',
  {
    variants: {
      status: {
        RUNNING: '',
        COMPLETED: '',
        FAILED: '',
      },
      selected: {
        true: '',
        false: 'border-border hover:border-muted-foreground hover:bg-muted/10',
      },
    },
    compoundVariants: [
      // Only apply colored styling when SELECTED
      {
        selected: true,
        status: 'RUNNING',
        class: 'bg-primary/10 border-primary',
      },
      {
        selected: true,
        status: 'COMPLETED',
        class: 'bg-ctp-green/10 border-ctp-green',
      },
      {
        selected: true,
        status: 'FAILED',
        class: 'bg-destructive/10 border-destructive',
      },
    ],
    defaultVariants: {
      selected: false,
    },
  }
)

/**
 * Status badge variants
 *
 * Used for status indicators in the InstanceBrowser and other components.
 * Uses theme-aware foreground colors that work in both light and dark modes.
 */
export const statusBadgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold gap-1.5',
  {
    variants: {
      status: {
        RUNNING: 'bg-primary text-primary-foreground',
        COMPLETED: 'bg-ctp-green text-primary-foreground',
        FAILED: 'bg-destructive text-destructive-foreground',
      },
    },
  }
)

/**
 * Workflow node variants for React Flow nodes
 *
 * Base styling for workflow step nodes with execution state support.
 * Does NOT include inline CSS class names from nodes.css - those remain for backward compatibility.
 */
export const workflowNodeBaseVariants = cva(
  '', // Empty base - node styling comes from CSS classes (llm-node, tool-node, etc.)
  {
    variants: {
      executionStatus: {
        pending: 'node-pending',
        running: 'node-running',
        completed: 'node-completed',
        failed: 'node-failed',
        skipped: 'node-skipped',
      },
      onExecutionPath: {
        true: 'on-execution-path',
        false: '',
      },
      isCurrentStep: {
        true: 'current-step',
        false: '',
      },
    },
    compoundVariants: [
      {
        onExecutionPath: true,
        executionStatus: 'completed',
        class: 'on-execution-path',
      },
    ],
  }
)

/**
 * Special node variants (circular nodes: start, end, fail-terminal, trigger)
 *
 * Does NOT include base CSS class - those remain in nodes.css for backward compatibility.
 */
export const specialNodeVariants = cva(
  '', // Empty base - styling comes from CSS classes (start-node, end-node, etc.)
  {
    variants: {
      executionStatus: {
        pending: 'node-pending',
        running: 'node-running',
        completed: 'node-completed',
        failed: 'node-failed',
        skipped: 'node-skipped',
      },
      onExecutionPath: {
        true: 'on-execution-path',
        false: '',
      },
      isCurrentStep: {
        true: 'current-step',
        false: '',
      },
    },
  }
)
