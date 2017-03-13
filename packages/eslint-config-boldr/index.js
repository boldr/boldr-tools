
const maxLenIgnorePattern = '^(?:var|let|const)\\s+[a-zA-Z_\\$][a-zA-Z_\\$\\d]*' +
  '\\s*=\\s*require\\(["\'a-zA-Z_\\+\\.\\s\\d_\\-\\/]+\\)[^;\\n]*[;\\n]';

module.exports = {
  env: {
    node: true,
    jest: true,
    browser: true,
    es6: true,
  },
  plugins: ['import', 'flowtype'],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 8,
    impliedStrict: true,
    sourceType: 'module',
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
      jsx: true,
      generators: true,
    },
  },
  settings: {
    'import/extensions': ['.js', '.jsx'],
    'import/ignore': ['node_modules', '.(scss|less|css|styl)$', '.json$'],
  },
  rules: {

    // Blacklist certain identifiers to prevent them being used
    // http://eslint.org/docs/rules/id-blacklist
    'id-blacklist': 0,


/// end possible errors

    // enforces no braces where they can be omitted
    // http://eslint.org/docs/rules/arrow-body-style
    'arrow-body-style': 0,
    // require parens in arrow function arguments
    'arrow-parens': 0,
    // require space before/after arrow function's arrow
    // https://github.com/eslint/eslint/blob/master/docs/rules/arrow-spacing.md
    'arrow-spacing': [
      1,
      {
        before: true,
        after: true,
      },
    ],
    // verify super() callings in constructors
    'constructor-super': 2,

    // disallow modifying variables that are declared using const
    'no-const-assign': 2,
    // disallow duplicate class members
    // http://eslint.org/docs/rules/no-dupe-class-members
    'no-dupe-class-members': 2,
    // disallow importing from the same path more than once
    // http://eslint.org/docs/rules/no-duplicate-imports
    // doesnt work well with flow
    'no-duplicate-imports': 0,
    // disallow symbol constructor
    // http://eslint.org/docs/rules/no-new-symbol
    'no-new-symbol': 0,
    // disallow specific globals
    'no-restricted-globals': 0,
    // disallow specific imports
    // http://eslint.org/docs/rules/no-restricted-imports
    'no-restricted-imports': 0,
    // disallow to use this/super before super() calling in constructors.
    'no-this-before-super': 2,
    // require let or const instead of var
    'no-var': 2,
    // disallow unnecessary constructor
    // http://eslint.org/docs/rules/no-useless-constructor
    'no-useless-constructor': 2,
    // require method and property shorthand syntax for object literals
    // https://github.com/eslint/eslint/blob/master/docs/rules/object-shorthand.md
    'object-shorthand': [1, 'always'],
    // suggest using arrow functions as callbacks
    'prefer-arrow-callback': 2,
    // suggest using of const declaration for variables that are never modified after declared
    'prefer-const': 1,
    // suggest using the spread operator instead of .apply()
    'prefer-spread': 0,
    // suggest using Reflect methods where applicable
    'prefer-reflect': 0,
    // use rest parameters instead of arguments
    // http://eslint.org/docs/rules/prefer-rest-params
    'prefer-rest-params': 1,
    // suggest using template literals instead of string concatenation
    // http://eslint.org/docs/rules/prefer-template
    'prefer-template': 1,
    // disallow generator functions that do not have yield
    'require-yield': 0,
    // import sorting
    // http://eslint.org/docs/rules/sort-imports
    'sort-imports': 0,
    // enforce usage of spacing in template strings
    // http://eslint.org/docs/rules/template-curly-spacing
    'template-curly-spacing': 2,
    // enforce spacing around the * in yield* expressions
    // http://eslint.org/docs/rules/yield-star-spacing
    'yield-star-spacing': 0,



    'global-require': 1,
    // enforce return after a callback
    'callback-return': 0,
    // enforces 2 handling in callbacks (node environment)
    'handle-callback-err': 1,
    // disallow mixing regular variable and require declarations
    'no-mixed-requires': [2, {
      grouping: true,
      allowCall: false
    }],
    // disallow use of new operator with the require function
    'no-new-require': 2,
    // disallow string concatenation with __dirname and __filename
    'no-path-concat': 0,
    // disallow process.exit()
    'no-process-exit': 0,
    // restrict usage of specified node modules
    'no-restricted-modules': 0,
    // disallow use of synchronous methods (0 by default)
    'no-sync': 0,
    'no-await-in-loop': 0,
    'no-bitwise': 0,
    'no-empty-function': 0,
    'no-empty-pattern': 2,
    'no-global-assign': 0,
    'no-magic-numbers': 0,
    'no-mixed-operators': 0,
    'no-multi-assign': 0,
    // enforce spacing inside array brackets
    'array-bracket-spacing': [2, 'never'],
    'block-spacing': 0,
    // enforce one true brace style
    'brace-style': [
      1,
      '1tbs',
      {
        allowSingleLine: true,
      },
    ],

    'capitalized-comments': 0,
    // require camel case names
    camelcase: [
      0,
      {
        properties: 'always',
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
    'computed-property-spacing': [1, 'never'],
    // enforces consistent naming when capturing the current execution context
    'consistent-this': 0,
    // enforce newline at the end of file, with no multiple empty lines
    'eol-last': 2,
    // require function expressions to have a name
    'func-names': 0,
    // enforces use of function declarations or expressions
    'func-style': [0, 'declaration'],
    // this option enforces minimum and maximum identifier lengths
    // (variable names, property names etc.)
    'id-length': 0,
    'id-match': 0,
    // this option sets a specific tab width for your code
    // https://github.com/eslint/eslint/blob/master/docs/rules/indent.md
    indent: [
      2,
      2,
      {
        SwitchCase: 1,
      },
    ],
    // specify whether double or single quotes should be used in JSX attributes
    // http://eslint.org/docs/rules/jsx-quotes
    'jsx-quotes': [2, 'prefer-double'],
    // enforces spacing between keys and values in object literal properties
    'key-spacing': [
      2,
      {
        beforeColon: false,
        afterColon: true,
      },
    ],
    // require a space before & after certain keywords
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
    // enforces empty lines around comments
    'lines-around-comment': 0,
    // disallow mixed 'LF' and 'CRLF' as linebreaks
    'linebreak-style': [0, 'unix'],
    'max-depth': [2, 4],
    'max-len': 0,
    'max-lines': 0,
    'max-statements-per-line': [2, { max: 1 }],
    'max-statements': 0,
    // specify the maximum depth callbacks can be nested
    'max-nested-callbacks': 0,
    // require a capital letter for constructors
    'new-cap': 0,
    // disallow the omission of parentheses when invoking a constructor with no arguments
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
    // disallow use of the Array constructor
    'no-array-constructor': 2,
    // disallow use of the continue statement
    'no-continue': 0,
    // disallow comments inline after code
    'no-inline-comments': 0,
    // disallow if as the only statement in an else block | doesn't play well with `if (__DEV__) {}`
    'no-lonely-if': 0,
    // disallow mixed spaces and tabs for indentation
    'no-mixed-spaces-and-tabs': 2,
    // disallow multiple empty lines and only one newline at the end
    'no-multiple-empty-lines': [
      1,
      {
        max: 2,
        maxEOF: 1,
      },
    ],
    // disallow nested ternary expressions
    'no-nested-ternary': 0,
    // disallow use of the Object constructor
    'no-new-object': 1,
    // disallow space between function identifier and application
    'no-spaced-func': 1,
    // disallow the use of ternary operators
    'no-ternary': 0,
    'no-tabs': 2,
    // disallow trailing whitespace at the end of lines
    'no-trailing-spaces': [2, { skipBlankLines: true }],
    // disallow dangling underscores in identifiers because GROSS
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
    // disallow whitespace before properties
    // http://eslint.org/docs/rules/no-whitespace-before-property
    'no-whitespace-before-property': 2,
    // require padding inside curly braces
    'object-curly-spacing': [2, 'always'],
    // allow just one var statement per function
    'one-var': [1, {
      initialized: 'never'
    }],
    // require a newline around variable declaration
    // http://eslint.org/docs/rules/one-var-declaration-per-line
    'one-var-declaration-per-line': 0,
    // prefer `x += 4` over `x = x + 4`
    'operator-assignment': 0,
    // enforce operators to be placed before or after line breaks
    'operator-linebreak': 0,
    // enforce padding within blocks
    'padded-blocks': [2, 'never'],
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
    // specify whether double or single quotes should be used
    quotes: [2, 'single', 'avoid-escape'],
    // enforce spacing before and after semicolons
    'semi-spacing': [
      2,
      {
        before: false,
        after: true,
      },
    ],
    // require or disallow use of semicolons instead of ASI
    semi: [2, 'always'],
    // sort variables within the same declaration block
    'sort-vars': 0,
    'sort-keys': 0,
    // require `if () {` instead of `if (){`
    'space-before-blocks': [1, 'always'],
    // require `function foo()` instead of `function foo ()`
    'space-before-function-paren': [
      1,
      {
        anonymous: 'never',
        named: 'never',
      },
    ],
    // require or disallow spaces inside parentheses
    'space-in-parens': [2, 'never'],
    // require spaces around operators
    'space-infix-ops': 2,
    // Require or disallow spaces before/after unary operators
    'space-unary-ops': 0,
    // require or disallow a space immediately following the // or /* in a comment
    'spaced-comment': [
      1,
      'always',
      {
        exceptions: ['-', '+'],
        markers: ['=', '!'], // space here to support sprockets directives
      },
    ],
    // require regex literals to be wrapped in parentheses
    'wrap-regex': 0,
    // enforce or disallow variable initializations at definition
    'init-declarations': 0,
    // disallow the catch clause parameter name being the same as a variable in the outer scope
    'no-catch-shadow': 0,
    // disallow deletion of variables | is a strict mode violation
    'no-delete-var': 2,
    // disallow var and named functions in global scope
    // http://eslint.org/docs/rules/no-implicit-globals
    'no-implicit-globals': 0,
    // disallow labels that share a name with a variable
    'no-label-var': 0,
    // disallow self assignment
    // http://eslint.org/docs/rules/no-self-assign
    'no-self-assign': 2,
    // redefining undefined, NaN, Infinity, arguments, and eval is bad, mkay?
    'no-shadow-restricted-names': 2,
    // disallow declaration of variables already declared in the outer scope
    'no-shadow': 0,
    // disallow use of undefined when initializing variables
    'no-undef-init': 1,
    // disallow use of undeclared variables unless mentioned in a /*global */ block
    'no-undef': 1,
    // disallow use of undefined variable
    'no-undefined': 0,
    // disallow declaration of variables that are not used in the code
    'no-unused-vars': 0,

  },
};
