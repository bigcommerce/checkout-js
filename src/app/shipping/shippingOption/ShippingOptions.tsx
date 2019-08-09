import { Cart, CheckoutSelectors, Consignment } from '@bigcommerce/checkout-sdk';
import { createSelector } from 'reselect';

import { withCheckout, CheckoutContextProps } from '../../checkout';
import getShippingMethodId from '../getShippingMethodId';

import ShippingOptionsForm from './ShippingOptionsForm';

export interface ShippingOptionsProps {
    isMultiShippingMode: boolean;
    isUpdatingAddress?: boolean;
    shouldShowShippingOptions: boolean;
}

export interface WithCheckoutShippingOptionsProps {
    invalidShippingMessage: string;
    methodId?: string;
    consignments?: Consignment[];
    cart: Cart;
    isSelectingShippingOption(consignmentId?: string): boolean;
    subscribeToConsignments(subscriber: (state: CheckoutSelectors) => void): () => void;
    selectShippingOption(consignmentId: string, optionId: string): void;
    isLoading(consignmentId?: string): boolean;
}

const subscribeToConsignmentsSelector = createSelector(
    ({ checkoutService }: CheckoutContextProps) => checkoutService.subscribe,
    subscribe => (subscriber: (state: CheckoutSelectors) => void) => {
        return subscribe(subscriber, ({ data }) => data.getConsignments());
    }
);

const isLoadingSelector = createSelector(
    (_: CheckoutSelectors, { isUpdatingAddress }: ShippingOptionsProps) => isUpdatingAddress,
    ({ statuses }: CheckoutSelectors) => statuses.isLoadingShippingOptions,
    ({ statuses }: CheckoutSelectors) => statuses.isSelectingShippingOption,
    ({ statuses }: CheckoutSelectors) => statuses.isUpdatingConsignment,
    ({ statuses }: CheckoutSelectors) => statuses.isCreatingConsignments,
    (isUpdatingAddress, isLoadingShippingOptions, isSelectingShippingOption, isUpdatingConsignment, isCreatingConsignments) => {
        return (consignmentId?: string) => {
            return (
                isUpdatingAddress ||
                isLoadingShippingOptions() ||
                isSelectingShippingOption(consignmentId) ||
                isUpdatingConsignment(consignmentId) ||
                isCreatingConsignments()
            );
        };
    }
);

function mapToShippingOptions(
    { checkoutService, checkoutState }: CheckoutContextProps,
    props: ShippingOptionsProps
): WithCheckoutShippingOptionsProps | null {
    const {
        data: {
            getCart,
            getConsignments,
            getConfig,
            getCustomer,
            getCheckout,
        },
        statuses: {
            isSelectingShippingOption,
        },
    } = checkoutState;

    const consignments = getConsignments() || [];
    const customer = getCustomer();
    const cart = getCart();
    const config = getConfig();
    const checkout = getCheckout();

    if (!config || !checkout || !customer || !cart) {
        return null;
    }

    const methodId = getShippingMethodId(checkout);
    const { shippingQuoteFailedMessage } = config.checkoutSettings;

    return {
        cart,
        consignments,
        invalidShippingMessage: shippingQuoteFailedMessage,
        isLoading: isLoadingSelector(checkoutState, props),
        isSelectingShippingOption,
        methodId,
        selectShippingOption: checkoutService.selectConsignmentShippingOption,
        subscribeToConsignments: subscribeToConsignmentsSelector({ checkoutService, checkoutState }),
    };
}

export default withCheckout(mapToShippingOptions)(ShippingOptionsForm);
