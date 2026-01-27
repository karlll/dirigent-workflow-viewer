/**
 * Utility functions for className management
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges class names using clsx and tailwind-merge
 *
 * This utility combines clsx for conditional classes and tailwind-merge
 * to intelligently merge Tailwind CSS classes, resolving conflicts.
 *
 * @example
 * cn('px-2 py-1', condition && 'bg-primary', 'px-4')
 * // Returns: 'py-1 bg-primary px-4' (px-4 overrides px-2)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
