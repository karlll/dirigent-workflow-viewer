/**
 * PostCSS plugin to remove Tailwind's @layer base to prevent global CSS pollution
 */
export default function postcssRemoveBaseLayer() {
  return {
    postcssPlugin: 'postcss-remove-base-layer',
    Once(root) {
      root.walkAtRules('layer', (atRule) => {
        if (atRule.params === 'base') {
          atRule.remove();
        }
      });
    },
  };
}

postcssRemoveBaseLayer.postcss = true;
