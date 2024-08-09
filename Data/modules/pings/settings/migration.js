import Constants from '../constants.js';

export const MigrationResult = {
	UNNECESSARY: 0,
	FAILED: 1,
	SUCCESS: 2
};

function createMigrations(foundryGame) {
	return [
		{
			version: '1.4.1',
			func: async () => {
				let minMoveVal = foundryGame.settings.get(Constants.PINGS, Constants.MINIMUM_PERMISSION);
				if (typeof minMoveVal === 'string') {
					await foundryGame.settings.set(Constants.PINGS, Constants.MINIMUM_PERMISSION,
						Number(minMoveVal));
					return MigrationResult.SUCCESS;
				} else {
					return MigrationResult.UNNECESSARY;
				}
			}
		}
	];
}

export async function migrate(foundryGame) {
	try {
		foundryGame.settings.register(Constants.PINGS, 'lastVersion', {
			config: false,
			scope: 'client',
			type: Number,
			default: -1
		});

		let finalResult = MigrationResult.UNNECESSARY
		let lastVersion = foundryGame.settings.get(Constants.PINGS, Constants.LAST_VERSION);
		if (lastVersion === -1) {
			return MigrationResult.UNNECESSARY;
		}
		const migrations = createMigrations(foundryGame);
		for (let i = 0; i < migrations.length; ++i) {
			const migration = migrations[i];
			const result = lastVersion >= i ? MigrationResult.UNNECESSARY : await migration.func(lastVersion);
			if (result === MigrationResult.FAILED) {
				return MigrationResult.FAILED;
			} else if (result === MigrationResult.SUCCESS) {
				finalResult = migrations[migrations.length - 1].version;
			}
			
			lastVersion = i;
			await foundryGame.settings.set(Constants.PINGS, Constants.LAST_VERSION, lastVersion);
		}
		return finalResult;
	} catch (e) {
		console.error('Pings MigrationResult failed:', e);
		return { type: MigrationResult.FAILED };
	}
}
