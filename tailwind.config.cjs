/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src-svelte/**/*.{svelte,js,ts}'],
  theme: {
    extend: {
      gridTemplateColumns: {
        leaderboard: 'auto 1fr auto'
      }
    }
  },
  plugins: []
};
