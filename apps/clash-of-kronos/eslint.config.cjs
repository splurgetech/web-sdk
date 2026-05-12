const { createRequire } = require('node:module');

const requireFromEslint = createRequire(require.resolve('eslint'));
const requireFromSharedConfig = createRequire(require.resolve('eslint-config-custom'));

const js = requireFromEslint('@eslint/js');
const tsParser = requireFromSharedConfig('@typescript-eslint/parser');
const tsPlugin = requireFromSharedConfig('@typescript-eslint/eslint-plugin');
const svelte = requireFromSharedConfig('eslint-plugin-svelte');
const prettier = requireFromSharedConfig('eslint-config-prettier');

const globals = {
	console: 'readonly',
	clearInterval: 'readonly',
	clearTimeout: 'readonly',
	document: 'readonly',
	fetch: 'readonly',
	globalThis: 'readonly',
	localStorage: 'readonly',
	requestAnimationFrame: 'readonly',
	setInterval: 'readonly',
	setTimeout: 'readonly',
	URL: 'readonly',
	Response: 'readonly',
	window: 'readonly',
	$derived: 'readonly',
	$effect: 'readonly',
	$props: 'readonly',
	$state: 'readonly',
};

module.exports = [
	{
		ignores: ['.svelte-kit/**', 'build/**', 'node_modules/**'],
	},
	js.configs.recommended,
	...svelte.configs['flat/base'],
	{
		files: ['src/**/*.{ts,svelte.ts}'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: 2020,
				sourceType: 'module',
			},
			globals,
		},
		plugins: {
			'@typescript-eslint': tsPlugin,
		},
		rules: tsPlugin.configs.recommended.rules,
	},
	{
		files: ['src/**/*.svelte'],
		languageOptions: {
			parserOptions: {
				parser: tsParser,
				extraFileExtensions: ['.svelte'],
			},
			globals,
		},
	},
	prettier,
];
