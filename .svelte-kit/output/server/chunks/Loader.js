import { c as create_ssr_component, b as add_attribute } from "./index3.js";
/* empty css                                      */const css = {
  code: "svg.svelte-1n9uh2s{width:100px;height:100px}",
  map: null
};
const Loader = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { color = "#444" } = $$props;
  if ($$props.color === void 0 && $$bindings.color && color !== void 0)
    $$bindings.color(color);
  $$result.css.add(css);
  return `<svg class="mx-auto svelte-1n9uh2s" style="width: 100px; height: 100px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle fill="none"${add_attribute("stroke", color, 0)} stroke-width="4" stroke-miterlimit="10" cx="50" cy="50" r="48"></circle><path fill="none" stroke-linecap="round"${add_attribute("stroke", color, 0)} stroke-width="4" stroke-miterlimit="10" d="M50 50l35 .5"><animateTransform attributeName="transform" dur="2s" type="rotate" from="0 50 50" to="360 50 50" repeatCount="indefinite"></animateTransform></path><path fill="none" stroke-linecap="round"${add_attribute("stroke", color, 0)} stroke-width="4" stroke-miterlimit="10" d="M50 50l-.5 24"><animateTransform attributeName="transform" dur="15s" type="rotate" from="0 50 50" to="360 50 50" repeatCount="indefinite"></animateTransform></path></svg>`;
});
export {
  Loader as L
};
