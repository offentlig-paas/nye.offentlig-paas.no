/** @type {import('prettier').Options} */
module.exports = {
  singleQuote: true,
  semi: false,
  trailingComma: 'es5',
  tabWidth: 2,
  useTabs: false,
  printWidth: 80,
  endOfLine: 'lf',
  arrowParens: 'avoid',
  quoteProps: 'as-needed',
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindFunctions: ['clsx', 'tw'],
}
