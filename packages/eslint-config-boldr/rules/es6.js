module.exports = {
  rules: {
    // enforces no braces where they can be omitted
    // http://eslint.org/docs/rules/arrow-body-style
    'arrow-body-style': 0,
    // require space before/after arrow function's arrow
    // https://github.com/eslint/eslint/blob/master/docs/rules/arrow-spacing.md
    // disabled for prettier
    // 'arrow-spacing': [
    //   2,
    //   {
    //     before: true,
    //     after: true,
    //   },
    // ],
    'arrow-spacing': 0,
    // disallow arrow functions where they could be confused with comparisons
    // http://eslint.org/docs/rules/no-confusing-arrow
    'no-confusing-arrow': 0,
    // require parens in arrow function arguments
    'arrow-parens': 0,
    // enforces use of function declarations or expressions
    'func-style': [0, 'declaration'],
    'prefer-arrow-callback': [
      2,
      {
        allowNamedFunctions: true,
        allowUnboundThis: true,
      },
    ],
    'rest-spread-spacing': 0,
    // import sorting
    // http://eslint.org/docs/rules/sort-imports
    'sort-imports': 0,
    'template-curly-spacing': 0,
    'yield-star-spacing': 0,
    // verify super() callings in constructors
    'constructor-super': 2,
    'new-cap': 0,
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

    // BABEL
    'babel/flow-object-type': 0,
    'babel/new-cap': [
      2,
      {
        newIsCap: true,
        capIsNew: true,
      },
    ],
    'babel/no-invalid-this': 2,
    'babel/object-curly-spacing': 0,
    'babel/semi': [2, 'always'],
    // deprecated
    'babel/no-await-in-loop': 0,
    'babel/array-bracket-spacing': 0,
    'babel/arrow-parens': 0,
    'babel/func-params-comma-dangle': 0,
    'babel/generator-star-spacing': 0,
    'babel/object-shorthand': 0 // eslint-disable-line
  } // eslint-disable-line
};
