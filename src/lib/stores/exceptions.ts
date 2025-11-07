import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const STORAGE_KEY = 'paircraft.exceptions';
const defaultValue: Record<string, string[]> = {};
const initialValue = loadExceptions();

export const exceptions = writable<Record<string, string[]>>(initialValue);

exceptions.subscribe((value) => {
	if (!browser) return;
	try {
		const sanitized = sanitize(value);
		if (Object.keys(sanitized).length === 0) {
			localStorage.removeItem(STORAGE_KEY);
		} else {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
		}
	} catch (error) {
		console.error('Failed to persist exceptions', error);
	}
});

export const resetExceptions = () => {
	exceptions.set({ ...defaultValue });
};

function loadExceptions(): Record<string, string[]> {
	if (!browser) return defaultValue;

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return defaultValue;

		const parsed = JSON.parse(stored);
		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
			return defaultValue;
		}

		return sanitize(parsed as Record<string, unknown>);
	} catch (error) {
		console.error('Failed to load exceptions from storage', error);
		return defaultValue;
	}
}

function sanitize(value: Record<string, unknown>): Record<string, string[]> {
	const result: Record<string, string[]> = {};

	for (const [key, list] of Object.entries(value)) {
		if (typeof key !== 'string') continue;
		if (!Array.isArray(list)) continue;

		const filtered = list.filter(
			(item): item is string => typeof item === 'string' && item.trim() !== ''
		);
		if (filtered.length > 0) {
			result[key] = filtered;
		}
	}

	return result;
}
