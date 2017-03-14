module.exports = {
  plugins: ['flowtype'],
  env: {
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module',
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
      jsx: true
    },
  },
  rules: {
    'flowtype/define-flow-type': 1,
    'flowtype/require-valid-file-annotation': 1,
    'flowtype/require-return-type': 0,
    'flowtype/space-after-type-colon': [2, 'always'],
    'flowtype/space-before-generic-bracket': [2, 'never'],
    'flowtype/space-before-type-colon': [2, 'never'],
    'flowtype/type-id-match': 0,
    'flowtype/semi': [2, 'always'],
    'flowtype/use-flow-type': 1,
    'flowtype/no-weak-types': 0,
    'flowtype/boolean-style': [2, 'boolean'],
    'flowtype/delimiter-dangle': 0,
    'flowtype/generic-spacing': 0,
    'flowtype/no-dupe-keys': 2,
    'flowtype/no-primitive-constructor-types': 0,
    'flowtype/object-type-delimiter': 0,
    'flowtype/require-parameter-type': 0,
    'flowtype/require-variable-type': 0,
    'flowtype/sort-keys': 0,
    'flowtype/union-intersection-spacing': 0,
    'flowtype/valid-syntax': 0,
  },
}
