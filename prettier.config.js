/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
  semi: true,
  singleQuote: true,
  bracketSpacing: false,
  bracketSameLine: true,
  arrowParens: 'avoid',
  trailingComma: 'all',
  printWidth: 100,
  parser: 'typescript',
};

export default config;
