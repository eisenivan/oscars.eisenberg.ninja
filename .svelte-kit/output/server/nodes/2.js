import * as universal from '../entries/pages/_page.ts.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { universal };
export const universal_id = "src-svelte/routes/+page.ts";
export const imports = ["_app/immutable/nodes/2.f3ab9448.js","_app/immutable/chunks/index.e3f5fe78.js","_app/immutable/chunks/navigation.54cc5851.js","_app/immutable/chunks/preload-helper.a4192956.js","_app/immutable/chunks/singletons.e7dafbce.js","_app/immutable/chunks/helpers.d40725a1.js","_app/immutable/chunks/constants.d3c68800.js","_app/immutable/chunks/Loader.839f4639.js","_app/immutable/chunks/PageHeading.b0991ad5.js"];
export const stylesheets = ["_app/immutable/assets/Loader.db00b920.css"];
export const fonts = [];
