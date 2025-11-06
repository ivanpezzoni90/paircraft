<script lang="ts">
	import { browser } from '$app/environment';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';

	type Option = {
		label: string;
		value: string;
		disabled?: boolean;
	};

	export let options: Option[] = [];
	export let selected: string[] = [];
	export let placeholder = 'Select...';
	export let label: string;

	const dispatch = createEventDispatcher<{ change: { selected: string[] } }>();

	let open = false;
	let buttonEl: HTMLButtonElement | null = null;
	let listboxEl: HTMLDivElement | null = null;
	const dropdownId = `multiselect-${
		typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
			? crypto.randomUUID()
			: Math.random().toString(36).slice(2)
	}`;

	const toggleOpen = () => {
		if (!options.length) return;
		open = !open;
	};

	const close = () => {
		open = false;
	};

	const handleToggle = (value: string) => {
		const option = options.find((item) => item.value === value);
		if (!option || option.disabled) return;

		if (selected.includes(value)) {
			selected = selected.filter((item) => item !== value);
		} else {
			selected = [...selected, value];
		}

		dispatch('change', { selected });
	};

	const clear = () => {
		selected = [];
		dispatch('change', { selected });
	};

	const handleClickOutside = (event: MouseEvent) => {
		if (!browser) return;
		const target = event.target as Node | null;
		if (!target) return;

		const clickedInside =
			(buttonEl && buttonEl.contains(target)) || (listboxEl && listboxEl.contains(target));

		if (!clickedInside) {
			close();
		}
	};

	onMount(() => {
		if (!browser) return;
		document.addEventListener('mousedown', handleClickOutside);
	});

	onDestroy(() => {
		if (!browser) return;
		document.removeEventListener('mousedown', handleClickOutside);
	});
</script>

<div class="multiselect">
	{#if label}
		<label class="multiselect__label" for={dropdownId}>{label}</label>
	{/if}

	<button
		id={dropdownId}
		class="multiselect__trigger"
		type="button"
		on:click={toggleOpen}
		class:multiselect__trigger--open={open}
		aria-haspopup="listbox"
		aria-expanded={open}
		{...{ 'aria-controls': `${dropdownId}-list` }}
		bind:this={buttonEl}
	>
		<span class="multiselect__placeholder">
			{#if selected.length === 0}
				{placeholder}
			{:else}
				{selected
					.map((value) => options.find((option) => option.value === value)?.label ?? value)
					.join(', ')}
			{/if}
		</span>
		<span class="multiselect__chevron" aria-hidden="true">v</span>
	</button>

	{#if open}
		<div class="multiselect__dropdown">
			<div
				id={`${dropdownId}-list`}
				class="multiselect__chip-list"
				role="listbox"
				aria-multiselectable="true"
				bind:this={listboxEl}
			>
				{#each options as option}
					<button
						type="button"
						class="chip"
						class:chip--selected={selected.includes(option.value)}
						on:click={() => handleToggle(option.value)}
						disabled={option.disabled}
						role="option"
						aria-selected={selected.includes(option.value)}
					>
						{option.label}
					</button>
				{/each}
			</div>

			<div class="multiselect__actions">
				{#if selected.length > 0}
					<button class="multiselect__link" type="button" on:click={clear}>Clear selection</button>
				{/if}
				<button class="multiselect__link" type="button" on:click={close}>Close</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.multiselect {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.multiselect__label {
		font-weight: 600;
		font-size: 0.95rem;
		color: #0f172a;
	}

	.multiselect__trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		width: 100%;
		background-color: white;
		border: 1px solid #cbd5e1;
		border-radius: 0.5rem;
		padding: 0.75rem 1rem;
		font-size: 1rem;
		cursor: pointer;
		transition:
			border-color 0.15s ease,
			box-shadow 0.15s ease;
	}

	.multiselect__trigger:focus-visible {
		outline: 2px solid #1d4ed8;
		outline-offset: 2px;
	}

	.multiselect__trigger--open {
		border-color: #1d4ed8;
		box-shadow: 0 0 0 2px rgba(29, 78, 216, 0.15);
	}

	.multiselect__placeholder {
		flex: 1;
		text-align: left;
		color: #0f172a;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.multiselect__chevron {
		font-size: 1rem;
		color: #64748b;
	}

	.multiselect__dropdown {
		position: absolute;
		left: 0;
		right: 0;
		top: calc(100% + 0.25rem);
		background: white;
		border: 1px solid #cbd5e1;
		border-radius: 0.75rem;
		box-shadow: 0 20px 45px -15px rgba(15, 23, 42, 0.25);
		padding: 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		z-index: 50;
	}

	.multiselect__chip-list {
		max-height: 18rem;
		overflow-y: auto;
		margin: 0;
		padding: 0.25rem;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 0.5rem;
	}

	.chip {
		border-radius: 0.5rem;
		border: 1px solid #cbd5e1;
		background: white;
		color: #0f172a;
		padding: 0.45rem 1rem;
		cursor: pointer;
		font-size: 0.95rem;
		transition:
			background-color 0.15s ease,
			border-color 0.15s ease,
			color 0.15s ease;
	}

	.chip:hover {
		background-color: rgba(15, 23, 42, 0.06);
	}

	.chip--selected {
		border-color: #1d4ed8;
		color: #1d4ed8;
		background: white;
		box-shadow: none;
	}

	.chip--selected:hover {
		background: rgba(29, 78, 216, 0.12);
	}

	.chip:disabled {
		cursor: not-allowed;
		opacity: 0.4;
	}

	.multiselect__actions {
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
		align-items: center;
	}

	.multiselect__link {
		border: none;
		background: none;
		color: #1d4ed8;
		font-weight: 600;
		font-size: 0.9rem;
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		border-radius: 0.375rem;
	}

	.multiselect__link:hover {
		background-color: rgba(29, 78, 216, 0.12);
	}
</style>
