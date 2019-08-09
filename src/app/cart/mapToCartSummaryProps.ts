import { CheckoutSelectors } from '@bigcommerce/checkout-sdk';
import { createSelector } from 'reselect';

import { CheckoutContextProps } from '../checkout';

import mapToRedeemableProps from './mapToRedeemableProps';
import { CartSummaryProps, WithCheckoutCartSummaryProps } from './CartSummary';

const checkoutSelector = createSelector(
    ({ data }: CheckoutSelectors) => data.getCheckout(),
    (_: CheckoutSelectors, { storeCreditAmount }: CartSummaryProps) => storeCreditAmount,
    (checkout, storeCreditAmount) => {
        if (!checkout) {
            return;
        }

        return {
            ...checkout,
            grandTotal: checkout.grandTotal - (storeCreditAmount || 0),
        };
    }
);

export default function mapToCartSummaryProps(
    context: CheckoutContextProps,
    props: CartSummaryProps
): WithCheckoutCartSummaryProps | null {
    const {
        checkoutState: {
            data: { getConfig },
        },
    } = context;

    const config = getConfig();
    const redeemableProps = mapToRedeemableProps(context);
    const checkout = checkoutSelector(context.checkoutState, props);

    if (!checkout || !config || !redeemableProps) {
        return null;
    }

    return {
        checkout,
        shopperCurrency: config.shopperCurrency,
        cartUrl: config.links.cartLink,
        storeCurrency: config.currency,
        ...redeemableProps,
    };
}
