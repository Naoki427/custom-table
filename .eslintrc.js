module.exports = {
  rules: {
    'no-unused-vars': ['error'],
    'no-empty-function': ['error'],
    'no-extra-semi': 'error',
    'no-multi-spaces': 'error',
    'no-multiple-empty-lines': ['error', { max: 1 }],
    'max-statements-per-line': ['error', { max: 1 }],
    'padded-blocks': ['error', 'never'],
    'eol-last': ['error', 'always'],
    indent: ['error', 4],
    quotes: ['error', 'single', { avoidEscape: true }],
    semi: ['error', 'never'],
  },
}
