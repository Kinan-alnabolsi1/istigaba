// Tailwind CSS 3 preset for NativeWind v4 (DESIGN_TOKENS.md §9.5, decision B4).
// Reads the generated css/tailwind-tokens.json so Tailwind's config loader never has to load TypeScript.
// Utility names match the web exactly: bg-sev-critical-bg, text-muted-foreground, rounded-lg …
const tokens = require('./css/tailwind-tokens.json');

const toVar = (keys) => Object.fromEntries(keys.map((k) => [k, `var(--${k})`]));

module.exports = {
  darkMode: 'class', // required by NativeWind colorScheme.set()
  theme: {
    extend: {
      colors: toVar(tokens.colors),
      borderRadius: tokens.radius,
      fontFamily: tokens.fontFamily,
    },
  },
};
