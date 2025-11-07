<script lang="ts">
	import favicon from '$lib/assets/icon-paircraft.png';
	import logo from '$lib/assets/logo-paircraft.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="app-header">
	<a class="brand" href="/">
		<img src={logo} alt="PairCraft logo" />
	</a>
</header>

<main class="page">{@render children()}</main>

<style>
	:global(body) {
		margin: 0;
		font-family:
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			sans-serif;
		background: #f8fafc;
		color: #0f172a;
	}

	.app-header {
		display: flex;
		align-items: center;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid #e2e8f0;
		background-color: white;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
	}

	.brand img {
		display: block;
		height: 2.25rem;
	}

	.page {
		min-height: calc(100vh - 70px);
	}
</style>
