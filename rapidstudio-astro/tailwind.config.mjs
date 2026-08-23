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
        // The cool family is sampled from the hero footage rather than picked:
        // its shadows sit at #0B3837, its lit edges at #148C92 and its speculars
        // at #51D7DF. The old moss green and dusty sky appeared nowhere in the
        // film, which is exactly why those sections read as a different site.
        deep:   '#0B2A2B',   // cool shadow, the ink of the teal side
        teal:   '#148C92',   // the rim light on the barrel
        cyan:   '#51D7DF',   // the specular on the glass
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
