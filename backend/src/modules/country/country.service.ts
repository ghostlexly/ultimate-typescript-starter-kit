import { Injectable } from '@nestjs/common';
import * as countries from 'i18n-iso-countries';

export interface CountryData {
  countryName: string;
  iso2Code: string;
  iso3Code: string;
  num3Code: string;
  continent: string | null;
  continentName: string | null;
  currencyCode: string | null;
}

@Injectable()
export class CountryService {
  /**
   * Get all countries data with optional language support
   * @param language - ISO 639-1 language code (e.g., 'en', 'fr', 'es'). Defaults to 'en'
   * @returns Array of country data
   */
  getAllCountries(language: string = 'en'): CountryData[] {
    const allCountries = countries.getNames(language, { select: 'official' });
    const countriesArray: CountryData[] = [];

    const entries = Object.entries(allCountries);

    for (const [iso2Code, countryName] of entries) {
      const iso3Code = countries.alpha2ToAlpha3(iso2Code);
      const num3Code = countries.alpha2ToNumeric(iso2Code);

      if (!iso3Code || !num3Code) {
        continue;
      }

      countriesArray.push({
        countryName,
        iso2Code,
        iso3Code,
        num3Code,
        continent: this.getContinentCode(iso2Code),
        continentName: this.getContinentName(iso2Code),
        currencyCode: this.getCurrencyCode(iso2Code),
      });
    }

    return countriesArray;
  }

  /**
   * Get a single country by ISO2 code
   * @param iso2Code - ISO 3166-1 alpha-2 country code
   * @param language - ISO 639-1 language code (e.g., 'en', 'fr', 'es'). Defaults to 'en'
   * @returns Country data or null if not found
   */
  getCountryByIso2(iso2Code: string, language: string = 'en'): CountryData | null {
    const countryName = countries.getName(iso2Code, language, {
      select: 'official',
    });

    if (!countryName) {
      return null;
    }

    const iso3Code = countries.alpha2ToAlpha3(iso2Code);
    const num3Code = countries.alpha2ToNumeric(iso2Code);

    if (!iso3Code || !num3Code) {
      return null;
    }

    return {
      countryName,
      iso2Code,
      iso3Code,
      num3Code,
      continent: this.getContinentCode(iso2Code),
      continentName: this.getContinentName(iso2Code),
      currencyCode: this.getCurrencyCode(iso2Code),
    };
  }

