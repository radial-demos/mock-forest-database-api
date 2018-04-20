module.exports = {
    'env': {
        'browser': false,
        'commonjs': true,
        'node': true,
        'es6': true
    },
    'parserOptions': {
        'ecmaVersion': 2017
    },
    'extends': [
        'eslint:recommended',
        'plugin:react/recommended'
    ],
    'rules': {
        'no-console': 0,
        'indent': [
            'error',
            4
        ],
        'linebreak-style': [
            'error',
            'unix'
        ],
        'quotes': [
            'error',
            'single'
        ],
        'semi': [
            'error',
            'always'
        ],
         'no-shadow': ['error']
    }
};
