<script>
	export let rows = 8;
</script>

<div class="space-y-2" aria-busy="true" aria-label="Loading">
	{#each Array(rows) as _}
		<div class="card flex h-[60px] items-center gap-3 px-4">
			<div class="skeleton h-5 w-6" />
			<div class="skeleton h-9 w-9 !rounded-full" />
			<div class="skeleton h-4 flex-1" />
			<div class="skeleton h-5 w-8" />
		</div>
	{/each}
</div>
