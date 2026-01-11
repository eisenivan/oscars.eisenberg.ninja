<script>
	import PageHeading from '$lib/components/PageHeading.svelte';
</script>

<svelte:head>
	<title>About</title>
</svelte:head>

<div class="mx-auto max-w-3xl">
	<div class="text-center mb-12">
		<PageHeading>About Oscars Voting</PageHeading>
		<p class="text-sm text-gray-600 dark:text-gray-300">Learn about how to use this application</p>
	</div>

	<div class="space-y-8">
		<!-- My Ballot Section -->
		<section class="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border-l-4 border-blue-500 backdrop-blur-sm">
			<h2 class="text-2xl font-bold mb-3 text-blue-600 dark:text-blue-400">📋 My Ballot</h2>
			<p class="text-gray-700 dark:text-gray-300 mb-4">
				Submit your Oscar predictions for each category. Select your picks for Best Picture, Best Director, Best Actor, and other award categories. Your selections are saved in real-time to your account.
			</p>
			<ul class="list-disc list-inside text-gray-700 dark:text-gray-200 space-y-2">
				<li>Vote in multiple categories</li>
				<li>Update your picks anytime before voting closes</li>
				<li>See your current score in real-time if results have been announced</li>
			</ul>
		</section>

		<!-- Leaderboard Section -->
		<section class="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border-l-4 border-green-500 backdrop-blur-sm">
			<h2 class="text-2xl font-bold mb-3 text-green-600 dark:text-green-400">🏆 Leaderboard</h2>
			<p class="text-gray-700 dark:text-gray-300 mb-4">
				View live rankings of all participants as awards are announced. Rankings update automatically as results come in, showing each person's current score based on correct predictions.
			</p>
			<ul class="list-disc list-inside text-gray-700 dark:text-gray-200 space-y-2">
				<li>See current standings for the year</li>
				<li>Browse leaderboards from past years</li>
				<li>Scores calculated as results are announced</li>
				<li>Tied scores display with the same rank</li>
			</ul>
		</section>

		<!-- All-Time Results Section -->
		<section class="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border-l-4 border-yellow-500 backdrop-blur-sm">
			<h2 class="text-2xl font-bold mb-3 text-yellow-600 dark:text-yellow-400">🥇 All-Time Results</h2>
			<p class="text-gray-700 dark:text-gray-300 mb-4">
				View a comprehensive medal count of everyone who has finished in the top 3 across all years of voting. Your performance is tracked with weighted points:
			</p>
			<ul class="list-disc list-inside text-gray-700 dark:text-gray-200 space-y-2">
				<li><strong>🥇 Gold (1st place):</strong> 3 points per win</li>
				<li><strong>🥈 Silver (2nd place):</strong> 2 points per finish</li>
				<li><strong>🥉 Bronze (3rd place):</strong> 1 point per finish</li>
				<li>Sort by any column to find top performers</li>
			</ul>
		</section>

		<!-- Profile Section -->
		<section class="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border-l-4 border-purple-500 backdrop-blur-sm">
			<h2 class="text-2xl font-bold mb-3 text-purple-600 dark:text-purple-400">👤 Profile</h2>
			<p class="text-gray-700 dark:text-gray-300 mb-4">
				Manage your account settings and personal information.
			</p>
			<ul class="list-disc list-inside text-gray-700 dark:text-gray-200 space-y-2">
				<li>Update your display name</li>
				<li>Change your email address</li>
				<li>Reset your password</li>
				<li>View your account details</li>
			</ul>
		</section>

		<!-- Scoring Section -->
		<section class="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border-l-4 border-red-500 backdrop-blur-sm">
			<h2 class="text-2xl font-bold mb-3 text-red-600 dark:text-red-400">📊 How Scoring Works</h2>
			<p class="text-gray-700 dark:text-gray-300 mb-4">
				You earn one point for each correct prediction. The leaderboard updates as awards are announced:
			</p>
			<ul class="list-disc list-inside text-gray-700 dark:text-gray-200 space-y-2">
				<li>Each correct pick = 1 point toward your current year score</li>
				<li>Leaderboard ranks are sorted by total points</li>
				<li>For all-time results, top 3 finishes are tracked with weighted points</li>
				<li>All participants start at 0 points each year</li>
			</ul>
		</section>

		<!-- Tips Section -->
		<section class="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-6 border-l-4 border-blue-500 backdrop-blur-sm">
			<h2 class="text-2xl font-bold mb-3 text-blue-600 dark:text-blue-400">💡 Tips for Success</h2>
			<ul class="list-disc list-inside text-gray-700 dark:text-gray-200 space-y-2">
				<li>Submit your ballot early and update as you refine your picks</li>
				<li>Check the leaderboard throughout the ceremony to track progress</li>
				<li>Remember that voting locks when set by the administrator</li>
				<li>Browse all-time results to see who the top performers have been historically</li>
				<li>Your display name appears on the leaderboard, so choose wisely!</li>
			</ul>
		</section>
	</div>
</div>

<style>
</style>
