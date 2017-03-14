module.exports = {
  plugins: ['babel'],
  env: {
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module',
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
      jsx: true,
    },
  },
  rules: {
    'babel/flow-object-type': 0,
    'babel/new-cap': [
      2,
      {
        newIsCap: true,
        capIsNew: true,
      },
    ],
    'babel/no-invalid-this': 2,
    'babel/object-curly-spacing': [2, 'always'],
    'babel/semi': [2, 'never'],
    // deprecated
    'babel/no-await-in-loop': 0,
    'babel/array-bracket-spacing': 0,
    'babel/arrow-parens': 0,
    'babel/func-params-comma-dangle': 0,
    'babel/generator-star-spacing': 0,
    'babel/object-shorthand': 0,
  },
}
