/** @type {import('tailwindcss').Config} */
export default {
  content: ['./**/*.php', './src/**/*.js'],
  theme: {
    extend: {
      colors: {
        ink:   '#0A0A0A', coal: '#121212', smoke: '#1C1C1C', ash: '#2A2A2A',
        chalk: '#EDEAE6', flame: '#FF5A1F', ember: '#FF9142',
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
