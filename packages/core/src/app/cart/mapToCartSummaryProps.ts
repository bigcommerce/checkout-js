import { CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';

import { WithCheckoutCartSummaryProps } from './CartSummary';
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
    const updatedCartModal = config?.checkoutSettings.features['CHECKOUT-7403.updated_cart_summary_modal'] ?? false;

    return {
        checkout,
        shopperCurrency: config.shopperCurrency,
        cartUrl: config.links.cartLink,
        storeCurrency: config.currency,
        storeCreditAmount: isStoreCreditApplied ? Math.min(grandTotal, storeCredit) : undefined,
        isUpdatedCartSummayModal: updatedCartModal,
        ...redeemableProps,
    };
}
