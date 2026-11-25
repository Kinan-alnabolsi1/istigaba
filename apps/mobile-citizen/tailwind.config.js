// NativeWind v4 + Tailwind CSS 3 (decision B4). Tokens come from @istigaba/config, so class names
// match the web apps (bg-background, text-muted-foreground, bg-sev-critical-bg …).
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset'), require('@istigaba/config/tailwind-preset')],
};
