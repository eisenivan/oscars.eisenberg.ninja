import { c as create_ssr_component } from "./index3.js";
function client_method(key) {
  {
    if (key === "before_navigate" || key === "after_navigate" || key === "on_navigate") {
      return () => {
      };
    } else {
      const name_lookup = {
        disable_scroll_handling: "disableScrollHandling",
        preload_data: "preloadData",
        preload_code: "preloadCode",
        invalidate_all: "invalidateAll"
      };
      return () => {
        throw new Error(`Cannot call ${name_lookup[key] ?? key}(...) on the server`);
      };
    }
  }
}
const goto = /* @__PURE__ */ client_method("goto");
const PageHeading = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { children = null } = $$props;
  if ($$props.children === void 0 && $$bindings.children && children !== void 0)
    $$bindings.children(children);
  return `<h1 class="text-3xl text-gray-900">${slots.default ? slots.default({}) : ``}</h1>`;
});
export {
  PageHeading as P,
  goto as g
};
