import { type ComparableAddress, normalizeAddress } from './isEqualAddress';

// Empty = no shopper-entered content, e.g. a guest billing address holding only an email.
export function isEmptyAddress(address?: ComparableAddress): boolean {
    if (!address) {
        return true;
    }

    const {
        customFields = [],
        extraFields = [],
        countryCode: _countryCode,
        ...fields
    } = normalizeAddress(address);

    return (
        Object.values(fields).every((value) => !value) &&
        customFields.length === 0 &&
        extraFields.length === 0 &&
        !address.stateOrProvince &&
        !address.stateOrProvinceCode
    );
}
