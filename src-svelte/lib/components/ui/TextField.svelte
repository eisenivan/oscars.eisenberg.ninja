<script>
	import Icon from './Icon.svelte';
	export let label;
	export let id = label.toLowerCase().replace(/\W+/g, '-');
	export let value = '';
	export let type = 'text';
	export let hint = '';
	export let error = '';
	export let autocomplete = undefined;
	export let required = false;
	export let inputmode = undefined;

	let reveal = false;
	$: isPassword = type === 'password';
	$: actualType = isPassword && reveal ? 'text' : type;

	function onInput(e) {
		value = e.currentTarget.value;
	}
</script>

<div class="space-y-1.5">
	<label for={id} class="block text-sm font-medium text-fg">{label}</label>
	{#if hint}<p id="{id}-hint" class="text-[13px] leading-snug text-muted">{hint}</p>{/if}
	<div class="relative">
		<input
			{id}
			name={id}
			type={actualType}
			{value}
			{autocomplete}
			{required}
			{inputmode}
			on:input={onInput}
			on:blur
			aria-invalid={!!error}
			aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
			class="h-12 w-full rounded-sm border bg-surface px-3.5 text-base text-fg placeholder:text-muted/70 transition
				focus:outline-none focus:ring-2 focus:ring-gold-fill/60
				{error ? 'border-danger' : 'border-line focus:border-gold-fill'} {isPassword ? 'pr-12' : ''}"
		/>
		{#if isPassword}
			<button
				type="button"
				class="absolute right-1 top-1 grid h-10 w-10 place-items-center rounded-sm text-muted hover:text-fg"
				aria-label={reveal ? 'Hide password' : 'Show password'}
				aria-pressed={reveal}
				on:click={() => (reveal = !reveal)}
			>
				<Icon name={reveal ? 'eye-off' : 'eye'} size={18} />
			</button>
		{/if}
	</div>
	{#if error}
		<p id="{id}-error" class="flex items-center gap-1.5 text-[13px] text-danger">
			<Icon name="alert" size={14} />{error}
		</p>
	{/if}
	<slot />
</div>
