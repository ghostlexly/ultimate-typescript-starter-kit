/**
 * How a `Fixtures.given*` method lets a test adjust its defaults:
 *   - a partial object merged over the defaults: `Fixtures.givenAppConfig({ value: 'on' })`
 *   - a consumer mutating the defaults:          `Fixtures.givenAppConfig((config) => { config.value = 'on'; })`
 */
export type Customizer<T> = Partial<T> | ((defaults: T) => void);
