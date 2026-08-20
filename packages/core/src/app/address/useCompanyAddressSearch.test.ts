import {
    type CompanyAddress,
    type CompanyAddressSearchResult,
    type CustomerAddress,
} from '@bigcommerce/checkout-sdk';
import { act, renderHook } from '@testing-library/react';

import { useCheckout } from '@bigcommerce/checkout/contexts';

import { getAddress, getCustomerAddressB2B } from './address.mock';
import AddressType from './AddressType';
import {
    COMPANY_ADDRESS_SEARCH_LIMIT,
    type CompanyAddressSearchProps,
    useCompanyAddressSearch,
} from './useCompanyAddressSearch';

jest.mock('@bigcommerce/checkout/contexts');

describe('useCompanyAddressSearch', () => {
    const getB2BTokenFromState = jest.fn();
    const getB2BToken = jest.fn();
    const searchCompanyAddresses = jest.fn();

    const checkoutService = {
        getState: () => ({ data: { getB2BToken: getB2BTokenFromState } }),
        getB2BToken,
        searchCompanyAddresses,
    };

    const createCustomerAddress = (
        id: number,
        overrides: Partial<CustomerAddress> = {},
    ): CustomerAddress => ({
        ...getAddress(),
        id,
        type: 'company',
        ...getCustomerAddressB2B({ isBilling: true }),
        ...overrides,
    });

    const createCompanyAddressNode = (
        entityId: number,
        overrides: Partial<CompanyAddress> = {},
    ): CompanyAddress => ({
        entityId,
        firstName: 'Company',
        lastName: 'Address',
        address1: `${entityId} Company Way`,
        city: 'Sydney',
        country: 'Australia',
        countryCode: 'AU',
        isBilling: true,
        ...overrides,
    });

    const createSearchResult = (nodes: CompanyAddress[]): CompanyAddressSearchResult => ({
        company: {
            addresses: {
                edges: nodes.map((node) => ({ node })),
                pageInfo: { hasNextPage: false },
            },
        },
    });

    const createDeferred = <T>() => {
        let resolve!: (value: T) => void;
        let reject!: (error: unknown) => void;
        const promise = new Promise<T>((res, rej) => {
            resolve = res;
            reject = rej;
        });

        return { promise, resolve, reject };
    };

    const billingAddresses = [
        createCustomerAddress(1, { address1: 'Main Street' }),
        ...[2, 3, 4, 5, 6].map((id) =>
            createCustomerAddress(id, { address1: `${id} Suburb Road` }),
        ),
    ];

    const renderCompanyAddressSearch = (initialProps: CompanyAddressSearchProps) =>
        renderHook((props: CompanyAddressSearchProps) => useCompanyAddressSearch(props), {
            initialProps,
        });

    const advanceSearchDebounce = async () =>
        act(async () => {
            jest.advanceTimersByTime(500);
            await Promise.resolve();
        });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();

        getB2BTokenFromState.mockReturnValue(undefined);
        getB2BToken.mockResolvedValue(undefined);
        searchCompanyAddresses.mockResolvedValue(createSearchResult([]));

        (useCheckout as jest.Mock).mockReturnValue({ checkoutService });
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('caps the address list at the limit', () => {
        const { result } = renderCompanyAddressSearch({
            addresses: billingAddresses,
            searchQuery: '',
            type: AddressType.Billing,
        });

        expect(result.current.filteredAddresses).toHaveLength(COMPANY_ADDRESS_SEARCH_LIMIT);
        expect(searchCompanyAddresses).not.toHaveBeenCalled();
    });

    it('filters addresses locally while the remote search is pending', () => {
        const { result, rerender } = renderCompanyAddressSearch({
            addresses: billingAddresses,
            searchQuery: '',
            type: AddressType.Billing,
        });

        rerender({ addresses: billingAddresses, searchQuery: 'main', type: AddressType.Billing });

        expect(searchCompanyAddresses).not.toHaveBeenCalled();
        expect(result.current.filteredAddresses).toEqual([billingAddresses[0]]);
    });

    it('requests a B2B token and searches company addresses after the debounce', async () => {
        searchCompanyAddresses.mockResolvedValue(
            createSearchResult([
                createCompanyAddressNode(2),
                createCompanyAddressNode(999, { address2: null, phone: null, label: null }),
                createCompanyAddressNode(998, { isBilling: false, isShipping: true }),
            ]),
        );

        const { result, rerender } = renderCompanyAddressSearch({
            addresses: billingAddresses,
            searchQuery: '',
            type: AddressType.Billing,
        });

        rerender({ addresses: billingAddresses, searchQuery: 'main', type: AddressType.Billing });

        await advanceSearchDebounce();

        expect(getB2BToken).toHaveBeenCalled();
        expect(searchCompanyAddresses).toHaveBeenCalledWith('main', {
            first: COMPANY_ADDRESS_SEARCH_LIMIT,
            isBilling: true,
        });

        expect(result.current.filteredAddresses).toHaveLength(2);
        expect(result.current.filteredAddresses[0]).toBe(billingAddresses[1]);
        expect(result.current.filteredAddresses[1]).toEqual(
            expect.objectContaining({
                id: 999,
                type: 'company',
                address1: '999 Company Way',
                address2: '',
                phone: '',
                isBilling: true,
            }),
        );
    });

    it('passes the shipping filter when searching on the shipping step', async () => {
        const shippingAddresses = [1, 2, 3, 4, 5].map((id) =>
            createCustomerAddress(id, getCustomerAddressB2B({ isShipping: true })),
        );

        const { rerender } = renderCompanyAddressSearch({
            addresses: shippingAddresses,
            searchQuery: '',
            type: AddressType.Shipping,
        });

        rerender({ addresses: shippingAddresses, searchQuery: 'main', type: AddressType.Shipping });

        await advanceSearchDebounce();

        expect(searchCompanyAddresses).toHaveBeenCalledWith('main', {
            first: COMPANY_ADDRESS_SEARCH_LIMIT,
            isShipping: true,
        });
    });

    it('does not request a B2B token when one is already available', async () => {
        getB2BTokenFromState.mockReturnValue('b2b-token');

        const { rerender } = renderCompanyAddressSearch({
            addresses: billingAddresses,
            searchQuery: '',
            type: AddressType.Billing,
        });

        rerender({ addresses: billingAddresses, searchQuery: 'main', type: AddressType.Billing });

        await advanceSearchDebounce();

        expect(getB2BToken).not.toHaveBeenCalled();
        expect(searchCompanyAddresses).toHaveBeenCalled();
    });

    it('falls back to local filtering when the remote search fails', async () => {
        searchCompanyAddresses.mockRejectedValue(new Error('search failed'));

        const { result, rerender } = renderCompanyAddressSearch({
            addresses: billingAddresses,
            searchQuery: '',
            type: AddressType.Billing,
        });

        rerender({ addresses: billingAddresses, searchQuery: 'main', type: AddressType.Billing });

        await advanceSearchDebounce();

        expect(searchCompanyAddresses).toHaveBeenCalled();
        expect(result.current.filteredAddresses).toEqual([billingAddresses[0]]);
    });

    it('falls back to local filtering when the previous search returned no results', async () => {
        searchCompanyAddresses.mockResolvedValue(createSearchResult([]));

        const { result, rerender } = renderCompanyAddressSearch({
            addresses: billingAddresses,
            searchQuery: '',
            type: AddressType.Billing,
        });

        rerender({ addresses: billingAddresses, searchQuery: 'zzz', type: AddressType.Billing });

        await advanceSearchDebounce();

        expect(result.current.filteredAddresses).toEqual([]);

        rerender({ addresses: billingAddresses, searchQuery: 'main', type: AddressType.Billing });

        expect(result.current.filteredAddresses).toEqual([billingAddresses[0]]);
    });

    it('ignores search results for outdated queries', async () => {
        const firstSearch = createDeferred<CompanyAddressSearchResult>();
        const secondSearch = createDeferred<CompanyAddressSearchResult>();

        searchCompanyAddresses
            .mockReturnValueOnce(firstSearch.promise)
            .mockReturnValueOnce(secondSearch.promise);

        const { result, rerender } = renderCompanyAddressSearch({
            addresses: billingAddresses,
            searchQuery: '',
            type: AddressType.Billing,
        });

        rerender({ addresses: billingAddresses, searchQuery: 'ma', type: AddressType.Billing });

        await advanceSearchDebounce();

        rerender({ addresses: billingAddresses, searchQuery: 'main', type: AddressType.Billing });

        await advanceSearchDebounce();

        await act(async () => {
            firstSearch.resolve(createSearchResult([createCompanyAddressNode(777)]));
        });

        expect(result.current.filteredAddresses).toEqual([billingAddresses[0]]);

        await act(async () => {
            secondSearch.resolve(createSearchResult([createCompanyAddressNode(999)]));
        });

        expect(result.current.filteredAddresses).toHaveLength(1);
        expect(result.current.filteredAddresses[0].id).toBe(999);
    });

    it('searches immediately when the query is cleared', async () => {
        const { rerender } = renderCompanyAddressSearch({
            addresses: billingAddresses,
            searchQuery: '',
            type: AddressType.Billing,
        });

        rerender({ addresses: billingAddresses, searchQuery: 'main', type: AddressType.Billing });

        await advanceSearchDebounce();

        searchCompanyAddresses.mockClear();

        await act(async () => {
            rerender({ addresses: billingAddresses, searchQuery: '', type: AddressType.Billing });
        });

        expect(searchCompanyAddresses).toHaveBeenCalledWith('', {
            first: COMPANY_ADDRESS_SEARCH_LIMIT,
            isBilling: true,
        });
    });
});
