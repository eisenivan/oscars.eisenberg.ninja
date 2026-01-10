import * as universal from '../entries/pages/admin/_id_/_page.ts.js';

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/_id_/_page.svelte.js')).default;
export { universal };
export const universal_id = "src-svelte/routes/admin/[id]/+page.ts";
export const imports = ["_app/immutable/nodes/3.e28a1281.js","_app/immutable/chunks/index.d983bbc4.js","_app/immutable/chunks/paths.57a359a1.js","_app/immutable/chunks/auth.b7d72476.js","_app/immutable/chunks/preload-helper.a4192956.js","_app/immutable/chunks/helpers.d40725a1.js"];
export const stylesheets = [];
export const fonts = [];
