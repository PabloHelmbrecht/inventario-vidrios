// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')

/** @type {import("eslint").Linter.Config} */
const config = {
    env: {
        es6: true,
        node: true,
        jest: true,
        browser: true,
    },
    globals: {
        __DEV__: true,
        __VERSION__: true,
        __COMMIT_SHA__: true,
        __BUILD_DATE__: true,
        __BRANCH__: true,
        __COMMIT_MESSAGE__: true,
        ServiceWorkerGlobalScope: true,
        BeforeInstallPromptEvent: true,
        JSX: true,
    },
    overrides: [
        {
            extends: [
                'plugin:@typescript-eslint/recommended-requiring-type-checking',
                'plugin:@typescript-eslint/eslint-recommended',
                'plugin:@typescript-eslint/recommended',
                'eslint:recommended',
                'next/core-web-vitals',
            ],
            files: ['*.ts', '*.tsx'],
            parserOptions: {
                project: path.join(__dirname, 'tsconfig.json'),
            },
        },
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: path.join(__dirname, 'tsconfig.json'),
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint', '@typescript-eslint/eslint-plugin'],
    extends: ['next/core-web-vitals', 'plugin:@typescript-eslint/recommended'],
    rules: {
        'react/prop-types': 'off',
        'react/react-in-jsx-scope': 'off',
        'no-unused-vars': 'off',
        'generator-star-spacing': ['error', { before: false, after: true }],
        'space-before-function-paren': 'off',
        'no-dupe-class-members': 'off',
        'no-useless-constructor': 'off',
        '@typescript-eslint/no-useless-constructor': 'off',
        'lines-between-class-members': ['error', 'always'],
        'padding-line-between-statements': ['error', { blankLine: 'always', prev: '*', next: 'return' }],
        'react-hooks/exhaustive-deps': 'error',
        '@typescript-eslint/no-misused-promises': ['warn'],
        '@typescript-eslint/explicit-module-boundary-types': ['off'],
        '@typescript-eslint/no-non-null-assertion': ['off'],
        '@typescript-eslint/member-delimiter-style': [
            'warn',
            {
                multiline: {
                    delimiter: 'none',
                    requireLast: false,
                },
                singleline: {
                    delimiter: 'semi',
                    requireLast: false,
                },
            },
        ],
        '@typescript-eslint/no-unused-vars': ['warn', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],

        '@typescript-eslint/consistent-type-imports': [
            'warn',
            {
                prefer: 'type-imports',
                fixStyle: 'inline-type-imports',
            },
        ],
    },
}

module.exports = config
