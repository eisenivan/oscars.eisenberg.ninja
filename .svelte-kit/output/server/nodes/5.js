import * as universal from '../entries/pages/profile/_page.ts.js';

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/profile/_page.svelte.js')).default;
export { universal };
export const universal_id = "src-svelte/routes/profile/+page.ts";
export const imports = ["_app/immutable/nodes/5.3d9d1a27.js","_app/immutable/chunks/index.d983bbc4.js","_app/immutable/chunks/navigation.e0bfb279.js","_app/immutable/chunks/singletons.8e57d49a.js","_app/immutable/chunks/paths.1b830c06.js","_app/immutable/chunks/auth.4dcf20aa.js","_app/immutable/chunks/preload-helper.a4192956.js","_app/immutable/chunks/Loader.1d641830.js","_app/immutable/chunks/PageHeading.2f32458f.js"];
export const stylesheets = ["_app/immutable/assets/Loader.db00b920.css"];
export const fonts = [];
