import React, { type FunctionComponent } from 'react';

import { useCheckout } from '@bigcommerce/checkout/contexts';

import { SummaryDrawerV2 } from '../common/components/SummaryDrawerV2';
import OrderSummary from '../order/OrderSummary';
import { removeBundledItems } from '../order/removeBundledItems';

import { CartHeaderLink } from './CartHeaderLink';
import mapToCartSummaryProps from './mapToCartSummaryProps';
import withRedeemable from './withRedeemable';

interface CartSummaryDrawerV2Props {
    isMultiShippingMode: boolean;
}

const CartSummaryDrawerV2: FunctionComponent<CartSummaryDrawerV2Props> = ({
    isMultiShippingMode,
}) => {
    const checkoutContext = useCheckout();
    const props = mapToCartSummaryProps(checkoutContext);

    if (!props) {
        return null;
    }

    const { cartUrl, isBuyNowCart, checkout, shopperCurrency } = props;
    const nonBundledLineItems = removeBundledItems(checkout.cart.lineItems);

    return (
        <SummaryDrawerV2
            amount={checkout.outstandingBalance}
            currencyCode={shopperCurrency.code}
            nonBundledItems={nonBundledLineItems}
        >
            {withRedeemable(OrderSummary)({
                ...props,
                headerLink: (
                    <CartHeaderLink
                        cartUrl={cartUrl}
                        isBuyNowCart={isBuyNowCart}
                        isMultiShippingMode={isMultiShippingMode}
                    />
                ),
            })}
        </SummaryDrawerV2>
    );
};

export default CartSummaryDrawerV2;
