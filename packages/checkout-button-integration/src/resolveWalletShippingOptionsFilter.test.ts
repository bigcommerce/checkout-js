import { type ShippingOption } from '@bigcommerce/checkout-sdk';

import { getShippingOption, getShippingOptionPickUpStore } from '@bigcommerce/checkout/test-mocks';

import {
    getWalletShippingOptionsFilterContext,
    resolveWalletShippingOptionsFilter,
    type WalletShippingOptionsFilter,
} from './resolveWalletShippingOptionsFilter';

const registerFilter = (filterAvailableShippingOptions?: WalletShippingOptionsFilter): void => {
    window.BigCommerce = { walletButtons: { filterAvailableShippingOptions } };
};

describe('resolveWalletShippingOptionsFilter', () => {
    const shippingOptions = [getShippingOption(), getShippingOptionPickUpStore()];

    afterEach(() => {
        delete window.BigCommerce;
    });

    describe('#getWalletShippingOptionsFilterContext', () => {
        it.each(['googlepay', 'googlepaystripeupe', 'googlepaybraintree'])(
            'normalizes %s to the googlepay method id',
            (methodId) => {
                expect(getWalletShippingOptionsFilterContext(methodId).methodId).toBe('googlepay');
            },
        );

        it('normalizes a Google Pay gateway variant to the googlepay method id', () => {
            expect(getWalletShippingOptionsFilterContext('googlepaystripeupe')).toEqual({
                methodId: 'googlepay',
                gatewayId: 'googlepaystripeupe',
                page: 'checkout',
            });
        });

        it('keeps the method id for wallets without gateway variants', () => {
            expect(getWalletShippingOptionsFilterContext('applepay')).toEqual({
                methodId: 'applepay',
                gatewayId: 'applepay',
                page: 'checkout',
            });
        });
    });

    describe('#resolveWalletShippingOptionsFilter', () => {
        it('returns the shipping options unchanged when the global is absent', async () => {
            await expect(
                resolveWalletShippingOptionsFilter('applepay')(shippingOptions),
            ).resolves.toBe(shippingOptions);
        });

        it('returns the shipping options unchanged when the namespace has no callback', async () => {
            window.BigCommerce = { walletButtons: {} };

            await expect(
                resolveWalletShippingOptionsFilter('applepay')(shippingOptions),
            ).resolves.toBe(shippingOptions);
        });

        it('returns the shipping options unchanged when the callback is not a function', async () => {
            Object.assign(window, {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                BigCommerce: {
                    walletButtons: { filterAvailableShippingOptions: 'not a function' },
                },
            });

            await expect(
                resolveWalletShippingOptionsFilter('applepay')(shippingOptions),
            ).resolves.toBe(shippingOptions);
        });

        it('returns the filtered shipping options when the callback is registered', async () => {
            const filterAvailableShippingOptions: WalletShippingOptionsFilter = (options) =>
                options.filter(({ type }) => type !== 'shipping_pickupinstore');

            registerFilter(filterAvailableShippingOptions);

            await expect(
                resolveWalletShippingOptionsFilter('applepay')(shippingOptions),
            ).resolves.toEqual([getShippingOption()]);
        });

        it('awaits an asynchronous callback', async () => {
            const filterAvailableShippingOptions: WalletShippingOptionsFilter = (options) =>
                Promise.resolve(options.slice(0, 1));

            registerFilter(filterAvailableShippingOptions);

            await expect(
                resolveWalletShippingOptionsFilter('applepay')(shippingOptions),
            ).resolves.toEqual([getShippingOption()]);
        });

        it('passes the normalized context to the callback', async () => {
            const filterAvailableShippingOptions = jest.fn((options: ShippingOption[]) => options);

            registerFilter(filterAvailableShippingOptions);

            await resolveWalletShippingOptionsFilter('googlepaystripeupe')(shippingOptions);

            expect(filterAvailableShippingOptions).toHaveBeenCalledWith(shippingOptions, {
                methodId: 'googlepay',
                gatewayId: 'googlepaystripeupe',
                page: 'checkout',
            });
        });

        it.each([
            ['undefined', undefined],
            ['null', null],
            ['an object', { id: 'not-an-array' }],
            ['a string', 'nope'],
        ])(
            'returns the shipping options unchanged when the callback resolves to %s',
            async (_label, resolved) => {
                Object.assign(window, {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    BigCommerce: {
                        walletButtons: {
                            filterAvailableShippingOptions: () => resolved,
                        },
                    },
                });

                await expect(
                    resolveWalletShippingOptionsFilter('applepay')(shippingOptions),
                ).resolves.toBe(shippingOptions);
            },
        );

        it('returns the shipping options unchanged when the callback rejects', async () => {
            jest.spyOn(console, 'error').mockImplementation(() => undefined);

            registerFilter(() => Promise.reject(new Error('filter failed')));

            await expect(
                resolveWalletShippingOptionsFilter('applepay')(shippingOptions),
            ).resolves.toBe(shippingOptions);
            // eslint-disable-next-line no-console
            expect(console.error).toHaveBeenCalledWith(
                'Failed to filter available shipping options:',
                expect.any(Error),
            );
        });

        it('returns the shipping options unchanged when the callback throws synchronously', async () => {
            jest.spyOn(console, 'error').mockImplementation(() => undefined);

            registerFilter(() => {
                throw new Error('filter exploded');
            });

            await expect(
                resolveWalletShippingOptionsFilter('applepay')(shippingOptions),
            ).resolves.toBe(shippingOptions);
        });

        it('resolves the callback at call time rather than when the filter is created', async () => {
            const filter = resolveWalletShippingOptionsFilter('applepay');

            const filterAvailableShippingOptions: WalletShippingOptionsFilter = (options) =>
                options.slice(0, 1);

            registerFilter(filterAvailableShippingOptions);

            await expect(filter(shippingOptions)).resolves.toEqual([getShippingOption()]);
        });
    });
});
