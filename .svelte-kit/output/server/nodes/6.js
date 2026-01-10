

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/register/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/6.00fc5ea5.js","_app/immutable/chunks/index.d983bbc4.js","_app/immutable/chunks/navigation.e0bfb279.js","_app/immutable/chunks/singletons.8e57d49a.js","_app/immutable/chunks/paths.1b830c06.js","_app/immutable/chunks/auth.4dcf20aa.js","_app/immutable/chunks/preload-helper.a4192956.js","_app/immutable/chunks/PageHeading.2f32458f.js"];
export const stylesheets = [];
export const fonts = [];
