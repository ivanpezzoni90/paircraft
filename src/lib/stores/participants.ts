import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const STORAGE_KEY = 'paircraft.participants';
const defaultValue = [''];
const isDefaultValue = (value: string[]) =>
	value.length === 1 && typeof value[0] === 'string' && value[0].trim() === '';
const initialValue = loadParticipants();

export const participants = writable<string[]>(initialValue);

participants.subscribe((value) => {
	if (!browser) return;
	try {
		if (isDefaultValue(value)) {
			localStorage.removeItem(STORAGE_KEY);
		} else {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
		}
	} catch (error) {
		console.error('Failed to persist participants', error);
	}
});

export const resetParticipants = () => {
	participants.set([...defaultValue]);
};

function loadParticipants(): string[] {
	if (!browser) return defaultValue;

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return defaultValue;

		const parsed = JSON.parse(stored);
		if (!Array.isArray(parsed)) {
			return defaultValue;
		}

		const filtered = parsed.filter((item) => typeof item === 'string');
		if (filtered.length === 0) {
			return defaultValue;
		}

		return filtered;
	} catch (error) {
		console.error('Failed to load participants from storage', error);
		return defaultValue;
	}
}
