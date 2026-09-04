import { type Iso2 } from 'intl-tel-input';
import { rawCountryData } from 'intl-tel-input/data';

const iso2Codes = new Set<string>(rawCountryData.map(([iso2]) => iso2));

/**
 * Type guard that narrows an arbitrary string to a valid ISO 3166-1 alpha-2
 * country code (`Iso2`) recognised by intl-tel-input.
 */
export function isIso2(value: string): value is Iso2 {
    return iso2Codes.has(value);
}
