module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'airbnb',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: './',
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', '@typescript-eslint', 'import', 'prettier'],
  rules: {
    // needed by prettier
    'prettier/prettier': 'warn',
    'arrow-body-style': 'off',
    'prefer-arrow-callback': 'off',
    // allow jsx in typescript files
    'react/jsx-filename-extension': [
      2,
      {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    ],
    // from google/gts
    'block-scoped-var': 'error',
    'eqeqeq': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'eol-last': 'error',
    'no-trailing-spaces': 'error',
    'quotes': ['warn', 'single', { avoidEscape: true }],
    'no-restricted-properties': [
      'error',
      {
        object: 'describe',
        property: 'only',
      },
      {
        object: 'it',
        property: 'only',
      },
    ],
    'react/function-component-definition': [
      2,
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function',
      },
    ],
    'import/extensions': [
      'error',
      'never',
      {
        svg: 'always',
      },
    ],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-explicit-any': 'off',
    'react/destructuring-assignment': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/require-default-props': 'off',
    'react/no-array-index-key': 'off',
    'react/jsx-no-constructed-context-values': 'off',
    'no-empty-function': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    'no-console': 'off',
  },
  settings: {
    'import/resolver': {
      node: {},
      typescript: {},
    },
  },
};
