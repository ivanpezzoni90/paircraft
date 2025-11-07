import { describe, expect, test } from 'vitest';
import type { ExceptionsMap } from './paircraft';
import { generatePairs } from './paircraft';

const constantRng = (value: number) => () => value;

describe('generatePairs', () => {
	test('pairs everyone without self-assignments when constraints allow', () => {
		const participants = ['Alex', 'Jordan', 'Priya', 'Mateo'];
		const exceptions: ExceptionsMap = {
			Alex: [],
			Jordan: [],
			Priya: [],
			Mateo: []
		};

		const result = generatePairs(participants, exceptions, { rng: constantRng(0) });

		expect(result.success).toBe(true);
		if (!result.success) return;

		expect(Object.keys(result.pairs)).toHaveLength(participants.length);
		for (const [giver, receiver] of Object.entries(result.pairs)) {
			expect(giver).not.toBe(receiver);
			expect(participants).toContain(receiver);
		}
	});

	test('respects exceptions (no blocked pairings)', () => {
		const participants = ['Alex', 'Jordan', 'Priya'];
		const exceptions: ExceptionsMap = {
			Alex: ['Jordan'],
			Jordan: [],
			Priya: []
		};

		const result = generatePairs(participants, exceptions, { rng: constantRng(0.5) });

		expect(result.success).toBe(true);
		if (!result.success) return;

		for (const [giver, receiver] of Object.entries(result.pairs)) {
			expect(giver).not.toBe(receiver);
			expect(exceptions[giver]?.includes(receiver)).toBeFalsy();
		}
	});

	test('fails with constraints reason when pairing is impossible', () => {
		const participants = ['Alex', 'Jordan'];
		const exceptions: ExceptionsMap = {
			Alex: ['Jordan'],
			Jordan: ['Alex']
		};

		const result = generatePairs(participants, exceptions, { rng: constantRng(0) });

		expect(result.success).toBe(false);
		if (result.success) return;
		expect(result.reason).toBe('constraints');
	});
});
