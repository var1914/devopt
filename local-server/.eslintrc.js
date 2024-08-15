const { FlatCompat } = require('@eslint/eslintrc');
const path = require('path');

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  ...compat.config({
    root: true,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    env: {
      browser: true,
      node: true,
      es6: true,
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'warn',
      'no-undef': 'error',
    },
  }),
  {
    ignores: ["node_modules/", "dist/"],
  },
];