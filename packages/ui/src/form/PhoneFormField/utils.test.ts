import { type Country } from 'intl-tel-input';

import { getPhoneNumberPlaceholder } from './utils';

const makeCountry = (dialCode: string) => ({ dialCode }) as Country;

describe('getPhoneNumberPlaceholder', () => {
    it('prepends e.g. to the national format example number', () => {
        expect(getPhoneNumberPlaceholder('0412 345 678', makeCountry('61'))).toBe(
            'e.g. 0412 345 678',
        );
    });

    it('returns empty string when exampleNumber is empty', () => {
        expect(getPhoneNumberPlaceholder('', makeCountry('61'))).toBe('');
    });

    it('returns empty string when selectedCountryData is null', () => {
        expect(getPhoneNumberPlaceholder('0412 345 678', null)).toBe('');
    });
});
