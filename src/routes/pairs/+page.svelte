<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { exceptions } from '$lib/stores/exceptions';
	import { participants } from '$lib/stores/participants';
	import { generatePairs, type PaircraftResult } from '$lib/utils/paircraft';
	import { onMount } from 'svelte';

	const createSeededRng = (seed: string) => {
		let h = 2166136261 >>> 0;
		for (let i = 0; i < seed.length; i++) {
			h ^= seed.charCodeAt(i);
			h = Math.imul(h, 16777619);
		}

		return () => {
			h += 0x6d2b79f5;
			let t = Math.imul(h ^ (h >>> 15), 1 | h);
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	};

	let pairResult: PaircraftResult | undefined;
	let pairEntries: { giver: string; receiver: string }[] = [];
	let hydrated = browser;
	let seed = crypto.randomUUID();

	onMount(() => {
		hydrated = true;
	});

	$: {
		if (!hydrated) {
			pairResult = undefined;
			pairEntries = [];
		} else {
			const names = $participants.map((name) => name.trim()).filter(Boolean);
			const exceptionMap = $exceptions;
			const seededRng = createSeededRng(seed);
			pairResult = generatePairs(names, exceptionMap, { rng: seededRng });
			pairEntries = pairResult.success
				? Object.entries(pairResult.pairs).map(([giver, receiver]) => ({ giver, receiver }))
				: [];
		}
	}

	function regeneratePairs() {
		seed = crypto.randomUUID();
	}

	async function copyPairs() {
		if (!pairResult?.success) return;
		const text = pairEntries.map((pair) => `${pair.giver} -> ${pair.receiver}`).join('\n');
		try {
			await navigator.clipboard.writeText(text);
		} catch (error) {
			console.error('Failed to copy pairs', error);
		}
	}

	function goBackToExceptions() {
		goto(resolve('/exceptions'));
	}
</script>

<svelte:head>
	<title>Pairs</title>
</svelte:head>

<section class="intro">
	<h2 class="intro__title">PairCraft delivery time</h2>
	<p class="intro__description">
		Your matchmaker magic is complete. Here’s who ended up with whom.
	</p>
</section>

<main class="container">
	{#if !hydrated}
		<p class="loading">Loading your pairs…</p>
	{:else if pairResult?.success}
		<section class="pairs">
			<div class="pairs__header">
				<p class="pairs__hint">
					Need a new combo? You can generate pairs again with the button below!
				</p>
			</div>
			<div class="pairs__grid">
				{#each pairEntries as pair (pair.giver + pair.receiver)}
					<article class="pair-card">
						<div>
							<p class="pair-card__label">Person A</p>
							<p class="pair-card__name">{pair.giver}</p>
						</div>
						<span class="pair-card__arrow" aria-hidden="true">→</span>
						<div>
							<p class="pair-card__label">Paired with</p>
							<p class="pair-card__name">{pair.receiver}</p>
						</div>
					</article>
				{/each}
			</div>
		</section>
	{:else}
		<section class="error">
			<h3>We couldn't create pairs</h3>
			{#if pairResult?.reason === 'constraints'}
				<p>It looks like the current exceptions block every possibility. Try relaxing them.</p>
			{:else if pairResult?.errors}
				<ul>
					{#each pairResult.errors as issue (issue)}
						<li>{issue}</li>
					{/each}
				</ul>
			{:else}
				<p>Add at least two names to get started.</p>
			{/if}
			<button class="error__link" type="button" on:click={goBackToExceptions}>
				Review names & exceptions
			</button>
		</section>
	{/if}
</main>

<footer class="footer">
	<div class="footer__content">
		{#if pairResult?.success}
			<div class="footer__primary">
				<button class="primary-action__button" type="button" on:click={regeneratePairs}>
					Regenerate pairs
				</button>
			</div>
		{/if}
		<div class="footer__links">
			<button class="footer__link" type="button" on:click={goBackToExceptions}>
				Back to exceptions
			</button>
			<button
				class="footer__link"
				type="button"
				on:click={copyPairs}
				disabled={!pairResult?.success}
			>
				Copy pairs
			</button>
		</div>
	</div>
</footer>

<style>
	.intro {
		max-width: 40rem;
		margin: 2.5rem auto 0;
		padding: 0 1.5rem;
	}

	.intro__title {
		margin: 0 0 0.25rem;
		font-size: 1.5rem;
		font-weight: 700;
	}

	.intro__description {
		margin: 0;
		font-size: 1.05rem;
		line-height: 1.5;
		color: #334155;
	}

	.container {
		max-width: 40rem;
		margin: 0 auto;
		padding: 3rem 1.5rem 8rem;
	}

	.loading {
		margin-top: 2rem;
		color: #64748b;
	}

	.pairs {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.pairs__header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.pairs__hint {
		margin: 0;
		font-size: 0.95rem;
		color: #64748b;
	}

	.pairs__grid {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.pair-card {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: 1rem;
		padding: 1rem 1.25rem;
		border-radius: 0.75rem;
		border: 1px solid #e2e8f0;
		background: white;
		box-shadow: 0 15px 35px -30px rgba(15, 23, 42, 0.6);
	}

	.pair-card__label {
		margin: 0;
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #94a3b8;
	}

	.pair-card__name {
		margin: 0.25rem 0 0;
		font-size: 1.2rem;
		font-weight: 600;
		color: #0f172a;
	}

	.pair-card__arrow {
		font-size: 1.5rem;
		color: #00867d;
	}

	.error {
		margin-top: 2rem;
		padding: 1.5rem;
		border-radius: 0.75rem;
		border: 1px solid #fee2e2;
		background: #fef2f2;
		color: #b91c1c;
	}

	.error h3 {
		margin-top: 0;
		margin-bottom: 0.5rem;
	}

	.error ul {
		margin: 0.5rem 0 1rem;
		padding-left: 1.25rem;
	}

	.error__link {
		border: none;
		background: none;
		color: #00867d;
		font-weight: 600;
		cursor: pointer;
		text-decoration: underline;
	}

	.error__link:hover {
		color: #006a63;
	}

	.footer {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		background: white;
		border-top: 1px solid #e2e8f0;
		padding: 1.25rem 1.5rem calc(1.25rem + env(safe-area-inset-bottom, 0));
		z-index: 10;
	}

	.footer__content {
		max-width: 40rem;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.footer__primary {
		display: flex;
		justify-content: flex-end;
	}

	.primary-action__button {
		border-radius: 0.5rem;
		border: 1px solid #00867d;
		background: #00867d;
		color: white;
		padding: 0.75rem 1.5rem;
		font-weight: 600;
		font-size: 1rem;
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			border-color 0.15s ease;
		box-shadow: 0 12px 30px -18px rgba(0, 134, 125, 0.35);
	}

	.primary-action__button:hover {
		background: #006a63;
		border-color: #006a63;
	}

	.footer__link {
		border: none;
		background: none;
		color: #00867d;
		font-size: 0.95rem;
		cursor: pointer;
		font-weight: 500;
		text-decoration: underline;
		text-decoration-color: rgba(100, 116, 139, 0.4);
		text-decoration-thickness: 1px;
		padding: 0.25rem 0.5rem;
		border-radius: 0.375rem;
		transition:
			color 0.15s ease,
			background-color 0.15s ease;
	}

	.footer__link:hover {
		color: #006a63;
		background-color: rgba(0, 134, 125, 0.12);
	}

	.footer__link:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.footer__links {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}
</style>
