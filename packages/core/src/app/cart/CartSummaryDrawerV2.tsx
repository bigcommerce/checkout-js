import classNames from 'classnames';
import React, { type FunctionComponent, type KeyboardEvent, useState } from 'react';

import { useCheckout, useLocale } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { IconChevronDown, IconChevronUp } from '@bigcommerce/checkout/ui';

import { ShopperCurrency } from '../currency';
import getItemsCount from '../order/getItemsCount';
import getLineItemsCount from '../order/getLineItemsCount';
import OrderSummary from '../order/OrderSummary';
import { removeBundledItems } from '../order/removeBundledItems';

import { CartHeaderLink } from './CartHeaderLink';
import { CartSummaryItemImage } from './CartSummaryItemImage';
import mapToCartSummaryProps from './mapToCartSummaryProps';
import withRedeemable from './withRedeemable';

interface CartSummaryDrawerV2Props {
    isMultiShippingMode: boolean;
}

const CartSummaryDrawerV2: FunctionComponent<CartSummaryDrawerV2Props> = ({
    isMultiShippingMode,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const { language } = useLocale();
    const checkoutContext = useCheckout();
    const props = mapToCartSummaryProps(checkoutContext);

    if (!props) {
        return null;
    }

    const { cartUrl, isBuyNowCart, checkout, shopperCurrency } = props;
    const nonBundledLineItems = removeBundledItems(checkout.cart.lineItems);
    const cartHeading = language.translate('cart.cart_heading');

    const toggleSheet = () => setIsExpanded((currentState) => !currentState);
    const closeSheet = () => setIsExpanded(false);

    const handleBarKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleSheet();
        }
    };

    const handleRootKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Escape' && isExpanded) {
            closeSheet();
        }
    };

    return (
        <div
            className={classNames('cart-summary-drawer', {
                'cart-summary-drawer--open': isExpanded,
            })}
            onKeyDown={handleRootKeyDown}
        >
            <div
                aria-hidden="true"
                className="cart-summary-backdrop"
                data-test="cart-summary-backdrop"
                onClick={closeSheet}
            />
            <div
                aria-controls="cart-summary-sheet"
                aria-expanded={isExpanded}
                className="cart-summary-collapsed-bar optimizedCheckout-orderSummary"
                data-test="cart-summary-collapsed-bar"
                onClick={toggleSheet}
                onKeyDown={handleBarKeyDown}
                role="button"
                tabIndex={0}
            >
                <figure
                    className={classNames('cart-summary-figure', {
                        'cart-summary-figure--stack': getLineItemsCount(nonBundledLineItems) > 1,
                    })}
                    data-test="cart-summary-figure"
                >
                    <div className="cart-summary-image-wrapper">
                        <CartSummaryItemImage lineItems={nonBundledLineItems} />
                    </div>
                </figure>
                <div className="cart-summary-bar-body">
                    <span className="body-regular" data-test="cart-item-count">
                        <TranslatedString
                            data={{ count: getItemsCount(nonBundledLineItems) }}
                            id="cart.item_count_text"
                        />
                    </span>
                    <span className="sub-header" data-test="cart-outstanding-balance">
                        <ShopperCurrency amount={checkout.outstandingBalance} /> (
                        {shopperCurrency.code})
                    </span>
                </div>
                <span className="cart-summary-bar-toggle-label body-regular">
                    <TranslatedString
                        id={isExpanded ? 'cart.hide_details_action' : 'cart.show_details_action'}
                    />
                    {isExpanded ? <IconChevronDown /> : <IconChevronUp />}
                </span>
            </div>
            <section
                aria-hidden={!isExpanded}
                aria-label={cartHeading}
                className="cart-summary-sheet"
                data-test="cart-summary-sheet"
                id="cart-summary-sheet"
            >
                <div className="cart-summary-sheet-handle" />
                <div className="cart-summary-sheet-content">
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
                </div>
            </section>
        </div>
    );
};

export default CartSummaryDrawerV2;
