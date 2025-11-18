/**
 * Minimal test countries fixture
 * Use these instead of seeding all 250+ countries for faster tests
 */

export const TEST_COUNTRIES = [
  {
    countryName: 'France',
    iso2Code: 'FR',
    iso3Code: 'FRA',
    num3Code: '250',
    continent: 'EU',
    continentName: 'Europe',
    currencyCode: 'EUR',
    population: 0,
  },
  {
    countryName: 'United States',
    iso2Code: 'US',
    iso3Code: 'USA',
    num3Code: '840',
    continent: 'NA',
    continentName: 'North America',
    currencyCode: 'USD',
    population: 0,
  },
  {
    countryName: 'Germany',
    iso2Code: 'DE',
    iso3Code: 'DEU',
    num3Code: '276',
    continent: 'EU',
    continentName: 'Europe',
    currencyCode: 'EUR',
    population: 0,
  },
  {
    countryName: 'Japan',
    iso2Code: 'JP',
    iso3Code: 'JPN',
    num3Code: '392',
    continent: 'AS',
    continentName: 'Asia',
    currencyCode: 'JPY',
    population: 0,
  },
] as const;
