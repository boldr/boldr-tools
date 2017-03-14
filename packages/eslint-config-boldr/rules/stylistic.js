module.exports = {
  env: {
    browser: true,
    node: true,
  },
  rules: {
    'array-bracket-spacing': [2, 'never'],
    'arrow-parens': [2, 'as-needed'],
    'block-spacing': 2,
    'brace-style': [2, '1tbs'],
    'camelcase': [2, { properties: 'always' }],
    // wHO CaRes?
    'capitalized-comments': 0,
    'comma-dangle': [
      2,
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'always-multiline',
      },
    ],
    // enforce spacing before and after comma
    'comma-spacing': [
      2,
      {
        before: false,
        after: true,
      },
    ],
    // enforce one true comma style
    'comma-style': [2, 'last'],
    // disallow padding inside computed properties
    'computed-property-spacing': [2, 'never'],
    // Too many use-cases for reassigning "this" to different values
    'consistent-this': 0,
    'eol-last': 2,
    'func-call-spacing': [2, 'never'],
    'func-names': 2,
    'func-name-matching': 2,
    'func-style': [2, 'declaration'],
    'generator-star-spacing': [2, 'after'],
    'id-blacklist': 2,
    'init-declarations': 0,
    // when using short composable functions, using single-letter variables is fine
    'id-length': 0,
    'id-match': [
      2,
      // camelCase, PascalCase, __filename, CONST_VALUE, stream$, $el
      '^\\$?(__)?(([A-Z]|[a-z]|[0-9]+)|([A-Z_]))*\\$?$',
    ],
    // this option sets a specific tab width for your code
    // https://github.com/eslint/eslint/blob/master/docs/rules/indent.md
    indent: [
      2,
      2,
      {
        SwitchCase: 1,
      },
    ],
    'key-spacing': [
      2,
      {
        beforeColon: false,
        afterColon: true,
      },
    ],
    'keyword-spacing': [
      2,
      {
        before: true,
        after: true,
        overrides: {
          return: {
            after: true,
          },
          throw: {
            after: true,
          },
          case: {
            after: true,
          },
        },
      },
    ],
    // disallow mixed 'LF' and 'CRLF' as linebreaks
    'linebreak-style': [2, 'unix'],
    'line-comment-position': 0,
    // enforces empty lines around comments
    'lines-around-comment': 0,
    'lines-around-directive': 0,
    'max-depth': [2, 4],
    'max-len': [2, 120, 2],
    'max-lines': [
      2,
      {
        max: 500,
        skipBlankLines: false,
        skipComments: false,
      },
    ],
    'max-nested-callbacks': [2, 5],
    'max-params': [2, 5],
    'max-statements-per-line': [2, { max: 1 }],
    'max-statements': [2, 30],
    'multiline-ternary': 0,
    'new-cap': 2,
    'new-parens': 2,
    'newline-after-var': 0,
    'newline-before-return': 0,
    'newline-per-chained-call': 0,
    'no-array-constructor': 2,
    'no-bitwise': 2,
    // disallow use of the continue statement
    'no-continue': 2,
    // disallow comments inline after code
    'no-inline-comments': 0,
    // disallow if as the only statement in an else block | doesn't play well with `if (__DEV__) {}`
    'no-lonely-if': 2,
    'no-mixed-spaces-and-tabs': 2,
     // it's handy, but harder to read
    'no-multi-assign': 2,
    // disallow multiple empty lines and only one newline at the end
    'no-multiple-empty-lines': [
      1,
      {
        max: 2,
        maxEOF: 1,
      },
    ],
    'no-negated-condition': 2,
    'no-nested-ternary': 2,
    'no-new-object': 2,
    'no-plusplus': 0,
    'no-spaced-func': 2,
    'no-tabs': 2,
    'no-ternary': 0,
    'no-trailing-spaces': [2, { skipBlankLines: true }],
    'no-underscore-dangle': 0,
    // disallow the use of Boolean literals in conditional expressions
    // also, prefer `a || b` over `a ? a : b`
    // http://eslint.org/docs/rules/no-unneeded-ternary
    'no-unneeded-ternary': [
      1,
      {
        defaultAssignment: false,
      },
    ],
    'no-whitespace-before-property': 2,
    'nonblock-statement-body-position': 0,
    'object-curly-newline': 0,
    // @NOTE: exists in rules/babel.js
    'object-curly-spacing': 0,
    'object-property-newline': 0,
    'object-shorthand': [2, 'properties'],
    'one-var-declaration-per-line': 2,
    'one-var': [
      2,
      {
        uninitialized: 'always',
        initialized: 'never',
      },
    ],
    'operator-assignment': 0,
    // enforce operators to be placed before or after line breaks
    'operator-linebreak': 0,
    // enforce padding within blocks
    'padded-blocks': [2, 'never'],
    'prefer-destructuring': 0,
    'quotes': [
      2,
      'single',
      {
        avoidEscape: true,
        allowTemplateLiterals: true,
      },
    ],
    // require quotes around object literal property names
    // http://eslint.org/docs/rules/quote-props.html
    'quote-props': [
      2,
      'as-needed',
      {
        keywords: false,
        unnecessary: true,
        numbers: false,
      },
    ],
    'require-jsdoc': 0,
    'template-tag-spacing': [2, 'never'],
    'semi-spacing': [
      2,
      {
        before: false,
        after: true,
      },
    ],
    // @NOTE: exists in rules/babel.js
    'semi': 0,
    'sort-keys': 0,
    'sort-vars': 0,
    'space-before-blocks': [2, 'always'],
    'space-before-function-paren': [2, 'never'],
    'space-in-parens': [2, 'never'],
    'space-infix-ops': 2,
    'space-unary-ops': [
      2,
      {
        words: true,
        nonwords: false,
      },
    ],
    'spaced-comment': 0,
    'unicode-bom': [2, 'never'],
    // require regex literals to be wrapped in parentheses
    'wrap-regex': 0,
    // specify whether double or single quotes should be used in JSX attributes
    // http://eslint.org/docs/rules/jsx-quotes
    'jsx-quotes': [2, 'prefer-double'],
  },
}
