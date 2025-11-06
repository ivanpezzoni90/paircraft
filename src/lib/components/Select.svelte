<script lang="ts">
	import { browser } from '$app/environment';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';

	type Option = {
		label: string;
		value: string;
		disabled?: boolean;
	};

	export let options: Option[] = [];
	export let value = '';
	export let placeholder = 'Select...';
	export let label: string;

	const dispatch = createEventDispatcher<{ change: { value: string } }>();

	let open = false;
	let buttonEl: HTMLButtonElement | null = null;
	let listEl: HTMLUListElement | null = null;
	const selectId = `select-${
		typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
			? crypto.randomUUID()
			: Math.random().toString(36).slice(2)
	}`;

$: selectedLabel =
	options.find((option) => option.value === value)?.label ?? (value ? value : '');

	const toggleOpen = () => {
		if (!options.length) return;
		open = !open;
	};

	const close = () => {
		open = false;
	};

	function selectOption(option: Option) {
		if (option.disabled) return;
		value = option.value;
		dispatch('change', { value });
		close();
	}

	const handleClickOutside = (event: MouseEvent) => {
		if (!browser) return;
		const target = event.target as Node | null;
		if (!target) return;

		const clickedInside =
			(buttonEl && buttonEl.contains(target)) || (listEl && listEl.contains(target));

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

<div class="select">
	{#if label}
		<label class="select__label" for={selectId}>{label}</label>
	{/if}

	<button
		class="select__trigger"
		type="button"
		on:click={toggleOpen}
		aria-haspopup="listbox"
		aria-expanded={open}
		bind:this={buttonEl}
		id={selectId}
	>
		<span class="select__value">
			{#if selectedLabel}
				{selectedLabel}
			{:else}
				<span class="select__placeholder">{placeholder}</span>
			{/if}
		</span>
		<span class="select__chevron" aria-hidden="true">v</span>
	</button>

	{#if open}
		<ul
			class="select__dropdown"
			role="listbox"
			bind:this={listEl}
			aria-activedescendant={value ? `${selectId}-${value}` : undefined}
			tabindex="0"
		>
			{#each options as option}
				<li
					id={`${selectId}-${option.value}`}
					class="select__option"
					class:selected={option.value === value}
					class:disabled={option.disabled}
					role="option"
					aria-selected={option.value === value}
				>
					<button type="button" on:click={() => selectOption(option)} disabled={option.disabled}>
						{option.label}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.select {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.select__label {
		font-weight: 600;
		font-size: 0.95rem;
		color: #0f172a;
	}

	.select__trigger {
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

	.select__trigger:focus-visible {
		outline: 2px solid #1d4ed8;
		outline-offset: 2px;
	}

	.select__value {
		flex: 1;
		text-align: left;
		color: #0f172a;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.select__placeholder {
		color: #94a3b8;
	}

	.select__chevron {
		font-size: 1rem;
		color: #64748b;
	}

	.select__dropdown {
		position: absolute;
		left: 0;
		right: 0;
		top: calc(100% + 0.25rem);
		background: white;
		border: 1px solid #cbd5e1;
		border-radius: 0.75rem;
		box-shadow: 0 20px 45px -15px rgba(15, 23, 42, 0.25);
		padding: 0.5rem;
		margin: 0;
		list-style: none;
		z-index: 50;
		max-height: 16rem;
		overflow-y: auto;
	}

	.select__option button {
		width: 100%;
		text-align: left;
		padding: 0.5rem 0.75rem;
		border-radius: 0.4rem;
		border: none;
		background: none;
		cursor: pointer;
		font-size: 1rem;
		color: #0f172a;
		transition: background-color 0.15s ease;
	}

	.select__option button:hover {
		background: rgba(59, 130, 246, 0.12);
	}

	.select__option.selected button {
		background: rgba(59, 130, 246, 0.18);
		font-weight: 600;
	}

	.select__option.disabled button {
		cursor: not-allowed;
		opacity: 0.5;
	}
</style>
