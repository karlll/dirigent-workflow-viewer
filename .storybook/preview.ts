import type { Preview } from '@storybook/react-vite'
import { initialize, mswLoader } from 'msw-storybook-addon'

// Import CSS (order matters: theme first, then Tailwind, then component styles)
import '../src/styles/theme.css'
import '../src/styles/tailwind.css'
import '@xyflow/react/dist/style.css'
import '../src/styles/nodes.css'
import '../src/styles/execution.css'

// Initialize MSW
initialize()

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
  loaders: [mswLoader],
};

export default preview;