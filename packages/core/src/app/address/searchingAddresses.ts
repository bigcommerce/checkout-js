import { type CustomerAddress } from '@bigcommerce/checkout-sdk';

export function searchingAddresses(addresses: CustomerAddress[], query: string): CustomerAddress[] {
    const normalized = query.trim().toLowerCase();

    if (!normalized) return addresses;

    return addresses.filter((address) => {
        const searchText = [
            address.firstName,
            address.lastName,
            address.company,
            address.phone,
            address.address1,
            address.address2,
            address.city,
            address.stateOrProvince,
            address.stateOrProvinceCode,
            address.postalCode,
            address.country,
            address.countryCode,
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

        return searchText.includes(normalized);
    });
}
