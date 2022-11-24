import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

const config: UserConfig = {
	define: {

	},
	plugins: [sveltekit()]
};

export default config;
