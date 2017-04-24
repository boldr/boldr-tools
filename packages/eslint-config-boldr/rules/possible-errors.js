module.exports = {
  env: {
    browser: true,
    node: true // eslint-disable-line
  },
  rules: {
    // possible erros
    // disallow assignment in conditional expressions
    'no-cond-assign': [2, 'except-parens'],
    // disallow use of console
    'no-console': 0,
    // disallow use of constant expressions in conditions
    'no-constant-condition': 1,
    // disallow control characters in regular expressions
    'no-control-regex': 2,
    'no-compare-neg-zero': 2,
    // disallow use of debugger
    'no-debugger': 1,
    // disallow duplicate arguments in functions
    'no-dupe-args': 2,
    // disallow duplicate keys when creating object literals
    'no-dupe-keys': 2,
    // disallow a duplicate case label.
    'no-duplicate-case': 2,
    // disallow the use of empty character classes in regular expressions
    'no-empty-character-class': 2,
    // disallow empty statements
    'no-empty': 2,
    // can cause subtle bugs in IE 8, and we shouldn't do this anyways
    'no-ex-assign': 1,
    // disallow double-negation boolean casts in a boolean context
    'no-extra-boolean-cast': 0,
    // disallow unnecessary parentheses
    // This is annoying with ES6 arrows.
    'no-extra-parens': 0,
    // disallow unnecessary semicolons
    'no-extra-semi': 0,
    // disallow overwriting functions written as function declarations
    'no-func-assign': 0,
    // disallow function or variable declarations in nested blocks
    'no-inner-declarations': 2,
    // disallow invalid regular expression strings in the RegExp constructor
    'no-invalid-regexp': 2,
    // disallow irregular whitespace outside of strings and comments
    'no-irregular-whitespace': 2,
    // disallow negation of the left operand of an in expression
    'no-negated-in-lhs': 2,
    // disallow the use of object properties of the global object
    // (Math and JSON) as functions
    'no-obj-calls': 2,
    'no-prototype-builtins': 0,
    // disallow multiple spaces in a regular expression literal
    'no-regex-spaces': 2,
    'no-sparse-arrays': 2,
    'no-template-curly-in-string': 2,
    'no-unexpected-multiline': 2,
    // disallow unreachable statements after a return,
    // throw, continue, or break statement
    'no-unreachable': 2,
    'no-unsafe-negation': 2,
    'no-unsafe-finally': 2,
    // disallow comparisons with the value NaN
    'use-isnan': 2,
    // ensure JSDoc comments are valid
    'valid-jsdoc': 0,
    // ensure that the results of typeof are compared against a valid string
    'valid-typeof': 2,
    // too noisy
    'no-use-before-define': 0 // eslint-disable-line
  },
};
