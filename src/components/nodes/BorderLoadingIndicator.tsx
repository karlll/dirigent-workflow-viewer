import { type ReactNode } from 'react'

/**
 * BorderLoadingIndicator
 *
 * Adds an animated spinning gradient border around the currently executing node.
 * Inspired by React Flow's BorderLoadingIndicator component.
 *
 * Creates a border-only animation by using a spinning gradient masked to show
 * only the border edge. The border stays static while the gradient sweeps around it.
 */
export const BorderLoadingIndicator = ({ children }: { children: ReactNode }) => {
  return (
    <>
      {/* Animated border effect - static border mask with rotating gradient behind */}
      <div className="absolute -top-px -left-px h-[calc(100%+2px)] w-[calc(100%+2px)] pointer-events-none">
        <style>
          {`
            @keyframes border-spin {
              from { transform: translate(-50%, -50%) rotate(0deg); }
              to { transform: translate(-50%, -50%) rotate(360deg); }
            }
            .border-container {
              position: absolute;
              inset: 0;
              border-radius: 8px;
              padding: 2px;
              /* Create border mask - shows only the border area */
              -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
              -webkit-mask-composite: xor;
              mask-composite: exclude;
              overflow: hidden;
            }
            .border-gradient {
              position: absolute;
              left: 50%;
              top: 50%;
              width: 140%;
              height: 140%;
              animation: border-spin 3.5s linear infinite;
              background: conic-gradient(
                from 0deg at 50% 50%,
                transparent 0deg,
                transparent 200deg,
                rgba(251, 146, 60, 0.3) 240deg,
                rgba(251, 146, 60, 0.6) 270deg,
                #fb923c 300deg,
                #f59e0b 320deg,
                #fb923c 340deg,
                rgba(251, 146, 60, 0.6) 350deg,
                rgba(251, 146, 60, 0.3) 355deg,
                transparent 360deg
              );
            }
          `}
        </style>
        <div className="border-container">
          <div className="border-gradient" />
        </div>
      </div>
      {children}
    </>
  )
}