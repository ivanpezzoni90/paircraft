<script lang="ts">
	import { goto } from '$app/navigation';

	const mockPairs = [
		{ giver: 'Alex', receiver: 'Jordan' },
		{ giver: 'Priya', receiver: 'Mateo' },
		{ giver: 'Sam', receiver: 'Harper' },
		{ giver: 'Luca', receiver: 'Mina' }
	];

	function goBackToExceptions() {
		goto('/exceptions');
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
	{#if mockPairs.length === 0}
		<p class="empty">We don’t have any pairs yet. Generate matches to see them here.</p>
	{:else}
		<section class="pairs">
			<div class="pairs__header">
				<p class="pairs__hint">Mocked data for now—wire up the engine when you’re ready.</p>
			</div>
			<div class="pairs__grid">
				{#each mockPairs as pair}
					<article class="pair-card">
						<div>
							<p class="pair-card__label">Giver</p>
							<p class="pair-card__name">{pair.giver}</p>
						</div>
						<span class="pair-card__arrow" aria-hidden="true">→</span>
						<div>
							<p class="pair-card__label">Receiver</p>
							<p class="pair-card__name">{pair.receiver}</p>
						</div>
					</article>
				{/each}
			</div>
		</section>
	{/if}
</main>

<footer class="footer">
	<div class="footer__content">
		<div class="footer__links">
			<button class="footer__link" type="button" on:click={goBackToExceptions}>
				Back to exceptions
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
		padding: 3rem 1.5rem 4rem;
	}

	.empty {
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
		color: #1d4ed8;
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

	.footer__link {
		border: none;
		background: none;
		color: #64748b;
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
		color: #475569;
		background-color: rgba(148, 163, 184, 0.12);
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
