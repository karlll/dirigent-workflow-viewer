/**
 * Utility for conditionally joining class names together.
 * Simple implementation to avoid adding the classnames package as a dependency.
 *
 * @example
 * ```typescript
 * classNames('base', { 'active': isActive, 'disabled': isDisabled })
 * // Returns: "base active" (if isActive is true and isDisabled is false)
 * ```
 */
export function classNames(
  ...args: (string | Record<string, boolean | undefined> | undefined | null | false)[]
): string {
  const classes: string[] = []

  for (const arg of args) {
    if (!arg) continue

    if (typeof arg === 'string') {
      classes.push(arg)
    } else if (typeof arg === 'object') {
      for (const [key, value] of Object.entries(arg)) {
        if (value) {
          classes.push(key)
        }
      }
    }
  }

  return classes.join(' ')
}
