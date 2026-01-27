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
 * Will be applied in Phase 3.
 */
export const instanceItemVariants = cva(
  'rounded-lg border-2 p-3 cursor-pointer transition-all duration-200',
  {
    variants: {
      status: {
        RUNNING: 'bg-primary/10 border-primary hover:bg-primary/20',
        COMPLETED: 'bg-ctp-green/10 border-ctp-green hover:bg-ctp-green/20',
        FAILED: 'bg-destructive/10 border-destructive hover:bg-destructive/20',
      },
      selected: {
        true: 'ring-2 ring-offset-2 ring-primary',
        false: 'hover:border-muted-foreground',
      },
    },
    compoundVariants: [
      {
        selected: true,
        status: 'RUNNING',
        class: 'ring-primary',
      },
      {
        selected: true,
        status: 'COMPLETED',
        class: 'ring-ctp-green',
      },
      {
        selected: true,
        status: 'FAILED',
        class: 'ring-destructive',
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
 */
export const statusBadgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold gap-1.5',
  {
    variants: {
      status: {
        RUNNING: 'bg-primary text-white',
        COMPLETED: 'bg-ctp-green text-white',
        FAILED: 'bg-destructive text-white',
      },
    },
  }
)
