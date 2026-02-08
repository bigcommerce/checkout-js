import { type Checkout, type ShopperCurrency as ShopperCurrencyType, type StoreCurrency } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent, useState } from 'react';

import { useCheckout } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { IconArrowLeft, IconChevronDown, IconChevronUp } from '@bigcommerce/checkout/ui';

import { ShopperCurrency } from '../currency';
import OrderSummary from '../order/OrderSummary';

import EditLink from './EditLink';
import mapToCartSummaryProps from './mapToCartSummaryProps';
import { type RedeemableProps } from './Redeemable';
import withRedeemable from './withRedeemable';

export type WithCheckoutCartSummaryProps = {
    checkout: Checkout;
    cartUrl: string;
    storeCurrency: StoreCurrency;
    shopperCurrency: ShopperCurrencyType;
    storeCreditAmount?: number;
    isBuyNowCart: boolean;
    isShippingDiscountDisplayEnabled: boolean;
} & RedeemableProps;

export interface CartSummaryDrawerV2Props {
    isMultiShippingMode: boolean;
}

const CartSummaryDrawerV2: FunctionComponent<CartSummaryDrawerV2Props> = ({ isMultiShippingMode }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const checkoutContext = useCheckout();
    const props = mapToCartSummaryProps(checkoutContext);

    if (!props) {
        return null;
    }

    const { cartUrl, isBuyNowCart, checkout } = props;
    
    const headerLink = isBuyNowCart ? null : (
        <EditLink
            isMultiShippingMode={isMultiShippingMode}
            label={<TranslatedString id="cart.go_to_cart_action" />}
            url={cartUrl}
        />
    );

    return (
    <div className="cart-summary-drawer">
        <div className='cart-summary-header'>
            <IconArrowLeft />
            {headerLink}
        </div>
        <button 
            aria-expanded={isExpanded}
            className="cart-summary-toggle"
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <span className='body-regular'>
                <TranslatedString 
                    id={isExpanded ? 'cart.hide_order_summary_action' : 'cart.show_order_summary_action'} 
                />
                {isExpanded ? <IconChevronUp /> : <IconChevronDown />}
            </span>
            <span className="sub-header">
                <ShopperCurrency amount={checkout.outstandingBalance} />
            </span>
        </button>
        {isExpanded && (
            withRedeemable(OrderSummary)({
                ...props,
                headerLink: null,
                showHeader: false,
            })
        )}
    </div>
    );
};

export default CartSummaryDrawerV2;
