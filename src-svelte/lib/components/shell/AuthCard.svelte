<script>
	export let title;
	export let subtitle = '';
</script>

<div class="relative -mt-5 flex min-h-[calc(100dvh-8rem)] items-center justify-center py-8 sm:-mt-8">
	<div
		class="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-[420px] max-w-2xl opacity-70"
		style="background: radial-gradient(ellipse at 50% 0%, rgb(var(--gold-fill) / .22), transparent 65%)"
		aria-hidden="true"
	/>
	<div class="w-full max-w-[400px]">
		<div class="mb-6 text-center">
			<h1 class="font-display text-3xl font-semibold sm:text-4xl">{title}</h1>
			{#if subtitle}<p class="mt-2 text-[15px] text-muted">{subtitle}</p>{/if}
		</div>
		<div class="card p-5 sm:p-7">
			<slot />
		</div>
		<div class="mt-5 text-center text-sm text-muted"><slot name="footer" /></div>
	</div>
</div>
