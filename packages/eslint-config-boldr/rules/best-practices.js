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
    'class-methods-use-this': 0,
    // specify the maximum cyclomatic complexity allowed in a program
    complexity: [0, 1],
    // require return statements to either always or never specify values
    'consistent-return': 0,
    // specify curly brace conventions for all control statements
    curly: [2, 'all'],
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
    'no-empty-function': 0,
    'no-empty-pattern': 2,

    // disallow comparisons to null without a type-checking operator
    'no-eq-null': 0,
    // disallow use of eval()
    'no-eval': 2,
    // disallow adding to native types
    'no-extend-native': 1,
    // disallow unnecessary function binding
    'no-extra-bind': 1,
    // disallow Unnecessary Labels
    // http://eslint.org/docs/rules/no-extra-label
    'no-extra-label': 2,
    // disallow fallthrough of case statements
    'no-fallthrough': 1,
    // disallow the use of leading or trailing decimal points in
    // numeric literals
    'no-floating-decimal': 2,
    // disallow var and named functions in global scope
    // http://eslint.org/docs/rules/no-implicit-globals
    'no-implicit-globals': 0,
    // disallow the type conversions with shorter notations
    'no-implicit-coercion': 0,
    // disallow use of eval()-like methods
    'no-implied-eval': 2,
    // @NOTE: exists in rules/babel.js -- disallow this keywords outside of
    // classes or class-like objects
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
    'no-multi-spaces': 0,
    // disallow use of multiline strings
    'no-multi-str': 2,
    // disallow reassignments of native objects
    'no-native-reassign': [
      2,
      {
        exceptions: ['Map', 'Set'],
      },
    ],
    // disallow use of new operator when not part of the assignment
    // or comparison
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
    'no-warning-comments': 0,
    // disallow use of the with statement
    'no-with': 2,
    // require use of the second argument for parseInt()
    radix: 2,
    // disallow the catch clause parameter name being the same as a
    // variable in the outer scope
    'no-catch-shadow': 0,
    // requires to declare all vars on top of their containing scope
    'vars-on-top': 2,
    // require immediate function invocation to be wrapped in parentheses
    // http://eslint.org/docs/rules/wrap-iife.html
    'wrap-iife': 0,
    // require or disallow Yoda conditions
    yoda: [
      2,
      'never',
      {
        exceptRange: false,
        onlyEquality: false,
      },
    ],
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
    'object-curly-newline': 0,

    'no-useless-rename': 2,
    'no-useless-concat': 2,
    'no-useless-computed-key': 0,

    'no-return-await': 2,
    'no-restricted-syntax': 0,
    'no-restricted-properties': 0,

    'no-plusplus': 0,
    'no-negated-condition': 0,
    'max-params': 0,
    'line-comment-position': [
      2,
      {
        position: 'above',
      },
    ],
    'lines-around-directive': 0,
    'multiline-ternary': 0,

    'func-name-matching': [2, 'always'],

    'prefer-promise-reject-errors': 0,
    'prefer-numeric-literals': 1,
    'no-useless-return': 2,

    'prefer-destructuring': [
      1,
      {
        array: false,
        object: true,
      },
      {
        enforceForRenamedProperties: false,
      },
    ],
    'require-await': 2,

    'symbol-description': 1,

    strict: [2, 'never'],

    'unicode-bom': 0,
    'require-jsdoc': 0,
    'template-tag-spacing': 0,
    // disallow modifying variables of class declarations
    'no-class-assign': 0,

    // disallow use of undefined when initializing variables
    'no-undef-init': 1,
    // @NOTE: Super annoying with react. disallow use of undeclared variables
    // unless mentioned in a /*global */ block
    'no-undef': 0,
    // disallow use of undefined variable
    'no-undefined': 0,
    // disallow declaration of variables that are not used in the code
    'no-unused-vars': 0,
    // disallow labels that share a name with a variable
    'no-label-var': 0,
    // disallow self assignment
    // http://eslint.org/docs/rules/no-self-assign
    'no-self-assign': 2,
    // redefining undefined, NaN, Infinity, arguments, and eval is bad, mkay?
    'no-shadow-restricted-names': 2,
    // disallow declaration of variables already declared in the outer scope
    'no-shadow': 0,
    // disallow deletion of variables | is a strict mode violation
    'no-delete-var': 2,
    // specify the maximum depth callbacks can be nested
    'max-nested-callbacks': 0,
    // @NOTE exists in rules/babel.js -- require a capital letter for
    //  constructors
    'new-cap': 0,
    // disallow the omission of parentheses when invoking a constructor
    // with no arguments
    'new-parens': 0,
    // allow/disallow an empty newline after var statement
    'newline-after-var': 0,
    // http://eslint.org/docs/rules/newline-before-return
    'newline-before-return': 0,
    // enforces new line after each method call in the chain to make it
    // more readable and easy to maintain
    // http://eslint.org/docs/rules/newline-per-chained-call
    'newline-per-chained-call': [
      0,
      {
        ignoreChainWithDepth: 3,
      },
    ],
    'no-await-in-loop': 0,
    'no-global-assign': 0,
    'no-magic-numbers': 0,
    'no-mixed-operators': 0,
  },
};
