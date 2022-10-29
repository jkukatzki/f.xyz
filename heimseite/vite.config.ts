import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

const config: UserConfig = {
	define: {
		"global": {'svelte-grid':'svelte-grid'}
	},
	plugins: [sveltekit()]
};

export default config;
