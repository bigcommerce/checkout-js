import classNames from 'classnames';
import React, { type FunctionComponent, type KeyboardEvent, useState } from 'react';
import ReactModal from 'react-modal';

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

// Must match $animation-collapse-transitionSpeed in scss settings
const SHEET_TRANSITION_DURATION = 600;

interface CartSummaryDrawerV2Props {
    isMultiShippingMode: boolean;
}

const CartSummaryDrawerV2: FunctionComponent<CartSummaryDrawerV2Props> = ({
    isMultiShippingMode,
}) => {
    const [rootElement, setRootElement] = useState<HTMLDivElement | null>(null);
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

    const toggleSheet = () => {
        setIsExpanded((currentState) => !currentState);
    };

    const closeSheet = () => {
        setIsExpanded(false);
    };

    const handleBarKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleSheet();
        }
    };

    return (
        <div className="cart-summary-drawer enhancedThemeV1" ref={setRootElement}>
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
                <span className="cart-summary-bar-toggle-label body-regular optimizedCheckout-orderSummary-toggle">
                    <TranslatedString
                        id={isExpanded ? 'cart.hide_details_action' : 'cart.show_details_action'}
                    />
                    {isExpanded ? <IconChevronDown /> : <IconChevronUp />}
                </span>
            </div>
            {rootElement && (
                <ReactModal
                    ariaHideApp={false}
                    bodyOpenClassName="has-activeCartSummarySheet"
                    className={{
                        base: 'cart-summary-sheet optimizedCheckout-orderSummary',
                        afterOpen: 'cart-summary-sheet--afterOpen',
                        beforeClose: 'cart-summary-sheet--beforeClose',
                    }}
                    closeTimeoutMS={SHEET_TRANSITION_DURATION}
                    contentElement={(contentProps, children) => (
                        <div {...contentProps} data-test="cart-summary-sheet">
                            {children}
                        </div>
                    )}
                    contentLabel={cartHeading}
                    id="cart-summary-sheet"
                    isOpen={isExpanded}
                    onRequestClose={closeSheet}
                    overlayClassName={{
                        base: 'cart-summary-backdrop',
                        afterOpen: 'cart-summary-backdrop--afterOpen',
                        beforeClose: 'cart-summary-backdrop--beforeClose',
                    }}
                    overlayElement={(overlayProps, contentElement) => (
                        <div {...overlayProps} data-test="cart-summary-backdrop">
                            {contentElement}
                        </div>
                    )}
                    parentSelector={() => rootElement}
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
                </ReactModal>
            )}
        </div>
    );
};

export default CartSummaryDrawerV2;
