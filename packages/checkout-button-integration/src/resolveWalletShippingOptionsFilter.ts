import { type ShippingOption } from '@bigcommerce/checkout-sdk';

export interface WalletShippingOptionsFilterContext {
    methodId: string;
    gatewayId: string;
    page: 'checkout';
}

export type WalletShippingOptionsFilter = (
    shippingOptions: ShippingOption[],
    context: WalletShippingOptionsFilterContext,
) => ShippingOption[] | Promise<ShippingOption[]>;

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        BigCommerce?: {
            walletButtons?: {
                filterAvailableShippingOptions?: WalletShippingOptionsFilter;
            };
        };
    }
}

const googlePayMethodIdPrefix = 'googlepay';

export const getWalletShippingOptionsFilterContext = (
    methodId: string,
): WalletShippingOptionsFilterContext => ({
    methodId: methodId.startsWith(googlePayMethodIdPrefix) ? googlePayMethodIdPrefix : methodId,
    gatewayId: methodId,
    page: 'checkout',
});

export const resolveWalletShippingOptionsFilter =
    (methodId: string) =>
    async (shippingOptions: ShippingOption[]): Promise<ShippingOption[]> => {
        const filter = window.BigCommerce?.walletButtons?.filterAvailableShippingOptions;

        if (typeof filter !== 'function') {
            return shippingOptions;
        }

        try {
            const filteredOptions = await filter(
                shippingOptions,
                getWalletShippingOptionsFilterContext(methodId),
            );

            return Array.isArray(filteredOptions) ? filteredOptions : shippingOptions;
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Failed to filter available shipping options:', error);

            return shippingOptions;
        }
    };
