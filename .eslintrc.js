module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
        parser: '@typescript-eslint/parser',
    },
    plugins: ['@typescript-eslint/eslint-plugin', 'simple-import-sort'],
    extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
        'prettier',
    ],
    root: true,
    env: {
        node: true,
        jest: true,
    },
    ignorePatterns: ['.eslintrc.js', 'scripts'],
    rules: {
        '@typescript-eslint/typedef': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-function-return-type': 'error',
        'import/order': 'off',
        'simple-import-sort/exports': 'error',
        'simple-import-sort/imports': ['error'],
        '@typescript-eslint/member-ordering': 'error',
        'no-underscore-dangle': 'error',
    },
}
