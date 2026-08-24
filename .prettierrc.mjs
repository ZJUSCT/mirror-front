/** @type {import('prettier').Config} */
export default {
  plugins: ['prettier-plugin-astro'],
  singleQuote: true,
  trailingComma: 'es5',
  overrides: [
    {
      files: '*.astro',
      options: { parser: 'astro' },
    },
  ],
};
