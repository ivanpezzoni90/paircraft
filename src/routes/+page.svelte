<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { tick } from 'svelte';
	import { participants, resetParticipants } from '$lib/stores/participants';

	let entries: string[] = [];
	let actionsDocked = false;

	const updateEntry = (index: number, value: string) => {
		participants.update((list) => {
			const next = [...list];
			next[index] = value;
			return next;
		});
	};

	const focusLastInput = () => {
		if (!browser) return;
		const lastIndex = entries.length - 1;
		const element = document.getElementById(`name-${lastIndex}`) as HTMLInputElement | null;
		element?.focus();
	};

	const addInput = async () => {
		if (!canAdd) return;
		participants.update((list) => [...list, '']);
		await tick();
		focusLastInput();
	};

	const goToExceptions = () => {
		if (filledCount < 2) return;
		goto('/exceptions');
	};

	const handleKeyDown = async (event: KeyboardEvent, index: number) => {
		if (event.key !== 'Enter') return;
		event.preventDefault();
		if (index !== entries.length - 1) return;
		await addInput();
	};

	const clearEntries = async () => {
		resetParticipants();
		await tick();
		focusLastInput();
	};

	const observeDocking = (node: HTMLElement) => {
		if (!browser) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				actionsDocked = entry.intersectionRatio < 0.9;
			},
			{ threshold: [0, 0.9, 1], rootMargin: '0px 0px -60px 0px' }
		);

		observer.observe(node);

		return {
			destroy() {
				observer.disconnect();
			}
		};
	};

	$: entries = $participants;
	$: trimmedEntries = entries.map((entry) => entry.trim());
	$: filledCount = trimmedEntries.filter(Boolean).length;
	$: lastTrimmedEntry = trimmedEntries[trimmedEntries.length - 1] ?? '';
	$: canAdd = lastTrimmedEntry !== '';
</script>

<section class="intro">
	<h2 class="intro__title">Ready to craft surprise pairings?</h2>
	<p class="intro__description">Add everyone's name below and we'll do the matchmaking magic.</p>
</section>

<div class="container">
	<div class="inputs">
		{#each entries as entry, index}
			<input
				class="name-input"
				type="text"
				id={`name-${index}`}
				placeholder={`Name ${index + 1}`}
				enterkeyhint="next"
				value={entry}
				on:input={(event) => updateEntry(index, (event.target as HTMLInputElement).value)}
				on:keydown={(event) => handleKeyDown(event, index)}
			/>
		{/each}
	</div>

	<div
		class="actions"
		class:actions--hidden={actionsDocked}
		use:observeDocking
		aria-hidden={actionsDocked}
	>
		<button class="action" type="button" on:click={addInput} disabled={!canAdd}>
			Add person
		</button>
		<button
			class="action primary"
			type="button"
			on:click={goToExceptions}
			disabled={filledCount < 2}
		>
			Continue
		</button>
	</div>
</div>

<footer class="footer">
	<div class="footer__content">
		{#if actionsDocked}
			<div class="actions actions--docked">
				<button class="action" type="button" on:click={addInput} disabled={!canAdd}>
					Add person
				</button>
				<button
					class="action primary"
					type="button"
					on:click={goToExceptions}
					disabled={filledCount < 2}
				>
					Continue
				</button>
			</div>
		{/if}
		<button class="footer__clear" type="button" on:click={clearEntries}> Clear all names </button>
	</div>
</footer>

<style>
	.intro {
		max-width: 32rem;
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
		display: flex;
		flex-direction: column;
		gap: 1rem;
		max-width: 28rem;
		margin: 0 auto;
		padding: 4rem 1.5rem 8rem;
	}

	.inputs {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.name-input {
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		border: 1px solid #cbd5e1;
		font-size: 1rem;
	}

	.actions {
		display: flex;
		gap: 0.75rem;
	}

	.actions--hidden {
		opacity: 0;
		pointer-events: none;
		visibility: hidden;
	}

	.actions--docked {
		width: 100%;
	}

	.action {
		font-size: 1rem;
		flex: 1;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		border: 1px solid #1d4ed8;
		background-color: white;
		color: #1d4ed8;
		font-weight: 600;
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			color 0.15s ease,
			opacity 0.15s ease;
	}

	.action.primary {
		background-color: #1d4ed8;
		color: white;
	}

	.action:disabled {
		cursor: not-allowed;
		opacity: 0.5;
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
		max-width: 32rem;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: stretch;
	}

	.footer__clear {
		align-self: flex-end;
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

	.footer__clear:hover {
		color: #475569;
		background-color: rgba(148, 163, 184, 0.12);
	}
</style>
