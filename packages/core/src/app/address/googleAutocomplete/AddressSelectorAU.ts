import AddressSelector from './AddressSelector';

// Australia Post requires alphanumeric unit number suffixes to be upper-case
const uppercaseUnitSuffix = (value: string): string =>
    value.replace(
        /\b(\d+)([a-z])\b/gi,
        (_, digits: string, letter: string) => `${digits}${letter.toUpperCase()}`,
    );

export default class AddressSelectorAU extends AddressSelector {
    getStreet(): string {
        const subpremise = uppercaseUnitSuffix(this._get('subpremise', 'short_name'));
        const subpremisePart = subpremise ? `${subpremise}/` : '';
        const streetNumber = uppercaseUnitSuffix(this._get('street_number', 'long_name'));

        return `${subpremisePart}${streetNumber} ${this._get('route', 'long_name')}`;
    }

    getStreet2(): string {
        return '';
    }
}
