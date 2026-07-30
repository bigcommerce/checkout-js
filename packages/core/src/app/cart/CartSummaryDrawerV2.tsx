import {
    type Checkout,
    type LineItemMap,
    type ShopperCurrency as ShopperCurrencyType,
    type StoreCurrency,
} from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import React, {
    type FunctionComponent,
    type KeyboardEvent,
    type ReactNode,
    useMemo,
    useState,
} from 'react';

import { useCheckout } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { IconChevronDown, IconChevronUp, IconGiftCertificate } from '@bigcommerce/checkout/ui';

import { ShopperCurrency } from '../currency';
import getItemsCount from '../order/getItemsCount';
import getLineItemsCount from '../order/getLineItemsCount';
import OrderSummary from '../order/OrderSummary';
import { removeBundledItems } from '../order/removeBundledItems';

import { CartHeaderLink } from './CartHeaderLink';
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

const CartSummaryDrawerV2: FunctionComponent<CartSummaryDrawerV2Props> = ({
    isMultiShippingMode,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const checkoutContext = useCheckout();
    const props = mapToCartSummaryProps(checkoutContext);

    const lineItems = props?.checkout.cart.lineItems;
    const nonBundledLineItems = useMemo(
        () => (lineItems ? removeBundledItems(lineItems) : undefined),
        [lineItems],
    );

    if (!props || !nonBundledLineItems) {
        return null;
    }

    const { cartUrl, isBuyNowCart, checkout, shopperCurrency } = props;

    const toggleSheet = () => setIsExpanded(!isExpanded);
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
                >
                    <div className="cart-summary-image-wrapper">
                        {getImage(nonBundledLineItems)}
                    </div>
                </figure>
                <div className="cart-summary-bar-body">
                    <span className="body-regular">
                        <TranslatedString
                            data={{ count: getItemsCount(nonBundledLineItems) }}
                            id="cart.item_count_text"
                        />
                    </span>
                    <span className="sub-header">
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

function getImage(lineItems: LineItemMap): ReactNode {
    const productWithImage = lineItems.physicalItems[0] || lineItems.digitalItems[0];

    if (productWithImage && productWithImage.imageUrl) {
        return (
            <img
                alt={productWithImage.name}
                data-test="cart-item-image"
                src={productWithImage.imageUrl}
            />
        );
    }

    if (lineItems.giftCertificates.length) {
        return <IconGiftCertificate />;
    }
}

export default CartSummaryDrawerV2;
