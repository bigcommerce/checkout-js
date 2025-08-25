import { type CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';
import { isBuyNowCart } from '@bigcommerce/checkout/utility';

import { isExperimentEnabled } from '../common/utility';

import { type WithCheckoutCartSummaryProps } from './CartSummary';
import mapToRedeemableProps from './mapToRedeemableProps';

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
    const redeemableProps = mapToRedeemableProps(context);

    if (!checkout || !config || !redeemableProps || !customer) {
        return null;
    }

    const { isStoreCreditApplied, grandTotal } = checkout;
    const { storeCredit } = customer;

    const isShippingDiscountDisplayEnabled = isExperimentEnabled(
        config.checkoutSettings,
        'PROJECT-6643.enable_shipping_discounts_in_orders',
    );

    return {
        isBuyNowCart: isBuyNowCart(checkout.cart),
        isShippingDiscountDisplayEnabled,
        checkout,
        shopperCurrency: config.shopperCurrency,
        cartUrl: config.links.cartLink,
        storeCurrency: config.currency,
        storeCreditAmount: isStoreCreditApplied ? Math.min(grandTotal, storeCredit) : undefined,
        ...redeemableProps,
    };
}
