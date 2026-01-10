

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/_id_/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/3.cd69e064.js","_app/immutable/chunks/index.e3f5fe78.js","_app/immutable/chunks/navigation.54cc5851.js","_app/immutable/chunks/preload-helper.a4192956.js","_app/immutable/chunks/singletons.e7dafbce.js","_app/immutable/chunks/stores.065d49fe.js","_app/immutable/chunks/helpers.d40725a1.js","_app/immutable/chunks/constants.d3c68800.js"];
export const stylesheets = [];
export const fonts = [];
