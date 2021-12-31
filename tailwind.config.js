module.exports = {
  mode: 'jit',
  content: ['./src/**/*.{js,jsx,ts,tsx,mdx}'],
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
    require('@tailwindcss/typography'),
  ],
  daisyui: {
    themes: [
      'corporate', // default theme
      // 'dark',
    ],
  },
}
