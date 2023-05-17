import { CustomerInitializeOptions, CustomerRequestOptions } from "@bigcommerce/checkout-sdk";

import { CheckoutContextProps } from "@bigcommerce/checkout/payment-integration-api";

import { filterUnsupportedMethodIds } from "./getSupportedMethods";

interface WithCheckoutCheckoutButtonHelperProps {
    availableMethodIds: string[];
    isLoading: boolean;
    isPaypalCommerce: boolean;
    initializedMethodIds: string[];
    deinitialize(options: CustomerRequestOptions): void;
    initialize(options: CustomerInitializeOptions): void;
}

export function mapToCheckoutButtonHelperProps({
    checkoutState: {
       data: {
           getConfig,
           getCustomer,
       },
       statuses: {
           isInitializedCustomer,
       },
       errors: {
           getInitializeCustomerError,
       }
    },
    checkoutService,
}: CheckoutContextProps): WithCheckoutCheckoutButtonHelperProps | null {
    const config = getConfig();
    const availableMethodIds = filterUnsupportedMethodIds(config?.checkoutSettings.remoteCheckoutProviders ?? []);
    const customer = getCustomer();

    if (!config || availableMethodIds.length === 0 || !customer?.isGuest) {
        return null;
    }

    const isLoading = availableMethodIds.filter(
        (methodId) => Boolean(getInitializeCustomerError(methodId)) || isInitializedCustomer(methodId)
    ).length !== availableMethodIds.length;
    const initializedMethodIds = availableMethodIds.filter((methodId) => isInitializedCustomer(methodId));
    const paypalCommerceIds = ['paypalcommerce', 'paypalcommercecredit', 'paypalcommercevenmo'];
    const isPaypalCommerce = availableMethodIds.some(id => paypalCommerceIds.includes(id));

    return {
        availableMethodIds,
        deinitialize: checkoutService.deinitializeCustomer,
        initialize: checkoutService.initializeCustomer,
        initializedMethodIds,
        isLoading,
        isPaypalCommerce,
    }
}
