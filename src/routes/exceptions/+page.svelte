<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import MultiSelect from '$lib/components/MultiSelect.svelte';
	import Select from '$lib/components/Select.svelte';
	import { exceptions, resetExceptions } from '$lib/stores/exceptions';
	import { participants } from '$lib/stores/participants';

	let activePerson = '';
	let exceptionsByName: Record<string, string[]> = {};
	let pairsButtonDocked = false;

	$: names = $participants.filter((name) => name.trim() !== '');
	$: exceptionsByName = $exceptions;
	$: subjectOptions = names.map((name) => ({ label: name, value: name }));
	$: availableOptions =
		activePerson === ''
			? []
			: names.filter((name) => name !== activePerson).map((name) => ({ label: name, value: name }));
	$: selectedForActive = activePerson ? [...(exceptionsByName[activePerson] ?? [])] : [];
	$: summaryEntries = Object.entries(exceptionsByName).filter(([, values]) => values.length > 0);
	$: hasExceptions = summaryEntries.length > 0;

	function handlePersonSelect(event: CustomEvent<{ value: string }>) {
		activePerson = event.detail.value;
		if (activePerson && !exceptionsByName[activePerson]) {
			exceptions.set({ ...exceptionsByName, [activePerson]: [] });
		}
	}

	function handleExclusionsChange(event: CustomEvent<{ selected: string[] }>) {
		if (!activePerson) return;
		const nextSelections = event.detail.selected.filter((value) => value !== activePerson);
		exceptions.set({ ...exceptionsByName, [activePerson]: [...nextSelections] });
	}

	$: if (activePerson && !names.includes(activePerson)) {
		activePerson = '';
	}

	function clearExceptions() {
		resetExceptions();
	}

	function goBackToNames() {
		goto('/');
	}

	function goToPairs() {
		goto('/pairs');
	}

	function observePairsButton(node: HTMLElement) {
		if (!browser) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				pairsButtonDocked = entry.intersectionRatio < 0.9;
			},
			{ threshold: [0, 0.9, 1], rootMargin: '0px 0px -60px 0px' }
		);

		observer.observe(node);

		return {
			destroy() {
				observer.disconnect();
			}
		};
	}
</script>

<svelte:head>
	<title>Exceptions</title>
</svelte:head>

<section class="intro">
	<h2 class="intro__title">Let's lay down the no-go's</h2>
	<p class="intro__description">
		Let's make sure no accidental matches sneak through. Pick any pairings that should stay apart.
	</p>
</section>

<main class="container">
	{#if names.length === 0}
		<p class="empty">Add some names first, then come back to set your exceptions.</p>
	{:else}
		<section class="builder">
			<h2>Build your exceptions</h2>
			<div class="builder__field">
				<Select
					label="Choose a participant"
					placeholder="Select a person"
					options={subjectOptions}
					value={activePerson}
					on:change={handlePersonSelect}
				/>
			</div>

			{#if activePerson}
				<div class="builder__picker">
					<MultiSelect
						label={`Keep ${activePerson} away from...`}
						placeholder="Start choosing participants"
						options={availableOptions}
						selected={selectedForActive}
						on:change={handleExclusionsChange}
					/>
				</div>

				{#if selectedForActive.length > 0}
					<p class="builder__hint">
						<strong>{activePerson}</strong> will skip: {selectedForActive.join(', ')}
					</p>
				{/if}
			{/if}
		</section>

		{#if summaryEntries.length > 0}
			<section class="summary">
				<h2>Current exceptions</h2>
				<ul>
					{#each summaryEntries as [subject, blocked]}
						<li>
							<strong>{subject}</strong>
							<span aria-hidden="true">-></span>
							{blocked.join(', ')}
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		<div
			class="primary-action"
			use:observePairsButton
			class:primary-action--hidden={pairsButtonDocked}
			aria-hidden={pairsButtonDocked}
		>
			<button class="primary-action__button" type="button" on:click={goToPairs}>
				View pairs
			</button>
		</div>
	{/if}
</main>

<footer class="footer">
	<div class="footer__content">
		{#if pairsButtonDocked}
			<div class="footer__primary">
				<button class="primary-action__button" type="button" on:click={goToPairs}>
					View pairs
				</button>
			</div>
		{/if}

		<div class="footer__links">
			<button class="footer__link" type="button" on:click={goBackToNames}> Back to names </button>
			<button
				class="footer__link"
				type="button"
				on:click={clearExceptions}
				disabled={!hasExceptions}
			>
				Clear all exceptions
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

	.empty {
		margin: 2rem 0;
		color: #64748b;
	}

	.builder {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		background: white;
		border-radius: 1rem;
		border: 1px solid #e2e8f0;
		padding: 1.75rem;
		box-shadow: 0 20px 45px -25px rgba(15, 23, 42, 0.3);
	}

	.builder h2 {
		margin: 0 0 0.5rem;
		font-size: 1.25rem;
	}

	.builder__field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.builder__picker {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.builder__hint {
		margin: 0;
		font-size: 0.95rem;
		color: #475569;
	}

	.summary {
		margin-top: 2.5rem;
		padding-top: 2rem;
		border-top: 1px solid #e2e8f0;
	}

	.summary h2 {
		margin: 0 0 1rem;
		font-size: 1.1rem;
	}

	.summary ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.summary li {
		padding: 0.75rem 1rem;
		border-radius: 0.75rem;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.summary strong {
		font-weight: 600;
		color: #0f172a;
	}

	.primary-action {
		margin-top: 2.5rem;
		display: flex;
		justify-content: flex-end;
		transition: opacity 0.2s ease;
	}

	.primary-action--hidden {
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
	}

	.primary-action__button {
		border-radius: 0.5rem;
		border: 1px solid #1d4ed8;
		background: #1d4ed8;
		color: white;
		padding: 0.75rem 1rem;
		font-weight: 600;
		font-size: 1rem;
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			border-color 0.15s ease;
		box-shadow: 0 12px 30px -18px rgba(29, 78, 216, 0.6);
	}

	.primary-action__button:hover {
		background: #1e40af;
		border-color: #1e40af;
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
