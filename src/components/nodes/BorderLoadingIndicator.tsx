import { type ReactNode } from 'react'

/**
 * BorderLoadingIndicator
 *
 * Adds an animated spinning gradient border around the currently executing node.
 * Inspired by React Flow's BorderLoadingIndicator component.
 *
 * The conic gradient spins around the node creating a "loading" effect.
 * Colors are designed to work well in both light and dark modes.
 */
export const BorderLoadingIndicator = ({ children }: { children: ReactNode }) => {
  return (
    <>
      {/* Animated border container */}
      <div className="absolute -top-px -left-px h-[calc(100%+2px)] w-[calc(100%+2px)] pointer-events-none">
        <style>
          {`
            @keyframes border-spin {
              from { transform: translate(-50%, -50%) rotate(0deg); }
              to { transform: translate(-50%, -50%) rotate(360deg); }
            }
            .border-spinner {
              animation: border-spin 2s linear infinite;
              position: absolute;
              left: 50%;
              top: 50%;
              width: 140%;
              aspect-ratio: 1;
              transform-origin: center;
            }
          `}
        </style>
        <div className="absolute inset-0 overflow-hidden rounded-[8px]">
          {/* Conic gradient spinner - uses CSS variables for theme-aware colors */}
          <div
            className="border-spinner rounded-full"
            style={{
              background: 'conic-gradient(from 0deg at 50% 50%, #f59e0b 0deg, rgba(245, 158, 11, 0) 360deg)'
            }}
          />
        </div>
      </div>
      {children}
    </>
  )
}