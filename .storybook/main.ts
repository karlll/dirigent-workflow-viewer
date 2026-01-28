import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import tailwindcss from '@tailwindcss/postcss';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
    "msw-storybook-addon"
  ],
  "framework": "@storybook/react-vite",
  "staticDirs": ["../public"],

  async viteFinal(config) {
    return mergeConfig(config, {
      css: {
        postcss: {
          plugins: [
            tailwindcss(),
          ],
        },
      },
    });
  },
};
export default config;