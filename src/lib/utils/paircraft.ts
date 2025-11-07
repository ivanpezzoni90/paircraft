export type PairingMap = Record<string, string>;
export type ExceptionsMap = Record<string, string[]>;

export type PaircraftResult =
	| { success: true; pairs: PairingMap }
	| { success: false; reason: 'constraints' | 'invalid'; errors?: string[] };

const normalizeExceptions = (exceptions: ExceptionsMap, participants: string[]) => {
	const normalized: ExceptionsMap = {};
	const allowed = new Set(participants);

	for (const participant of participants) {
		const list = exceptions[participant] ?? [];
		normalized[participant] = list.filter((name) => allowed.has(name) && name !== participant);
	}

	return normalized;
};

const testPairings = (pairs: PairingMap, exceptions: ExceptionsMap): string[] => {
	const errors: string[] = [];

	for (const participant of Object.keys(pairs)) {
		const assigned = pairs[participant];

		if (!assigned) {
			errors.push(`Missing assignment for ${participant}`);
			continue;
		}

		if (participant === assigned) {
			errors.push(`${participant} is assigned to themselves`);
		}

		const blocked = exceptions[participant] ?? [];
		if (blocked.includes(assigned)) {
			errors.push(`${participant} is assigned to blocked partner ${assigned}`);
		}
	}

	return errors;
};

const getMostSelective = (participants: string[], exceptions: ExceptionsMap) => {
	let mostSelective = participants[0];
	let mostExceptions = -1;

	for (const participant of participants) {
		const exceptionCount = exceptions[participant]?.length ?? 0;
		if (exceptionCount > mostExceptions) {
			mostExceptions = exceptionCount;
			mostSelective = participant;
		}
	}

	return mostSelective;
};

const makePicks = (
	participants: string[],
	exceptions: ExceptionsMap,
	rng: () => number = Math.random
): PairingMap | null => {
	const picks: PairingMap = {};
	let available = [...participants];
	let pickers = [...participants];

	while (pickers.length > 0) {
		const chooser = getMostSelective(pickers, exceptions);
		pickers = pickers.filter((person) => person !== chooser);

		const disallowed = new Set([chooser, ...(exceptions[chooser] ?? [])]);
		const possible = available.filter((candidate) => !disallowed.has(candidate));

		if (possible.length === 0) {
			return null;
		}

		const selected = possible[Math.floor(rng() * possible.length)];
		picks[chooser] = selected;
		available = available.filter((candidate) => candidate !== selected);
	}

	return picks;
};

export const generatePairs = (
	participants: string[],
	exceptions: ExceptionsMap,
	rng?: () => number
): PaircraftResult => {
	const trimmed = participants.map((name) => name.trim()).filter(Boolean);

	if (trimmed.length < 2) {
		return { success: false, reason: 'invalid', errors: ['At least two participants required'] };
	}

	const normalizedExceptions = normalizeExceptions(exceptions, trimmed);
	const picks = makePicks(trimmed, normalizedExceptions, rng);

	if (!picks) {
		return { success: false, reason: 'constraints' };
	}

	const errors = testPairings(picks, normalizedExceptions);
	if (errors.length > 0) {
		return { success: false, reason: 'invalid', errors };
	}

	return { success: true, pairs: picks };
};
