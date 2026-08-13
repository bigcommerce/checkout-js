import { type CheckoutContextProps } from '@bigcommerce/checkout/contexts';
import { isBuyNowCart } from '@bigcommerce/checkout/utility';

import { type WithCheckoutCartSummaryProps } from './CartSummary';

export default function mapToCartSummaryProps(
    context: CheckoutContextProps,
): WithCheckoutCartSummaryProps | null {
    const {
        checkoutState: {
            data: { getConfig, getCustomer, getCheckout },
        },
    } = context;

    const checkout = getCheckout();
    const config = getConfig();
    const customer = getCustomer();

    if (!checkout || !config || !customer) {
        return null;
    }

    const { isStoreCreditApplied, grandTotal } = checkout;
    const { storeCredit } = customer;

    return {
        isBuyNowCart: isBuyNowCart(checkout.cart),
        checkout,
        shopperCurrency: config.shopperCurrency,
        cartUrl: config.links.cartLink,
        storeCurrency: config.currency,
        storeCreditAmount: isStoreCreditApplied ? Math.min(grandTotal, storeCredit) : undefined,
    };
}
