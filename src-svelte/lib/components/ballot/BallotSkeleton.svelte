<div class="lg:grid lg:grid-cols-[260px_1fr] lg:gap-8" aria-busy="true" aria-label="Loading ballot">
	<div class="hidden space-y-3 lg:block">
		<div class="skeleton h-24 w-full" />
		{#each Array(10) as _}<div class="skeleton h-5 w-4/5" />{/each}
	</div>
	<div class="grid items-start gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
		{#each Array(6) as _, i}
			<div class="card space-y-2 p-5">
				<div class="skeleton h-3 w-8" />
				<div class="skeleton mb-3 h-6 w-1/2" />
				{#each Array(i === 0 ? 6 : 4) as _}<div class="skeleton h-14 w-full" />{/each}
			</div>
		{/each}
	</div>
</div>
