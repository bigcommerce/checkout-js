import { type CompanyAddress, type CustomerAddress } from '@bigcommerce/checkout-sdk';
import { debounce, type DebouncedFunc } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useCheckout } from '@bigcommerce/checkout/contexts';

import AddressType from './AddressType';
import { searchingAddresses } from './searchingAddresses';

export const COMPANY_ADDRESS_SEARCH_LIMIT = 5;

const SEARCH_DEBOUNCE_MILLISECONDS = 500;

export interface CompanyAddressSearchProps {
    addresses: CustomerAddress[];
    searchQuery: string;
    type: AddressType;
}

interface CompanyAddressSearchState {
    filteredAddresses: CustomerAddress[];
}

export function matchesAddressType(address: CustomerAddress, type: AddressType): boolean {
    return type === AddressType.Shipping ? Boolean(address.isShipping) : Boolean(address.isBilling);
}

function mapToCustomerAddress(address: CompanyAddress): CustomerAddress {
    return {
        id: address.entityId,
        type: 'company',
        firstName: address.firstName,
        lastName: address.lastName,
        company: '',
        address1: address.address1,
        address2: address.address2 ?? '',
        city: address.city,
        stateOrProvince: address.stateOrProvince ?? '',
        stateOrProvinceCode: address.stateOrProvinceCode ?? '',
        postalCode: address.postalCode ?? '',
        country: address.country,
        countryCode: address.countryCode,
        phone: address.phone ?? '',
        label: address.label ?? undefined,
        customFields: [],
        isShipping: address.isShipping ?? false,
        isBilling: address.isBilling ?? false,
        isDefaultShipping: address.isDefaultShipping ?? false,
        isDefaultBilling: address.isDefaultBilling ?? false,
        extraFields: [],
    };
}

export function useCompanyAddressSearch({
    addresses,
    searchQuery,
    type,
}: CompanyAddressSearchProps): CompanyAddressSearchState {
    const { checkoutService } = useCheckout(() => undefined);
    const [searchResults, setSearchResults] = useState<CustomerAddress[] | undefined>(undefined);

    const propsRef = useRef({ addresses, searchQuery, type });
    const debouncedSearchRef = useRef<DebouncedFunc<(query: string) => Promise<void>> | undefined>(
        undefined,
    );

    propsRef.current = { addresses, searchQuery, type };

    const matchesType = useCallback(
        (address: CustomerAddress) => matchesAddressType(address, type),
        [type],
    );

    const addressesByType = useMemo(() => addresses.filter(matchesType), [addresses, matchesType]);

    useEffect(() => {
        debouncedSearchRef.current = debounce(async (query: string) => {
            const isStale = () => propsRef.current.searchQuery !== query;

            try {
                if (!checkoutService.getState().data.getB2BToken()) {
                    await checkoutService.getB2BToken();
                }

                const { company } = await checkoutService.searchCompanyAddresses(query, {
                    first: COMPANY_ADDRESS_SEARCH_LIMIT,
                    ...(propsRef.current.type === AddressType.Shipping
                        ? { isShipping: true }
                        : { isBilling: true }),
                });

                if (isStale()) {
                    return;
                }

                if (!company) {
                    setSearchResults(undefined);

                    return;
                }

                const addressesById = new Map(
                    propsRef.current.addresses.map((address) => [address.id, address]),
                );

                setSearchResults(
                    (company.addresses.edges ?? []).map(
                        ({ node }) =>
                            addressesById.get(node.entityId) ?? mapToCustomerAddress(node),
                    ),
                );
            } catch {
                if (!isStale()) {
                    setSearchResults(undefined);
                }
            }
        }, SEARCH_DEBOUNCE_MILLISECONDS);

        return () => {
            debouncedSearchRef.current?.cancel();
        };
    }, []);

    useEffect(() => {
        const debouncedSearch = debouncedSearchRef.current;

        if (
            !debouncedSearch ||
            (searchResults === undefined && searchQuery === '') // don't search on initial loading
        ) {
            return;
        }

        debouncedSearch(searchQuery);

        if (!searchQuery) {
            debouncedSearch.flush();
        }
    }, [searchQuery]);

    const filteredAddresses = useMemo(() => {
        const matchingAddresses =
            searchResults && searchResults.length > 0
                ? searchResults.filter(matchesType)
                : searchingAddresses(addressesByType, searchQuery);

        return matchingAddresses.slice(0, COMPANY_ADDRESS_SEARCH_LIMIT);
    }, [addressesByType, matchesType, searchQuery, searchResults]);

    return { filteredAddresses };
}
