module.exports = {
  env: {
    browser: true,
    node: true,
  },
  rules: {
    // enforces getter/setter pairs in objects
    'accessor-pairs': 0,
    // enforces return statements in callbacks of array's methods
    // http://eslint.org/docs/rules/array-callback-return
    'array-callback-return': 2,
    // treat var statements as if they were block scoped
    'block-scoped-var': 2,
    // specify the maximum cyclomatic complexity allowed in a program
    complexity: [0, 1],
    // require return statements to either always or never specify values
    'consistent-return': 0,
    // specify curly brace conventions for all control statements
    curly: [2, 'multi-line'],
    // require default case in switch statements
    'default-case': 2,
    // encourages use of dot notation whenever possible
    'dot-notation': [
      2,
      {
        allowKeywords: true,
        allowPattern: '^[a-z]+(?:[_-\\s][a-z]+)+$',
      },
    ],
    // enforces consistent newlines before or after dots
    'dot-location': 0,
    // require the use of === and !==
    eqeqeq: 2,
    // make sure for-in loops have an if statement
    'guard-for-in': 2,
    // disallow the use of alert, confirm, and prompt
    'no-alert': 1,
    // disallow use of arguments.caller or arguments.callee
    'no-caller': 2,
    // disallow lexical declarations in case/default clauses
    // http://eslint.org/docs/rules/no-case-declarations.html
    'no-case-declarations': 0,
    // disallow division operators explicitly at beginning of regular expression
    'no-div-regex': 0,
    // disallow else after a return in an if
    'no-else-return': 0,
    // disallow Unnecessary Labels
    // http://eslint.org/docs/rules/no-extra-label
    'no-extra-label': 2,
    // disallow comparisons to null without a type-checking operator
    'no-eq-null': 0,
    // disallow use of eval()
    'no-eval': 2,
    // disallow adding to native types
    'no-extend-native': 1,
    // disallow unnecessary function binding
    'no-extra-bind': 1,
    // disallow fallthrough of case statements
    'no-fallthrough': 1,
    // disallow the use of leading or trailing decimal points in numeric literals
    'no-floating-decimal': 2,
    // disallow the type conversions with shorter notations
    'no-implicit-coercion': 0,
    // disallow use of eval()-like methods
    'no-implied-eval': 2,
    // disallow this keywords outside of classes or class-like objects
    'no-invalid-this': 0,
    // disallow usage of __iterator__ property
    'no-iterator': 2,
    // disallow use of labels for anything other then loops and switches
    'no-labels': [
      2,
      {
        allowLoop: false,
        allowSwitch: false,
      },
    ],
    // disallow unnecessary nested blocks
    'no-lone-blocks': 2,
    // disallow creation of functions within loops
    'no-loop-func': 2,
    // disallow use of multiple spaces
    'no-multi-spaces': 2,
    // disallow use of multiline strings
    'no-multi-str': 2,
    // disallow reassignments of native objects
    'no-native-reassign': [
      2,
      {
        exceptions: ['Map', 'Set'],
      },
    ],
    // disallow use of new operator when not part of the assignment or comparison
    'no-new': 2,
    // disallow use of new operator for Function object
    'no-new-func': 2,
    // disallows creating new instances of String, Number, and Boolean
    'no-new-wrappers': 2,
    // disallow use of (old style) octal literals
    'no-octal': 2,
    // disallow use of octal escape sequences in string literals, such as
    // var foo = 'Copyright \251';
    'no-octal-escape': 2,
    // disallow reassignment of function parameters
    // disallow parameter object manipulation
    // rule: http://eslint.org/docs/rules/no-param-reassign.html
    'no-param-reassign': 0,
    // disallow use of process.env
    'no-process-env': 0,
    // disallow usage of __proto__ property
    'no-proto': 2,
    // disallow declaring the same variable more then once
    'no-redeclare': 2,
    // disallow use of assignment in return statement
    'no-return-assign': 2,
    // disallow use of `javascript:` urls.
    'no-script-url': 2,
    // disallow comparisons where both sides are exactly the same
    'no-self-compare': 2,
    // disallow use of comma operator
    'no-sequences': 0,
    // restrict what can be thrown as an exception
    'no-throw-literal': 1,
    // disallow unmodified conditions of loops
    // http://eslint.org/docs/rules/no-unmodified-loop-condition
    'no-unmodified-loop-condition': 0,
    // disallow usage of expressions in statement position
    'no-unused-expressions': 0,
    // disallow unused labels
    // http://eslint.org/docs/rules/no-unused-labels
    'no-unused-labels': 2,

        // disallow unnecessary .call() and .apply()
    'no-useless-call': 0,
        // disallow unnecessary string escaping
        // http://eslint.org/docs/rules/no-useless-escape
    'no-useless-escape': 2,
        // disallow use of void operator
    'no-void': 0,
        // disallow usage of configurable 1 terms in comments: e.g. todo
    'no-1-comments': 0,
        // disallow use of the with statement
    'no-with': 2,
        // require use of the second argument for parseInt()
    radix: 2,
        // requires to declare all vars on top of their containing scope
    'vars-on-top': 2,
        // require immediate function invocation to be wrapped in parentheses
        // http://eslint.org/docs/rules/wrap-iife.html
    'wrap-iife': [2, 'outside'],
        // require or disallow Yoda conditions
    yoda: [
      2,
      'never',
      {
        exceptRange: false,
        onlyEquality: false,
      },
    ],
    'comma-dangle': [2, {
      arrays: 'always-multiline',
      objects: 'always-multiline',
      imports: 'always-multiline',
      exports: 'always-multiline',
      functions: 'always-multiline',
    }],

    'object-property-newline': 2,
    'object-curly-newline': 0,

    'no-useless-rename': 2,
    'no-useless-concat': 2,
    'no-useless-computed-key': 0,


    'no-return-await': 2,
    'no-restricted-syntax': 0,
    'no-restricted-properties': 0,

    'no-plusplus': 0,
    'no-negated-condition': 0,
    'func-call-spacing': [2, 'never'],
    'max-params': 0,
    'line-comment-position': [2, {
      'position': 'above'
    }],
    'lines-around-directive': 0,
    'multiline-ternary': 0,

    'func-name-matching': [2, 'always'],

    'prefer-promise-reject-2s': 0,
    'prefer-numeric-literals': 1,
    'nonblock-statement-body-position': [2, 'beside'],
    'no-useless-return': 2,

    'prefer-destructuring': [1, {
      'array': false,
      'object': true,
    }, {
      'enforceForRenamedProperties': false
    }],
    'require-await': 2,
    'rest-spread-spacing': [2, 'never'],

    'symbol-description': 1,

    'strict': [2, 'never'],

    'unicode-bom': [1, 'never'],
    'require-jsdoc': 0,
    'template-tag-spacing': 0,
    'class-methods-use-this': 2,
    // enforce the spacing around the * in generator functions
    'generator-star-spacing': 1,
    // disallow modifying variables of class declarations
    'no-class-assign': 0,
    // disallow arrow functions where they could be confused with comparisons
    // http://eslint.org/docs/rules/no-confusing-arrow
    'no-confusing-arrow': [
      2,
      {
        allowParens: true,
      },
    ],
  },
};
