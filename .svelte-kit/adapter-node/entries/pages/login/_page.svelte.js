import { c as create_ssr_component, a as subscribe, v as validate_component, b as add_attribute } from "../../../chunks/index3.js";
import { g as goto, P as PageHeading } from "../../../chunks/PageHeading.js";
import { u as user } from "../../../chunks/auth.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $user, $$unsubscribe_user;
  $$unsubscribe_user = subscribe(user, (value) => $user = value);
  let email = "";
  let password = "";
  if ($user) {
    goto("/");
  }
  $$unsubscribe_user();
  return `<div class="w-full mt-2 max-w-xs m-auto bg-blue-100 p-5 border-blue-700 border-8 rounded-sm border-opacity-10 shadow-sm"><div class="mx-auto text-center mb-5">${validate_component(PageHeading, "PageHeading").$$render($$result, {}, {}, {
    default: () => {
      return `Login`;
    }
  })}</div>
	${`<form>${``}
			<div><label class="block mb-2 text-blue-500" for="email">Email</label>
				<input class="w-full p-2 mb-6 text-blue-700 border-b-2 border-blue-500 outline-none focus:bg-gray-300" type="text" name="email" required${add_attribute("value", email, 0)}></div>
			<div><label class="block mb-2 text-blue-500" for="password">Password</label>
				<input class="w-full p-2 mb-6 text-blue-700 border-b-2 border-blue-500 outline-none focus:bg-gray-300" type="password" name="password" required${add_attribute("value", password, 0)}></div>
			<div><button type="submit" class="block text-center bg-blue-700 hover:bg-pink-700 text-white font-bold py-2 px-4 mb-6 rounded mx-auto">Login
				</button></div>
			<div class="mb-3"><p class="text-xs italic text-center">Don&#39;t have an account?</p>
				<a href="/register" class="block text-center mx-auto text-xs underline">Register</a></div>
			<div><button type="button" class="block text-center mx-auto text-xs underline">Forgot Password?
				</button></div></form>`}</div>`;
});
export {
  Page as default
};