  private getContinentCode(iso2Code: string): string | null {
    const continentMap: Record<string, string> = {
      // Africa
      DZ: 'AF',
      AO: 'AF',
      BJ: 'AF',
      BW: 'AF',
      BF: 'AF',
      BI: 'AF',
      CM: 'AF',
      CV: 'AF',
      CF: 'AF',
      TD: 'AF',
      KM: 'AF',
      CG: 'AF',
      CD: 'AF',
      CI: 'AF',
      DJ: 'AF',
      EG: 'AF',
      GQ: 'AF',
      ER: 'AF',
      ET: 'AF',
      GA: 'AF',
      GM: 'AF',
      GH: 'AF',
      GN: 'AF',
      GW: 'AF',
      KE: 'AF',
      LS: 'AF',
      LR: 'AF',
      LY: 'AF',
      MG: 'AF',
      MW: 'AF',
      ML: 'AF',
      MR: 'AF',
      MU: 'AF',
      YT: 'AF',
      MA: 'AF',
      MZ: 'AF',
      NA: 'AF',
      NE: 'AF',
      NG: 'AF',
      RE: 'AF',
      RW: 'AF',
      SH: 'AF',
      ST: 'AF',
      SN: 'AF',
      SC: 'AF',
      SL: 'AF',
      SO: 'AF',
      ZA: 'AF',
      SS: 'AF',
      SD: 'AF',
      SZ: 'AF',
      TZ: 'AF',
      TG: 'AF',
      TN: 'AF',
      UG: 'AF',
      ZM: 'AF',
      ZW: 'AF',
      // Antarctica
      AQ: 'AN',
      BV: 'AN',
      GS: 'AN',
      HM: 'AN',
      TF: 'AN',
      // Asia
      AF: 'AS',
      AM: 'AS',
      AZ: 'AS',
      BH: 'AS',
      BD: 'AS',
      BT: 'AS',
      BN: 'AS',
      KH: 'AS',
      CN: 'AS',
      CX: 'AS',
      CC: 'AS',
      IO: 'AS',
      GE: 'AS',
      HK: 'AS',
      IN: 'AS',
      ID: 'AS',
      IR: 'AS',
      IQ: 'AS',
      IL: 'AS',
      JP: 'AS',
      JO: 'AS',
      KZ: 'AS',
      KP: 'AS',
      KR: 'AS',
      KW: 'AS',
      KG: 'AS',
      LA: 'AS',
      LB: 'AS',
      MO: 'AS',
      MY: 'AS',
      MV: 'AS',
      MN: 'AS',
      MM: 'AS',
      NP: 'AS',
      OM: 'AS',
      PK: 'AS',
      PS: 'AS',
      PH: 'AS',
      QA: 'AS',
      SA: 'AS',
      SG: 'AS',
      LK: 'AS',
      SY: 'AS',
      TW: 'AS',
      TJ: 'AS',
      TH: 'AS',
      TL: 'AS',
      TR: 'AS',
      TM: 'AS',
      AE: 'AS',
      UZ: 'AS',
      VN: 'AS',
      YE: 'AS',
      // Europe
      AX: 'EU',
      AL: 'EU',
      AD: 'EU',
      AT: 'EU',
      BY: 'EU',
      BE: 'EU',
      BA: 'EU',
      BG: 'EU',
      HR: 'EU',
      CY: 'EU',
      CZ: 'EU',
      DK: 'EU',
      EE: 'EU',
      FO: 'EU',
      FI: 'EU',
      FR: 'EU',
      DE: 'EU',
      GI: 'EU',
      GR: 'EU',
      GG: 'EU',
      VA: 'EU',
      HU: 'EU',
      IS: 'EU',
      IE: 'EU',
      IM: 'EU',
      IT: 'EU',
      JE: 'EU',
      LV: 'EU',
      LI: 'EU',
      LT: 'EU',
      LU: 'EU',
      MK: 'EU',
      MT: 'EU',
      MD: 'EU',
      MC: 'EU',
      ME: 'EU',
      NL: 'EU',
      NO: 'EU',
      PL: 'EU',
      PT: 'EU',
      RO: 'EU',
      RU: 'EU',
      SM: 'EU',
      RS: 'EU',
      SK: 'EU',
      SI: 'EU',
      ES: 'EU',
      SJ: 'EU',
      SE: 'EU',
      CH: 'EU',
      UA: 'EU',
      GB: 'EU',
      // North America
      AI: 'NA',
      AG: 'NA',
      AW: 'NA',
      BS: 'NA',
      BB: 'NA',
      BZ: 'NA',
      BM: 'NA',
      BQ: 'NA',
      CA: 'NA',
      KY: 'NA',
      CR: 'NA',
      CU: 'NA',
      CW: 'NA',
      DM: 'NA',
      DO: 'NA',
      SV: 'NA',
      GL: 'NA',
      GD: 'NA',
      GP: 'NA',
      GT: 'NA',
      HT: 'NA',
      HN: 'NA',
      JM: 'NA',
      MQ: 'NA',
      MX: 'NA',
      MS: 'NA',
      NI: 'NA',
      PA: 'NA',
      PM: 'NA',
      PR: 'NA',
      BL: 'NA',
      KN: 'NA',
      LC: 'NA',
      MF: 'NA',
      VC: 'NA',
      SX: 'NA',
      TT: 'NA',
      TC: 'NA',
      US: 'NA',
      VG: 'NA',
      VI: 'NA',
      // Oceania
      AS: 'OC',
      AU: 'OC',
      CK: 'OC',
      FJ: 'OC',
      PF: 'OC',
      GU: 'OC',
      KI: 'OC',
      MH: 'OC',
      FM: 'OC',
      NR: 'OC',
      NC: 'OC',
      NZ: 'OC',
      NU: 'OC',
      NF: 'OC',
      MP: 'OC',
      PW: 'OC',
      PG: 'OC',
      PN: 'OC',
      WS: 'OC',
      SB: 'OC',
      TK: 'OC',
      TO: 'OC',
      TV: 'OC',
      UM: 'OC',
      VU: 'OC',
      WF: 'OC',
      // South America
      AR: 'SA',
      BO: 'SA',
      BR: 'SA',
      CL: 'SA',
      CO: 'SA',
      EC: 'SA',
      FK: 'SA',
      GF: 'SA',
      GY: 'SA',
      PY: 'SA',
      PE: 'SA',
      SR: 'SA',
      UY: 'SA',
      VE: 'SA',
    };

    return continentMap[iso2Code] || null;
  }

  private getContinentName(iso2Code: string): string | null {
    const continentCode = this.getContinentCode(iso2Code);

    if (!continentCode) {
      return null;
    }

    const continentNames: Record<string, string> = {
      AF: 'Africa',
      AN: 'Antarctica',
      AS: 'Asia',
      EU: 'Europe',
      NA: 'North America',
      OC: 'Oceania',
      SA: 'South America',
    };

    return continentNames[continentCode] || null;
  }

  private getCurrencyCode(iso2Code: string): string | null {
    const currencyMap: Record<string, string> = {
      US: 'USD',
      CA: 'CAD',
      GB: 'GBP',
      AU: 'AUD',
      NZ: 'NZD',
      JP: 'JPY',
      CN: 'CNY',
      IN: 'INR',
      BR: 'BRL',
      MX: 'MXN',
      ZA: 'ZAR',
      // Euro zone countries
      AT: 'EUR',
      BE: 'EUR',
      CY: 'EUR',
      EE: 'EUR',
      FI: 'EUR',
      FR: 'EUR',
      DE: 'EUR',
      GR: 'EUR',
      IE: 'EUR',
      IT: 'EUR',
      LV: 'EUR',
      LT: 'EUR',
      LU: 'EUR',
      MT: 'EUR',
      NL: 'EUR',
      PT: 'EUR',
      SK: 'EUR',
      SI: 'EUR',
      ES: 'EUR',
      // Other major currencies
      CH: 'CHF',
      SE: 'SEK',
      NO: 'NOK',
      DK: 'DKK',
      PL: 'PLN',
      CZ: 'CZK',
      HU: 'HUF',
      RO: 'RON',
      BG: 'BGN',
      HR: 'HRK',
      RU: 'RUB',
      TR: 'TRY',
      KR: 'KRW',
      SG: 'SGD',
      HK: 'HKD',
      TH: 'THB',
      MY: 'MYR',
      ID: 'IDR',
      PH: 'PHP',
      VN: 'VND',
      AE: 'AED',
      SA: 'SAR',
      IL: 'ILS',
      EG: 'EGP',
      NG: 'NGN',
      KE: 'KES',
    };

    return currencyMap[iso2Code] || null;
  }
}
