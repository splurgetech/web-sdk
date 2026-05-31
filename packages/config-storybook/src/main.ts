import type { StorybookConfig } from '@storybook/sveltekit';

const config: StorybookConfig = {
	stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|ts|svelte)'],
	addons: ['@storybook/addon-svelte-csf', '@storybook/addon-docs'],
	framework: {
		name: '@storybook/sveltekit',
		options: {},
	},
	// Vite resolves apps/<game>/assets (symlink → static/assets) as /static/assets URLs.
	// Mount static twice: at / (SvelteKit-style) and /static (Vite symlink canonical path).
	staticDirs: ['../static', { from: '../static', to: '/static' }],
};

export default config;
