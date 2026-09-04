/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts,jsx,tsx,md}'],
  theme: {
    extend: {
      colors: {
        // Black and its neighbours, plus one orange. Nothing else — the old
        // paper/moss/plum palette is gone with the sections that used it.
        ink:    '#0A0A0A',   // the page
        coal:   '#121212',   // a panel lifted off the page
        smoke:  '#1C1C1C',   // a panel lifted off that
        ash:    '#2A2A2A',   // rules and edges
        chalk:  '#EDEAE6',   // type
        flame:  '#FF5A1F',   // the accent
        ember:  '#FF9142',   // the accent, lit
      },
      fontFamily: {
        display: ['Syne', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans:    ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono:    ['"DM Mono"', 'ui-monospace', 'monospace'],
      },
      maxWidth: { edge: '1680px' },
    },
  },
  plugins: [],
};
