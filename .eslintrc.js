// http://eslint.org/docs/user-guide/configuring

module.exports = {
    root: true,
    parser: 'babel-eslint',
    parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module'
    },
    env: {
        browser: true,
        node: true,
        es6: true
    },
    // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
    extends: 'eslint:recommended',
    'rules': {
        'space-before-function-paren': 0,
        'no-useless-constructor': 0,
        'arrow-parens': 0,
        'indent': 0,
        'semi': 0,
        'quotes': 0,
        'eol-last': 0,
        'generator-star-spacing': 0
    }
}