import { Cart, CheckoutSelectors, Consignment } from '@bigcommerce/checkout-sdk';
import { map, sortBy, uniq } from 'lodash';
import { createSelector } from 'reselect';

import { CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';

import { withCheckout } from '../../checkout';
import getShippableLineItems from '../getShippableLineItems';
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
    selectShippingOption(consignmentId: string, optionId: string): Promise<CheckoutSelectors>;
    isLoading(consignmentId?: string): boolean;
}

const subscribeToConsignmentsSelector = createSelector(
    ({ checkoutService }: CheckoutContextProps) => checkoutService.subscribe,
    (subscribe) => (subscriber: (state: CheckoutSelectors) => void) => {
        return subscribe(subscriber, ({ data }) => data.getConsignments());
    },
);

const isLoadingSelector = createSelector(
    (_: CheckoutSelectors, { isUpdatingAddress }: ShippingOptionsProps) => isUpdatingAddress,
    ({ statuses }: CheckoutSelectors) => statuses.isLoadingShippingOptions,
    ({ statuses }: CheckoutSelectors) => statuses.isSelectingShippingOption,
    ({ statuses }: CheckoutSelectors) => statuses.isUpdatingConsignment,
    ({ statuses }: CheckoutSelectors) => statuses.isCreatingConsignments,
    (
        isUpdatingAddress,
        isLoadingShippingOptions,
        isSelectingShippingOption,
        isUpdatingConsignment,
        isCreatingConsignments,
    ) => {
        return (consignmentId?: string) => {
            return (
                isUpdatingAddress ||
                isLoadingShippingOptions() ||
                isSelectingShippingOption(consignmentId) ||
                isUpdatingConsignment(consignmentId) ||
                isCreatingConsignments()
            );
        };
    },
);

const sortConsignments = (cart: Cart, unsortedConsignments: Consignment[]): Consignment[] => {
    if (unsortedConsignments.length < 2) {
        return unsortedConsignments;
    }

    const shippableItems = getShippableLineItems(cart, unsortedConsignments);
    const consignmentsOrder = uniq(map(shippableItems, 'consignment.id'));

    return sortBy(unsortedConsignments, (consignment) => consignmentsOrder.indexOf(consignment.id));
};

export function mapToShippingOptions(
    { checkoutService, checkoutState }: CheckoutContextProps,
    props: ShippingOptionsProps,
): WithCheckoutShippingOptionsProps | null {
    const {
        data: { getCart, getConsignments, getConfig, getCustomer, getCheckout },
        statuses: { isSelectingShippingOption },
    } = checkoutState;

    const customer = getCustomer();
    const cart = getCart();
    const config = getConfig();
    const checkout = getCheckout();

    if (!config || !checkout || !customer || !cart) {
        return null;
    }

    const consignments = sortConsignments(cart, getConsignments() || []);
    const methodId = getShippingMethodId(checkout, config);
    const { shippingQuoteFailedMessage } = config.checkoutSettings;

    return {
        cart,
        consignments,
        invalidShippingMessage: shippingQuoteFailedMessage,
        isLoading: isLoadingSelector(checkoutState, props),
        isSelectingShippingOption,
        methodId,
        selectShippingOption: checkoutService.selectConsignmentShippingOption,
        subscribeToConsignments: subscribeToConsignmentsSelector({
            checkoutService,
            checkoutState,
        }),
    };
}

export default withCheckout(mapToShippingOptions)(ShippingOptionsForm);
