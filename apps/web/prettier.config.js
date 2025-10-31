/** @type {import('prettier').Config} */
export default {
  plugins: ['prettier-plugin-tailwindcss'],

  // ✅ Code style preferences
  semi: false, // No semicolons
  singleQuote: true, // Prefer single quotes
  tabWidth: 2, // 2 spaces per tab
  trailingComma: 'es5', // Add trailing commas where valid in ES5
  printWidth: 100, // Good balance between readability and width
  bracketSpacing: true, // Add spaces inside object braces
  arrowParens: 'avoid', // Avoid parentheses for single-arg arrow functions

  // ✅ Optional modern flags
  endOfLine: 'lf', // Consistent line endings (important for Linux)
  useTabs: false, // Always use spaces for indentation
}
