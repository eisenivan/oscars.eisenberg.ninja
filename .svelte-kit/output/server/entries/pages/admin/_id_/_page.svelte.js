import { c as create_ssr_component, f as each, e as escape, b as add_attribute } from "../../../../chunks/index3.js";
import "../../../../chunks/auth.js";
import "firebase/database";
function keyFromName(name) {
  return name.toLowerCase().replace(/\s/g, "");
}
function isSelected(ballot = [], value) {
  return ballot.indexOf(value) > -1;
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  data.id;
  let categories = [];
  let results = [];
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  return `${$$result.head += `<!-- HEAD_svelte-13s6o7t_START -->${$$result.title = `<title>Admin</title>`, ""}<!-- HEAD_svelte-13s6o7t_END -->`, ""}

<div><label class="border-solid block pl-2 mb-6" for="locked"><input class="mr-2" type="checkbox" ${"checked"} id="locked">
		<span class="">Close voting</span></label>

	<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">${each(categories, (cat) => {
    return `<div class="mb-6"><h2 class="text-xl lg:text-2xl mb-2">${escape(cat.name)}</h2>
				${each(cat.candidates, (candidate) => {
      let key = `${cat.id}__${keyFromName(candidate.text)}`;
      return `
					<label class="border-solid block pl-2 ml-2 border-l"${add_attribute("for", key, 0)}><input ${isSelected(results, key) ? "checked" : ""} class="mr-2" type="radio"${add_attribute("name", cat.id, 0)}${add_attribute("value", key, 0)}${add_attribute("id", key, 0)}>
						<span class="">${escape(candidate.text)}</span>
						${candidate.subtext ? `<span class="block ml-6 pb-2 font-thin text-xs italic">${escape(candidate.subtext)}</span>` : ``}
					</label>`;
    })}
			</div>`;
  })}</div></div>`;
});
export {
  Page as default
};
