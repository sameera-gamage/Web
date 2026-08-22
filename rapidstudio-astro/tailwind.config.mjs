/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts,jsx,tsx,md}'],
  theme: {
    extend: {
      colors: {
        ink:    '#12100E',   // near-black, warm not blue
        bone:   '#F2EDE4',   // paper
        clay:   '#E8DCC8',
        rust:   '#D6461F',   // primary accent, not a "AI purple"
        ochre:  '#E9A227',
        moss:   '#2F4F3A',
        sky:    '#8FB8C9',
        plum:   '#5B2A45',
      },
      fontFamily: {
        display: ['Syne', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans:    ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono:    ['"DM Mono"', 'ui-monospace', 'monospace'],
      },
      maxWidth: { edge: '1440px' },
    },
  },
  plugins: [],
};
