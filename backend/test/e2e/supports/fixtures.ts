import { appConfigs } from '../../../src/core/database/schema/index.js';
import type { Customizer } from './customizer.types.js';
import { getTestDatabase } from './test-database.js';

/**
 * `given*` helpers that seed the e2e database.
 *
 * Every method inserts a row with defaults that are valid on their own, so it
 * can be called without arguments, and returns the row as stored (generated
 * id, timestamps, ...). Pass a partial or a consumer to adjust the defaults:
 *
 *   await Fixtures.givenAppConfig();
 *   await Fixtures.givenAppConfig({ key: 'maintenance_mode', value: 'off' });
 *   await Fixtures.givenAppConfig((config) => { config.value = 'on'; });
 *
 * Rows are wiped after each test by `e2e-hooks.ts`, no cleanup needed.
 */
export class Fixtures {
  // ---------------------------------------------------------------------------
  // App configs
  // ---------------------------------------------------------------------------

  static async givenAppConfig(
    customizer?: Customizer<typeof appConfigs.$inferInsert>,
  ): Promise<typeof appConfigs.$inferSelect> {
    const defaults: typeof appConfigs.$inferInsert = {
      key: `maintenance_mode`,
      value: 'off',
    };
    const values = Fixtures.applyCustomizer(defaults, customizer);

    const [insertedConfig] = await getTestDatabase()
      .insert(appConfigs)
      .values(values)
      .returning();

    return insertedConfig;
  }

  // ---------------------------------------------------------------------------
  // Internals
  // ---------------------------------------------------------------------------

  /** Applies a `Customizer` (partial or consumer) on top of fixture defaults. */
  private static applyCustomizer<T extends object>(
    defaults: T,
    customizer?: Customizer<T>,
  ): T {
    if (!customizer) {
      return defaults;
    }

    if (typeof customizer === 'function') {
      customizer(defaults);

      return defaults;
    }

    return { ...defaults, ...customizer };
  }
}
