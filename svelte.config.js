import adapter from '@sveltejs/adapter-node';
import preprocess from 'svelte-preprocess';

export default {
	preprocess: preprocess(),
	kit: {
		adapter: adapter({
			out: 'build'
		}),
		files: {
			routes: 'src-svelte/routes',
			lib: 'src-svelte/lib',
			appTemplate: 'src-svelte/app.html'
		}
	}
};
