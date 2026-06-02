/** RGS-facing config (Storybook uses math fixtures for books). */

const tier = (pays: number[]) => {
	const sizes = [5, 6, 7, 8, 9, 10];
	const table: Record<string, number>[] = [];
	for (let i = 0; i < sizes.length; i++) {
		table.push({ [String(sizes[i])]: pays[i] });
	}
	table.push({ '11': pays[6] });
	for (let n = 12; n <= 36; n++) table[table.length - 1][String(n)] = pays[6];
	return table;
};

export default {
	providerName: 'sample_provider',
	gameName: 'clash_kronos',
	gameID: '0_0_clash_kronos',
	rtp: 0.965,
	numReels: 6,
	numRows: [6, 6, 6, 6, 6, 6],
	betModes: {
		base: {
			cost: 1.0,
			feature: true,
			buyBonus: false,
			rtp: 0.965,
			max_win: 10000.0,
		},
		bonus: {
			cost: 100.0,
			feature: true,
			buyBonus: true,
			rtp: 0.965,
			max_win: 10000.0,
		},
	},
	symbols: {
		W: { paytable: null, special_properties: ['wild'] },
		S: { paytable: null, special_properties: ['scatter'] },
		L5: { paytable: tier([0.01, 0.015, 0.03, 0.05, 0.08, 0.1, 0.15]) },
		L4: { paytable: tier([0.01, 0.015, 0.03, 0.05, 0.08, 0.1, 0.15]) },
		L3: { paytable: tier([0.01, 0.015, 0.03, 0.05, 0.08, 0.1, 0.15]) },
		L2: { paytable: tier([0.01, 0.015, 0.03, 0.05, 0.08, 0.1, 0.15]) },
		L1: { paytable: tier([0.05, 0.1, 0.2, 0.4, 0.6, 1.0, 1.5]) },
		H3: { paytable: tier([0.1, 0.2, 0.4, 0.8, 1.5, 3.0, 5.0]) },
		H2: { paytable: tier([0.1, 0.2, 0.4, 0.8, 1.5, 3.0, 5.0]) },
		H1: { paytable: tier([0.2, 0.4, 0.8, 1.5, 3.0, 6.0, 10.0]) },
	},
	paddingReels: {
		basegame: '',
		freegame: '',
	},
};
